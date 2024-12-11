import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Discount } from '../entities/discount.entity';
import { DiscountController } from '../controllers/discount.controller';
import { Franchise } from "../entities/franchise.entity";
const router = Router();

router.get(
    '/discounts',
    authMiddleware(['SuperAdmin', 'FranchiseAdmin'], [
        {
            repository: AppDataSource.getRepository(Franchise),
            relationName: "franchises",
        },
    ]),
    DiscountController.getAllDiscounts
);

export default router;

