import { AppDataSource } from "../config/data-source";
import { Parent } from "../entities/parent.entity";
import { Teacher } from "../entities/teacher.entity";
import { Payment } from "../entities/payment.entity";
import { Invoice } from "../entities/invoice.entity";
import { MoreThan } from "typeorm";
import {NotificationService} from "../controllers/notification.controller";
import { NotificationTexts } from "../controllers/helperFunctions/notificationTexts";


export class InvoiceService {
  /**
   * Generate invoices for all users with the specified `invoiceDay`.
   *
   * @param invoiceDay - Day of the month (1 or 15) for which invoices should be generated.
   */
  static async generateInvoicesForDay(invoiceDay: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentRepository = queryRunner.manager.getRepository(Payment);
      const invoiceRepository = queryRunner.manager.getRepository(Invoice);

      // Fetch parents with matching invoiceDay
      const parents = await AppDataSource.getRepository(Parent)
        .createQueryBuilder("parent")
        .leftJoinAndSelect("parent.user", "user")
        .leftJoinAndSelect("parent.students", "students")
        .leftJoinAndSelect("students.contract", "contract")
        .leftJoinAndSelect("students.user", "studentUser")
        .where("parent.invoiceDay = :invoiceDay", { invoiceDay })
        .getMany();

      // Fetch teachers with matching invoiceDay
      const teachers = await AppDataSource.getRepository(Teacher)
        .createQueryBuilder("teacher")
        .leftJoinAndSelect("teacher.user", "user")
        .where("teacher.invoiceDay = :invoiceDay", { invoiceDay })
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
              oneTimeFee: MoreThan(0),
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
              user: parent.user,
              student: student,
              totalAmount,
              oneTimeFee: isFirstRegistration
                ? student.contract?.oneTimeFee || 0
                : 0,
              monthlyFee: student.contract?.monthlyFee,
              status: "Pending",
              payments: pendingPayments,
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

      // Process teachers
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
      console.log("Invoices successfully created:", invoices.length);
      return invoices; // Return the generated invoices
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error generating invoices:", error);
      throw new Error("Error generating invoices");
    } finally {
      await queryRunner.release();
    }
  }
}
