import { Router } from "express";
import { LocationController } from "../controllers/location.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";

const router = Router();

/**
 * @swagger
 * /location:
 *   post:
 *     summary: Add a new location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Information about the location to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewLocation'
 *     responses:
 *       201:
 *         description: Location added successfully
 *       400:
 *         description: Invalid franchise ID
 *       500:
 *         description: Error adding location
 */
router.post(
  "/location",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationController.addLocation
);

router.get(
  "/locations/:id/availability",
  LocationController.getLocationAvailability
);

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations with pagination
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword for location name
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageCount:
 *                   type: integer
 *       500:
 *         description: Error fetching locations
 */

router.get(
  "/locations",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.getLocations
);

/**
 * @swagger
 * /locations/franchise/{franchiseId}:
 *   get:
 *     summary: Get locations by franchise ID
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: franchiseId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Franchise ID
 *     responses:
 *       200:
 *         description: List of locations for the franchise
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       404:
 *         description: No locations found for this franchise
 *       500:
 *         description: Error fetching locations by franchise
 */
router.get(
  "/locations/franchise/:franchiseId",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.getLocationsByFranchise
);

/**
 * @swagger
 * /location/{id}:
 *   get:
 *     summary: Get a specific location by ID
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *       500:
 *         description: Error fetching location by ID
 */
router.get(
  "/location/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.getLocationById
);

/**
 * @swagger
 * /location/assign-teacher:
 *   post:
 *     summary: Assign a teacher to a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Information about the teacher and location to be assigned
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: integer
 *                 description: ID of the location
 *               teacherId:
 *                 type: integer
 *                 description: ID of the teacher
 *     responses:
 *       200:
 *         description: Teacher assigned to location successfully
 *       400:
 *         description: Teacher is already assigned to this location
 *       404:
 *         description: Location or Teacher not found
 *       500:
 *         description: Error assigning teacher to location
 */
router.post(
  "/location/assign-teacher",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.assignOrUpdateTeacherLocations
);

/**
 * @swagger
 * /location/assign-admin:
 *   post:
 *     summary: Assign an admin to a location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Information about the admin and location to be assigned
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: integer
 *                 description: ID of the location
 *               adminId:
 *                 type: integer
 *                 description: ID of the admin
 *     responses:
 *       200:
 *         description: Admin assigned to location successfully
 *       400:
 *         description: Admin is already assigned to this location
 *       404:
 *         description: Location or Admin not found
 *       500:
 *         description: Error assigning admin to location
 */
router.post(
  "/location/assign-admin",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
    ]
  ),
  LocationController.assignAdminToLocation
);

router.put(
  "/location/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.editLocation
);

router.delete(
  "/location/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin"],
    [
      {
        repository: AppDataSource.getRepository(Franchise),
        relationName: "franchises",
      },
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  LocationController.deleteLocation
);

export default router;
