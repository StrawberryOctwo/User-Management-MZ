import { Router } from 'express';
import InterestController, { createInterest } from '../controllers/interest.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/interests', createInterest);

router.get('/interests', authMiddleware(['SuperAdmin']),InterestController.getInterests);


router.get('/interests/:id', authMiddleware(['SuperAdmin']), InterestController.getInterestById);

router.patch('/interests/:id/toggle-accepted',  authMiddleware(['SuperAdmin']), InterestController.toggleAcceptedStatus);

export default router;

