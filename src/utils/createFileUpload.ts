import { Repository } from 'typeorm';
import { FileUpload } from '../entities/file-upload.entity';
import { User } from '../entities/user.entity';

export async function createFileUpload(
  repository: Repository<FileUpload>,
  generatedFileName: string,  
  customFileName: string,     
  user: User,
  type: string
): Promise<FileUpload> {
  const fileUpload = repository.create({
    type,
    name: customFileName, 
    path: `/${generatedFileName}`, 
    user,
  });

  await repository.save(fileUpload);
  return fileUpload;
}

