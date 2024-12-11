

import { Response } from 'express';
import { Availability } from '../entities/availability.entity';
import { Teacher } from '../entities/teacher.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { addDefaultAvailability } from './helperFunctions/teacherHelper';
import { QueryRunner } from 'typeorm';

export class TeacherAvailabilityController {
  
  
  static async getAvailabilityByTeacherId(req: AuthenticatedRequest, res: Response) {
    const { teacherId } = req.params;
    try {
      const teacher = await AppDataSource.getRepository(Teacher).findOne({
        where: { id: Number(teacherId) },
        relations: ['availabilities'],
      });

      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      res.json(teacher.availabilities);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ message: 'Error fetching availability' });
    }
  }

  
  static async getAvailabilityForSelf(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized access' });
          }
      const teacher = await AppDataSource.getRepository(Teacher).findOne({
        where: { user: { id: req.user.id } },
        relations: ['availabilities'],
      });

      if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
      res.json(teacher.availabilities);
    } catch (error) {
      console.error('Error fetching availability for self:', error);
      res.status(500).json({ message: 'Error fetching availability for self' });
    }
  }


  
  static async updateAvailabilityForSelf(req: AuthenticatedRequest, res: Response) {
    const { availabilityId } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;
  
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
  
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const availabilityRepo = queryRunner.manager.getRepository(Availability);
      const teacherRepo = queryRunner.manager.getRepository(Teacher);
  
      
      const teacher = await teacherRepo.findOne({ where: { user: { id: req.user.id } } });
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      let availability;
  
      
      if (availabilityId && availabilityId !== '0') {
        availability = await availabilityRepo
          .createQueryBuilder('availability')
          .leftJoinAndSelect('availability.teacher', 'teacher')
          .where('availability.id = :availabilityId', { availabilityId: Number(availabilityId) })
          .andWhere('teacher.user.id = :userId', { userId: req.user.id })
          .getOne();
      }
  
      
      if (!availability) {
        await addSingleAvailability(queryRunner, teacher, dayOfWeek, startTime, endTime);
        await queryRunner.commitTransaction();
        return res.status(201).json({ message: 'Availability created successfully' });
      }
  
      
      availability.dayOfWeek = dayOfWeek;
      availability.startTime = startTime;
      availability.endTime = endTime;
      await availabilityRepo.save(availability);
  
      await queryRunner.commitTransaction();
      res.json({ message: 'Availability updated successfully', availability });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating or creating availability:', error);
      res.status(500).json({ message: 'Error updating or creating availability' });
    } finally {
      await queryRunner.release();
    }
  }
  
  
}  
const addSingleAvailability = async (queryRunner: QueryRunner, teacher: Teacher, dayOfWeek: string, startTime: string, endTime: string) => {
 const availabilityRepo = queryRunner.manager.getRepository(Availability);

 const availability = availabilityRepo.create({
   dayOfWeek,
   startTime,
   endTime,
   teacher,
 });

 await availabilityRepo.save(availability);
};

