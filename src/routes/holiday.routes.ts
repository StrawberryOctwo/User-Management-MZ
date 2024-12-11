import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { HolidayController } from "../controllers/holiday.controller";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";

const router = Router();

router.post(
  "/holiday",
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
  HolidayController.createHoliday
);

router.post(
  "/holidays",
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
  HolidayController.getHolidaysByLocationIds
);

router.put(
  "/holiday/:id",
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
  HolidayController.updateHoliday
);

router.delete(
  "/holiday",
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
  HolidayController.deleteHoliday
);

router.get(
  "/holiday/:id",
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
  HolidayController.getHolidayById
);


export default router;
