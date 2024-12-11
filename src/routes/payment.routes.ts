import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Franchise } from "../entities/franchise.entity";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";

const router = Router();


router.post(
  "/payments/",
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
  PaymentController.createPaymentForUser
);





























router.put(
  "/payments/:paymentId",
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
  PaymentController.updatePaymentStatus
);


router.get(
  "/payments/user/:userId",
  authMiddleware(
    [
      "SuperAdmin",
      "FranchiseAdmin",
      "LocationAdmin",
      "Teacher",
      "Student",
      "Parent",
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
  PaymentController.getPaymentsForUser
);

router.get(
  "/parent-payments/:userId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Parent"],
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
  PaymentController.getPaymentsForParent
);

router.get(
  "/student-payments/:studentId",
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
  PaymentController.getStudentPaymentDetails
);

router.get(
  "/payments/user/:userId/session/:classSessionId",
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
  PaymentController.getPaymentsForUserByClassSession
);

export default router;

