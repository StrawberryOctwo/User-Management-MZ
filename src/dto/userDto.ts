import { Role } from '../entities/role.entity';
import { Franchise } from '../entities/franchise.entity';
import { Location } from '../entities/location.entity';
import { FileUpload } from '../entities/file-upload.entity';
import { Teacher } from '../entities/teacher.entity';
import { Student } from '../entities/student.entity';
import { Payment } from '../entities/payment.entity';

export class UserDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  dob!: Date;
  email!: string;
  city!: string;
  address!: string;
  postalCode!: string;
  phoneNumber!: string;
  roles!: Role[];
  files!: FileUpload[];
  teachers!: Teacher[];
  franchises!: Franchise[];
  locations!: Location[];
  students!: Student[];
  payments!: Payment[];

  constructor(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.dob = user.dob;
    this.email = user.email;
    this.city = user.city;
    this.address = user.address;
    this.postalCode = user.postalCode;
    this.phoneNumber = user.phoneNumber;
    this.roles = user.roles;
    this.files = user.files;
    this.teachers = user.teachers;
    this.franchises = user.franchises;
    this.locations = user.locations;
    this.students = user.students;
    this.payments = user.payments;

    delete user.password;
  }
}

