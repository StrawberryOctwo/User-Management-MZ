import { Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ClosingDay } from "../entities/closingDay.entity";
import { In } from "typeorm";

export class ClosingDayController {
  static async createClosingDay(req: AuthenticatedRequest, res: Response) {
    const { name, start_date, end_date, locationId } = req.body;

    if (!name || !start_date || !end_date || !locationId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const closingDayRepository = AppDataSource.getRepository(ClosingDay);

      const newClosingDay = closingDayRepository.create({
        name,
        start_date,
        end_date,
        location: locationId,
      });

      await closingDayRepository.save(newClosingDay);

      return res.status(201).json({
        message: "Closing day created successfully",
        closingDay: newClosingDay,
      });
    } catch (error) {
      console.error("Error creating closing day:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getClosingDaysByLocationIds(
    req: AuthenticatedRequest,
    res: Response
  ) {
    // Handle both array format and object format for locationIds
    const locationIds = Array.isArray(req.body)
      ? req.body
      : req.body.locationIds;

    try {
      const closingDayRepository = AppDataSource.getRepository(ClosingDay);

      // Get page, limit, and search from query parameters, with default values
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.body.search ? req.body.search.toString() : null;

      // Calculate the offset
      const offset = (page - 1) * limit;

      // Create query builder
      let queryBuilder = closingDayRepository
        .createQueryBuilder("closingDay")
        .leftJoinAndSelect("closingDay.location", "location")
        .leftJoinAndSelect("location.franchise", "franchise")
        .select([
          "franchise.id",
          "closingDay.id",
          "closingDay.name",
          "closingDay.start_date",
          "closingDay.end_date",
          "location.id",
          "location.name",
        ])
        .orderBy("closingDay.start_date", "ASC")
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

        queryBuilder.andWhere("closingDay.locationId IN (:...locationIds)", {
          locationIds: parsedLocationIds,
        });
      }

      // Add search filter if provided
      if (search) {
        queryBuilder.andWhere("closingDay.name ILIKE :search", {
          search: `%${search}%`,
        });
      }

      // Fetch closing days with pagination
      const [closingDays, total] = await queryBuilder.getManyAndCount();

      // Map the results to include locationId and remove location object
      const formattedClosingDays = closingDays.map((closingDay) => ({
        id: closingDay.id,
        name: closingDay.name,
        start_date: closingDay.start_date,
        end_date: closingDay.end_date,
        locationId: closingDay.location.name,
      }));

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Send response in the desired format
      return res.status(200).json({
        data: formattedClosingDays,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching closing days:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


  static async updateClosingDay(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { name, start_date, end_date, locationId } = req.body;

    try {
      const closingDayRepository = AppDataSource.getRepository(ClosingDay);
      const closingDay = await closingDayRepository.findOne({
        where: { id: Number(id) },
      });

      if (!closingDay) {
        return res.status(404).json({ message: "Closing day not found" });
      }

      closingDay.name = name ?? closingDay.name;
      closingDay.start_date = start_date ?? closingDay.start_date;
      closingDay.end_date = end_date ?? closingDay.end_date;
      closingDay.location = locationId ?? closingDay.location;

      await closingDayRepository.save(closingDay);

      return res
        .status(200)
        .json({ message: "Closing day updated successfully", closingDay });
    } catch (error) {
      console.error("Error updating closing day:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteClosingDay(req: AuthenticatedRequest, res: Response) {
    const { id } = req.body;

    try {
      const closingDayRepository = AppDataSource.getRepository(ClosingDay);
      const closingDay = await closingDayRepository.findOne({
        where: { id: Number(id) },
      });

      if (!closingDay) {
        return res.status(404).json({ message: "Closing day not found" });
      }

      await closingDayRepository.softRemove(closingDay);

      return res
        .status(200)
        .json({ message: "Closing day deleted successfully" });
    } catch (error) {
      console.error("Error deleting closing day:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getClosingDayById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
  
    try {
      const closingDayRepository = AppDataSource.getRepository(ClosingDay);
      const closingDay = await closingDayRepository.findOne({
        where: { id: Number(id) },
        relations: ["location"], // Include the location relation if needed
      });
  
      if (!closingDay) {
        return res.status(404).json({ message: "Closing day not found" });
      }
  
      return res.status(200).json({
        id: closingDay.id,
        name: closingDay.name,
        start_date: closingDay.start_date,
        end_date: closingDay.end_date,
        location: {
          id: closingDay.location.id,
          name: closingDay.location.name,
        },
      });
    } catch (error) {
      console.error("Error fetching closing day by ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  
}
