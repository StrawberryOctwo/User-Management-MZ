import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Parent } from "../entities/parent.entity";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { Student } from "../entities/student.entity";
import bcrypt from "bcryptjs";
import { Brackets, In } from "typeorm";
import { UserDto } from "../dto/userDto";
import { SessionReport } from "../entities/session-report.entity";
import { addMilliseconds, formatISO } from "date-fns";

export class ParentController {
  static async addParent(req: AuthenticatedRequest, res: Response) {
    const { parent: parentData, user: userData } = req.body;

    if (!parentData.studentIds || parentData.studentIds.length === 0) {
      return res.status(400).json({ message: "At least one student must be associated with the parent" });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const parentRepository = queryRunner.manager.getRepository(Parent);
      const studentRepository = queryRunner.manager.getRepository(Student);
      const roleRepository = queryRunner.manager.getRepository(Role);

      // Check if the email already exists
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const parentRole = await roleRepository.findOne({
        where: { name: "Parent" },
      });
      if (!parentRole) {
        return res.status(404).json({ message: "Parent role not found" });
      }

      // Hash the password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).json({ message: "Error hashing password" });
      }

      let user;
      try {
        const newUser = userRepository.create({
          ...userData,
          password: hashedPassword,
          roles: [parentRole],
        });
        user = await userRepository.save(newUser);
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Error creating user" });
      }

      // Create and save the new parent
      let savedParent;
      try {
        const newParent: Parent = parentRepository.create({
          ...parentData,
          user,
        } as Parent);
        savedParent = await parentRepository.save(newParent);
      } catch (error) {
        console.error("Error creating parent:", error);
        return res.status(500).json({ message: "Error creating parent" });
      }

      // Fetch the full parent entity
      let fullParent;
      try {
        fullParent = await parentRepository.findOne({
          where: { id: savedParent.id },
          relations: ["students"],
        });
        if (!fullParent) {
          return res.status(404).json({ message: "Parent not found" });
        }
      } catch (error) {
        console.error("Error fetching parent:", error);
        return res.status(500).json({ message: "Error fetching parent" });
      }

      // Associate parent with students
      if (parentData.studentIds && parentData.studentIds.length > 0) {
        const students = await studentRepository.findBy({
          id: In(parentData.studentIds),
        });

        if (students.length !== parentData.studentIds.length) {
          return res
            .status(404)
            .json({ message: "Some students were not found" });
        }

        for (const student of students) {
          student.parent = fullParent;
          await studentRepository.save(student);
        }
      }

      await queryRunner.commitTransaction();

      res.status(201).json({ message: "Parent created successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error("Error adding parent:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getParents(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    try {
      const parentRepository = AppDataSource.getRepository(Parent);
      let query = parentRepository
        .createQueryBuilder("parent")
        .leftJoinAndSelect("parent.user", "user")
        .leftJoinAndSelect("parent.students", "students")
        .leftJoinAndSelect("students.user", "studentsUser")
        .leftJoinAndSelect("students.locations", "location")
        .leftJoinAndSelect("location.franchise", "franchise");

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("user.firstName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.lastName ILIKE :search", { search: `%${search}%` })
              .orWhere("user.email ILIKE :search", { search: `%${search}%` });
          })
        );
      }

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const [parents, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy("parent.createdAt", "DESC")
        .getManyAndCount();

      const parentDtos = parents.map((parent) => ({
        id: parent.id,
        accountHolder: parent.accountHolder,
        iban: parent.iban,
        bic: parent.bic,
        user: new UserDto(parent.user),
        studentCount: parent.students.length,
      }));

      res.status(200).json({
        data: parentDtos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching parents:", error);
      res.status(500).json({ message: "Error fetching parents" });
    }
  }

  static async getParentById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const parentRepository = AppDataSource.getRepository(Parent);

      let query = parentRepository
        .createQueryBuilder("parent")
        .leftJoinAndSelect("parent.user", "user")
        .leftJoinAndSelect("parent.students", "students")
        .leftJoinAndSelect("students.user", "studentsUser")
        .leftJoinAndSelect("students.locations", "location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .select([
          "parent.id",
          "parent.accountHolder",
          "parent.iban",
          "parent.bic",
          "parent.createdAt",
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.dob",
          "user.email",
          "user.address",
          "user.city",
          "user.postalCode",
          "user.phoneNumber",
          "students.id",
          "studentsUser.firstName",
          "studentsUser.lastName",
          "students.status",
          "students.gradeLevel",
        ])
        .where("parent.id = :id", { id: Number(id) });

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const parent = await query.getOne();

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // Map students to include firstName and lastName directly in the student object
      const students = parent.students.map((student) => ({
        id: student.id,
        status: student.status,
        gradeLevel: student.gradeLevel,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
      }));

      res.status(200).json({
        id: parent.id,
        createdAt: parent.createdAt,
        accountHolder: parent.accountHolder,
        iban: parent.iban,
        bic: parent.bic,
        user: new UserDto(parent.user),
        students,
      });
    } catch (error) {
      console.error("Error fetching parent:", error);
      res.status(500).json({
        message: "Error fetching parent",
      });
    }
  }

  static async updateParent(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { parent: parentData, user: userData } = req.body;

    if (!parentData.studentIds || parentData.studentIds.length === 0) {
      return res.status(400).json({ message: "At least one student must be associated with the parent" });
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const parentRepository = queryRunner.manager.getRepository(Parent);
      const userRepository = queryRunner.manager.getRepository(User);
      const studentRepository = queryRunner.manager.getRepository(Student);

      // Fetch the parent with relations
      const parent = await parentRepository.findOne({
        where: { id: Number(id) },
        relations: ["user", "students"],
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      // Update user data
      if (userData) {
        Object.assign(parent.user, userData);

        // If updating password, hash it
        if (userData.password) {
          try {
            parent.user.password = await bcrypt.hash(userData.password, 10);
          } catch (error) {
            console.error("Error hashing password:", error);
            return res.status(500).json({ message: "Error hashing password" });
          }
        }

        await userRepository.save(parent.user);
      }

      // Update parent data
      Object.assign(parent, parentData);

      const updatedParent = await parentRepository.save(parent);

      // Re-fetch the full parent entity after updates
      const fullParent = await parentRepository.findOne({
        where: { id: updatedParent.id },
        relations: ["students"],
      });

      if (!fullParent) {
        throw new Error("Parent entity not found after updating.");
      }

      // Associate parent with new students
      if (parentData.studentIds && parentData.studentIds.length > 0) {
        const students = await studentRepository.findBy({
          id: In(parentData.studentIds),
        });

        if (students.length !== parentData.studentIds.length) {
          return res
            .status(404)
            .json({ message: "Some students were not found" });
        }

        // Unlink current students
        for (const currentStudent of fullParent.students) {
          await studentRepository
            .createQueryBuilder()
            .relation(Student, "parent")
            .of(currentStudent)
            .set(null);
        }

        // Link new students
        for (const student of students) {
          student.parent = fullParent;
          await studentRepository.save(student);
        }
      }

      await queryRunner.commitTransaction();

      res.status(200).json({
        message: "Parent updated successfully",
        parentId: updatedParent.id,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error("Error updating parent:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await queryRunner.release();
    }
  }

  // static async assignOrUpdateParentStudents(
  //   req: AuthenticatedRequest,
  //   res: Response
  // ) {
  //   const { studentIds, parentId } = req.body;

  //   try {
  //     const studentRepository = AppDataSource.getRepository(Student);
  //     const parentRepository = AppDataSource.getRepository(Parent);

  //     const parent = await parentRepository.findOne({
  //       where: { id: Number(parentId) },
  //       relations: ["students"],
  //     });

  //     if (!parent) {
  //       return res.status(404).json({ message: "Parent not found" });
  //     }

  //     const newStudents = await studentRepository.findBy({
  //       id: In(studentIds.map((id: any) => Number(id))),
  //     });

  //     for (const student of newStudents) {
  //       student.parent = parent;
  //       await studentRepository.save(student);
  //     }

  //     res.status(200).json({ message: "Parent students updated successfully" });
  //   } catch (error) {
  //     console.error("Error updating parent students:", error);
  //     res.status(500).json({ message: "Error updating parent students" });
  //   }
  // }

  static async getStudentsByParent(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    try {
      const parentRepository = AppDataSource.getRepository(Parent);
      const studentRepository = AppDataSource.getRepository(Student);

      const parent = await parentRepository.findOne({
        where: { id: Number(id) },
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      let query = studentRepository
        .createQueryBuilder("student")
        .leftJoinAndSelect("student.location", "location")
        .leftJoinAndSelect("student.parent", "parent")
        .where("student.parent.id = :parentId", { parentId: Number(id) });

      if (search) {
        query = query.andWhere(
          new Brackets((qb) => {
            qb.where("student.firstName ILIKE :search", {
              search: `%${search}%`,
            })
              .orWhere("student.lastName ILIKE :search", {
                search: `%${search}%`,
              })
              .orWhere("student.email ILIKE :search", {
                search: `%${search}%`,
              });
          })
        );
      }

      const [students, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy("student.createdAt", "DESC")
        .getManyAndCount();

      res.status(200).json({
        data: students,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching students for parent:", error);
      res.status(500).json({ message: "Error fetching students for parent" });
    }
  }
  static async deleteParent(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Invalid input: Please provide a parent ID" });
    }

    try {
      const parentRepository = AppDataSource.getRepository(Parent);

      const parentExists = await parentRepository
        .createQueryBuilder("parent")
        .where("parent.id = :id", { id: Number(id) })
        .getOne();

      if (!parentExists) {
        return res
          .status(404)
          .json({ message: "Parent not found or already deleted" });
      }

      await parentRepository
        .createQueryBuilder()
        .softDelete()
        .where("id = :id", { id: Number(id) })
        .execute();

      res.status(200).json({ message: "Parent deleted successfully" });
    } catch (error) {
      console.error("Error deleting parent:", error);
      res.status(500).json({ message: "Error deleting parent" });
    }
  }

  static async getSessionReportsByParent(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
      const studentRepository = AppDataSource.getRepository(Student);
      const parentRepository = AppDataSource.getRepository(Parent);
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);

      const student = await studentRepository.findOne({
        where: { user: { id: Number(id) } },
        relations: ["user"],
      });

      if (student) {
        const [sessionReports, total] = await sessionReportRepository
          .createQueryBuilder("sessionReport")
          .leftJoinAndSelect("sessionReport.session", "classSession")
          .leftJoinAndSelect("sessionReport.student", "student")
          .leftJoinAndSelect("student.user", "studentUser")
          .where("sessionReport.student.id = :studentId", {
            studentId: student.id,
          })
          .skip((Number(page) - 1) * Number(limit))
          .take(Number(limit))
          .orderBy("sessionReport.createdAt", "DESC")
          .getManyAndCount();

        const pageCount = Math.ceil(total / Number(limit));

        const data = sessionReports.map((report) => {
          const [hours, minutes] = report.session.startTime
            .split(":")
            .map(Number);
          const sessionStartDate = new Date();
          sessionStartDate.setHours(hours, minutes, 0, 0);

          const sessionDurationInMinutes = report.session.duration ?? 0;

          const sessionDurationInMs = sessionDurationInMinutes * 60 * 1000;

          const sessionEndDate = addMilliseconds(
            sessionStartDate,
            sessionDurationInMs
          );

          const formattedSessionStartDate = formatISO(sessionStartDate);
          const formattedSessionEndDate = formatISO(sessionEndDate);

          console.log(
            `Start: ${formattedSessionStartDate}, End: ${formattedSessionEndDate}`
          );

          return {
            id: report.id,
            studentName: `${report.student.user.firstName} ${report.student.user.lastName}`,
            sessionStartDate: formattedSessionStartDate,
            sessionEndDate: formattedSessionEndDate,
            reportDate: formatISO(new Date(report.createdAt)),
            lessonTopic: report.lessonTopic,
          };
        });
        return res
          .status(200)
          .json({ data, total, page: Number(page), pageCount });
      }

      const parent = await parentRepository.findOne({
        where: { user: { id: Number(id) } },
        relations: ["students"],
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      const studentIds = parent.students.map((student) => student.id);
      const query = sessionReportRepository
        .createQueryBuilder("sessionReport")
        .leftJoinAndSelect("sessionReport.student", "student")
        .leftJoinAndSelect("student.user", "studentUser")
        .leftJoinAndSelect("sessionReport.session", "classSession")
        .where("student.id IN (:...studentIds)", { studentIds })
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("sessionReport.createdAt", "DESC");

      const [sessionReports, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      console.log(sessionReports);
      const data = sessionReports.map((report) => {
        const [hours, minutes] = report.session.startTime
          .split(":")
          .map(Number);
        const sessionStartDate = new Date();
        sessionStartDate.setHours(hours, minutes, 0, 0);

        const sessionDurationInMinutes = report.session.duration ?? 0;

        const sessionDurationInMs = sessionDurationInMinutes * 60 * 1000;

        const sessionEndDate = addMilliseconds(
          sessionStartDate,
          sessionDurationInMs
        );

        const formattedSessionStartDate = formatISO(sessionStartDate);
        const formattedSessionEndDate = formatISO(sessionEndDate);

        console.log(
          `Start: ${formattedSessionStartDate}, End: ${formattedSessionEndDate}`
        );

        return {
          id: report.id,
          studentName: `${report.student.user.firstName} ${report.student.user.lastName}`,
          sessionStartDate: formattedSessionStartDate,
          sessionEndDate: formattedSessionEndDate,
          reportDate: formatISO(new Date(report.createdAt)),
          lessonTopic: report.lessonTopic,
        };
      });

      return res
        .status(200)
        .json({ data, total, page: Number(page), pageCount });
    } catch (error) {
      console.error(`Server error: ${error}`);
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }
}
