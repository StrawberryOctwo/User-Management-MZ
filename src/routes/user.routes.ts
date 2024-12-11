import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { UserController } from "../controllers/user.controller";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";

const router = Router();

router.get(
  "/user/profile",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher", "Student", "Parent"],
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
  UserController.getProfile
);

router.put(
  "/user/profile",
  authMiddleware(
    ["FranchiseAdmin", "LocationAdmin", "Teacher", "Student", "Parent"],
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
  UserController.updateProfile
);

export default router;

