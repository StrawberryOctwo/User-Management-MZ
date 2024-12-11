import { Request, Response } from 'express';
import { Interest } from '../entities/interest.entity';
import { Location } from '../entities/location.entity';
import { AppDataSource } from '../config/data-source';
import { saveDocument } from '../utils/fileUtils';
import { LocationWeeklyAvailability } from '../entities/LocationWeeklyAvailability.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Brackets } from 'typeorm';

export const createInterest = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    locationId,
    role,
    fundingOption,
    documents,
    takeKnowledgeTest,
    appointment,
  } = req.body;

  const locationRepository = AppDataSource.getRepository(Location);
  const interestRepository = AppDataSource.getRepository(Interest);

  try {
    
    const location = await locationRepository.findOneBy({ id: locationId });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }


    
    const newInterest = interestRepository.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      role,
      fundingOption,
      documents: [], 
      takeKnowledgeTest,
      appointment,
    });

    
    const savedInterest = await interestRepository.save(newInterest);

    
    const uploadedDocuments = await Promise.all(
      documents.map(async (doc: { name: string; content: string }) => {
        const filePath = await saveDocument(doc.name, doc.content); 
        return { name: doc.name, path: filePath }; 
      })
    );

    
    savedInterest.documents = uploadedDocuments;
    await interestRepository.save(savedInterest); 

    return res.status(201).json(savedInterest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

class InterestController {
  
  static async getInterests(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    try {
      const interestRepository = AppDataSource.getRepository(Interest);

      let query = interestRepository.createQueryBuilder('interest')
        .leftJoinAndSelect('interest.location', 'location')
        .orderBy('interest.accepted', 'ASC') 
        .addOrderBy('interest.appointment', 'ASC')
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .select([
        'interest.id',
        'interest.firstName',
        'interest.lastName',
        'interest.phoneNumber',
        'interest.email',
        'interest.appointment',
        'location.name',
      'interest.accepted'])
      
      

      
      if (search) {
        query.andWhere(
          new Brackets(qb => {
            qb.where('interest.firstName ILIKE :search', { search: `%${search}%` })
              .orWhere('interest.lastName ILIKE :search', { search: `%${search}%` })
              .orWhere('interest.email ILIKE :search', { search: `%${search}%` });
            
          })
        );
      }

      
      if (req.queryFilters) {
        req.queryFilters(query);
      }

      const [interests, total] = await query.getManyAndCount();

      const pageCount = Math.ceil(total / Number(limit));

      return res.status(200).json({
        data: interests,
        total,
        page: Number(page),
        pageCount,
      });
    } catch (error) {
      console.error('Error fetching interests:', error);
      return res.status(500).json({ message: 'Server error: ' + error });
    }
  }

  
  static async getInterestById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const interestRepository = AppDataSource.getRepository(Interest);

      const interest = await interestRepository.findOne({
        where: { id: Number(id) },
        relations: ['location']
      });

      if (!interest) {
        return res.status(404).json({ message: 'Interest not found' });
      }

      return res.status(200).json({ data: interest });
    } catch (error) {
      console.error('Error fetching interest:', error);
      return res.status(500).json({ message: 'Server error: ' + error });
    }
  }
  static async toggleAcceptedStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
  
    try {
      const interestRepository = AppDataSource.getRepository(Interest);
  
      // Fetch the interest by ID
      const interest = await interestRepository.findOneBy({ id: Number(id) });
      if (!interest) {
        return res.status(404).json({ message: 'Interest not found' });
      }
  
      interest.accepted = !interest.accepted;
  
      await interestRepository.save(interest);
  
      const message = interest.accepted
        ? 'Interest accepted successfully'
        : 'Interest declined successfully';
  
      return res.status(200).json({
        message, 
        data: { id: interest.id, accepted: interest.accepted },
      });
    } catch (error) {
      console.error('Error toggling accepted status:', error);
      return res.status(500).json({ message: 'Server error: ' + error });
    }
  }
  
}

export default InterestController;

