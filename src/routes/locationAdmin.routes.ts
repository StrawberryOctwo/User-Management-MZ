import { Router } from "express";
import { LocationAdminController } from "../controllers/locationAdmin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Franchise } from "../entities/franchise.entity";
import { AppDataSource } from "../config/data-source";

const router = Router();

router.post(
  "/location-admins",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.createLocationAdmin
);

router.put(
  "/location-admins/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.updateLocationAdmin
);

router.get(
  "/location-admins",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.getAllLocationAdmins
);

router.get(
  "/location-admin/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.getLocationAdminByUserId
);

router.get(
  "/admin-location/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.getLocationsByAdminId
);

router.post(
  "/admins-location/delete",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationAdminController.deleteLocationAdmins
);

export default router;

