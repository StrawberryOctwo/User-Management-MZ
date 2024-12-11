import { Request, Response } from 'express';
import { Franchise } from '../entities/franchise.entity';
import { AppDataSource } from '../config/data-source';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FranchiseDto } from '../dto/franchiseDto';

import { Brackets } from 'typeorm';

const MAX_LOGO_SIZE = 500 * 1024; 

export class FranchiseController {
  static async createFranchise(req: AuthenticatedRequest, res: Response) {
    const { 
      name, 
      ownerName, 
      cardHolderName, 
      iban, 
      bic, 
      status, 
      totalEmployees, 
      percentage, 
      city, 
      address, 
      postalCode, 
      franchiseLogo,
      emailAddress,
      phoneNumber 
    } = req.body;
  
    try {
      // Validate logo
      if (franchiseLogo) {
        const logoBuffer = Buffer.from(franchiseLogo, 'base64');
        
        // Check size
        if (logoBuffer.length > MAX_LOGO_SIZE) {
          return res.status(400).json({ message: 'Logo exceeds maximum size of 500 KB' });
        }
  
        // Check format
        const allowedFormats = ['image/png', 'image/jpeg'];
        const fileType = franchiseLogo.match(/^data:(.*?);base64,/)?.[1];
        if (!fileType || !allowedFormats.includes(fileType)) {
          return res.status(400).json({ message: 'Invalid logo format. Only PNG and JPEG are allowed.' });
        }
      }
  
      const franchiseRepository = AppDataSource.getRepository(Franchise);
  
      const franchise = franchiseRepository.create({
        name,
        ownerName,
        cardHolderName,
        iban,
        bic,
        status,
        totalEmployees,
        percentage,
        city,
        address,
        postalCode,
        franchiseLogo,
        emailAddress,
        phoneNumber
      });
  
      await franchiseRepository.save(franchise);
      res.status(201).json({ message: 'Franchise added successfully' });
    } catch (error) {
      console.error('Error creating franchise:', error);
      res.status(500).json({ message: 'Error creating franchise', error });
    }
  }

  static async getPublicFranchiseLocations(req: Request, res: Response) {

    try {
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      let query = franchiseRepository.createQueryBuilder('franchise')
        .leftJoinAndSelect('franchise.locations', 'location')
        .where('franchise.public = :public', { public: true })

        .orderBy('franchise.createdAt', 'DESC')
        .select(['franchise.name', 'location.id', 'location.name'])


      const [franchises] = await query.getManyAndCount();


      return res.status(200).json({ franchises });
    } catch (error) {
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }

  static async getAllFranchises(req: AuthenticatedRequest, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;

    try {
      const franchiseRepository = AppDataSource.getRepository(Franchise);
      let query = franchiseRepository.createQueryBuilder('franchise')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('franchise.createdAt', 'DESC');

      if (search) {
        query.andWhere(
          new Brackets(qb => {
            qb.where('franchise.name ILIKE :search', { search: `%${search}%` })
              .orWhere('franchise.ownerName ILIKE :search', { search: `%${search}%` })
              .orWhere('franchise.cardHolderName ILIKE :search', { search: `%${search}%` });
          })
        );
      }

      if (req.entities?.franchises) {
        const userFranchiseIds = req.entities.franchises.map(franchise => franchise.id);
        query.andWhere('franchise.id IN (:...userFranchiseIds)', { userFranchiseIds });
      }

      const [data, total] = await query.getManyAndCount();
      const pageCount = Math.ceil(total / Number(limit));

      return res.status(200).json({ data, total, page: Number(page), pageCount });
    } catch (error) {
      return res.status(500).json({ message: `Server error: ${error}` });
    }
  }

  static async getFranchiseById(req: AuthenticatedRequest, res: Response) {
    try {
      const franchise = await AppDataSource.getRepository(Franchise).findOne({
        where: ({ id: Number(req.params.id) }),
        relations: ['admins', 'locations'],
      });
  

      if (!franchise) {
        return res.status(404).json({ message: 'Franchise not found' });
      }

      const isAdmin = franchise.admins.some(admin => admin.id === req.user?.id);
      if (!isAdmin && !req.user?.roles.some(role => role.name === 'SuperAdmin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this franchise' });
      }

      res.json(new FranchiseDto(franchise));
    } catch (error) {
      console.error('Error fetching franchise:', error);
      res.status(500).json({ message: 'Error fetching franchise' });
    }
  }

  static async updateFranchise(req: AuthenticatedRequest, res: Response) {
    try {
      const franchise = await AppDataSource.getRepository(Franchise).findOne({
        where: ({ id: Number(req.params.id) }),
        relations: ['admins'],
      });
      if (!franchise) {
        return res.status(404).json({ message: 'Franchise not found' });
      }

      const isAdmin = franchise.admins.some(admin => admin.id === req.user?.id);
      if (!isAdmin && !req.user?.roles.some(role => role.name === 'SuperAdmin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this franchise' });
      }

      AppDataSource.getRepository(Franchise).merge(franchise, req.body);
      await AppDataSource.getRepository(Franchise).save(franchise);

      res.json({ message: 'Franchise updated successfully' });
    } catch (error) {
      console.error('Error updating franchise:', error);
      res.status(500).json({ message: 'Error updating franchise' });
    }
  }

  static async deleteFranchise(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Please provide an array of franchise IDs' });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const franchiseRepository = queryRunner.manager.getRepository(Franchise);

      for (const id of ids) {
        const franchise = await franchiseRepository.findOne({
          where: { id: Number(id) },
          relations: ['admins'],
        });

        if (!franchise) {
          return res.status(404).json({ message: `Franchise with ID ${id} not found or already deleted` });
        }

        const isAdmin = franchise.admins.some(admin => admin.id === req.user?.id);
        if (!isAdmin && !req.user?.roles.some(role => role.name === 'SuperAdmin')) {
          return res.status(403).json({ message: 'Forbidden: You do not have access to this franchise' });
        }
      }

      await franchiseRepository.softDelete(ids);

      await queryRunner.commitTransaction();

      res.json({ message: 'Franchises deleted successfully' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting franchises:', error);
      res.status(500).json({ message: 'Error deleting franchises' });
    } finally {
      await queryRunner.release();
    }
  }


  static async updateFranchiseStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const franchise = await AppDataSource.getRepository(Franchise).findOne({
        where: ({ id: Number(req.params.id) }),
        relations: ['admins'],
      });
      if (!franchise) {
        return res.status(404).json({ message: 'Franchise not found' });
      }

      const isAdmin = franchise.admins.some(admin => admin.id === req.user?.id);
      if (!isAdmin && !req.user?.roles.some(role => role.name === 'SuperAdmin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this franchise' });
      }

      franchise.status = req.body.status;
      await AppDataSource.getRepository(Franchise).save(franchise);

      res.json(new FranchiseDto(franchise));
    } catch (error) {
      console.error('Error updating franchise status:', error);
      res.status(500).json({ message: 'Error updating franchise status' });
    }
  }
}

