import { Router } from "express";
import { AppDataSource } from "../config/data-source";
import { SessionReportController } from "../controllers/sessionReport.controller";
import { Franchise } from "../entities/franchise.entity";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Location } from "../entities/location.entity";
import { Student } from "../entities/student.entity";

const router = Router();




router.post(
    '/session-reports',
    authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'], [
        { repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
        { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
        { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
    ]),
    SessionReportController.createSessionReport
);


router.get(
  "/session-reports/class-session/:classSessionId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.getClassSessionReports
);

router.get(
  "/students/:studentId/session-reports",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Student),
        relationName: "students",
      },
    ]
  ),
  SessionReportController.getStudentSessionReports
);


router.get(
  "/session-reports/status/class-session/:classSessionId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.getClassSessionReportsStatus
);


router.get(
  "/session-reports/status/class-session/:classSessionId/student/:studentId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.getStudentSessionReportStatus
);

router.patch(
  "/session-reports/class-session/teacher/submit",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.submitTeacherSessionReports
);
router.get(
  "/session-reports/:reportId",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Parent",
      "Student",
    ],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.getSessionReportById
);


router.put(
  "/session-reports/:reportId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.updateSessionReport
);


router.delete(
  "/session-reports/:reportId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionReportController.deleteSessionReport
);

export default router;

