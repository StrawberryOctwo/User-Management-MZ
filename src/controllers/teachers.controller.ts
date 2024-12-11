import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Teacher } from '../entities/teacher.entity';
import { UserDto } from '../dto/userDto';
import { User } from '../entities/user.entity';
import { Brackets, QueryFailedError } from 'typeorm';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { addDefaultAvailability, handleQueryFailedError, saveOrUpdateTeacher } from './helperFunctions/teacherHelper'

import { FileUpload } from '../entities/file-upload.entity';
export class TeachersController {
  static async getTeachers(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    try {
      const teacherRepository = AppDataSource.getRepository(Teacher);

      let query = teacherRepository.createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('teacher.locations', 'location') 
        .leftJoinAndSelect('location.franchise', 'franchise')

      if (search) {
        query = query.andWhere(
          new Brackets(qb => {
            qb.where('user.firstName ILIKE :search', { search: `%${search}%` })
              .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
              .orWhere('user.email ILIKE :search', { search: `%${search}%` })
              .orWhere('teacher.employeeNumber ILIKE :search', { search: `%${search}%` });
          })
        );
      }

      if (req.queryFilters) {
        query = req.queryFilters(query);
      }

      const [teachers, total] = await query
        .take(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .orderBy('teacher.createdAt', 'DESC')
        .getManyAndCount();

      const teacherDtos = teachers.map(teacher => ({
        id: teacher.id,
        userId: teacher.user.id,
        firstName: teacher.user.firstName,
        lastName: teacher.user.lastName,
        franchiseName: teacher.locations.length > 0 ? teacher.locations[0].franchise.name : '', 
        email: teacher.user.email,
        employeeNumber: teacher.employeeNumber,
        contractStartDate: teacher.contractStartDate,
        contractEndDate: teacher.contractEndDate,
        hourlyRate: teacher.hourlyRate,
        rateMultiplier: teacher.rateMultiplier,
        status: teacher.status,
      }));

      res.status(200).json({
        data: teacherDtos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });

    } catch (error) {
      console.error('Error fetching teachers:', error);
      res.status(500).json({ message: 'Error fetching teachers' });
    }
  }

  
  static async getTeacherById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const teacherRepository = AppDataSource.getRepository(Teacher);

      let query = teacherRepository.createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('teacher.topics', 'topics')
        .leftJoinAndSelect('teacher.locations', 'locations') 
        .leftJoinAndSelect('locations.franchise', 'franchise')
        .leftJoinAndSelect('teacher.availabilities', 'availabilities')
        .select(['teacher','user','franchise.id','franchise.name','topics','locations','availabilities'])
        .where('teacher.id = :id', { id: Number(id) })

      const teacher = await query.getOne();

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const topics = teacher.topics.map(topic => ({
        id: topic.id,
        name: topic.name,
      }));

      res.status(200).json({
        ...teacher,
        user: new UserDto(teacher.user),
        topics,
      });
    } catch (error) {
      console.error('Error fetching teacher:', error);
      res.status(500).json({ message: 'Error fetching teacher' });
    }
  }


  static async getTeacherInvoiceInfoByUserId(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params;

    try {
      const teacherRepository = AppDataSource.getRepository(Teacher);

      let query = teacherRepository.createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('teacher.locations', 'locations')
        .leftJoinAndSelect('locations.franchise', 'franchise')
        .select(['teacher', 'user', 'locations.id','franchise'])
        .where('teacher.user.id = :userId', { userId: Number(userId) })

      const teacher = await query.getOne();

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found for the provided user ID' });
      }

      const teacherDto = {
        ...teacher,
        user: new UserDto(teacher.user),
      };

      res.status(200).json(teacherDto);
    } catch (error) {
      console.error('Error fetching teacher by user ID:', error);
      res.status(500).json({ message: 'Error fetching teacher by user ID' });
    }
  }
  static async getTeacherByUserId(req: AuthenticatedRequest, res: Response) {
    const { userId } = req.params;

    try {
      const teacherRepository = AppDataSource.getRepository(Teacher);

      let query = teacherRepository.createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.user', 'user')
        .leftJoinAndSelect('teacher.locations', 'locations')
        .leftJoinAndSelect('locations.franchise', 'franchise')
        .select(['teacher', 'user', 'locations.name',
          'franchise.name'])
        .where('teacher.user.id = :userId', { userId: Number(userId) })

      const teacher = await query.getOne();

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found for the provided user ID' });
      }

      const teacherDto = {
        ...teacher,
        user: new UserDto(teacher.user),
      };

      res.status(200).json(teacherDto);
    } catch (error) {
      console.error('Error fetching teacher by user ID:', error);
      res.status(500).json({ message: 'Error fetching teacher by user ID' });
    }
  }

  static async createTeacher(req: AuthenticatedRequest, res: Response) {
    const { user: userData, teacher: teacherData } = req.body;
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { user, teacher } = await saveOrUpdateTeacher(queryRunner, userData, teacherData);

      await addDefaultAvailability(queryRunner, teacher);

      await queryRunner.commitTransaction();

      res.status(201).json({ message: 'Teacher added successfully', teacherId: teacher.id, userId: user.id });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        const errorMessage = handleQueryFailedError(error);
        console.error('Error creating teacher:', errorMessage);
        return res.status(400).json({ message: errorMessage });
      }

      console.error('Error creating teacher:', error);
      res.status(500).json({ message: 'Error creating teacher' });
    } finally {
      await queryRunner.release();
    }
  }

  static async updateTeacher(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { user: userData, teacher: teacherData } = req.body;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teacherRepository = queryRunner.manager.getRepository(Teacher);
      const userRepository = queryRunner.manager.getRepository(User);

      const existingTeacher = await teacherRepository.findOne({
        where: { id: Number(id) },
        relations: ['user']
      });

      if (!existingTeacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const existingUser = await userRepository.findOne({
        where: { id: existingTeacher.user.id },
      });

      if (!existingUser) {
        return res.status(404).json({ message: 'User associated with the teacher not found' });
      }

      const { user, teacher } = await saveOrUpdateTeacher(
        queryRunner,
        userData,
        teacherData,
        true,
        existingUser
      );

      await queryRunner.commitTransaction();

      res.status(200).json({ message: "Teacher updated successfully", teacherId: teacher.id, userId: user.id });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating teacher:', error);
      res.status(500).json({ message: 'Error updating teacher' });
    } finally {
      await queryRunner.release();
    }
  }


  static async deleteTeacher(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body; 

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Please provide an array of teacher IDs' });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const teacherRepository = queryRunner.manager.getRepository(Teacher);

      await teacherRepository
        .createQueryBuilder()
        .softDelete()
        .whereInIds(ids)
        .execute();

      await queryRunner.commitTransaction();

      res.status(200).json({ message: 'Teachers deleted successfully' });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error('Error deleting teachers:', error);
      res.status(500).json({ message: 'Error deleting teachers' });
    } finally {
      await queryRunner.release();
    }
  }



  static async getTeacherDocuments(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const teacherRepository = AppDataSource.getRepository(Teacher);
      const fileRepository = AppDataSource.getRepository(FileUpload);

      const teacher = await teacherRepository.findOne({
        where: { id: Number(id) },
        relations: ['user'],
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      const teacherDocuments = await fileRepository.find({
        where: { user: { id: teacher.user.id } },
        select: ['id', 'name', 'type', 'path', 'createdAt'],
      });

      const transformedDocuments = teacherDocuments.map((doc) => ({
        ...doc,
        path: doc.path.split('__ORIGINAL__')[1] || doc.path,
      }));

      return res.status(200).json({
        message: 'Teacher documents retrieved successfully',
        documents: transformedDocuments,
      });
    } catch (error) {
      console.error('Error fetching teacher documents:', error);
      return res.status(500).json({ message: 'Error fetching teacher documents' });
    }
  }

}


