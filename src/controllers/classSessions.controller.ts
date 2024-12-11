import { Request, Response } from "express";
import { ClassSession } from "../entities/class-session.entity";
import { AppDataSource } from "../config/data-source";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Between, Brackets, DeepPartial, In } from "typeorm";
import { Student } from "../entities/student.entity";
import { Topic } from "../entities/topic.entity";
import { Teacher } from "../entities/teacher.entity";
import { Location } from "../entities/location.entity";
import { User } from "../entities/user.entity";
import { Parent } from "../entities/parent.entity";
import { SessionType } from "../entities/sessionType.entity";
import { Absence } from "../entities/absence.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";
import { SessionReport } from "../entities/session-report.entity";
import { NotificationService } from "./notification.controller";
import { NotificationTexts } from "./helperFunctions/notificationTexts";
import {
  formatTime,
  getFullDayName,
} from "./helperFunctions/classSessionHelper";

export class ClassSessionController {
  static async createClassSession(req: AuthenticatedRequest, res: Response) {
    const {
      room,
      note,
      sessionType,
      isActive,
      isHolidayCourse,
      recurrenceOption,
      teacherId,
      topicId,
      locationId,
      studentIds,
      endDate,
      startDate,
      sessions,
    } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const classSessionRepository =
        queryRunner.manager.getRepository(ClassSession);
      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);
      const studentRepository = queryRunner.manager.getRepository(Student);

      // Fetch related entities
      const teacher = teacherId
        ? await queryRunner.manager.getRepository(Teacher).findOne({
          where: { id: teacherId },
          relations: ["availabilities", "user"],
        })
        : null;

      if (!teacher) {
        return res.status(400).json({ message: "Invalid teacher ID" });
      }

      const topic = topicId
        ? await queryRunner.manager
          .getRepository(Topic)
          .findOne({ where: { id: topicId } })
        : null;

      const location = locationId
        ? await queryRunner.manager
          .getRepository(Location)
          .findOne({ where: { id: locationId } })
        : null;

      const sessionTypeEntity = await queryRunner.manager
        .getRepository(SessionType)
        .findOne({ where: { id: sessionType } });

