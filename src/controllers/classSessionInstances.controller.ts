import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";
import {NotificationService} from "./notification.controller";
import { In } from "typeorm";

export class SessionInstanceController {
  static async updateSessionInstance(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const {
      date,
      startTime,
      duration,
      teacherId,
      studentIds,
      sessionType,
      note,
      isActive,
      room,
    } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Ensure the transaction is started
      await queryRunner.startTransaction();

      const sessionInstanceRepository =
        queryRunner.manager.getRepository(SessionInstance);
      const studentRepository = queryRunner.manager.getRepository(Student);

      const sessionInstance = await sessionInstanceRepository.findOne({
        where: { id: Number(id) },
        relations: [
          "teacher",
          "teacher.user",
          "location",
          "students",
          "students.user",
          "classSession",
        ],
      });

      if (!sessionInstance) {
        throw new Error("Session instance not found");
      }

      // Track changes
      const changesSet = new Set<string>();

      if (date && date !== sessionInstance.date) {
        changesSet.add(
          `Date updated from "${sessionInstance.date}" to "${date}"`
        );
        sessionInstance.date = new Date(date);
      }

      if (startTime && startTime !== sessionInstance.startTime) {
        changesSet.add(
          `Start time updated from "${sessionInstance.startTime}" to "${startTime}"`
        );
        sessionInstance.startTime = startTime;
      }

      if (duration && duration !== sessionInstance.duration) {
        changesSet.add(
          `Duration updated from "${sessionInstance.duration}m" to "${duration}m"`
        );
        sessionInstance.duration = duration;
      }

      if (note !== undefined && note !== sessionInstance.note) {
        sessionInstance.note = note;
      }

      if (isActive !== undefined && isActive !== sessionInstance.isActive) {
        sessionInstance.isActive = isActive;
      }

      if (room && room !== sessionInstance.room) {
        changesSet.add(
          `Room updated from "${sessionInstance.room}" to "${room}"`
        );
        sessionInstance.room = room;
      }

      if (sessionType && sessionType !== sessionInstance.sessionType) {
        changesSet.add(
          `Session type updated from "${sessionInstance.sessionType}" to "${sessionType}"`
        );
        sessionInstance.sessionType = sessionType;
      }

      if (
        teacherId &&
        (!sessionInstance.teacher || sessionInstance.teacher.id !== teacherId)
      ) {
        const teacher = await queryRunner.manager
          .getRepository(Teacher)
          .findOne({
            where: { id: teacherId },
            relations: ["user"],
          });
        if (!teacher) {
          throw new Error("Invalid teacher ID");
        }
        changesSet.add(
          `Teacher updated from "${sessionInstance.teacher?.user?.firstName} ${sessionInstance.teacher?.user?.lastName}" to "${teacher.user.firstName} ${teacher.user.lastName}"`
        );
        sessionInstance.teacher = teacher;
      }

      if (studentIds) {
        const currentStudentIds = sessionInstance.students.map(
          (student) => student.id
        );
        const newStudentIds = studentIds.filter(
          (id: number) => !currentStudentIds.includes(id)
        );
        const removedStudentIds = currentStudentIds.filter(
          (id) => !studentIds.includes(id)
        );

        // for (const newStudentId of newStudentIds) {
        //   const student = await studentRepository.findOne({
        //     where: { id: newStudentId },
        //   });
        //   if (student && student.sessionBalance && student.sessionBalance > 0) {
        //     student.sessionBalance -= 1;
        //     await studentRepository.save(student);
        //   }
        // }

        // for (const removedStudentId of removedStudentIds) {
        //   const student = await studentRepository.findOne({
        //     where: { id: removedStudentId },
        //   });
        //   if (student) {
        //     student.sessionBalance += 1;
        //     await studentRepository.save(student);
        //   }
        // }

        const students = await studentRepository.find({
          where: { id: In(studentIds) },
          relations: ["user"],
        });

        sessionInstance.students = students;
      }

      await sessionInstanceRepository.save(sessionInstance);

      // Notify students and teacher
      const studentUserIds = Array.from(
        new Set(sessionInstance.students.map((student) => student.user?.id))
      );

      const teacherUserId = sessionInstance.teacher?.user.id;

      const allUserIds = [
        ...studentUserIds,
        ...(teacherUserId ? [teacherUserId] : []),
      ];

      const title = `Session on ${new Date(
        sessionInstance.date
      ).toDateString()} Updated`;
      const changes = Array.from(changesSet);
      const message =
        changes.length === 1
          ? `- ${changes[0]}`
          : `The session has been updated. Changes are:\n${changes
              .map((change) => `- ${change}`)
              .join("\n")}`;

      await NotificationService.createNotification(
        allUserIds,
        title,
        message,
        "session-update"
      );

      await queryRunner.commitTransaction();

      return res.json({
        message: "Session instance updated successfully",
      });
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      console.error("Error updating session instance:", error);
      return res.status(500).json({
        message: `Error updating session instance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      await queryRunner.release();
    }
  }

  static async deleteSessionInstance(
    req: AuthenticatedRequest,
    res: Response
  ) {}
}
