import { Teacher } from "../../entities/teacher.entity";
import { isDate, parseISO } from 'date-fns';
import { User } from "../../entities/user.entity";
import { Role } from "../../entities/role.entity";
import bcrypt from 'bcryptjs';
import { QueryFailedError, QueryRunner } from "typeorm";
import { Availability } from "../../entities/availability.entity";

export async function saveOrUpdateTeacher(
  queryRunner: any,
  userData: any,
  teacherData: any,
  isUpdate: boolean = false,
  existingUser: User | null = null
): Promise<{ user: User, teacher: Teacher }> {
  const userRepository = queryRunner.manager.getRepository(User);
  const teacherRepository = queryRunner.manager.getRepository(Teacher);
  const roleRepository = queryRunner.manager.getRepository(Role);
  const teacherRole = await roleRepository.findOne({ where: { name: 'Teacher' } });
  if (!teacherRole) {
    throw new Error('Teacher role not found');
  }

  let user: User;
  if (isUpdate && existingUser) {
    user = existingUser;
    
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.city = userData.city;
    user.dob = parseISO(userData.dob);
    user.email = userData.email;
    user.address = userData.address;
    user.postalCode = userData.postalCode;
    user.phoneNumber = userData.phoneNumber;

    if (userData.password && userData.password.trim() !== '') {
      user.password = await bcrypt.hash(userData.password, 10);
    }
  } else {
    
    user = new User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.city = userData.city;
    user.dob = parseISO(userData.dob);
    user.email = userData.email;
    user.address = userData.address;
    user.postalCode = userData.postalCode;
    user.phoneNumber = userData.phoneNumber;
    user.password = await bcrypt.hash(userData.password, 10);
    user.roles = [teacherRole];
  }

  await userRepository.save(user);

  let teacher: Teacher;
  if (isUpdate) {
    
    teacher = await teacherRepository.findOne({ where: { user: { id: user.id } } });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    teacher.status = teacherData.status;
    teacher.employeeNumber = teacherData.employeeNumber;
    teacher.idNumber = teacherData.idNumber;
    teacher.taxNumber = teacherData.taxNumber;
    teacher.contractStartDate = parseISO(teacherData.contractStartDate);
    teacher.contractEndDate = parseISO(teacherData.contractEndDate);
    teacher.hourlyRate = teacherData.hourlyRate;
    teacher.bank = teacherData.bank;
    teacher.iban = teacherData.iban;
    teacher.bic = teacherData.bic;
    teacher.rateMultiplier = teacherData.rateMultiplier
      
  } else {
    
    teacher = new Teacher();
    teacher.status = teacherData.status;
    teacher.employeeNumber = teacherData.employeeNumber;
    teacher.idNumber = teacherData.idNumber;
    teacher.taxNumber = teacherData.taxNumber;
    teacher.contractStartDate = parseISO(teacherData.contractStartDate);
    teacher.contractEndDate = parseISO(teacherData.contractEndDate);
    teacher.hourlyRate = teacherData.hourlyRate;
    teacher.rateMultiplier = teacherData.rateMultiplier,
    teacher.bank = teacherData.bank;
    teacher.iban = teacherData.iban;
    teacher.bic = teacherData.bic;
    teacher.user = user;
  }

  await teacherRepository.save(teacher);

  return { user, teacher };
}

export function handleQueryFailedError(error: QueryFailedError): string {
  console.error('QueryFailedError:', error);

  
  const driverError = error.driverError as { code?: string; detail?: string };

  if (driverError) {
    
    if (driverError.code === '23505') { 
      const detail = driverError.detail || '';

      if (detail.includes('email')) {
        return 'Email already exists';
      }
    }
  }

  return 'Error fetching data';
}

export const addDefaultAvailability = async (queryRunner: QueryRunner, teacher: Teacher) => {
  const availabilityRepo = queryRunner.manager.getRepository(Availability);

  const defaultAvailability = [
    { dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { dayOfWeek: 'Friday', startTime: '09:00', endTime: '17:00' },
  ];

  for (const slot of defaultAvailability) {
    const availability = new Availability();
    availability.dayOfWeek = slot.dayOfWeek;
    availability.startTime = slot.startTime;
    availability.endTime = slot.endTime;
    availability.teacher = teacher;

    await availabilityRepo.save(availability);
  }
};
