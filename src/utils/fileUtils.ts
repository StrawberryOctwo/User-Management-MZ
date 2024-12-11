import { unlink } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';


export async function deleteFileFromStorage(filePath: string): Promise<void> {
  try {
    
    const fullPath = path.join(__dirname, '../..', 'uploads', filePath);

    await fs.unlink(fullPath); 

    console.log(`Successfully deleted file from storage: ${fullPath}`);
  } catch (error) {
    console.error(`Error deleting file from storage: ${filePath}`, error);
  }
}


export async function saveFileWithUniqueName(file: Express.Multer.File, customFileName: string): Promise<string> {
  
  const separator = '__ORIGINAL__';

  
  const uniqueFileName = `${uuidv4()}${separator}${file.originalname}`;

  
  const newFilePath = path.join('uploads', uniqueFileName);

  
  await fs.rename(file.path, newFilePath);

  return uniqueFileName; 
}


const UPLOADS_DIR = path.join(__dirname, '../../uploads/documents');

export const saveDocument = async (fileName: string, fileContent: string): Promise<string> => {
  const uniqueFileName = `${uuidv4()}-${fileName}`; 
  const filePath = path.join(UPLOADS_DIR, uniqueFileName);

  
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  
  await fs.writeFile(filePath, Buffer.from(fileContent, 'base64'));

  return `/uploads/documents/${uniqueFileName}`; 
};

