import { In, Like } from 'typeorm';
import { User } from '../entities/user.entity';

export function applyRoleBasedFilters(
    user: User,
    entitiesArray: any[], 
    whereConditions: any[],
    context: 'student' | 'teacher' 
  ): any[] {
    
    
    if (user.roles.some(role => role.name === 'Superadmin')) {
      return whereConditions;
    }
  
    
    if (user.roles.some(role => role.name === 'FranchiseAdmin')) {
        const franchiseIds = entitiesArray.map(entity => entity.id);
        return whereConditions.map(condition => {
            if (context === 'student') {
                
                return {
                    ...condition,
                    location: { franchise: { id: In(franchiseIds) } },
                };
            } else if (context === 'teacher') {
                
                return {
                    ...condition,
                    locations: { franchise: { id: In(franchiseIds) } },
                };
            }
        });
    }

  if (user.roles.some(role => role.name === 'Teacher' || role.name === 'LocationAdmin')) {
    
    const locationIds = entitiesArray.map(location => location.id);
    return whereConditions.map(condition => ({
      ...condition,
      location: { id: In(locationIds) },
    }));
  }



  throw new Error('Forbidden: You do not have access to this resource');
}

