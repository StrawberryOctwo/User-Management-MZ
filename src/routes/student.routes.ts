import { Router } from "express";
import { StudentController } from "../controllers/students.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppDataSource } from "../config/data-source";
import { Location } from "../entities/location.entity";
import { Franchise } from "../entities/franchise.entity";
import { Student } from "../entities/student.entity";
const router = Router();

/**
 * @swagger
 * /student:
 *   post:
 *     summary: Add a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Student and User data required to create a new student
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewStudent'
 *     responses:
 *       201:
 *         description: Student added successfully
 */
router.post(
  "/student",
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
  StudentController.addStudent
);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students with pagination and search
 *     tags: [Students]
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
 *         description: Search term (first name, last name, email)
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
router.get(
  "/students",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
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
      {
        repository: AppDataSource.getRepository(Student),
        relationName: "students",
      },
    ]
  ),
  StudentController.getStudents
);
/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a specific student by their ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: A student object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 */
router.get(
  "/student/:id",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
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
      {
        repository: AppDataSource.getRepository(Student),
        relationName: "students",
      },
    ]
  ),
  StudentController.getStudentById
);

/**
 * @swagger
 * /students/user/{userId}:
 *   get:
 *     summary: Get a student by their associated userId
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID associated with the student
 *     responses:
 *       200:
 *         description: A student object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 */
router.get(
  "/students/user/:userId",
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
  StudentController.getStudentByUserId
);

router.get(
  "/parent/students/",
  authMiddleware(
    ["SuperAdmin", "Parent"],
    [
      {
        repository: AppDataSource.getRepository(Student),
        relationName: "students",
      },
    ]
  ),
  StudentController.getStudentsForParent
);

router.put(
  "/student/:id",
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
  StudentController.updateStudent
);

router.post(
  "/students/delete",
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
  StudentController.deleteStudent
);

router.get(
  "/students/:id/documents",
  authMiddleware(
    ["SuperAdmin", "FranchiseAdmin", "LocationAdmin", "Teacher", "Parent"],
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
      {
        repository: AppDataSource.getRepository(Student),
        relationName: "students",
      },
    ]
  ),
  StudentController.getStudentDocuments
);

router.post(
  "/students/:studentId/assign-location/:locationId",
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
  StudentController.assignLocationToStudent
);

router.get(
  "/absences/user/:id",
  authMiddleware(
    ["Student"],
    [
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  StudentController.getAbsenceById
);

router.get(
  "/absences/self",
  authMiddleware(
    ["Student"],
    [
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  StudentController.getSelfAbsences
);

router.post(
  "/absences/:absenceId/assign-files",
  authMiddleware(
    ["Student"],
    [
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  StudentController.assignFilesToAbsence
);
router.post(
  "/students/absences",
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
  StudentController.createAbsence
);
router.patch(
  "/students/absences/update-reason",
  authMiddleware(
    ["SuperAdmin", "Student"],
    [
      {
        repository: AppDataSource.getRepository(Location),
        relationName: "locations",
      },
    ]
  ),
  StudentController.updateAbsenceReason
);
router.delete(
  "/students/absences/:absenceId",
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
  StudentController.deleteAbsence
);
router.patch(
  "/students/absences/update-status",
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
    ]
  ),
  StudentController.updateAbsenceStatus
);
router.get(
  "/student/:studentId/class-session/:sessionId/absence",
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
  StudentController.getClassSessionAbsencesByStudentId
);

export default router;
