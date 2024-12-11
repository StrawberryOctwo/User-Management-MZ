import { Repository } from 'typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import bcrypt from 'bcryptjs';
import { SchoolType } from '../entities/schoolType.entity';

export const loadJsonFile = async (filePath: string) => {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

export const seedRoles = async (roleRepository: Repository<any>, roles: string[]) => {
  const roleEntities = roles.map(name => roleRepository.create({ name }));
  await roleRepository.save(roleEntities);
  return roleEntities;
};

export const seedSuperAdmin = async (
  userRepository: Repository<any>,
  roles: any[],
  superAdminData: any
) => {
  const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
  const superAdminUser = userRepository.create({
    ...superAdminData,
    password: hashedPassword,
    roles: [roles.find(role => role.name === 'SuperAdmin')],
  });
  await userRepository.save(superAdminUser);
  return superAdminUser;
};

export const seedFranchises = async (franchiseRepository: Repository<any>, franchiseFilePath: string) => {
  const franchiseData = await loadJsonFile(franchiseFilePath);
  const franchises = franchiseRepository.create(franchiseData);
  await franchiseRepository.save(franchises);
  return franchises;
};
export const seedSchoolTypes = async (schoolTypeRepository: Repository<SchoolType>) => {
  const schoolTypes = [
    { name: 'Private' },
    { name: 'Public' },
    { name: 'Government' },
  ];

  for (const schoolTypeData of schoolTypes) {
    const existingType = await schoolTypeRepository.findOne({ where: { name: schoolTypeData.name } });
    
    
    if (!existingType) {
      const schoolType = schoolTypeRepository.create(schoolTypeData);
      await schoolTypeRepository.save(schoolType);
    }
  }

  console.log('School types seeded successfully');
};
export const seedSessionTypes = async (sessionTypeRepository: Repository<any>) => {
  const sessionTypes = [
    { name: 'Group' },
    { name: 'Online' },
    { name: 'Individual' },
    { name: 'Intensive Individual' },
  ];

  console.log('Seeding session types...');
  const sessionTypeEntities = sessionTypes.map(sessionType => sessionTypeRepository.create(sessionType));
  await sessionTypeRepository.save(sessionTypeEntities);
  console.log('Session types seeded.');
  return sessionTypeEntities;
};

export const seedDiscounts = async (discountRepository: Repository<any>) => {
  const discounts = [
    { name: 'Promotional'},
    { name: 'Siblings' },
    { name: 'Holiday' },
  ];

  console.log('Seeding discounts...');
  const discountEntities = discounts.map(discount => discountRepository.create(discount));
  await discountRepository.save(discountEntities);
  console.log('Discounts seeded.');
  return discountEntities;
};

export const seedFranchiseAdmins = async (
  userRepository: Repository<any>,
  franchiseRepository: Repository<any>,
  roles: any[],
  franchiseAdminFilePath: string
) => {
  const franchiseAdminData = await loadJsonFile(franchiseAdminFilePath);
  const franchiseAdmins = [];

  for (const admin of franchiseAdminData) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const franchise = await franchiseRepository.findOneBy({ id: admin.franchiseId });

    const franchiseAdmin = userRepository.create({
      ...admin,
      password: hashedPassword,
      roles: [roles.find(role => role.name === 'FranchiseAdmin')],
    });

    if (franchise) {
      franchise.admins = [...(franchise.admins || []), franchiseAdmin];
      await franchiseRepository.save(franchise);
    }

    franchiseAdmins.push(franchiseAdmin);
    await userRepository.save(franchiseAdmin);
  }

  return franchiseAdmins;
};

