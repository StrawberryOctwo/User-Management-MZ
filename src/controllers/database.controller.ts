import { Request, Response } from 'express';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import archiver from 'archiver'; 
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import AdmZip from 'adm-zip';

export class DatabaseController {

  
  static async backupDatabase(req: AuthenticatedRequest, res: Response) {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      const uploadsDir = path.join(__dirname, '../../uploads');
      const backupFileName = `backup-${Date.now()}.backup`;
      const backupFilePath = path.join(backupDir, backupFileName);

      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      
      const dbBackupPath = path.join(backupDir, `db-backup-${Date.now()}.sql`);

      
      const pgDumpCommand = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -U ${process.env.DB_USERNAME} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -d ${process.env.DB_NAME} -F c -b -v -f ${dbBackupPath}`;
      exec(pgDumpCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Error during database backup:', error);
          return res.status(500).json({ message: 'Error during database backup' });
        }

        
        const output = fs.createWriteStream(backupFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        
        output.on('close', () => {
          console.log(`Backup created successfully: ${backupFilePath}`);
          res.download(backupFilePath, backupFileName, (err) => {
            if (err) {
              console.error('Error during backup download:', err);
              return res.status(500).json({ message: 'Error downloading the backup' });
            }

            
            fs.unlinkSync(dbBackupPath);
          });
        });

        archive.on('error', (err: any) => {
          console.error('Error creating archive:', err);
          res.status(500).json({ message: 'Error creating backup archive' });
        });

        
        archive.pipe(output);

        
        archive.file(dbBackupPath, { name: 'database.sql' });

        
        archive.directory(uploadsDir, 'uploads');

        
        archive.finalize();
      });
    } catch (error) {
      console.error('Backup failed:', error);
      return res.status(500).json({ message: 'Server error during backup' });
    }
  }

  
  static async restoreDatabase(req: AuthenticatedRequest, res: Response) {
    
    let backupFilePath: string | undefined = undefined;
    let restoreDir: string | null = null;

    try {
      
      if (!req.file) {
        return res.status(400).json({ message: 'No backup file uploaded' });
      }

      backupFilePath = path.join(__dirname, '../../uploads', req.file.filename);
      restoreDir = path.join(__dirname, '../../restores');
      const uploadsDir = path.join(__dirname, '../../uploads');

      
      if (!fs.existsSync(restoreDir)) {
        fs.mkdirSync(restoreDir, { recursive: true });
      }

      
      const zip = new AdmZip(backupFilePath);
      zip.extractAllTo(restoreDir, true);
      console.log('Unzipping complete');

      
      const dbBackupPath = path.join(restoreDir, 'database.sql');
      const pgRestoreCommand = `PGPASSWORD=${process.env.DB_PASSWORD} pg_restore --no-owner -U ${process.env.DB_USERNAME} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -d ${process.env.DB_NAME} --clean --if-exists ${dbBackupPath}`;


      const dbRestorePromise = new Promise<void>((resolve, reject) => {
        exec(pgRestoreCommand, (error, stdout, stderr) => {
          if (error) {
            console.error('Error restoring the database:', error);
            return reject(new Error(`Error restoring the database: ${stderr}`));
          }
          console.log('Database restored successfully');
          resolve();
        });
      });

      
      const fileRestorePromise = new Promise<void>((resolve, reject) => {
        fs.readdir(path.join(restoreDir!, 'uploads'), (err, files) => {
          if (err) {
            console.error('Error reading restored files:', err);
            return reject(new Error('Error reading restored files.'));
          }

          files.forEach((file) => {
            const srcPath = path.join(restoreDir!, 'uploads', file);
            const destPath = path.join(uploadsDir, file);
            fs.renameSync(srcPath, destPath);
          });

          console.log('Files restored successfully');
          resolve();
        });
      });

      
      await Promise.all([dbRestorePromise, fileRestorePromise]);

      
      if (restoreDir && fs.existsSync(restoreDir)) {
        fs.rmSync(restoreDir, { recursive: true, force: true });
        console.log('Restore directory cleaned up');
      }

      
      if (backupFilePath && fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
        console.log('Backup zip file deleted');
      }

      return res.status(200).json({ message: 'Database and files restored successfully' });

    } catch (error) {
      console.error('Restore failed:', error);

      
      if (restoreDir && fs.existsSync(restoreDir)) {
        fs.rmSync(restoreDir, { recursive: true, force: true });
        console.log('Restore directory cleaned up after failure');
      }

      
      if (backupFilePath && fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
        console.log('Backup zip file deleted after failure');
      }

      return res.status(500).json({ message: 'Server error during restore', error: error });
    }
  }
}

