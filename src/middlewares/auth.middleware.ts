import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/data-source";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import { Parent } from "../entities/parent.entity";

export interface AuthenticatedRequest extends Request {
  user?: User;
  entities?: Record<string, any[]>;
  queryFilters?: (query: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;
}

interface EntityConfig {
  repository: Repository<any>;
  relationName: keyof User;
}

export const authMiddleware = (
  roles: string[] = [],
  entityConfigs?: EntityConfig[]
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "Access Denied: No or malformed Authorization header",
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res
          .status(401)
          .json({ message: "Access Denied: No token provided" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: decoded.id },
        relations: entityConfigs
          ? [
              "roles",
              ...entityConfigs.map((config) => config.relationName as string),
            ]
          : ["roles"],
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Access Denied: User not found" });
      }

      req.user = user;

      await AppDataSource.query(`SET app.current_user_id = ${user.id}`);

      const isSuperadmin = user.roles.some(
        (role) => role.name === "SuperAdmin"
      );
      if (isSuperadmin) {
        return next();
      }

      if (
        roles.length &&
        !user.roles.some((role) => roles.includes(role.name))
      ) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have the required role" });
      }

      req.entities = req.entities || {};

      const nonSuperAdminRoles = roles.filter((role) => role !== "SuperAdmin");

      let hasValidEntity = false;

      await Promise.all(
        user.roles.map(async (userRole) => {
          const roleIndex = nonSuperAdminRoles.indexOf(userRole.name);

          if (roleIndex !== -1 && entityConfigs && entityConfigs[roleIndex]) {
            const config = entityConfigs[roleIndex];

            let userEntities: any;

            if (userRole.name === "Teacher") {
              const teacher = await AppDataSource.getRepository(
                Teacher
              ).findOne({
                where: { user: { id: user.id } },
                relations: ["locations"],
              });
              if (teacher && teacher.locations) {
                userEntities = teacher.locations;
              }
            } else if (userRole.name === "Student") {
              const student = await AppDataSource.getRepository(
                Student
              ).findOne({
                where: { user: { id: user.id } },
                relations: ["locations"],
              });

              if (student && student.locations) {
                userEntities = [student.locations];
              }
            } else if (userRole.name === "Parent") {
              const parent = await AppDataSource.getRepository(Parent).findOne({
                where: { user: { id: user.id } },
                relations: ["students"],
              });

              if (parent && parent.students) {
                userEntities = [parent.students];
              }
            } else {
              userEntities = user[config.relationName as keyof User];
            }

            if (Array.isArray(userEntities) && userEntities.length > 0) {
              req.entities![config.relationName as string] = userEntities;
              hasValidEntity = true;
            }
          }
        })
      );

      if (!hasValidEntity) {
        return res.status(403).json({
          message: "Forbidden: You do not have access to any valid entities.",
        });
      }

      req.queryFilters = (query: any) => {
        if (req.entities?.locations) {
          console.log(req.entities.locations);
          const locationIds = req.entities.locations.map(
            (location: any) => location.id
          );

          console.log(locationIds);

          query = query.andWhere(`location.id  IN (:...locationIds)`, {
            locationIds,
          });
        }

        if (req.entities?.franchises) {
          const franchiseIds = req.entities.franchises.map(
            (franchise: any) => franchise.id
          );
          query = query.andWhere("franchise.id IN (:...franchiseIds)", {
            franchiseIds,
          });
        }

        return query;
      };

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(400).json({ message: `Invalid Token: ${error}` });
    }
  };
};
