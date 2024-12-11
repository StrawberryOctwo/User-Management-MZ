
import { franchiseAdminSchema } from './franchiseAdminSchema';
import { franchiseSchema } from './franchiseSchema';
import { locationSchemas } from './locationSchema';
import { studentSchemas } from './studentSchema';
import { teacherSchemas } from './teacherSchema';

export const swaggerSchemas = {
    ...franchiseSchema,
    ...franchiseAdminSchema,
    ...teacherSchemas,
    ...studentSchemas,
    ...locationSchemas
    
  };
  
