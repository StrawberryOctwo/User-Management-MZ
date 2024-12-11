import { Repository, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { Franchise } from '../../entities/franchise.entity';
import bcrypt from 'bcryptjs';

export async function saveOrUpdateFranchiseAdmin(
    userRepository: Repository<User>,
    roleRepository: Repository<Role>,
    franchiseRepository: Repository<Franchise>,
    userData: any,
    franchiseIds: number[] 
): Promise<{ user?: User, error?: { message: string, status: number } }> {
    const { firstName, lastName, email, password, dob, address, postalCode, phoneNumber, city } = userData;

    const franchiseAdminRole = await roleRepository.findOne({ where: { name: 'FranchiseAdmin' } });
    if (!franchiseAdminRole) {
        return { error: { message: 'FranchiseAdmin role not found', status: 400 } };
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
        return { error: { message: 'User with this email already exists', status: 400 } };
    }

    const franchises = await franchiseRepository.find({
        where: { id: In(franchiseIds) },
        relations: ['admins'],
    });

    if (franchises.length === 0) {
        return { error: { message: 'No valid franchises found', status: 400 } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const franchiseAdmin = new User();
    franchiseAdmin.firstName = firstName;
    franchiseAdmin.lastName = lastName;
    franchiseAdmin.city = city;
    franchiseAdmin.email = email;
    franchiseAdmin.city = city;
    franchiseAdmin.password = hashedPassword;
    franchiseAdmin.dob = new Date(dob);
    franchiseAdmin.address = address;
    franchiseAdmin.postalCode = postalCode;
    franchiseAdmin.phoneNumber = phoneNumber;
    franchiseAdmin.roles = [franchiseAdminRole];
    franchiseAdmin.franchises = franchises;

    await userRepository.save(franchiseAdmin);

    for (const franchise of franchises) {
        if (!franchise.admins) {
            franchise.admins = [];
        }
        franchise.admins.push(franchiseAdmin); 
        await franchiseRepository.save(franchise);
    }

    return { user: franchiseAdmin };
}

