import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { SchoolType } from '../entities/schoolType.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class SchoolTypeController {
    static async getAllSchoolTypes(req: AuthenticatedRequest, res: Response) {
        try {
            const schoolTypeRepository = AppDataSource.getRepository(SchoolType);
            const schoolTypes = await schoolTypeRepository.find();
            return res.status(200).json(schoolTypes);
        } catch (error) {
            console.error('Error fetching school types:', error);
            return res.status(500).json({ message: 'Error fetching school types' });
        }
    }
}

