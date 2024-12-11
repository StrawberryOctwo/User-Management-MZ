import { Router } from "express";
import { ClassSessionController } from "../controllers/classSessions.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";
import { SessionInstanceController } from "../controllers/classSessionInstances.controller";

const router = Router();

router.post(
  "/class-session",
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
        relationName: "teachers",
      },
    ]
  ),
  ClassSessionController.createClassSession
);

router.put(
  "/class-session/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.updateClassSession
);

router.put(
  "/class-session/from-to/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.updateFromToDate
);

router.get(
  "/class-sessions",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Student"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.getAllClassSessions
);

router.get(
  "/class-session/:id",
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
  ClassSessionController.getSessionById
);

router.delete(
  "/class-session/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.deleteClassSession
);

router.post(
  "/class-sessions/toggle-activation",
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
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.toggleClassSessionActivation
);

router.get(
  "/user/:userId/class-sessions",
  authMiddleware(
    ["Teacher", "Student"],
    [
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
  ClassSessionController.getClassSessionsByUser
);

router.get(
  "/parent/:parentUserId/class-sessions",
  authMiddleware(
    ["Parent"],
    [
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  ClassSessionController.getClassSessionsByParent
);

router.put(
  "/session-instance/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionInstanceController.updateSessionInstance
);

router.delete(
  "/session-instance/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  SessionInstanceController.deleteSessionInstance
);

export default router;
