import { Router } from 'express';
import { TeacherAvailabilityController } from '../controllers/availability.controller';
import { AppDataSource } from '../config/data-source';
import { Franchise } from '../entities/franchise.entity';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Location } from '../entities/location.entity';

const router = Router();


router.get('/teachers/availability/:teacherId',authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
    ]
), TeacherAvailabilityController.getAvailabilityByTeacherId);


router.get('/teachers/self/availability',authMiddleware(['SuperAdmin','Teacher'],[    { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
]), TeacherAvailabilityController.getAvailabilityForSelf);


router.put('/teachers/self/availability/:availabilityId',authMiddleware(['SuperAdmin','Teacher'],[    { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
]), TeacherAvailabilityController.updateAvailabilityForSelf);

export default router;

