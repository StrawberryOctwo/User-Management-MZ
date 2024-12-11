

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Student } from '../entities/student.entity';
import { AppDataSource } from '../config/data-source';
import { StudentExam } from '../entities/studentExam.entity';

export class StudentExamController {
  
  static async addExamForSelf(req: AuthenticatedRequest, res: Response) {
    const { examName, grade } = req.body;
    if(!req.user){
        return
    }
    try {
      
      const student = await AppDataSource.getRepository(Student).findOne({
        where: { user: { id: req.user.id } },
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      
      const exam = new StudentExam();
      exam.name = examName;
      exam.grade = grade;
      exam.student = student;

      await AppDataSource.getRepository(StudentExam).save(exam);

      res.status(201).json({ message: 'Exam added successfully', exam });
    } catch (error) {
      console.error('Error adding exam:', error);
      res.status(500).json({ message: 'Error adding exam' });
    }
  }

  
  static async getAllExamsForSelf(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;
    if(!req.user){
        return
    }
    try {
      const student = await AppDataSource.getRepository(Student).findOne({
        where: { user: { id: req.user.id } },
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const examRepository = AppDataSource.getRepository(StudentExam);
      const [exams, total] = await examRepository.findAndCount({
        where: { student: { id: student.id } },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { id: 'ASC' },
      });

      res.status(200).json({
        data: exams,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ message: 'Error fetching exams' });
    }
  }
}

