import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Discount } from '../entities/discount.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class DiscountController {
    static async getAllDiscounts(req: AuthenticatedRequest, res: Response) {
        try {
            const discountRepository = AppDataSource.getRepository(Discount);
            const discounts = await discountRepository.find();
            return res.status(200).json(discounts);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            return res.status(500).json({ message: 'Error fetching discounts' });
        }
    }
}

