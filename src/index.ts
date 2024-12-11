import express from "express";
import cors from "cors";

import { AppDataSource } from "./config/data-source";
import authRoutes from "./routes/auth.routes";
import franchiseRoutes from "./routes/franchise.routes";
import franchiseAdminRoutes from "./routes/franchiseAdmin.routes";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/student.routes";
import locationRoutes from "./routes/location.routes";
import swaggerOptions from "./config/swaggerConfig";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fileUploadRoutes from "./routes/fileUpload.routes";
import locationAdminsRoutes from "./routes/locationAdmin.routes";
import topicRoutes from "./routes/topic.routes";
import classSessionRoutes from "./routes/classSession.routes";
import databaseRoutes from "./routes/database.routes";
import { checkAndSeedDatabase } from "./seedManager";
import sessionReportRoutes from "./routes/sessionReport.routes";
import paymentRoutes from "./routes/payment.routes";
import billingRoutes from "./routes/billing.routes";

import BillingController from "./controllers/billing.controller";
import parentRoutes from "./routes/parent.routes";
import invoiceRoutes from "./routes/invoice.routes";
import contractPackageRoutes from "./routes/contractPackage.routes";
import sessionTypeRoutes from "./routes/sessionType.routes";
import discountRoutes from "./routes/discount.routes";
import holidayRoutes from "./routes/holiday.routes";
import schoolTypeRoutes from "./routes/schoolType.routes";
import availabilityRoutes from "./routes/availability.routes";
import studentExamRoutes from "./routes/studentExam.routes";
import todoRoutes from "./routes/todo.routes";
import surveyRoutes from "./routes/survey.routes";
import interestRoutes from "./routes/interest.routes";
import userRoutes from "./routes/user.routes";
import notificationRoutes from "./routes/notificationSSE.routes";
import closingDayRoutes from "./routes/closingDay.routes";
import { apiLogger } from './middlewares/apiLogger';

import './cronJobs';

const app = express();
app.use(express.json());
const swaggerDocs = swaggerJsDoc(swaggerOptions);

const allowedOrigins =
  process.env.CORS_ORIGIN === "production"
    ? process.env.CORS_ORIGIN
    : "http://localhost:3001";

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(apiLogger());

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");

    await checkAndSeedDatabase();

    new BillingController();

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    app.use("/api/auth", authRoutes);
    app.use("/api", userRoutes);
    app.use("/api", franchiseRoutes);
    app.use("/api", franchiseAdminRoutes);
    app.use("/api", teacherRoutes);
    app.use("/api", studentRoutes);
    app.use("/api", parentRoutes);
    app.use("/api", locationRoutes);
    app.use("/api", fileUploadRoutes);
    app.use("/api", locationAdminsRoutes);
    app.use("/api", topicRoutes);
    app.use("/api", classSessionRoutes);
    app.use("/api", databaseRoutes);
    app.use("/api", sessionReportRoutes);
    app.use("/api", paymentRoutes);
    app.use("/api", billingRoutes);
    app.use("/api", invoiceRoutes);
    app.use("/api", contractPackageRoutes);
    app.use("/api", sessionTypeRoutes);
    app.use("/api", discountRoutes);
    app.use("/api", holidayRoutes);
    app.use("/api", closingDayRoutes);
    app.use("/api", schoolTypeRoutes);
    app.use("/api", availabilityRoutes);
    app.use("/api", studentExamRoutes);
    app.use("/api", todoRoutes);
    app.use("/api", surveyRoutes);
    app.use("/api", interestRoutes);
    app.use("/api", notificationRoutes);


    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });
