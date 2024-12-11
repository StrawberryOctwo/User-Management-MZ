import { Router } from 'express';
import { FranchiseAdminController } from '../controllers/franchiseAdmin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/franchise-admins', authMiddleware(['SuperAdmin']), FranchiseAdminController.createFranchiseAdmin);

router.put('/franchise-admins/:id', authMiddleware(['SuperAdmin']), FranchiseAdminController.updateFranchiseAdmin);

router.get('/franchise-admins', authMiddleware(['SuperAdmin']), FranchiseAdminController.getAllFranchiseAdmins);

router.get('/franchise-admins/:id', authMiddleware(['SuperAdmin', 'FranchiseAdmin']), FranchiseAdminController.getFranchiseAdminById);

router.get('/admin-franchises/:id', authMiddleware(['SuperAdmin', 'FranchiseAdmin']), FranchiseAdminController.getFranchisesByAdminId);

router.post('/admins-franchises/delete', authMiddleware(['SuperAdmin',]), FranchiseAdminController.deleteFranchiseAdmins);

export default router;

