import { Request, Response } from 'express';
import { FileUpload } from '../entities/file-upload.entity';
import { AppDataSource } from '../config/data-source';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { User } from '../entities/user.entity';

import { Brackets, In } from 'typeorm';
import { deleteFileFromStorage, saveFileWithUniqueName } from '../utils/fileUtils';
import { createFileUpload } from '../utils/createFileUpload';
import * as path from 'path';
import * as fs from 'fs';
import mime from 'mime-types'; 

export class FileUploadController {
  
  static async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { type, customFileName } = req.body;
      if (!type || !customFileName) {
        return res.status(400).json({ message: 'File type and custom file name are required' });
      }

      const user = req.user!;
      const fileRepository = AppDataSource.getRepository(FileUpload);

      
      const uniqueFileName = await saveFileWithUniqueName(req.file, customFileName);

      
      const fileUpload = await createFileUpload(fileRepository, uniqueFileName, customFileName, user, type);

      res.status(201).json({ message: 'File uploaded successfully', file: fileUpload });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  }

  static async uploadFileByUserId(req: AuthenticatedRequest, res: Response) {
    try {
      console.log(req.file)
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      
      const { type, customFileName, userId } = req.body;

      
      if (!type || !customFileName || !userId) {
        return res.status(400).json({ message: 'File type, custom file name, and user ID are required' });
      }

      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: userId });

      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const fileRepository = AppDataSource.getRepository(FileUpload);

      
      const uniqueFileName = await saveFileWithUniqueName(req.file, customFileName);

      
      const fileUpload = await createFileUpload(fileRepository, uniqueFileName, customFileName, user, type);

      
      res.status(201).json({ message: 'File uploaded successfully', file: fileUpload });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file' ,error:error});
    }
  }

  
  static async getAllFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const fileUploadRepository = AppDataSource.getRepository(FileUpload);

      
      const { page = 1, pageSize = 10, search = '' } = req.query;

      
      const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
      const take = parseInt(pageSize as string);

      
      const queryBuilder = fileUploadRepository.createQueryBuilder('file')
        .leftJoinAndSelect('file.user', 'user')
        .select([
          'file.id',
          'file.type',
          'file.name',
          'file.path',
          'file.createdAt',
          'file.updatedAt',
          'user.firstName',
          'user.lastName',
          'user.email'
        ])
        .where(({}))
        .skip(skip) 
        .take(take); 

      
      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('file.name ILIKE  :search', { search: `%${search}%` })
              .orWhere('file.type ILIKE  :search', { search: `%${search}%` })
              .orWhere('user.firstName ILIKE  :search', { search: `%${search}%` })
              .orWhere('user.lastName ILIKE  :search', { search: `%${search}%` })
              .orWhere('user.email ILIKE  :search', { search: `%${search}%` });
          })
        );
      }

      
      const [files, total] = await queryBuilder.getManyAndCount();

      
      res.status(200).json({ data: files, total });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  }

  static async getCurrentUserFiles(req: AuthenticatedRequest, res: Response) {
    try {
      const fileRepository = AppDataSource.getRepository(FileUpload);
      const user = req.user!;
  
      
      const { page = 1, pageSize = 10, search = '' } = req.query;
  
      
      const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
      const take = parseInt(pageSize as string);
  
      
      const queryBuilder = fileRepository.createQueryBuilder('file')
        .leftJoinAndSelect('file.user', 'user')
        .select([
          'file.id',
          'file.type',
          'file.name',
          'file.path',
          'file.createdAt',
          'file.updatedAt',
          'user.firstName',
          'user.lastName',
          'user.email'
        ])
        .where('file.user.id = :userId', { userId: user.id }) 
        .skip(skip) 
        .take(take); 
  
      
      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('file.name ILIKE :search', { search: `%${search}%` })
              .orWhere('file.type ILIKE :search', { search: `%${search}%` })
              .orWhere('user.firstName ILIKE :search', { search: `%${search}%` })
              .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
              .orWhere('user.email ILIKE :search', { search: `%${search}%` });
          })
        );
      }
  
      
      const [files, total] = await queryBuilder.getManyAndCount();
  
      
      res.status(200).json({ data: files, total });
    } catch (error) {
      console.error('Error fetching files for current user:', error);
      res.status(500).json({ message: 'Error fetching files for current user' });
    }
  }
  

  static async getFilesByUserId(req: AuthenticatedRequest, res: Response) {
    try {
      
      const { userId } = req.params;
      const numericUserId = parseInt(userId, 10); 

      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: numericUserId });

      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      
      const fileRepository = AppDataSource.getRepository(FileUpload);
      const userFiles = await fileRepository.find({
        where: { user: { id: numericUserId } },  
      });

      
      if (!userFiles || userFiles.length === 0) {
        return res.status(404).json({ message: 'No files found for this user' });
      }

      res.status(200).json({ message: 'Files retrieved successfully', files: userFiles });
    } catch (error) {
      console.error('Error fetching files by user ID:', error);
      res.status(500).json({ message: 'Error fetching files' });
    }
  }

  
  static async deleteFiles(req: AuthenticatedRequest, res: Response) {
    const { ids } = req.body;
  
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Please provide an array of file IDs' });
    }
  
    const queryRunner = AppDataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const fileUploadRepository = queryRunner.manager.getRepository(FileUpload);
  
      for (const id of ids) {
        const file = await fileUploadRepository.findOne({
          where: { id },
        });
  
        if (!file) {
          return res.status(404).json({ message: `File with ID ${id} not found` });
        }
  
        
        await deleteFileFromStorage(file.path);
  
        
        await fileUploadRepository.delete(id);
      }
  
      await queryRunner.commitTransaction();
  
      res.json({ message: 'Files deleted successfully' });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error deleting files:', error);
      res.status(500).json({ message: 'Error deleting files' });
    } finally {
      await queryRunner.release();
    }
  }
  


 

  static async downloadFile(req: AuthenticatedRequest, res: Response) {
    const { fileId } = req.params;  
    const { action } = req.query;   

    try {
      const fileRepository = AppDataSource.getRepository(FileUpload);

      
      const file = await fileRepository.findOne({
        where: { id: Number(fileId) },
      });

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      
      const uploadsDirectory = path.join(__dirname, '../../uploads');

      
      const filePath = path.join(uploadsDirectory, file.path);

      
      console.log('Resolved file path:', filePath);

      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      
      const fileNameFromPath = path.basename(file.path);

      
      const mimeType = mime.lookup(fileNameFromPath) || 'application/octet-stream';

      
      const dispositionType = action === 'view' ? 'inline' : 'attachment';

      
      res.setHeader('Content-Disposition', `${dispositionType}; filename="${fileNameFromPath}"`);
      res.setHeader('Content-Type', mimeType); 

      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading/viewing file:', error);
      res.status(500).json({ message: 'Error processing file' });
    }
  }
}

