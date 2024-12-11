import { Request, Response } from "express";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import { Location } from "../entities/location.entity";
import { AppDataSource } from "../config/data-source";
import bcrypt from "bcryptjs";
import { UserDto } from "../dto/userDto";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { FranchiseDto } from "../dto/franchiseDto";

import { Brackets, ILike, In, Like, QueryFailedError } from "typeorm";
import { saveOrUpdateLocationAdmin } from "./helperFunctions/locationAdminsHelper";

export class LocationAdminController {
  static async createLocationAdmin(req: AuthenticatedRequest, res: Response) {
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      address,
      postalCode,
      phoneNumber,
      locationIds,
      city,
    } = req.body;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const roleRepository = AppDataSource.getRepository(Role);
      const locationRepository = AppDataSource.getRepository(Location);

      const result = await saveOrUpdateLocationAdmin(
        userRepository,
        roleRepository,
        locationRepository,
        {
          firstName,
          lastName,
          email,
          password,
          dob,
          address,
          postalCode,
          phoneNumber,
          city,
        },
        locationIds
      );

      if (result.error) {
        return res
          .status(result.error.status)
          .json({ message: result.error.message });
      }

      return res
        .status(201)
        .json({ message: "Location Admin created successfully" });
    } catch (error) {
      console.error("Error creating LocationAdmin:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateLocationAdmin(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      address,
      postalCode,
      phoneNumber,
      locationIds,
      city,
    } = req.body;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const locationRepository = AppDataSource.getRepository(Location);

      const locationAdmin = await userRepository.findOne({
        where: { id: parseInt(id), roles: { name: "LocationAdmin" } },
        relations: ["roles"],
      });
      if (!locationAdmin) {
        return res.status(404).json({ message: "LocationAdmin not found" });
      }

      locationAdmin.firstName = firstName || locationAdmin.firstName;
      locationAdmin.lastName = lastName || locationAdmin.lastName;
      locationAdmin.email = email || locationAdmin.email;
      locationAdmin.dob = dob || locationAdmin.dob;
      locationAdmin.address = address || locationAdmin.address;
      locationAdmin.postalCode = postalCode || locationAdmin.postalCode;
      locationAdmin.phoneNumber = phoneNumber || locationAdmin.phoneNumber;
      locationAdmin.city = city || locationAdmin.city;

      if (password) {
        locationAdmin.password = await bcrypt.hash(password, 10);
      }

      if (locationIds && locationIds.length > 0) {
        const locations = await locationRepository.findByIds(locationIds);

        if (locations.length === 0) {
          return res
            .status(400)
            .json({
              message:
                "No valid locations found for the provided franchise IDs",
            });
        }

        locationAdmin.locations = locations;
      }

      await userRepository.save(locationAdmin);

      return res
        .status(200)
        .json({ message: "Location Admin updated successfully" });
    } catch (error) {
      console.error("Error updating LocationAdmin:", error);
      res.status(500).json({ message: "Error updating LocationAdmin", error });
    }
  }

  static async getAllLocationAdmins(req: AuthenticatedRequest, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    try {
      const userRepository = AppDataSource.getRepository(User);
      const roleRepository = AppDataSource.getRepository(Role);

      const locationAdminRole = await roleRepository.findOne({
        where: { name: "LocationAdmin" },
      });
      if (!locationAdminRole) {
        return res
          .status(400)
          .json({ message: "LocationAdmin role not found" });
      }

      let whereConditions: any = { roles: { id: locationAdminRole.id } };

      if (search) {
        whereConditions = [
          {
            roles: { id: locationAdminRole.id },
            firstName: ILike(`%${search}%`),
          },
          {
            roles: { id: locationAdminRole.id },
            lastName: ILike(`%${search}%`),
          },
          { roles: { id: locationAdminRole.id }, email: ILike(`%${search}%`) },
          {
            roles: { id: locationAdminRole.id },
            locations: { name: ILike(`%${search}%`) },
          },
        ];
      }

      if (req.user?.roles.some((role) => role.name === "SuperAdmin")) {
        whereConditions = {
          ...whereConditions,
        };
      } else if (req.user?.franchises && req.user.franchises.length > 0) {
        const franchiseIds = req.user.franchises.map(
          (franchise) => franchise.id
        );

        const locations = await AppDataSource.getRepository(Location)
          .createQueryBuilder("location")
          .where("location.franchiseId IN (:...franchiseIds)", { franchiseIds })
          .getMany();

        const locationIds = locations.map((location) => location.id);

        if (locationIds.length > 0) {
          whereConditions = {
            ...whereConditions,
            locations: { id: In(locationIds) },
          };
        } else {
          return res
            .status(404)
            .json({ message: "No locations found for the managed franchises" });
        }
      } else {
        return res
          .status(403)
          .json({ message: "You do not have access to view location admins." });
      }

      const [locationAdmins, total] = await userRepository.findAndCount({
        where: whereConditions,
        relations: ["locations"],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        order: { createdAt: "DESC" },
      });

      const locationAdminDtos = locationAdmins.map((admin) => ({
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        dob: admin.dob,
        email: admin.email,
        address: admin.address,
        postalCode: admin.postalCode,
        phoneNumber: admin.phoneNumber,
        city: admin.city,
        locationNames: admin.locations.map((l) => l.name),
      }));

      res.status(200).json({
        data: locationAdminDtos,
        total,
        page: Number(page),
        pageCount: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      console.error("Error fetching LocationAdmins:", error);
      res.status(500).json({ message: "Error fetching LocationAdmins", error });
    }
  }

  static async getLocationsByAdminId(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      if (
        req.user?.id !== parseInt(id) &&
        !req.user?.roles.some((role) => role.name === "SuperAdmin")
      ) {
        return res
          .status(403)
          .json({
            message: "Forbidden: You do not have access to these locations",
          });
      }
      const locationRepository = AppDataSource.getRepository(Location);

      const locations = await locationRepository
        .createQueryBuilder("location")
        .innerJoin("location.admins", "admin")
        .andWhere("admin.id = :id", { id })
        .getMany();

      if (!locations.length) {
        return res
          .status(404)
          .json({ message: "No locations found for this admin" });
      }

      const locationDtos = locations.map((location) => location.name);

      res.status(200).json(locationDtos);
    } catch (error) {
      console.error("Error fetching locations by admin ID:", error);
      res
        .status(500)
        .json({ message: "Error fetching locations by admin ID", error });
    }
  }

  static async deleteLocationAdmins(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "Invalid input: Please provide an array of location admin IDs",
        });
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);

      const admins = await userRepository
        .createQueryBuilder("user")
        .where("user.id IN (:...ids)", { ids })
        .getMany();

      const existingAdminIds = admins.map((admin) => admin.id);
      const missingAdmins = ids.filter((id) => !existingAdminIds.includes(id));

      if (missingAdmins.length > 0) {
        return res.status(404).json({
          message: `Location admins with IDs ${missingAdmins.join(
            ", "
          )} not found or already deleted`,
        });
      }

      await userRepository
        .createQueryBuilder()
        .softDelete()
        .where("id IN (:...ids)", { ids: existingAdminIds })
        .execute();

      await queryRunner.commitTransaction();

      res.status(200).json({ message: "Location admins deleted successfully" });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error deleting location admins:", error);
      res.status(500).json({ message: "Error deleting location admins" });
    } finally {
      await queryRunner.release();
    }
  }

  static async getLocationAdminByUserId(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const { id } = req.params;

    try {
      const userRepository = AppDataSource.getRepository(User);

      const locationAdmin = await userRepository.findOne({
        where: { id: parseInt(id), roles: { name: "LocationAdmin" } },
        relations: ["roles", "locations"],
      });

      if (!locationAdmin) {
        return res.status(404).json({ message: "LocationAdmin not found" });
      }

      const locationAdminDto = {
        id: locationAdmin.id,
        firstName: locationAdmin.firstName,
        lastName: locationAdmin.lastName,
        dob: locationAdmin.dob,
        email: locationAdmin.email,
        address: locationAdmin.address,
        postalCode: locationAdmin.postalCode,
        phoneNumber: locationAdmin.phoneNumber,
        city: locationAdmin.city,
        locations: locationAdmin.locations,
      };

      res.status(200).json(locationAdminDto);
    } catch (error) {
      console.error("Error fetching LocationAdmin by user ID:", error);
      res
        .status(500)
        .json({ message: "Error fetching LocationAdmin by user ID", error });
    }
  }
}
