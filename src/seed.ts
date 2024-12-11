import { AppDataSource } from './config/data-source';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Franchise } from './entities/franchise.entity';
import {
  seedRoles,
  seedSuperAdmin,
  seedFranchises,
  seedFranchiseAdmins,
  seedSessionTypes,
  seedDiscounts,
  seedSchoolTypes
} from './utils/seedUtils';
import path from 'path';
import { SessionType } from './entities/sessionType.entity';
import { Discount } from './entities/discount.entity';
import { SchoolType } from './entities/schoolType.entity';

export const seedDatabase = async () => {
  try {
    
    if (!AppDataSource.isInitialized) {
      throw new Error('Data source is not initialized.');
    }

    console.log('Dropping existing tables...');
    await AppDataSource.synchronize();  
    console.log('Tables dropped and recreated.');

    const queryRunner = AppDataSource.createQueryRunner();

    console.log('Clearing existing data with TRUNCATE CASCADE...');
    await queryRunner.query('TRUNCATE TABLE "users_roles_roles" CASCADE');
    await queryRunner.query('TRUNCATE TABLE "roles" CASCADE');
    await queryRunner.query('TRUNCATE TABLE "users" CASCADE');
    await queryRunner.query('TRUNCATE TABLE "franchises" CASCADE');
    console.log('Data cleared.');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);
    const franchiseRepository = AppDataSource.getRepository(Franchise);
    const sessionTypeRepository=AppDataSource.getRepository(SessionType);
    const discountRepository=AppDataSource.getRepository(Discount);
    console.log('Seeding roles...');
    const roles = await seedRoles(roleRepository, ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Student','Parent']);
    console.log('Roles seeded.');

    console.log('Seeding session types...');
    const sessionTypes = await seedSessionTypes(sessionTypeRepository);
    console.log('Session types seeded.');

    const schoolTypeRepository = AppDataSource.getRepository(SchoolType);
    await seedSchoolTypes(schoolTypeRepository);
    
    console.log('Seeding discounts...');
    const discounts = await seedDiscounts(discountRepository);
    console.log('Discounts seeded.');
    console.log('Seeding SuperAdmin user...');
    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@example.com',
      password: 'aliali12',
      dob: new Date('1980-01-01'),
      address: '123 Admin Street',
      postalCode: '12345',
      phoneNumber: '123-456-7890',
    };
    await seedSuperAdmin(userRepository, roles, superAdminData);
    console.log('SuperAdmin user seeded.');

    console.log('Seeding franchises...');
    const franchiseFilePath = path.join(__dirname, '../data/franchises.json');
    await seedFranchises(franchiseRepository, franchiseFilePath);
    console.log('Franchises seeded.');

    console.log('Seeding franchise admins...');
    const franchiseAdminFilePath = path.join(__dirname, '../data/franchiseAdmins.json');
    await seedFranchiseAdmins(userRepository, franchiseRepository, roles, franchiseAdminFilePath);
    console.log('Franchise admins seeded.');

  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

