import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { SessionReport } from "../entities/session-report.entity";
import { ClassSession } from "../entities/class-session.entity";
import { Student } from "../entities/student.entity";
import { DeepPartial, QueryFailedError } from "typeorm";
import { Absence } from "../entities/absence.entity";
import PaymentController from "./payment.controller";
import { differenceInMinutes } from "date-fns";
import { Payment } from "../entities/payment.entity";
import { User } from "../entities/user.entity";
import { Teacher } from "../entities/teacher.entity";
import { PackageSessionTypePrice } from "../entities/packageSessionTypePrice.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";
import { NotificationTexts } from "./helperFunctions/notificationTexts";
import {NotificationService} from "./notification.controller";
import CustomError from "./CustomError";

export class SessionReportController {
  static async createSessionReport(req: AuthenticatedRequest, res: Response) {
    const {
      lessonTopic,
      coveredMaterials,
      progress,
      learningAssessment,
      activeParticipation,
      concentration,
      worksIndependently,
      cooperation,
      previousHomeworkCompleted,
      nextHomework,
      tutorRemarks,
      classSessionId,
      studentId,
    } = req.body;

    const sessionReportRepository = AppDataSource.getRepository(SessionReport);
    const classSessionRepository = AppDataSource.getRepository(SessionInstance);
    const studentRepository = AppDataSource.getRepository(Student);

    try {
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        const classSession = await transactionalEntityManager.findOne(
          SessionInstance,
          {
            where: { id: classSessionId },
            relations: ["teacher", "teacher.user"],
          }
        );
        const student = await transactionalEntityManager.findOne(Student, {
          where: { id: studentId },
          relations: ["user"],
        });

        if (!classSession || !student) {
          throw new Error("Class session or student not found");
        }

        const sessionReport = sessionReportRepository.create({
          lessonTopic,
          coveredMaterials,
          progress,
          learningAssessment,
          activeParticipation,
          concentration,
          worksIndependently,
          cooperation,
          previousHomeworkCompleted,
          nextHomework,
          tutorRemarks,
          session: classSession,
          student: student,
        });

        await transactionalEntityManager.save(sessionReport);

        await SessionReportController.createPaymentForUser({
          userId: student.user.id,
          classSessionId,
        });

        // Send notification to the student using NotificationTexts
        const notificationTitle = NotificationTexts.sessionReport.title();
        const notificationMessage =
          NotificationTexts.sessionReport.message(lessonTopic);
        await NotificationService.createNotification(
          [student.user.id],
          notificationTitle,
          notificationMessage,
          NotificationTexts.sessionReport.eventType
        );
      });

      // const allReportsCompleted =
      //   await SessionReportController.checkAllReportsCompletedForSession(
      //     classSessionId
      //   );
      //   console.log(allReportsCompleted)
      // if (allReportsCompleted) {
      //   const classSession = await classSessionRepository.findOne({
      //     where: { id: classSessionId },
      //     relations: ["teacher", "teacher.user"],
      //   });

      //   if (classSession?.teacher?.user) {
      //     await SessionReportController.createPaymentForUser({
      //       userId: classSession.teacher.user.id,
      //       classSessionId,
      //     });
      //   }
      // }

