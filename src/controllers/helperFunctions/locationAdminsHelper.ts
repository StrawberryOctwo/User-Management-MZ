import { Repository, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Location } from '../../entities/location.entity';
import bcrypt from 'bcryptjs';

export async function saveOrUpdateLocationAdmin(
    userRepository: Repository<User>,
    roleRepository: Repository<Role>,
    locationRepository: Repository<Location>,
    userData: any,
    locationIds: number[] 
): Promise<{ user?: User, error?: { message: string, status: number } }> {
    const { firstName, lastName, email, city,password, dob, address, postalCode, phoneNumber } = userData;

    
    const locationAdminRole = await roleRepository.findOne({ where: { name: 'LocationAdmin' } });
    if (!locationAdminRole) {
        return { error: { message: 'LocationAdmin role not found', status: 400 } };
    }

    
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        return { error: { message: 'User with this email already exists', status: 400 } };
    }

    
    const locations = await locationRepository.find({
        where: { id: In(locationIds) },
        relations: ['admins'], 
    });

    if (locations.length === 0) {
        return { error: { message: 'No valid locations found', status: 400 } };
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);
    const locationAdmin = new User();
    locationAdmin.firstName = firstName;
    locationAdmin.lastName = lastName;
    locationAdmin.city = city
    locationAdmin.email = email;
    locationAdmin.password = hashedPassword;
    locationAdmin.dob = new Date(dob);
    locationAdmin.address = address;
    locationAdmin.postalCode = postalCode;
    locationAdmin.phoneNumber = phoneNumber;
    locationAdmin.roles = [locationAdminRole];
    locationAdmin.locations = locations; 

    
    await userRepository.save(locationAdmin);

    
    for (const location of locations) {
        
        if (!location.admins) {
            location.admins = [];
        }
        location.admins.push(locationAdmin); 
        await locationRepository.save(location);
    }

    return { user: locationAdmin };
}

