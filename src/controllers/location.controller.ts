import { Request, Response } from "express";
import { Location } from "../entities/location.entity";
import { AppDataSource } from "../config/data-source";
import { Franchise } from "../entities/franchise.entity";
import { User } from "../entities/user.entity";
import { Teacher } from "../entities/teacher.entity";
import { Brackets, In, Like } from "typeorm";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { LocationWeeklyAvailability } from "../entities/LocationWeeklyAvailability.entity";
import { getAvailabilityForWeek } from "../utils/availabilityUtils";

export class LocationController {
  static async addLocation(req: AuthenticatedRequest, res: Response) {
    const { name, address, city, postalCode, franchiseId, numberOfRooms } =
      req.body;

    try {
      const locationRepository = AppDataSource.getRepository(Location);
      const franchiseRepository = AppDataSource.getRepository(Franchise);
      const weeklyAvailabilityRepository = AppDataSource.getRepository(
        LocationWeeklyAvailability
      );

      const franchise = await franchiseRepository.findOne({
        where: { id: franchiseId },
      });
      if (!franchise) {
        return res.status(400).json({ message: "Invalid franchise ID" });
      }

      const location = locationRepository.create({
        name,
        address,
        city,
        postalCode,
        franchise,
        numberOfRooms: numberOfRooms ?? 0,
      });

      await locationRepository.save(location);

      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];
      const startTime = "12:00";
      const endTime = "19:00";
      const capacityPerSlot = numberOfRooms ?? 5;

      for (const day of daysOfWeek) {
        const availability = weeklyAvailabilityRepository.create({
          location,
          dayOfWeek: day,
          startTime,
          endTime,
          capacityPerSlot,
        });

        await weeklyAvailabilityRepository.save(availability);
      }

      res.status(201).json({
        message: "Location and weekly availability added successfully",
      });
    } catch (error) {
      console.error("Error adding location:", error);
      res.status(500).json({ message: "Error adding location" });
    }
  }

  static async getLocationAvailability(req: AuthenticatedRequest, res: Response) {
    const { id: locationId } = req.params;
    const { weekStartDate } = req.query;

    if (!weekStartDate) {
      return res
        .status(400)
        .json({ message: "weekStartDate query parameter is required" });
    }

    try {
      const availability = await getAvailabilityForWeek(
        Number(locationId),
        String(weekStartDate)
      );
      res.status(200).json({ availability });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res
        .status(500)
        .json({ message: "Error fetching availability", error: error });
    }
  }


  static async getLocations(req: AuthenticatedRequest, res: Response) {
    let { page = "1", limit = "10", search } = req.query;
  
    // Parse and validate page and limit
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);
  
    // Logging parsed values for debugging
    console.log(`Parsed Page: ${parsedPage}, Parsed Limit: ${parsedLimit}`);
  
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ message: "Invalid page number" });
    }
  
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ message: "Invalid limit value" });
    }
  
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const userId = req.user.id;
    const userRoles = req.user.roles;
  
    try {
      const locationRepository = AppDataSource.getRepository(Location);
  
      // Initialize the base query builder with necessary joins
      let baseQuery = locationRepository
        .createQueryBuilder("location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .leftJoin("location.admins", "admins")
        // Use loadRelationCountAndMap to get counts without affecting pagination
        .loadRelationCountAndMap("location.totalTeachers", "location.teachers")
        .loadRelationCountAndMap("location.totalStudents", "location.students");
  
        if (req.queryFilters) {
          baseQuery = req.queryFilters(baseQuery);
        }
      // Apply search filters if provided
      if (search) {
        baseQuery.andWhere(
          new Brackets((qb) => {
            qb.where("location.name ILIKE :search", { search: `%${search}%` })
              .orWhere("location.address ILIKE :search", { search: `%${search}%` })
              .orWhere("franchise.name ILIKE :search", { search: `%${search}%` });
          })
        );
      }
  
      // If the user has the LocationAdmin role, filter locations by the locations they are admin of
      const isLocationAdmin = userRoles.some(
        (role) => role.name === "LocationAdmin"
      );
      if (isLocationAdmin) {
        baseQuery.andWhere("admins.id = :userId", { userId });
      }
  
      // Clone the base query for counting total records without pagination
      const countQuery = baseQuery.clone().select("COUNT(DISTINCT location.id)", "count");
      const countResult = await countQuery.getRawOne();
      const total = parseInt(countResult.count, 10);
  
      // Calculate total pages
      const pageCount = Math.ceil(total / parsedLimit);
  
      // Logging total and pageCount for debugging
      console.log(`Total Records: ${total}, Page Count: ${pageCount}`);
  
      // If the requested page exceeds the total pages, return empty data
      if (parsedPage > pageCount && total !== 0) {
        return res.status(200).json({
          data: [],
          total,
          page: parsedPage,
          pageCount,
        });
      }
  
      // Data Query: Fetch paginated data with relation counts
      const locations = await baseQuery
        .orderBy("location.createdAt", "DESC")
        .skip((parsedPage - 1) * parsedLimit)
        .take(parsedLimit)
        .getMany();
  
      // Logging the fetched locations for debugging
      console.log(`Fetched Locations: ${JSON.stringify(locations, null, 2)}`);
  
      // Format the response data
      const formattedLocations = locations.map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        postalCode: location.postalCode,
        numberOfRooms: location.numberOfRooms,
        franchiseName: location.franchise?.name || null,
        totalTeachers: location.totalTeachers || 0,
        totalStudents: location.totalStudents || 0,
      }));
  
      return res.status(200).json({
        data: formattedLocations,
        total,
        page: parsedPage,
        pageCount,
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      return res.status(500).json({ message: "Server error: " + error });
    }
  }


  static async getLocationsByFranchise(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { franchiseId } = req.params;

    try {
      const locationRepository = AppDataSource.getRepository(Location);

      const locations = await locationRepository
        .createQueryBuilder("location")
        .select(["location.id", "location.name", "location.numberOfRooms"])
        .where("location.franchiseId = :franchiseId", {
          franchiseId: Number(franchiseId),
        })
        .getMany();

      if (!locations.length) {
        return res
          .status(404)
          .json({ message: "No locations found for this franchise" });
      }

      res.status(200).json(
        locations.map((location) => ({
          id: location.id,
          name: location.name,
          numberOfRooms: location.numberOfRooms,
        }))
      );
    } catch (error) {
      console.error("Error fetching locations by franchise:", error);
      res
        .status(500)
        .json({ message: "Error fetching locations by franchise" });
    }
  }

  static async getLocationById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const locationRepository = AppDataSource.getRepository(Location);

      let location = await locationRepository
        .createQueryBuilder("location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .leftJoinAndSelect("location.admins", "admins")
        .leftJoinAndSelect("location.teachers", "teachers")
        .leftJoinAndSelect("teachers.user", "teacherUser")
        .leftJoinAndSelect("location.students", "students")
        .leftJoinAndSelect("students.user", "studentUser")

        .where({ id: Number(id) })
        .getOne();

      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      const isAdmin = location.admins.some((admin) => admin.id === userId);

      const locationData = {
        id: location.id,
        name: location.name,
        address: location.address,
        city: location.city,
        postal_code: location.postalCode,
        numberOfRooms: location.numberOfRooms,
        createdAt: location.createdAt,
        franchise: {
          id: location.franchise?.id,
          name: location.franchise?.name,
          ownerName: location.franchise?.ownerName,
          cardHolderName: location.franchise?.cardHolderName,
          status: location.franchise?.status,
          totalEmployees: location.franchise?.totalEmployees,
        },
        admins: isAdmin
          ? location.admins
              .filter((admin) => admin.id === userId)
              .map((admin) => ({
                id: admin.id,
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
              }))
          : location.admins.map((admin) => ({
              id: admin.id,
              firstName: admin.firstName,
              lastName: admin.lastName,
              email: admin.email,
            })),
        teachers: location.teachers.map((teacher) => ({
          id: teacher.id,
          firstName: teacher.user.firstName,
          lastName: teacher.user.lastName,
          email: teacher.user.email,
          employeeNumber: teacher.employeeNumber,
          idNumber: teacher.idNumber,
          hourlyRate: teacher.hourlyRate,
          contractStartDate: teacher.contractStartDate,
          contractEndDate: teacher.contractEndDate,
        })),
        students: location.students.map((student) => ({
          id: student.id,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          status: student.status,
          gradeLevel: student.gradeLevel,
          contractType: student.contract,
          contractEndDate: student.contractEndDate,
        })),
      };

      res.status(200).json(locationData);
    } catch (error) {
      console.error("Error fetching location by ID:", error);
      res.status(500).json({ message: "Error fetching location by ID" });
    }
  }

  static async assignOrUpdateTeacherLocations(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { locationIds, teacherId } = req.body;

    try {
      const locationRepository = AppDataSource.getRepository(Location);
      const teacherRepository = AppDataSource.getRepository(Teacher);

      const teacher = await teacherRepository.findOne({
        where: { id: Number(teacherId) },
        relations: ["locations"],
      });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const newLocations = await locationRepository.findBy({
        id: In(locationIds.map((id: any) => Number(id))),
      });

      teacher.locations = teacher.locations.filter((location) =>
        locationIds.includes(location.id)
      );

      for (const location of newLocations) {
        if (!teacher.locations.some((l) => l.id === location.id)) {
          teacher.locations.push(location);
        }
      }

      await teacherRepository.save(teacher);

      res
        .status(200)
        .json({ message: "Teacher locations updated successfully" });
    } catch (error) {
      console.error("Error updating teacher locations:", error);
      res.status(500).json({ message: "Error updating teacher locations" });
    }
  }

  static async assignAdminToLocation(req: AuthenticatedRequest, res: Response) {
    const { locationId, adminId } = req.body;

    try {
      const locationRepository = AppDataSource.getRepository(Location);
      const userRepository = AppDataSource.getRepository(User);

      const location = await locationRepository.findOne({
        where: { id: Number(locationId) },
        relations: ["admins"],
      });
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      const admin = await userRepository.findOne({
        where: { id: Number(adminId) },
      });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (location.admins.some((a) => a.id === admin.id)) {
        return res
          .status(400)
          .json({ message: "Admin is already assigned to this location" });
      }

      location.admins.push(admin);
      await locationRepository.save(location);

      res
        .status(200)
        .json({ message: "Admin assigned to location successfully" });
    } catch (error) {
      console.error("Error assigning admin to location:", error);
      res.status(500).json({ message: "Error assigning admin to location" });
    }
  }

  static async editLocation(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, address, city, postal_code, franchiseId, numberOfRooms } =
      req.body;

    try {
      const locationRepository = AppDataSource.getRepository(Location);
      const franchiseRepository = AppDataSource.getRepository(Franchise);

      const location = await locationRepository.findOne({
        where: { id: Number(id) },
      });
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      if (franchiseId) {
        const franchise = await franchiseRepository.findOne({
          where: { id: franchiseId },
        });
        if (!franchise) {
          return res.status(400).json({ message: "Invalid franchise ID" });
        }
        location.franchise = franchise;
      }

      location.name = name ?? location.name;
      location.address = address ?? location.address;
      location.city = city ?? location.city;
      location.postalCode = postal_code ?? location.postalCode;
      location.numberOfRooms = numberOfRooms ?? location.numberOfRooms;

      await locationRepository.save(location);
      res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Error updating location" });
    }
  }

  static async deleteLocation(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Location ID is required" });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const locationRepository = queryRunner.manager.getRepository(Location);

      await locationRepository
        .createQueryBuilder()
        .softDelete()
        .where("id = :id", { id: Number(id) })
        .execute();

      await queryRunner.commitTransaction();

      res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error deleting location:", error);
      res.status(500).json({ message: "Error deleting location" });
    } finally {
      await queryRunner.release();
    }
  }
}
