

import { Router } from 'express';
import { StudentExamController } from '../controllers/studentExam.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Location } from '../entities/location.entity';

const router = Router();

router.post('/student-exams/self', authMiddleware(['Student'], [
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  ]), StudentExamController.addExamForSelf);
router.get('/student-exams/self', authMiddleware(['Student'], [
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  ]), StudentExamController.getAllExamsForSelf);

export default router;

