import { Router } from 'express';
import { FranchiseController } from '../controllers/franchise.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppDataSource } from '../config/data-source';
import { Franchise } from '../entities/franchise.entity';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Franchises
 *   description: Franchise management endpoints
 */

/**
 * @swagger
 * /franchises:
 *   get:
 *     summary: Get all franchises
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term to filter franchises by name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of franchises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Franchise'
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageCount:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: Error fetching franchises
 */
router.get(
  '/franchises',
  authMiddleware(
    ['SuperAdmin', 'FranchiseAdmin'],
    [{
      repository: AppDataSource.getRepository(Franchise),
      relationName: 'franchises'
    }]
  ),
  FranchiseController.getAllFranchises
);

router.get(
  '/public/franchise/locations',
  FranchiseController.getPublicFranchiseLocations
);

/**
 * @swagger
 * /franchises/{id}:
 *   get:
 *     summary: Get a specific franchise by ID
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The franchise ID
 *     responses:
 *       200:
 *         description: A franchise object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Franchise'
 *       404:
 *         description: Franchise not found
 *       403:
 *         description: Forbidden - you do not have access to this franchise
 *       500:
 *         description: Error fetching franchise
 */
router.get('/franchises/:id', authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
  [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]), FranchiseController.getFranchiseById);

/**
 * @swagger
 * /franchises:
 *   post:
 *     summary: Create a new franchise
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Franchise object that needs to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewFranchise'
 *     responses:
 *       201:
 *         description: Franchise created successfully
 *       500:
 *         description: Error creating franchise
 */
router.post('/franchises', authMiddleware(['SuperAdmin']), FranchiseController.createFranchise);

/**
 * @swagger
 * /franchises/{id}:
 *   put:
 *     summary: Update a franchise
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The franchise ID
 *     requestBody:
 *       description: Franchise object that needs to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFranchise'
 *     responses:
 *       200:
 *         description: Franchise updated successfully
 *       404:
 *         description: Franchise not found
 *       403:
 *         description: Forbidden - you do not have access to this franchise
 *       500:
 *         description: Error updating franchise
 */
router.put('/franchises/:id', authMiddleware(['SuperAdmin', 'FranchiseAdmin'],
  [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' }]), FranchiseController.updateFranchise);

/**
 * @swagger
 * /franchises/{id}:
 *   delete:
 *     summary: Delete a franchise
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The franchise ID
 *     responses:
 *       200:
 *         description: Franchise deleted successfully
 *       404:
 *         description: Franchise not found
 *       403:
 *         description: Forbidden - you do not have access to this franchise
 *       500:
 *         description: Error deleting franchise
 */
router.post('/franchises/delete', authMiddleware(['SuperAdmin']), FranchiseController.deleteFranchise);

/**
 * @swagger
 * /franchises/{id}/status:
 *   patch:
 *     summary: Update franchise status
 *     tags: [Franchises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The franchise ID
 *     requestBody:
 *       description: Status update object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Franchise status updated successfully
 *       404:
 *         description: Franchise not found
 *       403:
 *         description: Forbidden - you do not have access to this franchise
 *       500:
 *         description: Error updating franchise status
 */
router.patch('/franchises/:id/status', authMiddleware(['SuperAdmin', 'FranchiseAdmin']), FranchiseController.updateFranchiseStatus);

export default router;

