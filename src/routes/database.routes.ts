import { Router } from 'express';
import { DatabaseController } from '../controllers/database.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({
    dest: 'uploads/', 
    limits: { fileSize: 500 * 1024 * 1024 } 
  });


router.get('/backup', authMiddleware(['SuperAdmin']), DatabaseController.backupDatabase);
router.post('/restore', authMiddleware(['SuperAdmin']), upload.single('backupFile'), DatabaseController.restoreDatabase);

export default router;