      return res
        .status(201)
        .json({ message: "Session report created successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async submitTeacherSessionReports(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { classSessionId } = req.body;

    if (!classSessionId || isNaN(Number(classSessionId))) {
      return res
        .status(400)
        .json({ message: "Invalid classSessionId provided." });
    }

    try {
      const classSessionRepository =
        AppDataSource.getRepository(SessionInstance);

      // Fetch the class session
      const classSession = await classSessionRepository.findOne({
        where: { id: Number(classSessionId) },
        relations: ["teacher", "teacher.user"],
      });

      if (!classSession) {
        return res
          .status(404)
          .json({
            message: `Class session with ID ${classSessionId} not found.`,
          });
      }

      // Check if reports are already submitted
      if (classSession.reportsSubmitted) {
        return res.status(400).json({
          message:
            "Cannot resubmit session reports for the same class session!",
        });
      }

      // Check if all reports are completed
      const result =
        await SessionReportController.checkAllReportsCompletedForSession(
          Number(classSessionId)
        );

      if (result.allReportsCompleted) {
        if (result.totalToPay === 0) {
          return res.status(400).json({
            message: "No payments required as total to pay is zero.",
          });
        }

        if (classSession?.teacher?.user) {
          await SessionReportController.createPaymentForUser({
            userId: classSession.teacher.user.id,
            classSessionId,
            totalStudents: result.totalToPay,
          });
        }

        // Update reportsSubmitted flag and save the class session
        classSession.reportsSubmitted = true;
        await classSessionRepository.save(classSession);

        return res.status(200).json({
          message: "All session reports have been successfully submitted.",
          data: result,
        });
      } else {
        return res.status(400).json({
          message:
            "Not all reports are completed. Please ensure all student reports are submitted before proceeding.",
        });
      }
    } catch (error: any) {
      console.error("Error submitting teacher session reports:", error);

      // Handle custom errors or specific cases
      if (error instanceof CustomError) {
        return res.status(error.status).json({ message: error.message });
      }

      if (error.message.includes("absence was not confirmed")) {
        return res.status(400).json({ message: error.message });
      }

      return res
        .status(500)
        .json({
          message:
            "An unexpected error occurred while submitting session reports.",
        });
    }
  }

  static async getClassSessionReports(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { classSessionId } = req.params;

    try {
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);
      const sessionReports = await sessionReportRepository.find({
        where: { session: { id: Number(classSessionId) } },
        relations: ["student", "student.user"],
      });

      return res.status(200).json({ sessionReports });
    } catch (error) {
      console.error("Error fetching session reports:", error);
      return res
        .status(500)
        .json({ message: "Error fetching session reports" });
    }
  }

