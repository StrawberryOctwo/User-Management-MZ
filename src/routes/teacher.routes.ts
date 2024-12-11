import { Router } from "express";
import { TeachersController } from "../controllers/teachers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Franchise } from "../entities/franchise.entity";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { User } from "../entities/user.entity";

const router = Router();

/**
 * @swagger
 * /teacher:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Teacher and User data required to create a new teacher
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTeacher'
 *     responses:
 *       201:
 *         description: Teacher created successfully
 */
router.post(
  "/teacher",
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
  TeachersController.createTeacher
);

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers with pagination and search
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term (first name, last name, email, or employee number)
 *     responses:
 *       200:
 *         description: List of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 */
router.get(
  "/teachers",
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
  TeachersController.getTeachers
);

/**
 * @swagger
 * /teacher/{id}:
 *   get:
 *     summary: Get a specific teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: A teacher object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 */
router.get(
  "/teacher/:id",
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
  TeachersController.getTeacherById
);

/**
 * @swagger
 * /teacher/user/{userId}:
 *   get:
 *     summary: Get a specific teacher by User ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID associated with the teacher
 *     responses:
 *       200:
 *         description: A teacher object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 */

router.get(
  "/teacher/invoice-info/user/:userId",
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
  TeachersController.getTeacherInvoiceInfoByUserId
);
router.get(
  "/teacher/user/:userId",
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
  TeachersController.getTeacherByUserId
);

router.put(
  "/teacher/:id",
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
  TeachersController.updateTeacher
);

router.post(
  "/teachers/delete",
  authMiddleware(["SuperAdmin"]),
  TeachersController.deleteTeacher
);

router.get(
  "/teachers/:id/documents",
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
  TeachersController.getTeacherDocuments
);

export default router;

