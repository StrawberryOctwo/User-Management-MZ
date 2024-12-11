import { Request, Response } from 'express';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Franchise } from '../entities/franchise.entity';
import { AppDataSource } from '../config/data-source';
import bcrypt from 'bcryptjs';
import { UserDto } from '../dto/userDto';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FranchiseDto } from '../dto/franchiseDto';
import { ILike } from 'typeorm';
import { saveOrUpdateFranchiseAdmin } from './helperFunctions/franchiseAdminsHelper';

export class FranchiseAdminController {
  static async createFranchiseAdmin(req: AuthenticatedRequest, res: Response) {
    const { firstName, lastName, city, email, password, dob, address, postalCode, phoneNumber, franchiseIds } = req.body;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const roleRepository = AppDataSource.getRepository(Role);
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const result = await saveOrUpdateFranchiseAdmin(
        userRepository,
        roleRepository,
        franchiseRepository,
        { firstName, city, lastName, email, password, dob, address, postalCode, phoneNumber },
        franchiseIds
      );


      if (result.error) {
        return res.status(result.error.status).json({ message: result.error.message });
      }

      return res.status(201).json({ message: 'Franchise Admin created successfully' });
    } catch (error) {
      console.error('Error creating FranchiseAdmin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateFranchiseAdmin(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { firstName, lastName, city, email, password, dob, address, postalCode, phoneNumber, franchiseIds } = req.body;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const franchiseAdmin = await userRepository.findOne({
        where: ({ id: parseInt(id), roles: { name: 'FranchiseAdmin' } }),
        relations: ['roles', 'franchises'],
      });

      if (!franchiseAdmin) {
        return res.status(404).json({ message: 'FranchiseAdmin not found' });
      }

      franchiseAdmin.firstName = firstName || franchiseAdmin.firstName;
      franchiseAdmin.lastName = lastName || franchiseAdmin.lastName;
      franchiseAdmin.city = city || franchiseAdmin.city;
      franchiseAdmin.email = email || franchiseAdmin.email;
      franchiseAdmin.dob = dob || franchiseAdmin.dob;
      franchiseAdmin.address = address || franchiseAdmin.address;
      franchiseAdmin.postalCode = postalCode || franchiseAdmin.postalCode;
      franchiseAdmin.phoneNumber = phoneNumber || franchiseAdmin.phoneNumber;

      if (password) {
        franchiseAdmin.password = await bcrypt.hash(password, 10);
      }

      if (franchiseIds && franchiseIds.length > 0) {
        const franchises = await franchiseRepository.findByIds(franchiseIds);

        if (franchises.length === 0) {
          return res.status(400).json({ message: 'No valid franchises found for the provided franchise IDs' });
        }

        franchiseAdmin.franchises = franchises;
      }

      await userRepository.save(franchiseAdmin);

      const franchiseAdminDto = new UserDto(franchiseAdmin);
      res.status(200).json({ message: 'Franchise Admin updated successfully' });
    } catch (error) {
      console.error("Error updating FranchiseAdmin:", error);
      res.status(500).json({ message: 'Error updating FranchiseAdmin', error });
    }
  }

  static async getAllFranchiseAdmins(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const roleRepository = AppDataSource.getRepository(Role);

      const franchiseAdminRole = await roleRepository.findOne({ where: { name: 'FranchiseAdmin' } });
      if (!franchiseAdminRole) {
        return res.status(400).json({ message: 'FranchiseAdmin role not found' });
      }

      let whereConditions: any = ({ roles: { id: franchiseAdminRole.id } });

      if (search) {
        whereConditions = [
          ({ roles: { id: franchiseAdminRole.id }, firstName: ILike(`%${search}%`) }),
          ({ roles: { id: franchiseAdminRole.id }, lastName: ILike(`%${search}%`) }),
          ({ roles: { id: franchiseAdminRole.id }, email: ILike(`%${search}%`) }),
          ({ roles: { id: franchiseAdminRole.id }, franchises: { name: ILike(`%${search}%`) } }),
        ];
      }

      const [franchiseAdmins, total] = await userRepository.findAndCount({
        where: whereConditions,
        relations: ['franchises'],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { createdAt: 'DESC' },
      });

      const franchiseAdminDtos = franchiseAdmins.map(admin => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        city: admin.city,
        dob: admin.dob,
        email: admin.email,
        address: admin.address,
        postalCode: admin.postalCode,
        phoneNumber: admin.phoneNumber,
        franchiseNames: admin.franchises.map(f => f.name) 
      }));

      res.status(200).json({
        data: franchiseAdminDtos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching FranchiseAdmins:", error);
      res.status(500).json({ message: 'Error fetching FranchiseAdmins', error });
    }
  }

  static async getFranchisesByAdminId(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params; 

    try {
      if (req.user?.id !== parseInt(id) && !req.user?.roles.some(role => role.name === 'SuperAdmin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to these franchises' });
      }
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const franchises = await franchiseRepository
        .createQueryBuilder('franchise')
        .innerJoin('franchise.admins', 'admin')
        .andWhere('admin.id = :id', { id })
        .getMany();

      if (!franchises.length) {
        return res.status(404).json({ message: 'No franchises found for this admin' });
      }

      const franchiseDtos = franchises.map(franchise => new FranchiseDto(franchise));

      res.status(200).json(franchiseDtos);
    } catch (error) {
      console.error("Error fetching franchises by admin ID:", error);
      res.status(500).json({ message: 'Error fetching franchises by admin ID', error });
    }
  }

  static async deleteFranchiseAdmins(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Please provide an array of franchise admin IDs' });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);

      const admins = await userRepository
        .createQueryBuilder('user')
        .where('user.id IN (:...ids)', { ids })
        .getMany();

      const existingAdminIds = admins.map(admin => admin.id);
      const missingAdmins = ids.filter(id => !existingAdminIds.includes(id));

      if (missingAdmins.length > 0) {
        return res.status(404).json({
          message: `Franchise admins with IDs ${missingAdmins.join(', ')} not found or already deleted`,
        });
      }

      await userRepository
        .createQueryBuilder()
        .softDelete()
        .where('id IN (:...ids)', { ids: existingAdminIds })
        .execute();

      await queryRunner.commitTransaction();

      res.status(200).json({ message: 'Franchise admins deleted successfully' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting franchise admins:', error);
      res.status(500).json({ message: 'Error deleting franchise admins' });
    } finally {
      await queryRunner.release();
    }
  }

  static async getFranchiseAdminById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const userRepository = AppDataSource.getRepository(User);

      const franchiseAdmin = await userRepository.findOne({
        where: ({ id: parseInt(id), roles: { name: 'FranchiseAdmin' } }),
        relations: ['roles', 'franchises'],
      });

      if (!franchiseAdmin) {
        return res.status(404).json({ message: 'FranchiseAdmin not found' });
      }

      const franchiseAdminDto = {
        id: franchiseAdmin.id,
        firstName: franchiseAdmin.firstName,
        lastName: franchiseAdmin.lastName,
        city: franchiseAdmin.city,
        dob: franchiseAdmin.dob,
        email: franchiseAdmin.email,
        address: franchiseAdmin.address,
        postalCode: franchiseAdmin.postalCode,
        phoneNumber: franchiseAdmin.phoneNumber,
        franchises: franchiseAdmin.franchises.map(f => ({
          id: f.id,
          name: f.name
        })),
      };

      res.status(200).json(franchiseAdminDto);
    } catch (error) {
      console.error("Error fetching FranchiseAdmin by ID:", error);
      res.status(500).json({ message: 'Error fetching FranchiseAdmin by ID', error });
    }
  }

}

