import { User } from "../entities/user.entity";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}
interface SessionInstanceDTO {
  id: string;
  sessionId: string;
  sessionType: string;
  topic: string;
  name: string;
  status: boolean;
  date: Date;
  startTime: string;
  endTime: string;
  teacherName: string;
  location: string;
  students: Array<{
    id: string;
    firstName: string;
    gradeLevel: string;
    absenceStatus: boolean;
  }>;
  reportStatus: {
    allReportsCompleted: boolean;
    totalStudents: number;
    completedReports: number;
    absences: number;
  };
}

export type DayDetails = Record<
  string,
  { startTime: string; duration: number }
>;

export interface fullUser {
  id: number;
  createdAt: Date;
  firstName: string;
  lastName: string;
  dob: Date;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  role: string | null;
  teacherDetails?: {
    employeeNumber: string;
    idNumber: string;
    taxNumber: string;
    hourlyRate: number;
    bank: string;
    iban: string;
    bic: string;
    contractStartDate: Date;
    contractEndDate: Date;
    invoiceDay?: number; 
  };
  studentDetails?: {
    status: string;
    gradeLevel: string;
    sessionBalance: number;
  };
  parentDetails?: {
    accountHolder: string;
    iban: string;
    bic: string;
    invoiceDay?: number; 
  };
}

export interface INotification {
  id: number;
  createdAt: Date;
  title: string;
  message: string;
  isRead: boolean;
  eventType?: string;
  users: { id: number }[];
}
