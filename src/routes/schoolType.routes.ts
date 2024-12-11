import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Franchise } from '../entities/franchise.entity';
import { Location } from '../entities/location.entity';
import { SchoolTypeController } from '../controllers/schoolTypes.controller';

const router = Router();

router.get(
    '/school-types',
    authMiddleware(
        ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
        [
            { repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },

        ]
    ),
    SchoolTypeController.getAllSchoolTypes
);

export default router;

