import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";

const router = Router();

router.post(
  "/invoices/create-monthly",
  authMiddleware(["SuperAdmin"]),
  InvoiceController.createMonthlyInvoices
);

router.get(
  "/invoices/user/:userId",
  authMiddleware(
    ["SuperAdmin", 'FranchiseAdmin',"Parent", "Teacher"],
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
  InvoiceController.getInvoicesForUser
);

router.get(
  "/invoices/:invoiceId/user/:userId",
  authMiddleware(
    ["SuperAdmin", 'FranchiseAdmin',"Parent", "Teacher"],
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

  InvoiceController.getInvoiceById
);

router.get(
  "/invoices/franchise/:franchiseId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      }
 
    ]
  ),

  InvoiceController.getInvoicesForFranchise
);

export default router;
