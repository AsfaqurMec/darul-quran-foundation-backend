import { User } from '@/modules/users/user.model';
import { userService } from '@/modules/users/user.service';
import { ROLES } from '@/constants';
import { logger } from '@/modules/common/utils/logger';
import { seedConfig } from './seedData';

/**
 * Seed users
 * Creates default superadmin user and optionally sample users based on configuration
 */
export const seedUsers = async (): Promise<void> => {
  try {
    logger.info('👤 Seeding users...');

    // Seed superadmin user if enabled
    if (seedConfig.seedSuperAdmin) {
      const existingSuperAdmin = await User.findOne({ email: seedConfig.superAdmin.email });
      if (!existingSuperAdmin) {
        await userService.createUser(
          seedConfig.superAdmin.name,
          seedConfig.superAdmin.email,
          seedConfig.superAdmin.password,
          ROLES.SUPERADMIN
        );
        logger.info(`✅ Created superadmin user: ${seedConfig.superAdmin.email}`);
        logger.info(`   Default password: ${seedConfig.superAdmin.password}`);
        logger.warn('⚠️  IMPORTANT: Change the default superadmin password in production!');
      } else {
        logger.info(`ℹ️  Superadmin user already exists: ${seedConfig.superAdmin.email}`);
      }
    }

    // Seed sample users if enabled (only in development or if explicitly enabled)
    if (seedConfig.seedSampleUsers || process.env.NODE_ENV === 'development') {
      for (const userData of seedConfig.sampleUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          // Map role string to ROLES constant
          const role =
            userData.role === 'superadmin'
              ? ROLES.SUPERADMIN
              : userData.role === 'admin'
              ? ROLES.ADMIN
              : ROLES.DONORS;

          await userService.createUser(
            userData.name,
            userData.email,
            userData.password,
            role
          );
          logger.info(`✅ Created sample user: ${userData.email} (${role})`);
          logger.info(`   Default password: ${userData.password}`);
        } else {
          logger.info(`ℹ️  User already exists: ${userData.email}`);
        }
      }
    }

    logger.info('✅ User seeding completed');
  } catch (error) {
    logger.error('❌ Error seeding users:', error);
    throw error;
  }
};

