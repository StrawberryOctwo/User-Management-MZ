import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Franchise } from '../entities/franchise.entity';
import { ContractPackageController } from '../controllers/contractPackage.controller';
import { Location } from '../entities/location.entity';

const router = Router();


router.post(
  '/contract-packages',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.addContractPackage
);

router.post(
  '/assign/student/contract',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    ]
  ),
  ContractPackageController.assignContractToStudent
);


router.get(
  '/contract-packages',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.getAllContractPackages
);

router.get(
  '/contract-package/:id',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.getContractPackageById
);

router.get(
  '/contract-packages/franchises',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    ]
  ),
  ContractPackageController.getFranchiseContractNames
);


router.get(
  '/contract-packages/franchise/:franchiseId',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.getContractPackagesByFranchise
);


router.put(
  '/contract-packages/:id',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.editContractPackage
);


router.delete(
  '/contract-packages',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]
  ),
  ContractPackageController.deleteContractPackages
);

export default router;

