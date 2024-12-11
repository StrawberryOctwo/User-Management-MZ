import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Holiday } from "../entities/holidays.entity";
import { In } from "typeorm";

export class HolidayController {
  static async createHoliday(req: AuthenticatedRequest, res: Response) {
    const { name, start_date, end_date, locationId } = req.body;

    if (!name || !start_date || !end_date || !locationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const holidayRepository = AppDataSource.getRepository(Holiday);

      const newHoliday = holidayRepository.create({
        name,
        start_date,
        end_date,
        location: locationId,
      });

      await holidayRepository.save(newHoliday);

      return res
        .status(201)
        .json({ message: "Holiday created successfully", holiday: newHoliday });
    } catch (error) {
      console.error("Error creating holiday:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getHolidaysByLocationIds(
    req: AuthenticatedRequest,
    res: Response
  ) {
    // Handle both array format and object format for locationIds
    const locationIds = Array.isArray(req.body)
      ? req.body
      : req.body.locationIds;

    try {
      const holidayRepository = AppDataSource.getRepository(Holiday);

      // Get page, limit, and search from query parameters, with default values
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.body.search ? req.body.search.toString() : null;

      // Calculate the offset
      const offset = (page - 1) * limit;

      // Create query builder
      let queryBuilder = holidayRepository
        .createQueryBuilder("holiday")
        .leftJoinAndSelect("holiday.location", "location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .select([
          "franchise.id",
          "holiday.id",
          "holiday.name",
          "holiday.start_date",
          "holiday.end_date",
          "location.id",
          "location.name",
        ])
        .orderBy("holiday.start_date", "ASC")
        .skip(offset)
        .take(limit);
        if (req.queryFilters) {
          queryBuilder = req.queryFilters(queryBuilder);
        }
      // Add filter for location IDs if provided
      if (locationIds && Array.isArray(locationIds) && locationIds.length > 0) {
        // Convert ids to numbers and validate
        const parsedLocationIds = locationIds.map((id) => {
          const numId = parseInt(String(id).trim());
          if (isNaN(numId)) {
            throw new Error(`Invalid location ID: ${id}`);
          }
          return numId;
        });

        queryBuilder.andWhere("holiday.locationId IN (:...locationIds)", {
          locationIds: parsedLocationIds,
        });
      }

      // Add search filter if provided
      if (search) {
        queryBuilder.andWhere("holiday.name ILIKE :search", {
          search: `%${search}%`,
        });
      }

      // Fetch holidays with pagination
      const [holidays, total] = await queryBuilder.getManyAndCount();

      // Map the results to include locationId and remove location object
      const formattedHolidays = holidays.map((holiday) => ({
        id: holiday.id,
        name: holiday.name,
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        locationId: holiday.location.name,
      }));

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Send response in the desired format
      return res.status(200).json({
        data: formattedHolidays,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching holidays:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


  static async updateHoliday(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, start_date, end_date, locationId } = req.body;

    try {
      const holidayRepository = AppDataSource.getRepository(Holiday);
      const holiday = await holidayRepository.findOne({
        where: { id: Number(id) },
      });

      if (!holiday) {
        return res.status(404).json({ message: "Holiday not found" });
      }

      holiday.name = name ?? holiday.name;
      holiday.start_date = start_date ?? holiday.start_date;
      holiday.end_date = end_date ?? holiday.end_date;
      holiday.location = locationId ?? holiday.location;

      await holidayRepository.save(holiday);

      return res
        .status(200)
        .json({ message: "Holiday updated successfully", holiday });
    } catch (error) {
      console.error("Error updating holiday:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteHoliday(req: AuthenticatedRequest, res: Response) {
    const { id } = req.body;

    try {
      const holidayRepository = AppDataSource.getRepository(Holiday);
      const holiday = await holidayRepository.findOne({
        where: { id: Number(id) },
      });

      if (!holiday) {
        return res.status(404).json({ message: "Holiday not found" });
      }

      await holidayRepository.softRemove(holiday);

      return res.status(200).json({ message: "Holiday deleted successfully" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getHolidayById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
  
    try {
      const holidayRepository = AppDataSource.getRepository(Holiday);
      const holiday = await holidayRepository.findOne({
        where: { id: Number(id) },
        relations: ["location"], // Include the location relation if needed
      });
  
      if (!holiday) {
        return res.status(404).json({ message: "Holiday not found" });
      }
  
      return res.status(200).json({
        id: holiday.id,
        name: holiday.name,
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        location: {
          id: holiday.location.id,
          name: holiday.location.name,
        },
      });
    } catch (error) {
      console.error("Error fetching holiday by ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  
}
