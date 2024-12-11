import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Payment } from "../entities/payment.entity";
import { User } from "../entities/user.entity";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Student } from "../entities/student.entity";
import { Brackets, In } from "typeorm";
import { differenceInHours, differenceInMinutes } from "date-fns";
import { Teacher } from "../entities/teacher.entity";
import { Parent } from "../entities/parent.entity";
import { PackageSessionTypePrice } from "../entities/packageSessionTypePrice.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";

class PaymentController {
  static async createPaymentForUser(req: AuthenticatedRequest, res: Response) {
    const { userId, sessionInstanceId } = req.body;

    try {
      const userRepo = AppDataSource.getRepository(User);
      const sessionInstanceRepo = AppDataSource.getRepository(SessionInstance);
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

      const sessionInstance = await sessionInstanceRepo.findOne({
        where: { id: sessionInstanceId },
        relations: ["sessionType"],
      });

      if (!user || !sessionInstance) {
        return res.status(404).json({ message: "User or session not found" });
      }

      
      if (sessionInstance.duration === undefined) {
        return res
          .status(400)
          .json({ message: "Session duration is undefined" });
      }
      const sessionDurationHours = sessionInstance.duration / 60;

      let rate;
      if (user.students && user.students.length > 0) {
        
        const student = await studentRepo.findOne({
          where: { user: { id: userId } },
          relations: ["contract"],
        });
        if (!student || !student.contract) {
          return res
            .status(404)
            .json({ message: "Student or student contract not found" });
        }

        
        const packageSessionTypePrice =
          await packageSessionTypePriceRepo.findOne({
            where: {
              contractPackage: { id: student.contract.id },
              sessionType: { id: sessionInstance.sessionType.id },
            },
          });

        if (!packageSessionTypePrice) {
          return res.status(404).json({
            message:
              "Price not found for this session type in the student’s contract",
          });
        }

        rate = packageSessionTypePrice.price;
      } else if (user.teachers && user.teachers.length > 0) {
        
        const teacher = await teacherRepo.findOne({
          where: { user: { id: userId } },
        });
        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }

        rate = teacher.hourlyRate;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid user type for payment calculation" });
      }

      
      const amount = rate * sessionDurationHours;

      
      const payment = paymentRepo.create({
        amount,
        paymentStatus: "Pending",
        paymentDate: new Date(),
        lastUpdate: new Date(),
        session: sessionInstance,
        user: user,
      });

      await paymentRepo.save(payment);
      return res.status(201).json({ message: "Payment created successfully" });
    } catch (error) {
      console.error("Error creating payment:", error);
      return res.status(500).json({ message: "Error creating payment" });
    }
  }

  
  static async updatePaymentStatus(req: AuthenticatedRequest, res: Response) {
    const { status } = req.body;
    const { paymentId } = req.params;

    try {
      const paymentRepo = AppDataSource.getRepository(Payment);
      const payment = await paymentRepo.findOne({
        where: { id: Number(paymentId) },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.paymentStatus = status;

      payment.lastUpdate = new Date();

      await paymentRepo.save(payment);
      return res.status(200).json(payment);
    } catch (error) {
      console.error("Error updating payment status:", error);
      return res.status(500).json({ message: "Error updating payment status" });
    }
  }

  
  static async getPaymentsForUser(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params;
    const { search, page = 1, limit = 10 } = req.query;

    try {
      const paymentRepo = AppDataSource.getRepository(Payment);

      let query = paymentRepo
        .createQueryBuilder("payment")
        .leftJoinAndSelect("payment.user", "user")
        .leftJoinAndSelect("user.students", "student") 
        .leftJoinAndSelect("student.parent", "parent") 
        .leftJoinAndSelect("user.teachers", "teacher") 
        .where("payment.userId = :userId", { userId: Number(userId) })
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy("payment.paymentDate", "DESC"); 

      
      if (search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where("payment.paymentStatus ILIKE :search", {
              search: `%${search}%`,
            }).orWhere("CAST(payment.amount AS TEXT) ILIKE :search", {
              search: `%${search}%`,
            });
          })
        );
      }

      
      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      
      const enhancedData = data.map((payment) => {
        const student = payment.user?.students[0];
        const parent = student?.parent;
        const teacher = payment.user?.teachers[0];

        return {
          ...payment,
          user: {
            id: payment.user.id,
            firstName: payment.user.firstName,
            lastName: payment.user.lastName,
            email: payment.user.email,
            address: payment.user.address,
            postalCode: payment.user.postalCode,
            phoneNumber: payment.user.phoneNumber,
            role: teacher ? "Teacher" : student ? "Student" : "Other",
          },
          student: student
            ? {
                gradeLevel: student.gradeLevel,
                contractType: student.contract,
                contractEndDate: student.contractEndDate,
                status: student.status,
              }
            : null,
          parent: parent
            ? {
                accountHolder: parent.accountHolder,
                iban: parent.iban,
                bic: parent.bic,
              }
            : null,
          teacher: teacher
            ? {
                employeeNumber: teacher.employeeNumber,
                hourlyRate: teacher.hourlyRate,
                bank: teacher.bank,
                iban: teacher.iban,
              }
            : null,
        };
      });

      return res
        .status(200)
        .json({ data: enhancedData, total, page: Number(page), pageCount });
    } catch (error) {
      console.error("Error fetching payments:", error);
      return res.status(500).json({ message: "Error fetching payments" });
    }
  }

  static async getStudentPaymentDetails(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { studentId } = req.params;

    try {
      const studentRepository = AppDataSource.getRepository(Student);

      
      const student = await studentRepository.findOne({
        where: { id: Number(studentId) },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      
      const groupSessionPrice = 0; 
      const individualSessionPrice = 0; 

      return res.status(200).json({
        groupSessionPrice,
        individualSessionPrice,
      });
    } catch (error) {
      console.error("Error fetching student payment details:", error);
      return res
        .status(500)
        .json({ message: "Error fetching student payment details" });
    }
  }
  
  static async getPaymentsForUserByClassSession(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { userId, classSessionId } = req.params; 

    try {
      const paymentRepo = AppDataSource.getRepository(Payment);

      
      const payment = await paymentRepo.findOne({
        where: {
          user: { id: Number(userId) },
          session: { id: Number(classSessionId) },
        },
      });

      if (payment) {
        return res.status(200).json("Payment already sent");
      }
      return res.status(200).json(payment);
    } catch (error) {
      console.error(
        "Error fetching payment for user and class session:",
        error
      );
      return res
        .status(500)
        .json({ message: "Error fetching payment for user and class session" });
    }
  }

  static async getPaymentsForParent(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 10,
      search,
      sortField = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    try {
      const parentRepository = AppDataSource.getRepository(Parent);
      const paymentRepository = AppDataSource.getRepository(Payment);

      
      const parent = await parentRepository.findOne({
        where: { user: { id: Number(userId) } },
        relations: ["students.user"],
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      
      const studentUserIds = parent.students.map((student) => student.user.id);

      
      let query = paymentRepository
        .createQueryBuilder("payment")
        .where("payment.user.id IN (:...studentUserIds)", { studentUserIds })
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy(`payment.${sortField}`, sortOrder as "ASC" | "DESC");

      
      if (search) {
        query = query.andWhere("payment.description LIKE :search", {
          search: `%${search}%`,
        });
      }

      
      const [payments, total] = await query.getManyAndCount();

      return res.status(200).json({
        data: payments,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching payments for parent:", error);
      return res
        .status(500)
        .json({ message: "Error fetching payments for parent" });
    }
  }
}

export default PaymentController;

