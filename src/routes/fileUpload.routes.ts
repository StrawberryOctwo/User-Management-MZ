import { Router } from 'express';
import multer from 'multer';
import { FileUploadController } from '../controllers/fileUpload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Franchise } from '../entities/franchise.entity';
import { Location } from '../entities/location.entity';
import { AppDataSource } from '../config/data-source';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });


router.post('/upload',
  authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Parent', 'Student'],
    [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
    { repository: AppDataSource.getRepository(Location), relationName: 'locations' },

    ]), 
  upload.single('file'), 
  FileUploadController.uploadFile 
);


router.get('/files',
  authMiddleware(['SuperAdmin']), 
  FileUploadController.getAllFiles 
);


router.post('/files/delete',
  authMiddleware(['SuperAdmin']), 
  FileUploadController.deleteFiles 
);


router.post('/files/user', authMiddleware(
  ['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
  [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
  ]), 
  upload.single('file')
  , FileUploadController.uploadFileByUserId);


router.get('/files/user/:userId', authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher'],
  [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' }
  ]), FileUploadController.getFilesByUserId);


router.get('/files/self', authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Parent', 'Student'], [
  { repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
]), FileUploadController.getCurrentUserFiles);

router.get('/files/download/:fileId', authMiddleware(['SuperAdmin', 'FranchiseAdmin', 'LocationAdmin', 'Teacher', 'Parent', 'Student'],
  [{ repository: AppDataSource.getRepository(Franchise), relationName: 'franchises' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  { repository: AppDataSource.getRepository(Location), relationName: 'locations' },
  ]), FileUploadController.downloadFile);


export default router;



