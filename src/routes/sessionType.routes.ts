import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { SessionType } from '../entities/sessionType.entity';
import { SessionTypeController } from '../controllers/sessionType.controller';
import { Franchise } from '../entities/franchise.entity';
import { Location } from '../entities/location.entity';

const router = Router();

router.get(
    '/session-types',
    authMiddleware(['SuperAdmin', 'FranchiseAdmin','LocationAdmin','Teacher','Parent','Student'],
        [
            { repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
            { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
        ]
    ), 
    SessionTypeController.getAllSessionTypes
);

export default router;

