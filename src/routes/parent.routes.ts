import { Router } from "express";
import { ParentController } from "../controllers/parent.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { Location } from "../entities/location.entity";

const router = Router();

router.post(
  "/parent",
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
  ParentController.addParent
);

router.get(
  "/parents",
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
  ParentController.getParents
);

router.get(
  "/parent/:id",
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
  ParentController.getParentById
);

router.put(
  "/parent/:id",
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
  ParentController.updateParent
);

router.post(
  "/parent/delete",
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
  ParentController.deleteParent
);

// router.post(
//   "/parent/assign-students",
//   authMiddleware(
//     ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
//     [
//       {
//         repository: AppDataSource.getRepository(Franchise),
//         relationName: "franchises",
//       },
//       {
//         repository: AppDataSource.getRepository(Location),
//         relationName: "locations",
//       },
//     ]
//   ),
//   ParentController.assignOrUpdateParentStudents
// );

router.get(
  "/parent/:id/students",
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
  ParentController.getStudentsByParent
);

router.get(
  "/parent/:id/session-reports",
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
  ParentController.getSessionReportsByParent
);

export default router;
