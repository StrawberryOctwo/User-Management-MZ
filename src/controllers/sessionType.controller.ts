import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { SessionType } from '../entities/sessionType.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class SessionTypeController {
    static async getAllSessionTypes(req: AuthenticatedRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || '';

            if (page < 1 || limit < 1) {
                return res.status(400).json({ message: 'Page and limit must be positive integers.' });
            }

            const sessionTypeRepository = AppDataSource.getRepository(SessionType);

            const queryBuilder = sessionTypeRepository.createQueryBuilder('sessionType');

            if (search) {
                queryBuilder.where('sessionType.name ILIKE :search', { search: `%${search}%` });
            }

            
            const totalItems = await queryBuilder.getCount();

            
            const sessionTypes = await queryBuilder
                .orderBy('sessionType.name', 'ASC') 
                .skip((page - 1) * limit)
                .take(limit)
                .getMany();

            const totalPages = Math.ceil(totalItems / limit);

            
            return res.status(200).json({
                data: sessionTypes,
                meta: {
                    totalItems,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit
                }
            });
        } catch (error) {
            console.error('Error fetching session types:', error);
            return res.status(500).json({ message: 'Error fetching session types' });
        }
    }
}
