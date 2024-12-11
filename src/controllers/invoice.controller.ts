import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Invoice } from "../entities/invoice.entity";
import { Payment } from "../entities/payment.entity";
import { User } from "../entities/user.entity";
import { In, MoreThan } from "typeorm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Parent } from "../entities/parent.entity";
import { Teacher } from "../entities/teacher.entity";
import {NotificationService} from "./notification.controller";
import { NotificationTexts } from "./helperFunctions/notificationTexts";
import { Franchise } from "../entities/franchise.entity";

export class InvoiceController {

  static async createMonthlyInvoices(req: AuthenticatedRequest, res: Response) {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
          const paymentRepository = queryRunner.manager.getRepository(Payment);
          const invoiceRepository = queryRunner.manager.getRepository(Invoice);
  
          const parents = await AppDataSource.getRepository(Parent)
              .createQueryBuilder("parent")
              .leftJoinAndSelect("parent.user", "user")
              .leftJoinAndSelect("parent.students", "students")
              .leftJoinAndSelect("students.contract", "contract")
              .leftJoinAndSelect("students.user", "studentUser")
              .getMany();
  
          const teachers = await AppDataSource.getRepository(Teacher)
              .createQueryBuilder("teacher")
              .leftJoinAndSelect("teacher.user", "user")
              .getMany();
  
          const invoices = [];
  
          // Process parents
          for (const parent of parents) {
              for (const student of parent.students) {
                  const studentUserId = student.user.id;
  
                  // Check if the student has already paid the one-time registration fee
                  const existingRegistrationInvoice = await invoiceRepository.findOne({
                      where: {
                          student: { id: student.id },
                          oneTimeFee: MoreThan(0)
                      },
                  });
  
                  const isFirstRegistration = !existingRegistrationInvoice;
  
                  // Fetch pending payments specifically for this student
                  const pendingPayments = await paymentRepository.find({
                      where: { user: { id: studentUserId }, paymentStatus: "Pending" },
                  });
  
                  if (pendingPayments.length > 0) {
                      // Calculate the total amount for this student's pending payments
                      let totalAmount = pendingPayments.reduce(
                          (sum, payment) => sum + Number(payment.amount),
                          0
                      );
  
                      // If it's the first registration, include the one-time fee
                      if (isFirstRegistration && student.contract?.oneTimeFee) {
                          totalAmount += Number(student.contract.oneTimeFee);
                      }
                      if (student.contract?.monthlyFee) {
                        totalAmount += Number(student.contract.monthlyFee);
                    }
                      // Create the invoice
                      const invoice = invoiceRepository.create({
                          user: parent.user, // Parent user
                          student: student, // Student associated with this invoice
                          totalAmount,
                          oneTimeFee: isFirstRegistration ? student.contract?.oneTimeFee || 0 : 0,
                          monthlyFee: student.contract?.monthlyFee,
                          status: "Pending",
                          payments: pendingPayments, // Associate pending payments with this invoice
                      });
                      await invoiceRepository.save(invoice);
  
                      // Associate payments with the invoice and mark them as paid
                      for (const payment of pendingPayments) {
                          payment.paymentStatus = "Paid";
                          payment.invoice = invoice;
                          await paymentRepository.save(payment);
                      }
  

  
                      // Send notification to the parent
                      await NotificationService.createNotification(
                          [parent.user.id],
                          NotificationTexts.invoice.parent.title,
                          NotificationTexts.invoice.parent.message(
                              `${student.user.firstName} ${student.user.lastName}`,
                              totalAmount
                          ),
                          NotificationTexts.invoice.parent.eventType
                      );
  
                      invoices.push(invoice);
                  }
              }
          }
  
          // Process teachers (unchanged)
          for (const teacher of teachers) {
              const userId = teacher.user.id;
              const pendingPayments = await paymentRepository.find({
                  where: { user: { id: userId }, paymentStatus: "Pending" },
              });
  
              if (pendingPayments.length > 0) {
                  const totalAmount = pendingPayments.reduce(
                      (sum, payment) => sum + Number(payment.amount),
                      0
                  );
  
                  const invoice = invoiceRepository.create({
                      user: teacher.user,
                      totalAmount,
                      status: "Pending",
                  });
                  await invoiceRepository.save(invoice);
  
                  for (const payment of pendingPayments) {
                      payment.paymentStatus = "Paid";
                      await paymentRepository.save(payment);
                  }
  
                  await NotificationService.createNotification(
                      [teacher.user.id],
                      NotificationTexts.invoice.teacher.title,
                      NotificationTexts.invoice.teacher.message(totalAmount),
                      NotificationTexts.invoice.teacher.eventType
                  );
  
                  invoices.push(invoice);
              }
          }
  
          await queryRunner.commitTransaction();
          return res.status(201).json({message:"successfully created invoices"});
      } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error("Error creating invoices:", error);
          res.status(500).json({ message: "Error creating invoices" });
      } finally {
          await queryRunner.release();
      }
  }
  

  static async getInvoicesForUser(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params; // Assuming userId is still part of the route
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const userRepository = AppDataSource.getRepository(User);
      const franchiseRepository = AppDataSource.getRepository(Franchise);
      const invoiceRepository = AppDataSource.getRepository(Invoice);
  
      const pageNumber = Number(page);
      const pageLimit = Number(limit);
      const offset = (pageNumber - 1) * pageLimit;
  
      // Check if the user is a franchise admin
      const franchise = await franchiseRepository.findOne({
        where: { admins: { id: Number(userId) } },
      });
      const isFranchiseAdmin = !!franchise;
  
      let invoices: Invoice[];
      let total: number;
  
      if (isFranchiseAdmin) {
        // User is a franchise admin; fetch invoices for their franchise
        const franchiseId = franchise.id;
  
        [invoices, total] = await invoiceRepository
          .createQueryBuilder("invoice")
          .leftJoinAndSelect("invoice.student", "student")
          .leftJoinAndSelect("student.locations", "studentLocation")
          .leftJoinAndSelect("studentLocation.franchise", "studentFranchise")
          .leftJoinAndSelect("invoice.user", "user")
          .leftJoinAndSelect("user.teachers", "teacher")
          .leftJoinAndSelect("teacher.locations", "teacherLocation")
          .leftJoinAndSelect("teacherLocation.franchise", "teacherFranchise")
          .where(
            "(studentFranchise.id = :franchiseId AND invoice.studentId IS NOT NULL)",
            { franchiseId: Number(franchiseId) }
          )
          .orWhere(
            "(teacherFranchise.id = :franchiseId AND invoice.studentId IS NULL)",
            { franchiseId: Number(franchiseId) }
          )
          .select(["invoice","user.id",'user.firstName','user.lastName'])
          .orderBy("invoice.createdAt", "DESC")
          .skip(offset)
          .take(pageLimit)
          .getManyAndCount();
      } else {
        // User is a regular user; fetch their own invoices
        [invoices, total] = await invoiceRepository.findAndCount({
          where: { user: { id: Number(userId) } },
          order: { createdAt: "DESC" },
          skip: offset,
          take: pageLimit,
          relations: ["user"],
        });
      }
  
      return res.status(200).json({
        data: invoices,
        total,
        page: pageNumber,
        pageCount: Math.ceil(total / pageLimit),
      });
    } catch (error) {
      console.error("Error fetching invoices for user:", error);
      res.status(500).json({ message: "Error fetching invoices for user" });
    }
  }
  

  static async getInvoiceById(req: AuthenticatedRequest, res: Response) {
    const { invoiceId, userId } = req.params;

    try {
      const invoiceRepository = AppDataSource.getRepository(Invoice);

      const invoice = await invoiceRepository
        .createQueryBuilder("invoice")
        .leftJoinAndSelect("invoice.payments", "payments")
        .leftJoinAndSelect("payments.session", "session")
        .leftJoinAndSelect("session.sessionType", "sessionType")
        .leftJoinAndSelect("invoice.student", "student")
        .leftJoinAndSelect("student.locations", "locations")
        .leftJoinAndSelect("student.parent", "parent")
        .leftJoinAndSelect("locations.franchise", "franchise")
        .leftJoinAndSelect("student.user", "studentUser")
        .leftJoinAndSelect("invoice.user", "user")
        .where("invoice.id = :invoiceId", { invoiceId: Number(invoiceId) })
        .andWhere("invoice.user.id = :userId", { userId: Number(userId) })
        .select([
          "invoice",
          "student",
          "locations.id",
          "franchise",
          "parent.id",
          "parent.iban",
          "parent.accountHolder",
          "session.duration",
          "session.date",
          "session.startTime",
          "sessionType.id",
          "sessionType.name",
  
          "payments",
          "user.firstName",
          "user.lastName",
          "user.address",
          "user.postalCode",
          "studentUser.firstName",
          "studentUser.lastName",
        ])
        .getOne();

      if (!invoice) {
        return res
          .status(404)
          .json({ message: "Invoice not found for this user" });
      }

      const fullAmount = invoice.totalAmount;

      return res.status(200).json({ ...invoice, fullAmount });
    } catch (error) {
      console.error("Error fetching invoice by ID:", error);
      res.status(500).json({ message: "Error fetching invoice by ID" });
    }
  }
  static async getInvoicesForFranchise(req: AuthenticatedRequest, res: Response) {
    const { franchiseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const invoiceRepository = AppDataSource.getRepository(Invoice);
  
      const pageNumber = Number(page);
      const pageLimit = Number(limit);
      const offset = (pageNumber - 1) * pageLimit;
  
      // Fetch all invoices related to the franchise
      const [invoices, total] = await invoiceRepository
        .createQueryBuilder("invoice")
        .leftJoinAndSelect("invoice.student", "student")
        .leftJoinAndSelect("student.locations", "studentLocation")
        .leftJoinAndSelect("studentLocation.franchise", "studentFranchise")
        .leftJoinAndSelect("invoice.user", "user")
        .leftJoinAndSelect("user.teachers", "teacher")
        .leftJoinAndSelect("teacher.locations", "teacherLocation")
        .leftJoinAndSelect("teacherLocation.franchise", "teacherFranchise")
        .where(
          "(studentFranchise.id = :franchiseId AND invoice.studentId IS NOT NULL)",
          { franchiseId: Number(franchiseId) }
        )
        .orWhere(
          "(teacherFranchise.id = :franchiseId AND invoice.studentId IS NULL)",
          { franchiseId: Number(franchiseId) }
        )
        .select(['invoice','user.id','user.firstName','user.lastName'])
        .orderBy("invoice.createdAt", "DESC")
        .skip(offset)
        .take(pageLimit)
        .getManyAndCount();
  
      return res.status(200).json({
        data: invoices,
        total,
        page: pageNumber,
        pageCount: Math.ceil(total / pageLimit),
      });
    } catch (error) {
      console.error("Error fetching invoices for franchise:", error);
      res.status(500).json({ message: "Error fetching invoices for franchise" });
    }
  }
  
}
