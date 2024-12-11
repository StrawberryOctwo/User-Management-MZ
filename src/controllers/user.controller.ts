import { Request, Response } from "express";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";
import { Teacher } from "../entities/teacher.entity";
import { Student } from "../entities/student.entity";
import { Parent } from "../entities/parent.entity";
import { fullUser } from "../types/express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const transformedUser: fullUser = {
      id: user.id,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob,
      email: user.email,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      phoneNumber: user.phoneNumber,
      role: user.roles.length > 0 ? user.roles[0].name : null,
    };

    
    if (transformedUser.role === "Teacher") {
      const teacher = await AppDataSource.getRepository(Teacher).findOne({
        where: { user: { id: user.id } },
      });
      if (teacher) {
        transformedUser["teacherDetails"] = {
          employeeNumber: teacher.employeeNumber,
          idNumber: teacher.idNumber,
          taxNumber: teacher.taxNumber,
          hourlyRate: teacher.hourlyRate,
          bank: teacher.bank,
          iban: teacher.iban,
          bic: teacher.bic,
          invoiceDay: teacher.invoiceDay,
          contractStartDate: teacher.contractStartDate,
          contractEndDate: teacher.contractEndDate,
        };
      }
    } else if (transformedUser.role === "Student") {
      
      
      
      
      
      
      
      
      
      
    } else if (transformedUser.role === "Parent") {
      const parent = await AppDataSource.getRepository(Parent).findOne({
        where: { user: { id: user.id } },
      });
      if (parent) {
        transformedUser["parentDetails"] = {
          accountHolder: parent.accountHolder,
          iban: parent.iban,
          bic: parent.bic,
          invoiceDay:parent.invoiceDay
        };
      }
    }

    res.json({
      message: "Profile fetched successfully",
      data: transformedUser,
    });
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      dob,
      email,
      address,
      city,
      postalCode,
      phoneNumber,
      teacherDetails,
      studentDetails,
      parentDetails,
    } = req.body;

    try {
      const userRepository = AppDataSource.getRepository(User);

      
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.dob = dob || user.dob;
      user.email = email || user.email;
      user.address = address || user.address;
      user.city = city || user.city;
      user.postalCode = postalCode || user.postalCode;
      user.phoneNumber = phoneNumber || user.phoneNumber;

      await userRepository.save(user);

      
      if (user.roles.length > 0) {
        const role = user.roles[0].name;

        if (role === "Teacher" && teacherDetails) {
          const teacherRepository = AppDataSource.getRepository(Teacher);
          let teacher = await teacherRepository.findOne({
            where: { user: { id: user.id } },
          });
          if (teacher) {
            teacher.employeeNumber =
              teacherDetails.employeeNumber || teacher.employeeNumber;
            teacher.idNumber = teacherDetails.idNumber || teacher.idNumber;
            teacher.taxNumber = teacherDetails.taxNumber || teacher.taxNumber;
            teacher.hourlyRate =
              teacherDetails.hourlyRate || teacher.hourlyRate;
            teacher.bank = teacherDetails.bank || teacher.bank;
            teacher.iban = teacherDetails.iban || teacher.iban;
            teacher.bic = teacherDetails.bic || teacher.bic;
            teacher.invoiceDay = teacherDetails.invoiceDay || teacher.invoiceDay;
            teacher.contractStartDate =
              teacherDetails.contractStartDate || teacher.contractStartDate;
            teacher.contractEndDate =
              teacherDetails.contractEndDate || teacher.contractEndDate;
            await teacherRepository.save(teacher);
          }
        } else if (role === "Student" && studentDetails) {
          const studentRepository = AppDataSource.getRepository(Student);
          let student = await studentRepository.findOne({
            where: { user: { id: user.id } },
          });
          if (student) {
            student.status = studentDetails.status || student.status;
            student.gradeLevel =
              studentDetails.gradeLevel || student.gradeLevel;
            student.sessionBalance =
              studentDetails.sessionBalance || student.sessionBalance;
            await studentRepository.save(student);
          }
        } else if (role === "Parent" && parentDetails) {
          const parentRepository = AppDataSource.getRepository(Parent);
          let parent = await parentRepository.findOne({
            where: { user: { id: user.id } },
          });
          if (parent) {
            parent.accountHolder =
              parentDetails.accountHolder || parent.accountHolder;
            parent.iban = parentDetails.iban || parent.iban;
            parent.invoiceDay = parentDetails.invoiceDay || parent.invoiceDay;

            parent.bic = parentDetails.bic || parent.bic;
            await parentRepository.save(parent);
          }
        }
      }

      res.json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  }
}

