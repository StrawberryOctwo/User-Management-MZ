import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { ContractPackage } from '../entities/contractPackage.entity';
import { Franchise } from '../entities/franchise.entity';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { PackageSessionTypePrice } from '../entities/packageSessionTypePrice.entity';
import { PackageDiscountPrice } from '../entities/packageDiscountPrice.entity';
import { Student } from '../entities/student.entity';

export class ContractPackageController {

  
  static async addContractPackage(req: AuthenticatedRequest, res: Response) {
    const { name, contractName, monthlyFee, oneTimeFee,initialSessionBalance, isVatExempt, vatPercentage, franchiseId, sessionTypePrices, discounts } = req.body;

    try {
      const contractPackageRepository = AppDataSource.getRepository(ContractPackage);
      const franchiseRepository = AppDataSource.getRepository(Franchise);
      const sessionTypePriceRepository = AppDataSource.getRepository(PackageSessionTypePrice);
      const discountPriceRepository = AppDataSource.getRepository(PackageDiscountPrice);

      
      const franchise = await franchiseRepository.findOne({ where: { id: franchiseId } });
      if (!franchise) {
        return res.status(400).json({ message: 'Invalid franchise ID' });
      }

      
      const contractPackage = contractPackageRepository.create({
        name,
        contractName,
        monthlyFee,
        oneTimeFee,
        isVatExempt,
        // initialSessionBalance,
        vatPercentage,
        franchise,
      });
      await contractPackageRepository.save(contractPackage);

      
      if (sessionTypePrices && Array.isArray(sessionTypePrices)) {
        const sessionTypePriceEntities = sessionTypePrices.map(({ sessionTypeId, price }: { sessionTypeId: number, price: number }) =>
          sessionTypePriceRepository.create({ contractPackage, sessionType: { id: sessionTypeId }, price })
        );
        await sessionTypePriceRepository.save(sessionTypePriceEntities);
      }

      
      if (discounts && Array.isArray(discounts)) {
        const discountPriceEntities = discounts.map(({ discountId, price }: { discountId: number, price: number }) =>
          discountPriceRepository.create({ contractPackage, discount: { id: discountId }, price })
        );
        await discountPriceRepository.save(discountPriceEntities);
      }

      res.status(201).json({ message: 'Contract Package added successfully' });
    } catch (error) {
      console.error('Error adding contract package:', error);
      res.status(500).json({ message: 'Error adding contract package' });
    }
  }

