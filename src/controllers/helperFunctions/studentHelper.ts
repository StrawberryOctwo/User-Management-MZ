import { In, QueryFailedError } from "typeorm";
import { Role } from "../../entities/role.entity";
import { Student } from "../../entities/student.entity";
import { User } from "../../entities/user.entity";
import { Location } from "../../entities/location.entity";
import bcrypt from "bcryptjs";
import { SchoolType } from "../../entities/schoolType.entity";

export async function saveOrUpdateStudent(
  queryRunner: any,
  userData: any,
  studentData: any,
  locationIds: number[],
  isUpdate: boolean = false,
  existingStudent: Student | null = null
): Promise<{ user: User; student: Student }> {
  const userRepository = queryRunner.manager.getRepository(User);
  const studentRepository = queryRunner.manager.getRepository(Student);
  const locationRepository = queryRunner.manager.getRepository(Location);
  const roleRepository = queryRunner.manager.getRepository(Role);
  const schoolTypeRepository = queryRunner.manager.getRepository(SchoolType);

  const schoolType = await schoolTypeRepository.findOne({
    where: { id: studentData.schoolType },
  });
  if (!schoolType) throw new Error("Invalid school type ID");
  const studentRole = await roleRepository.findOne({
    where: { name: "Student" },
  });
  if (!studentRole) {
    throw new Error("Student role not found");
  }

  let user: User;
  if (isUpdate && existingStudent) {
    if (!existingStudent.user) {
      throw new Error("Existing student is missing associated user");
    }

    user = existingStudent.user;
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.city = userData.city;
    user.dob = new Date(userData.dob);
    user.email = userData.email;
    user.address = userData.address;
    user.postalCode = userData.postalCode;
    user.phoneNumber = userData.phoneNumber;

    if (userData.password && userData.password.trim() !== "") {
      user.password = await bcrypt.hash(userData.password, 10);
    }
  } else {
    user = new User();
    user.firstName = userData.firstName;
    user.lastName = userData.lastName;
    user.dob = new Date(userData.dob);
    user.city = userData.city;
    user.email = userData.email;
    user.address = userData.address;
    user.postalCode = userData.postalCode;
    user.phoneNumber = userData.phoneNumber;
    user.password = await bcrypt.hash(userData.password, 10);
    user.roles = [studentRole];
  }

  await userRepository.save(user);

  let locations = [];
  if (locationIds && locationIds.length > 0) {
    locations = await locationRepository.findBy({
      id: In(locationIds),

    });

    if (locations.length !== locationIds.length) {
      throw new Error("One or more provided location IDs are invalid.");
    }
  }
  console.log(schoolType);
  let student: Student;
  if (isUpdate && existingStudent) {
    student = existingStudent;
    student.status = studentData.status ?? student.status;
    student.gradeLevel = studentData.gradeLevel ?? student.gradeLevel;
    student.contractEndDate =
      new Date(studentData.contractEndDate) ?? student.contractEndDate;
    student.notes = studentData.notes ?? student.notes;
    student.availableDates =
      encodeAvailableDates(studentData.availableDates) ??
      student.availableDates;
    student.locations = locations;
    student.schoolType = schoolType;
  } else {
    student = new Student();
    student.status = studentData.status;
    student.gradeLevel = studentData.gradeLevel;
    student.contractEndDate = new Date(studentData.contractEndDate);
    student.notes = studentData.notes;
    student.availableDates = encodeAvailableDates(studentData.availableDates);
    student.user = user;
    student.locations = locations;
    student.schoolType = schoolType;
  }

  await studentRepository.save(student);

  return { user, student };
}

export function handleQueryFailedError(error: QueryFailedError): string {
  console.error("QueryFailedError:", error);

  const driverError = error.driverError as { code?: string; detail?: string };

  if (driverError) {
    if (driverError.code === "23505") {
      if (driverError.detail?.includes("email")) {
        return "A student with this email already exists.";
      }
    }
    if (driverError.code === "23503") {
      return "Invalid foreign key. Ensure the userId and locationIds are valid references.";
    }
  }

  return "Error processing request";
}

export function encodeAvailableDates(days: string[]): string {
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  return daysOfWeek.map((day) => (days.includes(day) ? "1" : "0")).join("");
}

export function decodeAvailableDates(encoded: string): string[] {
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  return encoded
    .split("")
    .map((char, index) => (char === "1" ? daysOfWeek[index] : null))
    .filter((day) => day !== null);
}