      if (!sessionTypeEntity) {
        return res.status(400).json({ message: "Invalid session type" });
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      let students: Student[] = [];
      if (studentIds && studentIds.length > 0) {
        students = await queryRunner.manager
          .getRepository(Student)
          .createQueryBuilder("student")
          .leftJoinAndSelect("student.user", "user")
          .select([
            "student.id",
            "student.availableDates",
            "user.firstName",
            "user.lastName",
            "user.id",
          ])
          .where("student.id IN (:...studentIds)", { studentIds })
          .getMany();

        const invalidStudentIds = studentIds.filter(
          (id: number) => !students.some((student) => student.id === id)
        );

        if (invalidStudentIds.length > 0) {
          return res.status(400).json({
            message: `Invalid student IDs: ${invalidStudentIds.join(", ")}`,
          });
        }

        for (const student of students) {
          if (student.sessionBalance && student.sessionBalance > 0) {
            student.sessionBalance -= 1;
            await studentRepository.save(student);
          }
        }
      }

      // Create the class session
      const classSession = classSessionRepository.create({
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        sessionType: sessionTypeEntity,
        recurrencePattern: recurrenceOption || null,
        isHolidayCourse:
          isHolidayCourse !== undefined ? isHolidayCourse : false,
        topic: topic || null,
      } as DeepPartial<ClassSession>);

      await classSessionRepository.save(classSession);

      const classSessionInstances: SessionInstance[] = [];

      if (recurrenceOption === "once") {
        // Create session instances for each session provided in the `sessions` array
        for (const session of sessions) {
          const { day, startTime, duration } = session;
          const [hours, minutes] = startTime.split(":").map(Number);
          const sessionStartDateTime = new Date(parsedStartDate);
          sessionStartDateTime.setHours(hours, minutes, 0, 0);

          const sessionInstance = new SessionInstance();
          sessionInstance.room = room;
          sessionInstance.date = sessionStartDateTime;
          sessionInstance.startTime = startTime;
          sessionInstance.duration = duration;
          if (location) sessionInstance.location = location;
          if (teacher) sessionInstance.teacher = teacher;
          sessionInstance.note = note;
          sessionInstance.isActive = isActive;
          sessionInstance.classSession = classSession;
          sessionInstance.sessionType = sessionTypeEntity;
          sessionInstance.students = students.length > 0 ? students : [];
          classSessionInstances.push(sessionInstance);
        }
      } else {
        // Handle other recurrence options (e.g., weekly, daily)
        let currentDate = new Date(parsedStartDate);

        while (currentDate <= parsedEndDate) {
          const dayOfWeek = currentDate.getDay();
          const dayIndexMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
          const matchingSession = sessions.find(
            (session: { day: string; startTime: string; duration: number }) => {
              const dayIndex = dayIndexMap.indexOf(session.day);
              return dayIndex === dayOfWeek;
            }
          );

          if (matchingSession) {
            const { startTime, duration } = matchingSession;
            const [hours, minutes] = startTime.split(":").map(Number);
            const sessionStartDateTime = new Date(currentDate);
            sessionStartDateTime.setHours(hours, minutes, 0, 0);

            if (teacher) {
              const dayOfWeekMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              const sessionDay = dayOfWeekMap[dayOfWeek]; // Get day of the week from currentDate

              // Helper function to convert "HH:MM" to minutes since midnight
              const timeToMinutes = (time: string): number => {
                const [h, m] = time.split(":").map(Number);
                return h * 60 + m;
              };

              const sessionStartMinutes = timeToMinutes(startTime);
              const sessionEndMinutes = sessionStartMinutes + duration;

              const teacherAvailability = teacher.availabilities.find((availability) => {
                const availabilityStartMinutes = timeToMinutes(availability.startTime);
                const availabilityEndMinutes = timeToMinutes(availability.endTime);

                return (
                  availability.dayOfWeek === sessionDay &&
                  availabilityStartMinutes <= sessionStartMinutes &&
                  availabilityEndMinutes >= sessionEndMinutes
                );
              });

              if (!teacherAvailability) {
                return res.status(400).json({
                  message: `The selected teacher is not available on ${sessionDay} at ${startTime}.`,
                });
              }
            }
            // Check Students' Availability
            if (students.length > 0) {
              // Define a helper function outside the loop or inline as above
              const unavailableStudents = students.filter(

                (student) => !isStudentAvailableOnDay(student.availableDates, dayOfWeek)
              );

              if (unavailableStudents.length > 0) {
                const unavailableNames = unavailableStudents.map(
                  (student) => `${student.user.firstName} ${student.user.lastName}`
                ).join(", ");
                return res.status(400).json({
                  message: `The following students are not available on ${dayIndexMap[dayOfWeek]}: ${unavailableNames}.`,
                });
              }
            }
            const sessionInstance = new SessionInstance();
            sessionInstance.room = room;
            sessionInstance.date = new Date(currentDate);
            sessionInstance.startTime = startTime;
            sessionInstance.duration = duration;
            if (location) sessionInstance.location = location;
            if (teacher) {
              sessionInstance.teacher = teacher;
            }
            sessionInstance.note = note;
            sessionInstance.isActive = isActive;
            sessionInstance.classSession = classSession;
            sessionInstance.sessionType = sessionTypeEntity;
            sessionInstance.students = students.length > 0 ? students : [];
            classSessionInstances.push(sessionInstance);
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      await sessionInstanceRepository.save(classSessionInstances);

      await queryRunner.commitTransaction();

      res.status(201).json({
        status: "success",
        message: "Class Session and instances created successfully",
      });
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error("Error creating class session:", error);
      res.status(500).json({ message: "Error creating class session" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getAllClassSessions(req: AuthenticatedRequest, res: Response) {
    const {
      search,
      page = 1,
      limit = 10,
      startDate,
      endDate,
      locationId,
    } = req.query;

    try {
      const classSessionRepository = AppDataSource.getRepository(ClassSession);
      const sessionInstanceRepository =
        AppDataSource.getRepository(SessionInstance);
      const absenceRepository = AppDataSource.getRepository(Absence);

      let query = classSessionRepository
        .createQueryBuilder("classSession")
        .leftJoinAndSelect("classSession.instances", "sessionInstance")
        .leftJoinAndSelect("sessionInstance.sessionType", "sessionType")
        .leftJoinAndSelect("classSession.topic", "topic")
        .leftJoinAndSelect("sessionInstance.students", "students")
        .leftJoinAndSelect("students.user", "studentUser")
        .leftJoinAndSelect("sessionInstance.absences", "absence")
        .leftJoinAndSelect("absence.student", "absenceStudent")
        .leftJoinAndSelect("sessionInstance.teacher", "teacher")
        .leftJoinAndSelect("sessionInstance.location", "location")
        .leftJoinAndSelect("teacher.user", "teacherUser")
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("classSession.createdAt", "DESC");

      if (startDate && endDate) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("sessionInstance.date >= :startDate").andWhere(
              "sessionInstance.date <= :endDate"
            );
          }),
          { startDate, endDate }
        );
      } else if (startDate) {
        query = query.andWhere("sessionInstance.date >= :startDate", {
          startDate,
        });
      } else if (endDate) {
        query = query.andWhere("sessionInstance.date <= :endDate", { endDate });
      }

      if (locationId) {
        const locationIds = Array.isArray(locationId)
          ? locationId
          : String(locationId).split(",");
        query = query.andWhere("location.id IN (:...locationIds)", {
          locationIds,
        });
      }

      query = query
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("classSession.createdAt", "DESC");

      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      const instances = await Promise.all(
        data.map(async (session) => {
          const sessionInstances = await sessionInstanceRepository.find({
            where: {
              classSession: { id: session.id },
              date:
                startDate && endDate
                  ? Between(
                    new Date(startDate as string),
                    new Date(endDate as string)
                  )
                  : undefined,
            },
            relations: [
              "students",
              "students.user",
              "absences",
              "absences.student",
              "teacher",
              "teacher.user",
              "location",
              "sessionType",
            ],
          });

          const studentCount = sessionInstances.reduce(
            (count, instance) => count + instance.students.length,
            0
          );

          const completedReportsCount = await absenceRepository.count({
            where: {
              sessionInstance: { classSession: { id: session.id } },
              status: true,
            },
          });

          const absencesCount = await absenceRepository.count({
            where: {
              sessionInstance: { classSession: { id: session.id } },
              status: true,
            },
          });

          const allReportsCompleted =
            completedReportsCount + absencesCount >= studentCount;

          return sessionInstances.flatMap((instance) => {
            const startTimeParts = instance.startTime.split(":").map(Number);
            const startDateTime = new Date(instance.date);
            startDateTime.setHours(startTimeParts[0], startTimeParts[1], 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(
              startDateTime.getMinutes() + (instance.duration ?? 0)
            );

            const endTime = endDateTime.toTimeString().split(" ")[0];

            const teacherName = instance.teacher
              ? `${instance.teacher.user?.firstName || "Unknown"} ${instance.teacher.user?.lastName || ""
                }`.trim()
              : "Unknown";

            return {
              id: instance.id,
              sessionId: session.id,
              sessionType: instance.sessionType,
              recurrencePattern: session.recurrencePattern,
              topic: session.topic,
              room: instance.room,
              status: instance.isActive,
              date: instance.date,
              startTime: instance.startTime,
              endTime: endTime,
              teacherName: teacherName,
              location: instance.location,
              students: instance.students.map((student) => ({
                id: student.id,
                firstName: student.user?.firstName || "Unknown",
                gradeLevel: student.gradeLevel,
                absences:
                  student.absences?.map((absence) => ({
                    id: absence.id,
                    status: absence.status,
                  })) || [],
              })),
              reportStatus: {
                allReportsCompleted,
                totalStudents: studentCount,
                completedReports: completedReportsCount,
                absences: absencesCount,
              },
            };
          });
        })
      );

      const sessionInstances = instances.flat();

      return res.status(200).json({
        sessionInstances,
        total,
        page: Number(page),
        pageCount,
      });
    } catch (error) {
      console.error(
        "Error fetching all class sessions with report status:",
        error
      );
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }

  static async getClassSessionsByUser(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { userId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    try {
      const sessionInstanceRepository =
        AppDataSource.getRepository(SessionInstance);
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({
        where: { id: Number(userId) },
        relations: [
          "roles",
          "teachers",
          "students",
          "teachers.locations",
          "students.locations",
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hasTeacherRole = user.roles.some((role) => role.name === "Teacher");
      const hasStudentRole = user.roles.some((role) => role.name === "Student");

      if (!hasTeacherRole && !hasStudentRole) {
        return res.status(400).json({
          message: "User does not have valid roles for class sessions.",
        });
      }

      let query = sessionInstanceRepository
        .createQueryBuilder("sessionInstance")
        .leftJoinAndSelect("sessionInstance.teacher", "teacher")
        .leftJoinAndSelect("teacher.user", "teacherUser")
        .leftJoinAndSelect("sessionInstance.students", "students")
        .leftJoinAndSelect("students.user", "studentUser")
        .leftJoinAndSelect(
          "students.absences",
          "studentAbsence",
          "studentAbsence.sessionInstanceId = sessionInstance.id"
        )
        .leftJoinAndSelect("sessionInstance.classSession", "classSession")
        .leftJoinAndSelect("classSession.topic", "topic")
        .leftJoinAndSelect("sessionInstance.location", "location")
        .leftJoinAndSelect("sessionInstance.sessionType", "sessionType")
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("sessionInstance.date", "DESC");

      if (hasTeacherRole && user.teachers.length > 0) {
        const teacherId = user.teachers[0].id;
        query.andWhere("sessionInstance.teacher = :teacherId", { teacherId });
      } else if (hasStudentRole && user.students.length > 0) {
        const studentId = user.students[0].id;
        query.andWhere("students.id = :studentId", { studentId });
      }

      if (startDate && endDate) {
        query
          .andWhere("sessionInstance.date >= :startDate", { startDate })
          .andWhere("sessionInstance.date <= :endDate", { endDate });
      } else if (startDate) {
        query.andWhere("sessionInstance.date >= :startDate", { startDate });
      } else if (endDate) {
        query.andWhere("sessionInstance.date <= :endDate", { endDate });
      }

      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      const userLocations = hasTeacherRole
        ? user.teachers[0]?.locations.map((location) => ({
          id: location.id,
          name: location.name,
          numberOfRooms: location.numberOfRooms,
        }))
        : hasStudentRole
          ? user.students[0]?.locations.map((location) => ({
            id: location.id,
            name: location.name,
            numberOfRooms: location.numberOfRooms,
          }))
          : [];

      const transformedData = data.map((sessionInstance) => ({
        id: sessionInstance.id,
        sessionId: sessionInstance.classSession?.id || null,
        sessionType: sessionInstance?.sessionType
          ? {
            id: sessionInstance.sessionType.id,
            name: sessionInstance.sessionType.name,
          }
          : null,
        topic: sessionInstance.classSession?.topic
          ? {
            id: sessionInstance.classSession.topic.id,
            name: sessionInstance.classSession.topic.name,
          }
          : null,
        room: sessionInstance?.room || "Unknown Session",
        status: sessionInstance.isActive,
        date: sessionInstance.date,
        startTime: sessionInstance.startTime,
        endTime: sessionInstance.classSession?.endDate || null,
        teacherName: sessionInstance.teacher
          ? `${sessionInstance.teacher.user.firstName} ${sessionInstance.teacher.user.lastName}`
          : null,
        location: sessionInstance.location
          ? {
            id: sessionInstance.location.id,
            name: sessionInstance.location.name,
            address: sessionInstance.location.address,
            city: sessionInstance.location.city,
            postalCode: sessionInstance.location.postalCode,
            numberOfRooms: sessionInstance.location.numberOfRooms,
          }
          : null,
        students: sessionInstance.students.map((student) => ({
          id: student.id,
          firstName: student.user.firstName,
          gradeLevel: student.gradeLevel || null,
          absences:
            student.absences?.map((absence) => ({
              id: absence.id,
              status: absence.status,
            })) || [],
        })),
        reportStatus: {
          allReportsCompleted: false,
          totalStudents: sessionInstance.students.length,
          completedReports: 0,
          absences: sessionInstance.students.reduce(
            (count, student) =>
              count +
              (student.absences?.filter((absence) => absence.status).length ||
                0),
            0
          ),
        },
      }));

      return res.status(200).json({
        sessionInstances: transformedData,
        userLocations,
        total,
        page: Number(page),
        pageCount,
      });
    } catch (error) {
      console.error(`Server error: ${error}`);
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }

  static async getClassSessionsByParent(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { parentUserId } = req.params;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    try {
      const parentRepository = AppDataSource.getRepository(Parent);
      const sessionInstanceRepository = AppDataSource.getRepository(SessionInstance);
      const locationRepository = AppDataSource.getRepository(Location);

      const parent = await parentRepository.findOne({
        where: { user: { id: Number(parentUserId) } },
        relations: ["students"],
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      const studentIds = parent.students.map((student) => student.id);

      // Get highest room number from students' locations
      const highestRoomNumber = await locationRepository
        .createQueryBuilder("location")
        .leftJoin("location.students", "students")
        .where("students.id IN (:...studentIds)", { studentIds })
        .select("MAX(location.numberOfRooms)", "maxRooms")
        .getRawOne();

      // Get session instances
      let query = sessionInstanceRepository
        .createQueryBuilder("sessionInstance")
        .leftJoinAndSelect("sessionInstance.teacher", "teacher")
        .leftJoinAndSelect("teacher.user", "teacherUser")
        .leftJoinAndSelect("sessionInstance.students", "students")
        .leftJoinAndSelect("students.user", "studentUser")
        .leftJoinAndSelect("sessionInstance.classSession", "classSession")
        .leftJoinAndSelect("sessionInstance.location", "location")
        .leftJoinAndSelect("sessionInstance.sessionType", "sessionType")
        .leftJoinAndSelect("classSession.topic", "topic")
        .where("students.id IN (:...studentIds)", { studentIds })
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("sessionInstance.date", "DESC");

      if (startDate && endDate) {
        if (startDate === endDate) {
          query.andWhere(`DATE(sessionInstance.date) = :startDate`, {
            startDate,
          });
        } else {
          query
            .andWhere("sessionInstance.date >= :startDate", { startDate })
            .andWhere("sessionInstance.date <= :endDate", { endDate });
        }
      } else if (startDate) {
        query.andWhere("sessionInstance.date >= :startDate", { startDate });
      } else if (endDate) {
        query.andWhere("sessionInstance.date <= :endDate", { endDate });
      }

      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      return res.status(200).json({
        data,
        total,
        page: Number(page),
        pageCount,
        numberOfRooms: highestRoomNumber?.maxRooms || 0
      });
    } catch (error) {
      console.error(`Server error: ${error}`);
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }

  static async getSessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const sessionInstance = await AppDataSource.getRepository(SessionInstance)
        .createQueryBuilder("sessionInstance")
        .leftJoinAndSelect("sessionInstance.classSession", "classSession")
        .leftJoinAndSelect("sessionInstance.sessionType", "sessionType")
        .leftJoinAndSelect("sessionInstance.teacher", "teacher")
        .leftJoinAndSelect("teacher.user", "teacherUser")
        .leftJoinAndSelect("classSession.topic", "topic")
        .leftJoinAndSelect("sessionInstance.location", "location")
        .leftJoinAndSelect("sessionInstance.students", "students")
        .leftJoinAndSelect("students.user", "studentUser")
        .leftJoinAndSelect(
          "students.absences",
          "studentAbsence",
          "studentAbsence.sessionInstanceId = sessionInstance.id"
        )
        .where("sessionInstance.id = :id", { id: Number(req.params.id) })
        .select([
          "sessionInstance.id",
          "sessionInstance.date",
          "sessionInstance.startTime",
          "sessionInstance.duration",
          "sessionInstance.note",
          "sessionInstance.isActive",
          "sessionInstance.room",
          "sessionInstance.reportsSubmitted",
          "classSession.id",
          "classSession.startDate",
          "classSession.endDate",
          "classSession.isHolidayCourse",
          "classSession.createdAt",
          "classSession.updatedAt",
          "classSession.recurrencePattern",
          "sessionType.id",
          "sessionType.name",
          "teacher.id",
          "teacherUser.id",
          "teacherUser.firstName",
          "teacherUser.lastName",
          "topic.id",
          "topic.name",
          "location.id",
          "location.name",
          "location.numberOfRooms",
          "students.id",
          "studentUser.id",
          "studentUser.firstName",
          "studentUser.lastName",
          "studentAbsence.id",
          "studentAbsence.status",
        ])
        .getOne();

      if (!sessionInstance) {
        return res.status(404).json({ message: "Session instance not found" });
      }
      // Get all session instances for the class session
      const classSessionInstances = await AppDataSource.getRepository(
        SessionInstance
      )
        .createQueryBuilder("sessionInstance")
        .where("sessionInstance.classSessionId = :classSessionId", {
          classSessionId: sessionInstance.classSession.id,
        })
        .select([
          "sessionInstance.date",
          "sessionInstance.startTime",
          "sessionInstance.duration",
        ])
        .getMany();

      const dayIndexMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
      const days: Record<string, { startTime: string; duration: number }> = {};

      if (sessionInstance.classSession.recurrencePattern === "once") {
        // Handle recurrence pattern "once"
        const instance = classSessionInstances[0]; // Only one session expected
        if (instance && instance.duration !== undefined) {
          const dayAbbreviation = dayIndexMap[new Date(instance.date).getDay()];
          days[dayAbbreviation] = {
            startTime: instance.startTime,
            duration: instance.duration,
          };
        }
      } else if (sessionInstance.classSession.recurrencePattern === "weekly") {
        const instance = classSessionInstances[0];
        if (instance && instance.duration !== undefined) {
          const dayAbbreviation = dayIndexMap[new Date(instance.date).getDay()];
          days[dayAbbreviation] = {
            startTime: instance.startTime,
            duration: instance.duration,
          };
        }
      } else if (sessionInstance.classSession.recurrencePattern === "custom") {
        classSessionInstances.forEach((instance) => {
          if (instance.duration !== undefined) {
            const dayAbbreviation =
              dayIndexMap[new Date(instance.date).getDay()];
            if (!days[dayAbbreviation]) {
              days[dayAbbreviation] = {
                startTime: instance.startTime,
                duration: instance.duration,
              };
            }
          }
        });
      }

      const formattedResponse = {
        id: sessionInstance.id,
        date: sessionInstance.date,
        room: sessionInstance.room,
        startTime: sessionInstance.startTime,
        duration: sessionInstance.duration,
        note: sessionInstance.note,
        reportsSubmitted: sessionInstance.reportsSubmitted,
        isActive: sessionInstance.isActive,
        classSession: {
          id: sessionInstance.classSession.id,
          createdAt: sessionInstance.classSession.createdAt,
          updatedAt: sessionInstance.classSession.updatedAt,
          recurrencePattern: sessionInstance.classSession.recurrencePattern,
          startDate: sessionInstance.classSession.startDate,
          endDate: sessionInstance.classSession.endDate,
          isHolidayCourse: sessionInstance.classSession.isHolidayCourse,
          topic: sessionInstance.classSession.topic,
          days,
        },
        sessionType: sessionInstance.sessionType,
        teacher: {
          id: sessionInstance.teacher?.id,
          user: sessionInstance.teacher?.user,
        },
        location: sessionInstance.location,
        students: sessionInstance.students.map((student) => ({
          id: student.id,
          user: student.user,
          absences: student.absences,
        })),
      };

      res.json(formattedResponse);
    } catch (error) {
      console.error("Error fetching session instance:", error);
      res.status(500).json({ message: "Error fetching session instance" });
    }
  }

  static async updateClassSession(req: AuthenticatedRequest, res: Response) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const classSessionRepository =
        queryRunner.manager.getRepository(ClassSession);
      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);

      const sessionInstance = await sessionInstanceRepository.findOne({
        where: { id: Number(req.params.id) },
        relations: [
          "classSession",
          "classSession.topic",
          "students",
          "teacher",
          "teacher.user",
          "location",
        ],
      });

      if (!sessionInstance) {
        res.status(404).json({ message: "Session instance not found" });
        return;
      }

      const classSession = await classSessionRepository.findOne({
        where: { id: Number(sessionInstance.classSession.id) },
        relations: ["topic"],
      });

      if (!classSession) {
        return res.status(404).json({ message: "Class session not found" });
      }

      const {
        room,
        topicId,
        isHolidayCourse,
        startDate,
        endDate,
        teacherId,
        locationId,
        studentIds,
        dayDetails,
        note,
        sessionType,
        recurrenceOption: recurrencePattern,
      } = req.body;

      // Track changes using a Set to avoid duplicates
      const changesSet = new Set<string>();

      if (
        !dayDetails ||
        typeof dayDetails !== "object" ||
        Object.keys(dayDetails).length === 0
      ) {
        return res.status(400).json({
          message:
            "Invalid or missing `dayDetails` property. Ensure `dayDetails` is an object with at least one key.",
        });
      }

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({ message: "Invalid startDate format" });
        }
        classSession.startDate = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid endDate format" });
        }
        classSession.endDate = parsedEndDate;
      }

      if (
        isHolidayCourse !== undefined &&
        isHolidayCourse !== classSession.isHolidayCourse
      ) {
        changesSet.add(
          `Holiday course status updated to "${isHolidayCourse ? "Yes" : "No"}"`
        );
        classSession.isHolidayCourse = isHolidayCourse;
      }

      if (
        topicId &&
        (!classSession.topic || classSession.topic.id !== topicId)
      ) {
        const topic = await queryRunner.manager
          .getRepository(Topic)
          .findOne({ where: { id: topicId } });
        if (!topic)
          return res.status(400).json({ message: "Invalid topic ID" });
        classSession.topic = topic;
        changesSet.add(`Topic updated to "${topic.name}"`);
      }

      if (recurrencePattern) {
        classSession.recurrencePattern = recurrencePattern;
        changesSet.add(`Recurrence pattern updated to "${recurrencePattern}"`);
      }

      await classSessionRepository.save(classSession);

      const sessionInstances = await sessionInstanceRepository.find({
        where: { classSession: { id: classSession.id } },
        relations: [
          "classSession",
          "classSession.topic",
          "students",
          "students.user",
          "teacher",
          "teacher.user",
          "location",
        ],
      });

      const dayIndexMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

      const getTwoLetterDay = (date: Date): string => {
        const dayIndex = date.getDay();
        return dayIndexMap[dayIndex];
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const teacher = teacherId
        ? await queryRunner.manager
          .getRepository(Teacher)
          .findOne({ where: { id: teacherId }, relations: ["user"] })
        : null;

      const location = locationId
        ? await queryRunner.manager
          .getRepository(Location)
          .findOne({ where: { id: locationId } })
        : null;

      const students = studentIds?.length
        ? await queryRunner.manager
          .getRepository(Student)
          .find({ where: { id: In(studentIds) }, relations: ["user"] })
        : [];

      const pastSessionInstances = sessionInstances.filter(
        (instance) => new Date(instance.date) < today
      );

      // if (pastSessionInstances.length > 0) {
      //   return res.status(500).json({
      //     message: `Cannot edit sessions that have already occurred.`,
      //   });
      // }

      const newStartDate = new Date(classSession.startDate);
      const newEndDate = new Date(classSession.endDate);

      if (newStartDate && newEndDate) {
        changesSet.add(
          `Session date range updated from "${newStartDate.toDateString()}" to "${newEndDate.toDateString()}"`
        );
      }

      const instancesToRemove = sessionInstances.filter((instance) => {
        const instanceDate = new Date(instance.date);
        const instanceDay = getTwoLetterDay(instanceDate);

        return (
          instanceDate < newStartDate ||
          instanceDate > newEndDate ||
          !Object.keys(dayDetails).includes(instanceDay)
        );
      });

      for (const instance of instancesToRemove) {
        const hasReports = await queryRunner.manager
          .getRepository(SessionReport)
          .createQueryBuilder("report")
          .where("report.session = :id", { id: instance.id })
          .getCount();

        if (hasReports > 0) {
          res.status(500).json({
            message: `Cannot remove session instance on ${instance.date} as it has associated reports.`,
          });
        }

        // If no reports exist, perform the soft delete
        await sessionInstanceRepository.softRemove(instance);
      }

      // **3. Update Existing Session Instances Within New Date Range**
      for (const instance of sessionInstances) {
        const instanceDate = new Date(instance.date);
        if (instanceDate >= newStartDate && instanceDate <= newEndDate) {
          const instanceDay = getTwoLetterDay(instanceDate);
          const dayDetail = dayDetails[instanceDay];
          const fullDayName = getFullDayName(instanceDate);

          if (dayDetail) {
            if (instance.startTime !== dayDetail.startTime) {
              const formattedInstanceStartTime = formatTime(instance.startTime);
              const formattedDayDetailStartTime = formatTime(
                dayDetail.startTime
              );

              if (formattedInstanceStartTime !== formattedDayDetailStartTime) {
                changesSet.add(
                  `Start time updated from ${formattedInstanceStartTime} to ${formattedDayDetailStartTime} on ${fullDayName}`
                );
                instance.startTime = dayDetail.startTime;
              }
            }
            if (instance.duration !== dayDetail.duration) {
              changesSet.add(
                `Duration updated from ${instance.duration}m to ${dayDetail.duration}m on ${fullDayName}`
              );
              instance.duration = dayDetail.duration;
            }
          }

          if (instance.room !== room) {
            changesSet.add(`Room updated from "${instance.room}" to "${room}"`);
            instance.room = room;
          }
          if (instance.teacher?.id !== teacher?.id) {
            console.log("teacher is", instance.teacher, teacher);
            changesSet.add(
              `Teacher updated from "${instance.teacher?.user?.firstName} ${instance.teacher?.user?.lastName}" to "${teacher?.user?.firstName} ${teacher?.user?.lastName}"`
            );
            if (teacher) {
              instance.teacher = teacher;
            }
          }
          if (instance.location?.id !== location?.id) {
            changesSet.add(
              `Location updated from "${instance.location?.name}" to "${location?.name}"`
            );
            if (location) {
              instance.location = location;
            }
          }
          if (instance.sessionType?.id !== sessionType?.id) {
            changesSet.add(
              `Session type updated from "${instance.sessionType?.name}" to "${sessionType?.name}"`
            );
            instance.sessionType = sessionType;
          }

          instance.note = note || instance.note;
          instance.students = students.length ? students : instance.students;

          await sessionInstanceRepository.save(instance);
        }
      }

      const existingDates = sessionInstances
        .filter(
          (instance) =>
            new Date(instance.date) >= newStartDate &&
            new Date(instance.date) <= newEndDate
        )
        .map((instance) => {
          const date =
            instance.date instanceof Date
              ? instance.date
              : new Date(instance.date);
          return date.toISOString().split("T")[0]; // Extract date in 'YYYY-MM-DD' format
        });

      console.log("recurrencePattern", recurrencePattern);

      if (recurrencePattern === "once") {
        console.log("hello once");
        // Remove all future instances
        const futureInstances = sessionInstances.filter(
          (instance) => new Date(instance.date) >= today
        );
        for (const instance of futureInstances) {
          await sessionInstanceRepository.softRemove(instance);
        }

        // Create a single instance based on dayDetails
        const [dayAbbreviation, sessionDetails] = Object.entries(dayDetails)[0];
        let instanceDate = new Date(startDate);
        const instanceDay = getTwoLetterDay(instanceDate);

        console.log("dayAbbreviation", dayAbbreviation);
        console.log("instanceDay", instanceDay);

        // Find the next date that matches the day abbreviation
        while (getTwoLetterDay(instanceDate) !== dayAbbreviation) {
          instanceDate.setDate(instanceDate.getDate() + 1);
        }

        console.log("matched instanceDate", instanceDate);

        const newInstance = sessionInstanceRepository.create({
          classSession: classSession,
          date: instanceDate,
          startTime: (sessionDetails as any).startTime,
          duration: (sessionDetails as any).duration,
          teacher: teacher || undefined,
          location: location || undefined,
          students: students.length ? students : undefined,
          room: room || undefined,
          note: undefined,
          sessionType: sessionType || undefined,
        });

        console.log("new instance", newInstance);

        await sessionInstanceRepository.save(newInstance);

        // Commit the transaction and return the response
        await queryRunner.commitTransaction();
        return res.json({ message: "Class session updated successfully" });
      } else {
        for (const [dayAbbreviation, sessionDetails] of Object.entries(
          dayDetails
        )) {
          let currentDate = new Date(newStartDate);

          console.log("testing", currentDate, newEndDate);

          while (currentDate <= newEndDate) {
            const instanceDay = getTwoLetterDay(currentDate);

            if (dayAbbreviation === instanceDay) {
              const dateString = currentDate.toISOString().split("T")[0];
              if (!existingDates.includes(dateString)) {
                if (currentDate < today) {
                  currentDate.setDate(currentDate.getDate() + 1);
                  continue;
                }

                const newInstance = sessionInstanceRepository.create({
                  classSession: classSession,
                  date: new Date(currentDate),
                  startTime: (sessionDetails as any).startTime,
                  duration: (sessionDetails as any).duration,
                  teacher: teacher || undefined,
                  location: location || undefined,
                  students: students.length ? students : undefined,
                  room: room || undefined,
                  note: undefined,
                  sessionType: sessionType || undefined,
                });

                await sessionInstanceRepository.save(newInstance);
              }
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }

      const studentUserIds = Array.from(
        new Set(
          sessionInstances
            .flatMap((instance) => instance.students)
            .map((student) => student.user?.id)
        )
      );

      const teacherUserId = sessionInstances
        .map((instance) => instance.teacher?.user.id)
        .find((id) => id !== undefined);

      const allUserIds = [
        ...studentUserIds,
        ...(teacherUserId ? [teacherUserId] : []),
      ];

      const title = NotificationTexts.classSessionUpdate.title(
        classSession.topic?.name || "Unknown Topic"
      );
      const changes = Array.from(changesSet);
      const message =
        changes.length === 1
          ? `- ${changes[0]}`
          : `The class session has been updated. Changes are:\n${changes
            .map((change) => `- ${change}`)
            .join("\n")}`;

      await NotificationService.createNotification(
        allUserIds,
        title,
        message,
        NotificationTexts.classSessionUpdate.eventType
      );

      // **5. Commit Transaction**
      await queryRunner.commitTransaction();

      res.json({ message: "Class session updated successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating class session:", error);
      res
        .status(500)
        .json({ message: error || "Error updating class session" });
    } finally {
      await queryRunner.release();
    }
  }

  // Soft delete class sessions
  static async deleteClassSession(req: AuthenticatedRequest, res: Response) { }

  static async toggleClassSessionActivation(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { id, isActive } = req.body;

    if (!id) {
      return res.status(400).json({
        message:
          "Invalid input: Please provide the id of the class session to toggle",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "Invalid input: Please provide a boolean isActive value",
      });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const classSessionRepository =
        queryRunner.manager.getRepository(ClassSession);
      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);
      const studentRepository = queryRunner.manager.getRepository(Student);

      const sessionInstances = await sessionInstanceRepository.find({
        where: { id: Number(id) },
        relations: ["students", "classSession", "students.user"],
      });

      if (!sessionInstances || sessionInstances.length === 0) {
        return res.status(404).json({ message: "Class session not found" });
      }

      const processedStudentIds = new Set();
      const userIdsToNotify: number[] = [];
      const classSessionTopic =
        sessionInstances[0].classSession?.topic || "Unknown Topic";

      for (const instance of sessionInstances) {
        instance.isActive = isActive;
        await sessionInstanceRepository.save(instance);

        for (const student of instance.students) {
          const studentUserid = student.user.id;
          if (processedStudentIds.has(studentUserid)) continue;

          processedStudentIds.add(studentUserid);
          userIdsToNotify.push(studentUserid);
          if (student.sessionBalance && student.sessionBalance > 0) {
            const reduction = Math.min(
              student.sessionBalance,
              sessionInstances.length
            );
            student.sessionBalance -= reduction;
            await studentRepository.save(student);
          }
        }
      }

      const action = isActive ? "reactivated" : "deactivated";

      // Send a notification if the session was deactivated
      if (!isActive) {
        const message = NotificationTexts.classSessionDeactivation.message(
          classSessionTopic.name
        );

        await NotificationService.createNotification(
          userIdsToNotify,
          NotificationTexts.classSessionDeactivation.title,
          message,
          NotificationTexts.classSessionDeactivation.eventType
        );
      }

      await queryRunner.commitTransaction();

      res.json({ message: `Class sessions ${action} successfully` });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error toggling class session activation:", error);
      res
        .status(500)
        .json({ message: "Error toggling class session activation" });
    } finally {
      await queryRunner.release();
    }
  }

  static async updateFromToDate(req: AuthenticatedRequest, res: Response) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const classSessionRepository =
        queryRunner.manager.getRepository(ClassSession);
      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);

      const classSessionId = req.params.id;
      const {
        startDate,
        endDate,
        room,
        topicId,
        isHolidayCourse,
        teacherId,
        locationId,
        studentIds,
        dayDetails,
        note,
        sessionType,
      } = req.body;

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid startDate or endDate format" });
      }

      if (parsedStartDate > parsedEndDate) {
        return res
          .status(400)
          .json({ message: "Start Date cannot be after End Date" });
      }

      if (
        !dayDetails ||
        typeof dayDetails !== "object" ||
        Object.keys(dayDetails).length === 0
      ) {
        return res.status(400).json({
          message:
            "Invalid or missing dayDetails property. Ensure dayDetails is an object with at least one key.",
        });
      }

      const classSession = await classSessionRepository.findOne({
        where: { id: Number(classSessionId) },
        relations: ["topic", "instances"],
      });
      if (!classSession) {
        return res.status(404).json({ message: "Class session not found" });
      }

      if (isHolidayCourse !== undefined) {
        classSession.isHolidayCourse = isHolidayCourse;
      }

      if (topicId) {
        const topic = await queryRunner.manager
          .getRepository(Topic)
          .findOne({ where: { id: topicId } });
        if (!topic) return res.status(404).json({ message: "Topic not found" });
        classSession.topic = topic;
      }

      if (classSession.endDate < endDate) {
        classSession.endDate = endDate;
      }

      await classSessionRepository.save(classSession);

      const dayIndexMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

      const getTwoLetterDay = (date: Date): string => {
        const dayIndex = date.getDay();
        return dayIndexMap[dayIndex];
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const teacher = teacherId
        ? await queryRunner.manager
          .getRepository(Teacher)
          .findOne({ where: { id: teacherId } })
        : null;

      const location = locationId
        ? await queryRunner.manager
          .getRepository(Location)
          .findOne({ where: { id: locationId } })
        : null;

      const students = studentIds?.length
        ? await queryRunner.manager
          .getRepository(Student)
          .find({ where: { id: In(studentIds) } })
        : [];

      // **2. Delete Session Instances Within the Specified Date Range That Do Not Match dayDetails**
      const sessionInstancesInRange = await sessionInstanceRepository.find({
        where: {
          classSession: { id: classSession.id },
          date: Between(parsedStartDate, parsedEndDate),
        },
        relations: ["classSession"],
      });

      const instancesToDelete = sessionInstancesInRange.filter((instance) => {
        const instanceDate = new Date(instance.date);
        const instanceDay = getTwoLetterDay(instanceDate);
        return !dayDetails.hasOwnProperty(instanceDay);
      });

      const pastSessionInstances = instancesToDelete.filter(
        (instance) => new Date(instance.date) < today
      );

      if (pastSessionInstances.length > 0) {
        return res.status(500).json({
          message: `Cannot edit sessions that have already occurred.`,
        });
      }
      for (const instance of instancesToDelete) {
        const hasReports = await queryRunner.manager
          .getRepository(SessionReport)
          .count({ where: { session: { id: instance.id } } });

        if (hasReports > 0) {
          return res.status(500).json({
            message: `Cannot remove session instance on ${instance.date} as it has associated reports.`,
          });
        }
        await sessionInstanceRepository.softRemove(instance);
      }

      for (const instance of sessionInstancesInRange) {
        const instanceDate = new Date(instance.date);
        const instanceDay = getTwoLetterDay(instanceDate);
        const dayDetail = dayDetails[instanceDay];

        if (dayDetail) {
          instance.startTime = dayDetail.startTime || instance.startTime;
          instance.duration = dayDetail.duration || instance.duration;
        }

        instance.room = room || instance.room;
        instance.note = note || instance.note;
        instance.teacher = teacher || instance.teacher;
        instance.location = location || instance.location;
        instance.students = students.length ? students : instance.students;
        instance.sessionType = sessionType ? sessionType : instance.sessionType;

        await sessionInstanceRepository.save(instance);
      }

      const existingDates = sessionInstancesInRange.map((instance) => {
        const date =
          instance.date instanceof Date
            ? instance.date
            : new Date(instance.date);
        return date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
      });

      for (const [dayAbbreviation, sessionDetails] of Object.entries(
        dayDetails
      )) {
        let currentDate = new Date(parsedStartDate);

        while (currentDate <= parsedEndDate) {
          const instanceDay = getTwoLetterDay(currentDate);

          if (dayAbbreviation === instanceDay) {
            const dateString = currentDate.toISOString().split("T")[0];
            if (!existingDates.includes(dateString)) {
              if (currentDate < today) {
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
              }

              const newInstance = sessionInstanceRepository.create({
                classSession: classSession,
                date: new Date(currentDate),
                startTime: (sessionDetails as any).startTime,
                duration: (sessionDetails as any).duration,
                teacher: teacher || undefined,
                location: location || undefined,
                students: students.length ? students : undefined,
                room: room || undefined,
                note: undefined,
                sessionType: sessionType || undefined,
              });

              await sessionInstanceRepository.save(newInstance);
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      await queryRunner.commitTransaction();

      res.json({
        message:
          "Class session updated successfully within the specified date range.",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating class sessions within date range:", error);
      res
        .status(500)
        .json({ message: error || "Error updating class sessions" });
    } finally {
      await queryRunner.release();
    }
  }
}
const isStudentAvailableOnDay = (
  availableDates: string | undefined,
  dayIndex: number
): boolean => {
  if (!availableDates || typeof availableDates !== "string") {
    console.error("Invalid availableDates:", availableDates);
    return false; // Return false if availableDates is undefined or not a string
  }

  const dayIndexMap: Record<number, number> = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };

  const mappedIndex = dayIndexMap[dayIndex];
  if (mappedIndex === undefined || mappedIndex >= availableDates.length) {
    return false;
  }

  return availableDates.charAt(mappedIndex) === "1";
};