  static async getAllContractPackages(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    try {
      const contractPackageRepository = AppDataSource.getRepository(ContractPackage);

      let query = contractPackageRepository
        .createQueryBuilder('contractPackage')
        .leftJoinAndSelect('contractPackage.franchise', 'franchise')
        .leftJoinAndSelect('contractPackage.packageSessionTypePrices', 'sessionTypePrices')
        .leftJoinAndSelect('sessionTypePrices.sessionType', 'sessionType') 
        .leftJoinAndSelect('contractPackage.packageDiscountPrices', 'discounts')
        .leftJoinAndSelect('discounts.discount', 'discount') 
        
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('contractPackage.createdAt', 'DESC')
        .select([
          'contractPackage',
          'franchise.id',
          'franchise.name',
          'sessionTypePrices.id',
          'sessionTypePrices.price',
          'sessionType.id',
          'sessionType.name',
          'discounts.id',
          'discounts.price',
          'discount.id',
          'discount.name'
        ]);
        if (req.queryFilters) {
          query = req.queryFilters(query);
        }
      const contractPackages = await query.getMany();
      const total = await query.getCount();

      res.status(200).json({
        data: contractPackages,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching all contract packages:', error);
      res.status(500).json({ message: 'Error fetching all contract packages' });
    }
  }

  static async getContractPackageById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const contractPackageRepository = AppDataSource.getRepository(ContractPackage);

      
      const contractPackage = await contractPackageRepository
        .createQueryBuilder('contractPackage')
        .leftJoinAndSelect('contractPackage.franchise', 'franchise')
        .leftJoinAndSelect('contractPackage.packageSessionTypePrices', 'sessionTypePrices')
        .leftJoinAndSelect('sessionTypePrices.sessionType', 'sessionType') 
        .leftJoinAndSelect('contractPackage.packageDiscountPrices', 'discounts')
        .leftJoinAndSelect('discounts.discount', 'discount') 
        .where('contractPackage.id = :id', { id: Number(id) })
        .select([
          'contractPackage',
          'franchise.id',
          'franchise.name',
          'sessionTypePrices.id',
          'sessionTypePrices.price',
          'sessionType.id',
          'sessionType.name',
          'discounts.id',
          'discounts.price',
          'discount.id',
          'discount.name'
        ])
        .getOne();

      if (!contractPackage) {
        return res.status(404).json({ message: 'Contract Package not found' });
      }

      res.status(200).json(contractPackage);
    } catch (error) {
      console.error('Error fetching contract package by ID:', error);
      res.status(500).json({ message: 'Error fetching contract package' });
    }
  }

  
  static async getContractPackagesByFranchise(req: AuthenticatedRequest, res: Response) {
    const { franchiseId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query; 
  
    try {
      const contractPackageRepository = AppDataSource.getRepository(ContractPackage);
  
      const query = contractPackageRepository
        .createQueryBuilder('contractPackage')
        .leftJoinAndSelect('contractPackage.franchise', 'franchise')
        .where('contractPackage.franchiseId = :franchiseId', { franchiseId: Number(franchiseId) })
        .andWhere('contractPackage.name ILIKE :search', { search: `%${search}%` }) 
        .skip((Number(page) - 1) * Number(limit))
        .take(Number(limit))
        .orderBy('contractPackage.createdAt', 'DESC');
  
      const contractPackages = await query.getMany();
      const total = await query.getCount();
  
      res.status(200).json({
        data: contractPackages,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error('Error fetching contract packages by franchise:', error);
      res.status(500).json({ message: 'Error fetching contract packages' });
    }
  }

  static async assignContractToStudent(req: AuthenticatedRequest, res: Response) {
    const { studentId, contractId } = req.body;

    try {
        const studentRepository = AppDataSource.getRepository(Student);
        const contractRepository = AppDataSource.getRepository(ContractPackage);

        
        const student = await studentRepository.findOne({
            where: { id: Number(studentId) },
        });
        const contract = await contractRepository.findOne({
            where: { id: Number(contractId) },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        
        if (student.sessionBalance && student.sessionBalance > 0) {
            return res.status(400).json({ 
                message: `Student still has ${student.sessionBalance} sessions remaining. Complete or clear the balance before assigning a new contract.`
            });
        }

        
        // if (contract.initialSessionBalance && contract.initialSessionBalance > 0) {
        //     student.sessionBalance = contract.initialSessionBalance;
        // } else {
        //     student.sessionBalance = 0; 
        // }

        
        student.contract = contract;
        await studentRepository.save(student);

        res.status(200).json({ message: 'Contract assigned to student successfully' });
    } catch (error) {
        console.error('Error assigning contract to student:', error);
        res.status(500).json({ message: 'Error assigning contract to student' });
    }
}



static async getFranchiseContractNames(req: AuthenticatedRequest, res: Response) {
  const { page = 1, limit = 10, search = '' } = req.query; 

  try {
    const contractPackageRepository = AppDataSource.getRepository(ContractPackage);

    let query = contractPackageRepository
      .createQueryBuilder('contractPackage')
      .leftJoinAndSelect('contractPackage.franchise', 'franchise')
      .leftJoinAndSelect('franchise.locations', 'location')
      
      .andWhere('contractPackage.name ILIKE :search', { search: `%${search}%` }) 
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .select([
        'contractPackage.id',
        'contractPackage.name',
      ]);

    
    if (req.queryFilters) {
      query = req.queryFilters(query);
    }

    const contractPackages = await query.getMany();
    const total = await query.getCount();

    res.status(200).json({
      data: contractPackages,
      total,
      page: Number(page),
      pageCount: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching all contract packages:', error);
    res.status(500).json({ message: 'Error fetching all contract packages' });
  }
}


  
  static async editContractPackage(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, contractName, monthlyFee, oneTimeFee, initialSessionBalance,isVatExempt, vatPercentage, franchiseId, sessionTypePrices, discounts } = req.body;

    try {
      const contractPackageRepository = AppDataSource.getRepository(ContractPackage);
      const franchiseRepository = AppDataSource.getRepository(Franchise);
      const sessionTypePriceRepository = AppDataSource.getRepository(PackageSessionTypePrice);
      const discountPriceRepository = AppDataSource.getRepository(PackageDiscountPrice);

      
      const contractPackage = await contractPackageRepository.findOne({ where: { id: Number(id) } });
      if (!contractPackage) {
        return res.status(404).json({ message: 'Contract Package not found' });
      }

      
      if (franchiseId) {
        const franchise = await franchiseRepository.findOne({ where: { id: franchiseId } });
        if (!franchise) {
          return res.status(400).json({ message: 'Invalid franchise ID' });
        }
        contractPackage.franchise = franchise;
      }

      
      contractPackage.name = name ?? contractPackage.name;
      contractPackage.contractName = contractName ?? contractPackage.contractName;
      contractPackage.monthlyFee = monthlyFee ?? contractPackage.monthlyFee;
      contractPackage.oneTimeFee = oneTimeFee ?? contractPackage.oneTimeFee;
      // contractPackage.initialSessionBalance = initialSessionBalance ?? contractPackage.initialSessionBalance;
      contractPackage.isVatExempt = isVatExempt ?? contractPackage.isVatExempt;
      contractPackage.vatPercentage = vatPercentage ?? contractPackage.vatPercentage;

      await contractPackageRepository.save(contractPackage);

      
      if (sessionTypePrices && Array.isArray(sessionTypePrices)) {
        
        await sessionTypePriceRepository.delete({ contractPackage: { id: contractPackage.id } });

        
        const sessionTypePriceEntities = sessionTypePrices.map(({ sessionTypeId, price }: { sessionTypeId: number, price: number }) =>
          sessionTypePriceRepository.create({ contractPackage, sessionType: { id: sessionTypeId }, price })
        );
        await sessionTypePriceRepository.save(sessionTypePriceEntities);
      }

      
      if (discounts && Array.isArray(discounts)) {
        
        await discountPriceRepository.delete({ contractPackage: { id: contractPackage.id } });

        
        const discountPriceEntities = discounts.map(({ discountId, price }: { discountId: number, price: number }) =>
          discountPriceRepository.create({ contractPackage, discount: { id: discountId }, price })
        );
        await discountPriceRepository.save(discountPriceEntities);
      }

      res.status(200).json({ message: 'Contract Package updated successfully' });
    } catch (error) {
      console.error('Error updating contract package:', error);
      res.status(500).json({ message: 'Error updating contract package' });
    }
  }

  
  static async deleteContractPackages(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body; 
  
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Please provide an array of contract package IDs' });
    }
  
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const contractPackageRepository = queryRunner.manager.getRepository(ContractPackage);
  
      
      await contractPackageRepository
        .createQueryBuilder()
        .softDelete()
        .where('id IN (:...ids)', { ids })
        .execute();
  
      await queryRunner.commitTransaction();
      res.status(200).json({ message: 'Contract Packages deleted successfully' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting contract packages:', error);
      res.status(500).json({ message: 'Error deleting contract packages' });
    } finally {
      await queryRunner.release();
    }
  }
  
}

