import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";
import { FileUpload } from "../entities/file-upload.entity";
import { Teacher } from "../entities/teacher.entity";
import { Student } from "../entities/student.entity";
import { Topic } from "../entities/topic.entity";
import { ClassSession } from "../entities/class-session.entity";
import { SessionReport } from "../entities/session-report.entity";
import { Payment } from "../entities/payment.entity";
import { Event } from "../entities/event.entity";
import { Absence } from "../entities/absence.entity";
import { Parent } from "../entities/parent.entity";
import "dotenv/config";
import { Billing } from "../entities/billing.entity";
import { Invoice } from "../entities/invoice.entity";
import { SessionType } from "../entities/sessionType.entity";
import { Discount } from "../entities/discount.entity";
import { ContractPackage } from "../entities/contractPackage.entity";
import { PackageSessionTypePrice } from "../entities/packageSessionTypePrice.entity";
import { PackageDiscountPrice } from "../entities/packageDiscountPrice.entity";
import { Holiday } from "../entities/holidays.entity";
import { ToDoAssignee } from "../entities/todoAssignee.entity";
import { SessionInstance } from "../entities/class-session-instance.entity";
import { Room } from "../entities/room.entity";
import { Answer } from "../entities/answer.entity";
import { Availability } from "../entities/availability.entity";
import { Interest } from "../entities/interest.entity";
import { LocationWeeklyAvailability } from "../entities/LocationWeeklyAvailability.entity";
import { Question } from "../entities/question.entity";
import { SchoolType } from "../entities/schoolType.entity";
import { SoftDeleteBaseEntity } from "../entities/softDelete.entity";
import { StudentExam } from "../entities/studentExam.entity";
import { Survey } from "../entities/survey.entity";
import { ToDo } from "../entities/todo.entity";
import { UserSurvey } from "../entities/userSurvey.entity";
import { UserNotification } from "../entities/user-notification.entity";
import { ClosingDay } from "../entities/closingDay.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: ["error"],
  entities: [
    User,
    Role,
    Franchise,
    Location,
    FileUpload,
    Teacher,
    Student,
    Topic,
    ClassSession,
    SessionInstance,
    SessionReport,
    Payment,
    Event,
    Absence,
    Parent,
    Billing,
    Invoice,
    SessionType,
    Discount,
    ContractPackage,
    PackageSessionTypePrice,
    PackageDiscountPrice,
    Holiday,
    SchoolType,
    Availability,
    StudentExam,
    ToDo,
    ToDoAssignee,
    UserSurvey,
    Survey,
    Question,
    Answer,
    SoftDeleteBaseEntity,
    Room,
    Interest,
    LocationWeeklyAvailability,
    Notification,
    UserNotification,
    Holiday,
    ClosingDay,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
