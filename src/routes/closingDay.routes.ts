import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { ClosingDayController } from "../controllers/closingDay.controller";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";

const router = Router();

router.post(
  "/closing-day",
  authMiddleware(["SuperAdmin", "FranchiseAdmin", "LocationAdmin"], [
    {
      repository: AppDataSource.getRepository(Franchise),
      relationName: "franchises",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
  ]),
  ClosingDayController.createClosingDay
);

router.post(
  "/closing-days",
  authMiddleware(["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent", "Student"], [
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
  ]),
  ClosingDayController.getClosingDaysByLocationIds
);

router.put(
  "/closing-day/:id",
  authMiddleware(["SuperAdmin", "FranchiseAdmin", "LocationAdmin"], [
    {
      repository: AppDataSource.getRepository(Franchise),
      relationName: "franchises",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
  ]),
  ClosingDayController.updateClosingDay
);

router.delete(
  "/closing-day",
  authMiddleware(["SuperAdmin", "FranchiseAdmin", "LocationAdmin"], [
    {
      repository: AppDataSource.getRepository(Franchise),
      relationName: "franchises",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
  ]),
  ClosingDayController.deleteClosingDay
);

router.get(
  "/closing-day/:id",
  authMiddleware(["SuperAdmin", "FranchiseAdmin", "LocationAdmin"], [
    {
      repository: AppDataSource.getRepository(Franchise),
      relationName: "franchises",
    },
    {
      repository: AppDataSource.getRepository(Location),
      relationName: "locations",
    },
  ]),
  ClosingDayController.getClosingDayById
);

export default router;
