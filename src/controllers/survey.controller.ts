import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Survey } from '../entities/survey.entity';
import { Question } from '../entities/question.entity';
import { User } from '../entities/user.entity';
import { UserSurvey } from '../entities/userSurvey.entity';
import { Answer } from '../entities/answer.entity';

class SurveyController {
  
  static async createSurvey(req: AuthenticatedRequest, res: Response) {
    const { title, questions } = req.body;
  
    try {
      const surveyRepo = AppDataSource.getRepository(Survey);
      const questionRepo = AppDataSource.getRepository(Question);
      const userSurveyRepo = AppDataSource.getRepository(UserSurvey);
      const userRepo = AppDataSource.getRepository(User);
  
      const survey = surveyRepo.create({ title });
      await surveyRepo.save(survey);
  
      if (questions && Array.isArray(questions)) {
        for (const questionData of questions) {
          const { text, type, options } = questionData;
  
          const question = questionRepo.create({
            text,
            type,
            survey,
            options: options|| [], 
          });
          await questionRepo.save(question);
        }
      }
  
      const users = await userRepo.find();
      for (const user of users) {
        const userSurvey = userSurveyRepo.create({
          user,
          survey,
          status: 'pending',
        });
        await userSurveyRepo.save(userSurvey);
      }
  
      return res.status(201).json({ message: 'Survey created successfully', survey });
    } catch (error) {
      console.error('Error creating survey:', error);
      return res.status(500).json({ message: 'Error creating survey' });
    }
  }
  

  
  static async getAllSurveys(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const surveyRepo = AppDataSource.getRepository(Survey);
  
      const [surveys, total] = await surveyRepo.findAndCount({
        relations: ['questions'],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { createdAt: 'DESC' }, 
      });
  
      return res.status(200).json({
        data: surveys,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      return res.status(500).json({ message: 'Error fetching surveys' });
    }
  }
  

  
  static async getSurveyById(req: AuthenticatedRequest, res: Response) {
    const { surveyId } = req.params;

    try {
      const surveyRepo = AppDataSource.getRepository(Survey);

      const survey = await surveyRepo.findOne({
        where: { id: Number(surveyId) },
        relations: ['questions'],
      });

      if (!survey) {
        return res.status(404).json({ message: 'Survey not found' });
      }

      return res.status(200).json(survey);
    } catch (error) {
      console.error('Error fetching survey by ID:', error);
      return res.status(500).json({ message: 'Error fetching survey by ID' });
    }
  }
  static async getSurveysForSelf(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(403).json({ message: 'Invalid User' });
      }
  
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
  
      const userSurveyRepo = AppDataSource.getRepository(UserSurvey);
  
      const [userSurveys, total] = await userSurveyRepo.findAndCount({
        where: { user: { id: userId } },
        relations: ['survey'],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { survey: { createdAt: 'DESC' } }, 
      });
  
      return res.status(200).json({
        data: userSurveys,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching surveys for user:', error);
      return res.status(500).json({ message: 'Error fetching surveys' });
    }
  }
  

static async skipSurveyForSelf(req: AuthenticatedRequest, res: Response) {
    const { surveyId } = req.body;

    if (!req.user) {
        return res.status(403).json({ message: 'Invalid User' });
    }

    try {
        const userId = req.user.id;
        const userSurveyRepo = AppDataSource.getRepository(UserSurvey);

        
        const userSurvey = await userSurveyRepo.findOne({
            where: { survey: { id: surveyId }, user: { id: userId } },
        });

        if (!userSurvey) {
            return res.status(404).json({ message: 'Survey not assigned to the user' });
        }

        
        userSurvey.status = 'skipped';
        await userSurveyRepo.save(userSurvey);

        return res.status(200).json({ message: 'Survey skipped successfully' });
    } catch (error) {
        console.error('Error skipping survey:', error);
        return res.status(500).json({ message: 'Error skipping survey' });
    }
}
  
  static async submitSurveyForSelf(req: AuthenticatedRequest, res: Response) {
    const { surveyId, answers } = req.body;
    if (!req.user) {
        return res.status(403).json({ message: 'Invalid User' });
      }
    try {
      const userId = req.user.id;
      const answerRepo = AppDataSource.getRepository(Answer);
      const userSurveyRepo = AppDataSource.getRepository(UserSurvey);
      const questionRepo = AppDataSource.getRepository(Question);

      
      const userSurvey = await userSurveyRepo.findOne({
        where: { survey: { id: surveyId }, user: { id: userId } },
      });

      if (!userSurvey) {
        return res.status(403).json({ message: 'Survey not assigned to the user' });
      }

      
      for (const answerData of answers) {
        const { questionId, text, selectedOptions } = answerData;

        
        const question = await questionRepo.findOne({ where: { id: questionId } });
        if (!question) {
          return res.status(400).json({ message: `Question with ID ${questionId} not found` });
        }

        const answer = answerRepo.create({
          text,
          selectedOptions,
          question,
          user: req.user,
        });
        await answerRepo.save(answer);
      }

      
      userSurvey.status = 'completed';
      await userSurveyRepo.save(userSurvey);

      return res.status(200).json({ message: 'Survey submitted successfully' });
    } catch (error) {
      console.error('Error submitting survey:', error);
      return res.status(500).json({ message: 'Error submitting survey' });
    }
  }

  static async getSurveyAnswers(req: AuthenticatedRequest, res: Response) {
    const { surveyId } = req.params;
    const { page = 1, limit = 10, search = '', sort = '' } = req.query;
  
    try {
      
      const surveyRepo = AppDataSource.getRepository(Survey);
      const survey = await surveyRepo.findOne({
        where: { id: Number(surveyId) },
        relations: ['questions'],
      });
  
      if (!survey) {
        return res.status(404).json({ message: 'Survey not found' });
      }
  
      
      const userSurveyRepo = AppDataSource.getRepository(UserSurvey);
      const queryBuilder = userSurveyRepo
        .createQueryBuilder('userSurvey')
        .leftJoinAndSelect('userSurvey.user', 'user')
        .where('userSurvey.survey = :surveyId', { surveyId });
  
      
      if (search) {
        queryBuilder.andWhere(
          `(user.firstName ILIKE :search OR user.lastName ILIKE :search)`,
          { search: `%${search}%` }
        );
      }
  
      
      

      if (sort) {
        queryBuilder.andWhere('userSurvey.status = :sort', { sort });
      }  
      queryBuilder
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit));
  
      const [userSurveys, total] = await queryBuilder.getManyAndCount();
  
      
      const submissions = await Promise.all(
        userSurveys.map(async (userSurvey) => {
          const answers = await AppDataSource.getRepository(Answer)
            .createQueryBuilder('answer')
            .leftJoinAndSelect('answer.question', 'question')
            .where('question.survey = :surveyId', { surveyId })
            .andWhere('answer.user = :userId', { userId: userSurvey.user.id })
            .getMany();
  
          
          const answersByQuestion = survey.questions.map((question) => {
            const answer = answers.find((ans) => ans.question.id === question.id);
            return {
              questionId: question.id,
              questionText: question.text,
              answer: answer ? { text: answer.text, selectedOptions: answer.selectedOptions } : null,
            };
          });
  
          return {
            user: {
              id: userSurvey.user.id,
              firstName: userSurvey.user.firstName,
              lastName: userSurvey.user.lastName,
            },
            status: userSurvey.status,
            answers: answersByQuestion,
          };
        })
      );
  
      return res.status(200).json({
        survey: {
          id: survey.id,
          title: survey.title,
          questions: survey.questions.map((q) => ({ id: q.id, text: q.text })),
        },
        submissions,
        page: Number(page),
        totalSubmissions: total,
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching survey answers:', error);
      return res.status(500).json({ message: 'Error fetching survey answers' });
    }
  }
  

static async editSurvey(req: AuthenticatedRequest, res: Response) {
  const { surveyId } = req.params;
  const { title, questions } = req.body;

  try {
    const surveyRepo = AppDataSource.getRepository(Survey);
    const questionRepo = AppDataSource.getRepository(Question);

    
    const survey = await surveyRepo.findOne({
      where: { id: Number(surveyId) },
      relations: ['questions'],
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    
    if (title) {
      survey.title = title;
      await surveyRepo.save(survey); 
    }

    
    const existingQuestionIds = survey.questions.map((q) => q.id);
    const incomingQuestionIds = questions.map((q: { id: any }) => q.id).filter(Boolean);

    
    for (const questionData of questions) {
      const { id, text, type, options } = questionData;

      if (id && existingQuestionIds.includes(id)) {
        
        const existingQuestion = await questionRepo.findOne({ where: { id } });
        if (existingQuestion) {
          existingQuestion.text = text;
          existingQuestion.type = type;
          existingQuestion.options = options;
          await questionRepo.save(existingQuestion);
        }
      } else {
        
        const newQuestion = questionRepo.create({
          text,
          type,
          options,
          survey, 
        });
        await questionRepo.save(newQuestion);
      }
    }

    
    const questionsToDelete = existingQuestionIds.filter((id) => !incomingQuestionIds.includes(id));
    if (questionsToDelete.length > 0) {
      await questionRepo.delete(questionsToDelete);
    }

    
    const updatedSurvey = await surveyRepo.findOne({
      where: { id: Number(surveyId) },
      relations: ['questions'],
    });

    return res.status(200).json({ message: 'Survey updated successfully', survey: updatedSurvey });
  } catch (error) {
    console.error('Error editing survey:', error);
    return res.status(500).json({ message: 'Error editing survey' });
  }
}

  
  
}

export default SurveyController;

