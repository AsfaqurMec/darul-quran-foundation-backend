import mongoose from 'mongoose';
import { connectDB } from '@/db';
import { logger } from '@/modules/common/utils/logger';
import { seedUsers } from './seedUsers';
import { User } from '@/modules/users/user.model';

/**
 * Reset and seed database
 * Drops all collections and re-seeds with default data
 * WARNING: This will delete all existing data!
 */
const reset = async (): Promise<void> => {
  try {
    logger.warn('⚠️  WARNING: This will delete all existing data!');
    logger.info('🗑️  Resetting database...');

    // Connect to database
    await connectDB();

    // Drop all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].drop();
      logger.info(`   Dropped collection: ${key}`);
    }

    // Re-seed users
    await seedUsers();

    logger.info('✅ Database reset and seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

// Run reset if called directly
if (require.main === module) {
  reset();
}

export default reset;

