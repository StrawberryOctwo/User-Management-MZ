import { Request, Response } from "express";
import { Student } from "../entities/student.entity";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { UserDto } from "../dto/userDto";
import { Brackets, In, QueryFailedError } from "typeorm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  handleQueryFailedError,
  saveOrUpdateStudent,
} from "./helperFunctions/studentHelper";
import { FileUpload } from "../entities/file-upload.entity";
import { Absence } from "../entities/absence.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";
import {NotificationService} from "./notification.controller";
import { NotificationTexts } from "./helperFunctions/notificationTexts";
import { SessionReportController } from "./sessionReport.controller";

export class StudentController {
  static async addStudent(req: AuthenticatedRequest, res: Response) {
    const { user: userData, student: studentData } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { user, student } = await saveOrUpdateStudent(
        queryRunner,
        userData,
        studentData,
        studentData.locationIds
      );

      await queryRunner.commitTransaction();

      res.status(201).json({
        message: "Student added successfully",
        studentId: student.id,
        userId: user.id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        const errorMessage = handleQueryFailedError(error);
        console.error("Error adding student:", errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      console.error("Error adding student:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getStudents(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search, locationId } = req.query;

    try {
      const studentRepository = AppDataSource.getRepository(Student);

      let query = studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("student.locations", "location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .select([
          "student.id",
          "student.gradeLevel",
          "student.status",
          "student.createdAt",
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.email",
        ]);

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("user.firstName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.lastName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.email ILIKE :search", { search: `%${search}%` });
          })
        );
      }

      if (locationId) {
        query = query.andWhere("locations.id = :locationId", { locationId });
      }

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const [students, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy("student.createdAt", "DESC")
        .getManyAndCount();

      const studentDTOs = students.map((student) => ({
        id: student.id,
        userId: student.user.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        gradeLevel: student.gradeLevel,
        status: student.status,
      }));

      res.status(200).json({
        data: studentDTOs,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Error fetching students" });
    }
  }

  static async getStudentById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const studentRepository = AppDataSource.getRepository(Student);

      let query = studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("student.locations", "locations")
        .leftJoinAndSelect("locations.franchise", "franchise")
        .leftJoin("student.parent", "parent")
        .leftJoin("parent.user", "parentUser")
        .leftJoinAndSelect("student.topics", "topics")
        .leftJoinAndSelect("student.absences", "absences")
        .leftJoinAndSelect("student.sessionReports", "sessionReports")
        .leftJoinAndSelect("student.contract", "contract")
        .leftJoinAndSelect("student.schoolType", "schoolType")
        .where("student.id = :id", { id: Number(id) })
        .select([
          "student",
          "user",
          "locations",
          "franchise",
          "topics",
          "parent.id",
          "parentUser.lastName",
          "parentUser.firstName",
          "contract.id",
          "contract.name",
          "schoolType",
        ]);

      const student = await query.getOne();

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const topics = student.topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
      }));

      res.status(200).json({
        ...student,
        user: new UserDto(student.user),
        topics,
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Error fetching student" });
    }
  }

  static async updateStudent(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { user: userData, student: studentData } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const studentRepository = queryRunner.manager.getRepository(Student);

      const existingStudent = await studentRepository.findOne({
        where: { id: Number(id) },
        relations: ["user", "parent", "locations"],
      });

      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { user, student } = await saveOrUpdateStudent(
        queryRunner,
        userData,
        studentData,
        studentData.locationIds,
        true,
        existingStudent
      );

      await queryRunner.commitTransaction();

      res.status(200).json({
        message: "Student updated successfully",
        studentId: student.id,
        userId: user.id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        const errorMessage = handleQueryFailedError(error);
        console.error("Error updating student:", errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async assignLocationToStudent(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { studentId, locationId } = req.params;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const locationRepository = queryRunner.manager.getRepository(Location);

      const student = await studentRepository.findOne({
        where: { id: Number(studentId) },
        relations: ["locations"],
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const location = await locationRepository.findOne({
        where: { id: Number(locationId) },
      });

      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      student.locations = [...student.locations, location];

      await studentRepository.save(student);
      await queryRunner.commitTransaction();

      return res
        .status(200)
        .json({ message: "Location assigned to student successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error assigning location to student:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getStudentByUserId(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params;

    try {
      const studentRepository = AppDataSource.getRepository(Student);

      let query = studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("student.locations", "locations")
        .leftJoinAndSelect("student.parent", "parent")
        .leftJoinAndSelect("student.topics", "topics")
        .where("student.user.id = :userId", { userId: Number(userId) });

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const student = await query.getOne();

      if (!student) {
        return res
          .status(404)
          .json({ message: "Student not found for the provided user ID" });
      }

      const studentDto = {
        ...student,
        user: new UserDto(student.user),
      };

      res.status(200).json(studentDto);
    } catch (error) {
      console.error("Error fetching student by user ID:", error);
      res.status(500).json({ message: "Error fetching student by user ID" });
    }
  }

  static async deleteStudent(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        message: "Invalid input: Please provide an array of student IDs",
      });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const studentRepository = queryRunner.manager.getRepository(Student);

      await studentRepository
        .createQueryBuilder()
        .softDelete()
        .whereInIds(ids)
        .execute();

      await queryRunner.commitTransaction();

      res.status(200).json({ message: "Students deleted successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error deleting students:", error);
      res.status(500).json({ message: "Error deleting students" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getStudentDocuments(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const studentRepository = AppDataSource.getRepository(Student);
      const fileRepository = AppDataSource.getRepository(FileUpload);

      const student = await studentRepository.findOne({
        where: { id: Number(id) },
        relations: ["user"],
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const studentDocuments = await fileRepository.find({
        where: { user: { id: student.user.id } },
        select: ["id", "name", "type", "path", "createdAt"],
      });

      const transformedDocuments = studentDocuments.map((doc) => ({
        ...doc,
        path: doc.path.split("__ORIGINAL__")[1],
      }));

      return res.status(200).json({
        message: "Student documents retrieved successfully",
        documents: transformedDocuments,
      });
    } catch (error) {
      console.error("Error fetching student documents:", error);
      return res
        .status(500)
        .json({ message: "Error fetching student documents" });
    }
  }

  static async assignFilesToAbsence(req: AuthenticatedRequest, res: Response) {
    const { absenceId } = req.params;
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({
        message: "Please select a file before uploading your absence",
      });
    }

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);
      const fileRepository = AppDataSource.getRepository(FileUpload);

      const absence = await absenceRepository.findOne({
        where: { id: Number(absenceId) },
        relations: ["files"],
      });
      if (!absence) {
        return res.status(404).json({ message: "Absence not found." });
      }

      for (const fileId of fileIds) {
        const file = await fileRepository.findOne({
          where: { id: fileId },
          relations: ["absences"],
        });

        if (file && file.absences.length > 0) {
          return res.status(400).json({
            message: `File with name ${file.name} is already associated with another absence`,
          });
        }
      }

      const files = await fileRepository.findBy({
        id: In(fileIds),
      });
      if (files.length !== fileIds.length) {
        return res
          .status(404)
          .json({ message: "One or more files not found." });
      }

      absence.files = files;
      await absenceRepository.save(absence);

      res.status(200).json({
        message: "Files assigned to absence successfully",
        files: files.map((f) => f.id),
      });
    } catch (error) {
      console.error("Error assigning files to absence:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async createAbsence(req: AuthenticatedRequest, res: Response) {
    const { studentId, classSessionId } = req.body;

    if (!studentId || !classSessionId) {
      return res
        .status(400)
        .json({ message: "Student ID and Class Session ID are required." });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const studentRepository = queryRunner.manager.getRepository(Student);
      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);
      const absenceRepository = queryRunner.manager.getRepository(Absence);

      const student = await studentRepository.findOne({
        where: { id: studentId },
        relations: ["parent.user"],
      });
      const sessionInstance = await sessionInstanceRepository.findOne({
        where: { id: classSessionId },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
      if (!sessionInstance) {
        return res.status(404).json({ message: "Class session not found." });
      }

      // Check for consecutive absences
      const recentAbsences = await absenceRepository.find({
        where: {
          student: { id: studentId },
          sessionInstance: { id: classSessionId },
        },
        order: { createdAt: "DESC" },
        take: 3, // Fetch the 3 most recent absences for this student and class
      });

      const consecutiveAbsences = recentAbsences.every(
        (absence) => absence.status === null || absence.status === true
      );

      await queryRunner.startTransaction();

      // Create the new absence
      const newAbsence = absenceRepository.create({
        student,
        sessionInstance,
        reason: "",
        status: null,
      });

      const savedAbsence = await absenceRepository.save(newAbsence);

      // If there are 3 previous consecutive absences, send a notification
      if (recentAbsences.length === 3 && consecutiveAbsences) {
        const message = NotificationTexts.studentAbsence.message(
          `${student.user.firstName} ${student.user.lastName}`,
          sessionInstance.classSession.topic.name
        );

        await NotificationService.createNotification(
          [student.parent.id],
          NotificationTexts.studentAbsence.title,
          message,
          NotificationTexts.studentAbsence.eventType
        );
      }

      await queryRunner.commitTransaction();

      return res.status(201).json({
        message: "Absence created successfully",
        absence: {
          absenceId: savedAbsence.id,
          studentId: savedAbsence.student.id,
          classSessionId: savedAbsence.sessionInstance.id,
        },
      });
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error("Error creating absence:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async deleteAbsence(req: AuthenticatedRequest, res: Response) {
    const { absenceId } = req.params;

    if (!absenceId) {
      return res.status(400).json({ message: "Absence ID is required." });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const absenceRepository = queryRunner.manager.getRepository(Absence);

      const absence = await absenceRepository.findOne({
        where: { id: Number(absenceId) },
      });

      if (!absence) {
        return res.status(404).json({ message: "Absence not found." });
      }

      await queryRunner.startTransaction();

      await absenceRepository.delete({ id: Number(absenceId) });

      await queryRunner.commitTransaction();

      return res.status(200).json({ message: "Absence deleted successfully" });
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error("Error deleting absence:", error);
      return res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async updateAbsenceReason(req: AuthenticatedRequest, res: Response) {
    const { absenceId, reason } = req.body;

    if (!absenceId || !reason) {
      return res
        .status(400)
        .json({ message: "Absence ID and reason are required." });
    }

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);

      const absence = await absenceRepository.findOne({
        where: { id: absenceId },
        relations: ["student", "sessionInstance"],
      });
      if (!absence) {
        return res.status(404).json({ message: "Absence not found." });
      }

      absence.reason = reason;
      const updatedAbsence = await absenceRepository.save(absence);

      return res.status(200).json({
        message: "Absence reason updated successfully",
        absence: {
          absenceId: updatedAbsence.id,
          reason: updatedAbsence.reason,
        },
      });
    } catch (error) {
      console.error("Error updating absence reason:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateAbsenceStatus(req: AuthenticatedRequest, res: Response) {
    const { absenceId, status } = req.body;

    if (!absenceId || typeof status !== "boolean") {
      return res
        .status(400)
        .json({ message: "Absence ID and a boolean status are required." });
    }

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);

      const absence = await absenceRepository.findOne({
        where: { id: absenceId },
        relations: ["student", "sessionInstance","student.user"],
      });
      if (!absence) {
        return res.status(404).json({ message: "Absence not found." });
      }

      absence.status = status;
      const updatedAbsence = await absenceRepository.save(absence);

      if (status === false){
        await SessionReportController.createPaymentForUser({
          userId: absence.student.user.id,
          classSessionId:absence.sessionInstance.id,
        });
      }

      return res.status(200).json({
        message: "Absence status updated successfully",
        absence: {
          absenceId: updatedAbsence.id,
          status: updatedAbsence.status,
        },
      });
    } catch (error) {
      console.error("Error updating absence status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getClassSessionAbsencesByStudentId(req: AuthenticatedRequest, res: Response) {
    const studentId = Number(req.params.studentId);
    const sessionId = Number(req.params.sessionId);

    if (isNaN(studentId) || isNaN(sessionId)) {
      return res
        .status(400)
        .json({ message: "Invalid student ID or session ID." });
    }

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);

      const absences = await absenceRepository.find({
        where: {
          student: { id: studentId },
          sessionInstance: { id: sessionId },
        },
        relations: ["sessionInstance", "student", "files"],
      });

      if (absences.length === 0) {
        return res.status(201).json({
          message: "No absences found for the specified student and session.",
        });
      }

      res.json({
        message: "Absences fetched successfully",
        absences: absences.map((absence) => ({
          absenceId: absence.id,
          studentId: absence.student.id,
          sessionInstanceId: absence.sessionInstance.id,
          reason: absence.reason,
          status: absence.status,
          date: absence.createdAt,
          files: absence.files,
        })),
      });
    } catch (error) {
      console.error("Error fetching absences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAbsenceById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);

      const absence = await absenceRepository
        .createQueryBuilder("absence")
        .leftJoinAndSelect("absence.sessionInstance", "sessionInstance")
        .leftJoinAndSelect("absence.student", "student")
        .leftJoinAndSelect("absence.files", "file")
        .where("absence.id = :id", { id })

        .andWhere("student.user.id = :userId", { userId: req.user.id })
        .select([
          "absence.id",
          "absence.reason",
          "absence.status",
          "absence.createdAt",
          "sessionInstance.id",
          "sessionInstance.date",
          "file.id",
          "file.name",
        ])
        .getOne();

      if (!absence) {
        return res.status(404).json({ message: "Absence not found" });
      }

      const absenceDTO = {
        id: absence.id,
        reason: absence.reason,
        status: absence.status,
        date: absence.createdAt,
        classSessionId: absence.sessionInstance?.id || null,
        classSessionDate: absence.sessionInstance?.date || null,
        files: absence.files.map((file) => ({
          id: file.id,
          name: file.name,
        })),
      };

      res.status(200).json(absenceDTO);
    } catch (error) {
      console.error("Error fetching absence by ID:", error);
      res.status(500).json({ message: "Error fetching absence", error });
    }
  }

  static async getSelfAbsences(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    if (!req.user) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const userId = req.user.id;

    try {
      const absenceRepository = AppDataSource.getRepository(Absence);

      let query = absenceRepository
        .createQueryBuilder("absence")
        .leftJoinAndSelect("absence.sessionInstance", "sessionInstance")
        .leftJoinAndSelect("absence.student", "student")
        .where("student.user.id = :userId", { userId })

        .select([
          "absence.id",
          "absence.reason",
          "absence.status",
          "absence.createdAt",
          "sessionInstance.id",
          "sessionInstance.date",
        ]);

      const [absences, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy("absence.createdAt", "DESC")
        .getManyAndCount();

      const absenceDTOs = absences.map((absence) => ({
        id: absence.id,
        reason: absence.reason,
        status: absence.status,
        date: absence.createdAt,
        classSessionId: absence.sessionInstance?.id || null,
        classSessionDate: absence.sessionInstance.date,
      }));

      res.status(200).json({
        data: absenceDTOs,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching self absences:", error);
      res.status(500).json({ message: "Error fetching absences" });
    }
  }

  static async getStudentsForParent(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search, locationId } = req.query;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const parentUserId = req.user.id;

    try {
      const studentRepository = AppDataSource.getRepository(Student);

      let query = studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("student.locations", "location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .leftJoin("student.parent", "parent")
        .andWhere("parent.userId = :parentUserId", { parentUserId })
        .select([
          "student.id",
          "student.gradeLevel",
          "student.status",
          "student.createdAt",
          "user.firstName",
          "user.lastName",
          "user.email",
        ]);

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("user.firstName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.lastName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.email ILIKE :search", { search: `%${search}%` });
          })
        );
      }

      if (locationId) {
        query = query.andWhere("location.id = :locationId", { locationId });
      }

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const [students, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy("student.createdAt", "DESC")
        .getManyAndCount();

      const studentDTOs = students.map((student) => ({
        id: student.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        gradeLevel: student.gradeLevel,
        status: student.status,
      }));

      res.status(200).json({
        data: studentDTOs,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching students for parent:", error);
      res.status(500).json({ message: "Error fetching students for parent" });
    }
  }
}