  static async getClassSessionReportsStatus(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { classSessionId } = req.params;

    try {
      const classSessionRepository =
        AppDataSource.getRepository(SessionInstance);
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);
      const absenceRepository = AppDataSource.getRepository(Absence);

      const classSession = await classSessionRepository.findOne({
        where: { id: Number(classSessionId) },
        relations: ["students"],
      });

      if (!classSession) {
        return res.status(404).json({ message: "Class session not found" });
      }

      const studentCount = classSession.students.length;

      const completedReportsCount = await sessionReportRepository.count({
        where: {
          session: { id: Number(classSessionId) },
        },
      });

      const absencesCount = await absenceRepository.count({
        where: {
          sessionInstance: { id: Number(classSessionId) },
          status: true,
        },
      });

      const allReportsCompleted =
        completedReportsCount + absencesCount >= studentCount;

      return res.status(200).json({
        allReportsCompleted,
        totalStudents: studentCount,
        completedReports: completedReportsCount,
        absences: absencesCount,
      });
    } catch (error) {
      console.error("Error fetching session report status:", error);
      return res
        .status(500)
        .json({ message: "Error fetching session report status" });
    }
  }

  static async getStudentSessionReports(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { studentId } = req.params;

    try {
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);

      const sessionReports = await sessionReportRepository.find({
        where: {
          student: { id: Number(studentId) },
        },
        relations: ["session"],
      });

      if (sessionReports.length === 0) {
        return res
          .status(200)
          .json({ message: "No session reports found for the student" });
      }

      return res.status(200).json({ sessionReports });
    } catch (error) {
      console.error("Error fetching session reports for student:", error);
      return res
        .status(500)
        .json({ message: "Error fetching session reports for student" });
    }
  }

  static async getStudentSessionReportStatus(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { classSessionId, studentId } = req.params;

    try {
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);

      const report = await sessionReportRepository.findOne({
        where: {
          session: { id: Number(classSessionId) },
          student: { id: Number(studentId) },
        },
      });

      if (report) {
        return res.status(200).json({
          reportCompleted: true,
          reportId: report.id,
        });
      }

      return res.status(200).json({
        reportCompleted: false,
        reportId: null,
      });
    } catch (error) {
      console.error("Error fetching student session report status:", error);
      return res
        .status(500)
        .json({ message: "Error fetching student session report status" });
    }
  }

  static async updateSessionReport(req: AuthenticatedRequest, res: Response) {
    const { reportId } = req.params;
    const {
      lessonTopic,
      coveredMaterials,
      progress,
      learningAssessment,
      activeParticipation,
      concentration,
      worksIndependently,
      cooperation,
      previousHomeworkCompleted,
      nextHomework,
      tutorRemarks,
    } = req.body;

    try {
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);
      const sessionReport = await sessionReportRepository.findOne({
        where: { id: Number(reportId) },
      });

      if (!sessionReport) {
        return res.status(404).json({ message: "Session report not found" });
      }

      sessionReport.lessonTopic = lessonTopic;
      sessionReport.coveredMaterials = coveredMaterials;
      sessionReport.progress = progress;
      sessionReport.learningAssessment = learningAssessment;
      sessionReport.activeParticipation = activeParticipation;
      sessionReport.concentration = concentration;
      sessionReport.worksIndependently = worksIndependently;
      sessionReport.cooperation = cooperation;
      sessionReport.previousHomeworkCompleted = previousHomeworkCompleted;
      sessionReport.nextHomework = nextHomework;
      sessionReport.tutorRemarks = tutorRemarks;

      await sessionReportRepository.save(sessionReport);

      return res.status(200).json({
        message: "Session report updated successfully",
        sessionReport,
      });
    } catch (error) {
      console.error("Error updating session report:", error);
      return res.status(500).json({ message: "Error updating session report" });
    }
  }

  static async deleteSessionReport(req: AuthenticatedRequest, res: Response) {
    const { reportId } = req.params;

    if (!reportId || isNaN(Number(reportId))) {
      return res.status(400).json({ message: "Invalid reportId provided." });
    }

    const sessionReportRepository = AppDataSource.getRepository(SessionReport);
    const paymentRepository = AppDataSource.getRepository(Payment);

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      try {
        // Find the session report and include the related student and session
        const sessionReport = await transactionalEntityManager.findOne(
          SessionReport,
          {
            where: { id: Number(reportId) },
            relations: ["student", "session", "student.user"], // Load both student and session
          }
        );

        if (!sessionReport) {
          throw new Error("Session report not found.");
        }

        // Find the payment associated with the same student and session
        const payment = await transactionalEntityManager.findOne(Payment, {
          where: {
            user: { id: sessionReport.student.user.id },
            session: { id: sessionReport.session.id },
          },
        });

        if (!payment) {
          throw new Error(
            "No payment found for the associated student and session."
          );
        }

        // Soft delete the session report
        await transactionalEntityManager.softRemove(sessionReport);

        // Soft delete the payment
        await transactionalEntityManager.remove(payment);

        return res
          .status(200)
          .json({
            message:
              "Session report and associated payment deleted successfully.",
          });
      } catch (error) {
        console.error("Error deleting session report and payment:", error);

        throw error; // Ensure the transaction rolls back on unexpected errors
      }
    }).catch((error) => {
      console.error("Transaction failed:", error);
      return res
        .status(500)
        .json({ message: "Error deleting session report and payment." });
    });
  }

  static async getSessionReportById(req: AuthenticatedRequest, res: Response) {
    try {
      const { reportId } = req.params;
      const sessionReportRepository =
        AppDataSource.getRepository(SessionReport);

      const sessionReport = await sessionReportRepository.findOne({
        where: { id: Number(reportId) },
        relations: ["session", "student", "student.user"],
      });

      if (!sessionReport) {
        return res.status(404).json({ message: "Session report not found" });
      }

      return res.status(200).json({ data: sessionReport });
    } catch (error) {
      console.error("Error fetching session report by ID:", error);
      return res.status(500).json({ message: "Error fetching session report" });
    }
  }

  static async checkAllReportsCompletedForSession(
    classSessionId: number
  ): Promise<CheckReportsResult> {
    const classSessionRepository = AppDataSource.getRepository(SessionInstance);
    const sessionReportRepository = AppDataSource.getRepository(SessionReport);
    const absenceRepository = AppDataSource.getRepository(Absence);

    // Fetch the class session along with its students
    const classSession = await classSessionRepository.findOne({
      where: { id: classSessionId },
      relations: ["students"],
    });

    if (!classSession) {
      throw new Error(`Class session with ID ${classSessionId} not found.`);
    }

    const studentCount = classSession.students.length;

    // Fetch all absences for the session
    const absences = await absenceRepository.find({
      where: {
        sessionInstance: { id: classSessionId },
      },
    });

    // Check for any absence with null status
    const hasUnconfirmedAbsence = absences.some(
      (absence) => absence.status === null
    );

    if (hasUnconfirmedAbsence) {
      throw new Error("A student's absence was not confirmed yet.");
    }

    // Count absences with status true
    const absencesWithStatusTrue = absences.filter(
      (absence) => absence.status === true
    ).length;
    const absencesWithStatusFalse = absences.filter(
      (absence) => absence.status === false
    ).length;
    // Calculate the total number of students the teacher will get paid for
    const totalToPay = studentCount - absencesWithStatusTrue;

    // Count completed reports
    const completedReportsCount = await sessionReportRepository.count({
      where: {
        session: { id: classSessionId },
      },
    });

    // Determine if all reports are completed
    // Assuming that each student should have one report
    // Adjust the logic if your report structure is different
    const allReportsCompleted =
      completedReportsCount >= totalToPay - absencesWithStatusFalse;

    return {
      totalToPay,
      allReportsCompleted,
    };
  }

  static async createPaymentForUser({
    userId,
    classSessionId,
    totalStudents,
  }: {
    userId: number;
    classSessionId: number;
    totalStudents?: number;
  }) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const sessionRepo = AppDataSource.getRepository(SessionInstance);

      const paymentRepo = AppDataSource.getRepository(Payment);
      const studentRepo = AppDataSource.getRepository(Student);
      const teacherRepo = AppDataSource.getRepository(Teacher);
      const packageSessionTypePriceRepo = AppDataSource.getRepository(
        PackageSessionTypePrice
      );

      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["students", "teachers"],
      });
      const sessionInstance = await sessionRepo.findOne({
        where: { id: classSessionId },
        relations: ["sessionType"],
      });
      if (!user) {
        return Promise.reject(new Error("User not found"));
      }
      if (!sessionInstance) {
        return Promise.reject(new Error("Class session not found"));
      }

      let rate;

      if (user.students && user.students.length > 0) {
        const student = await studentRepo.findOne({
          where: { user: { id: userId } },
          relations: ["contract"],
        });
        if (!student || !student.contract) {
          return Promise.reject(
            new Error("Student or student contract not found")
          );
        }

        const packageSessionTypePrice =
          await packageSessionTypePriceRepo.findOne({
            where: {
              contractPackage: { id: student.contract.id },
              sessionType: { id: sessionInstance.sessionType.id },
            },
          });

        if (!packageSessionTypePrice) {
          return Promise.reject(
            new Error(
              "Price not found for this session type in the student’s contract"
            )
          );
        }

        rate = packageSessionTypePrice.price;
      } else if (user.teachers && user.teachers.length > 0) {
        const teacher = await teacherRepo.findOne({
          where: { user: { id: userId } },
        });
        if (!teacher) {
          return Promise.reject(new Error("Teacher not found"));
        }

        rate =
          teacher.hourlyRate +
          teacher.rateMultiplier * ((totalStudents ? totalStudents : 1) - 1);
        console.log(rate);
      } else {
        return Promise.reject(
          new Error("Invalid user type for payment calculation")
        );
      }
      if (!sessionInstance.duration) {
        return;
      }

      const amount = (rate * sessionInstance.duration) / 60;

      const payment = paymentRepo.create({
        amount,
        paymentStatus: "Pending",
        paymentDate: new Date(),
        lastUpdate: new Date(),
        session: sessionInstance,
        user: user,
      });

      await paymentRepo.save(payment);
      return Promise.resolve({ message: "Payment created successfully" });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        return;
      }
      console.error("Error creating payment:", error);
      throw new Error(`Error creating payment: ${error}`);
    }
  }
}
interface CheckReportsResult {
  totalToPay: number;
  allReportsCompleted: boolean;
}
