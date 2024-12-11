import { AppDataSource } from './config/data-source';
import { User } from './entities/user.entity';
import { seedDatabase } from './seed';

export const checkAndSeedDatabase = async (): Promise<void> => {
  try {
    
    if (!AppDataSource.isInitialized) {
      throw new Error('Data source is not initialized.');
    }

    
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();

    
    if (userCount === 0) {
      console.log('First time launching app. Running database seed...');
      await seedDatabase();
      console.log('Database seeded successfully.');
    } else {
      console.log('Database already seeded. Skipping seed process.');
    }

  } catch (error) {
    console.error('Error during the seeding process:', error);
  }
};

