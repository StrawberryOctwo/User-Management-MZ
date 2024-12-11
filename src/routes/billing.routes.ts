import { Router } from 'express';
import BillingController from '../controllers/billing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Franchise } from '../entities/franchise.entity';

const router = Router();


router.post('/billings/submit',authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    ]), BillingController.submitBilling);


router.post('/billings/confirm',authMiddleware(['SuperAdmin'],
    ), BillingController.confirmBillingAsPaid);

router.get('/billings',authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    ]), BillingController.getAllBillings);

    

router.get('/franchises/:franchiseId/billings',authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    ]), BillingController.getBillingsForFranchise);


router.get('/billings/:billingId',authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    ]), BillingController.getBillingById);


router.get('/billings/:billingId/download',authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    ]), BillingController.downloadBillingInvoice);

export default router;

