/**
 * Seed data configuration
 * Modify these values to customize seeding or use environment variables
 */

export interface SeedConfig {
  seedSuperAdmin: boolean;
  seedSampleUsers: boolean;
  superAdmin: {
    name: string;
    email: string;
    password: string;
  };
  sampleUsers: Array<{
    name: string;
    email: string;
    password: string;
    role: string;
  }>;
}

/**
 * Default seed configuration
 * Override with environment variables or modify here
 * 
 * Environment variables:
 * - SEED_SUPERADMIN: boolean (default: true)
 * - SEED_SUPERADMIN_NAME: string (default: 'Super Admin')
 * - SEED_SUPERADMIN_EMAIL: string (default: 'superadmin@darunquran.com')
 * - SEED_SUPERADMIN_PASSWORD: string (default: 'SuperAdmin@123')
 * - SEED_SAMPLE_USERS: boolean (default: false)
 */
export const seedConfig: SeedConfig = {
  seedSuperAdmin: process.env.SEED_SUPERADMIN !== 'false', // Default: true
  seedSampleUsers: process.env.SEED_SAMPLE_USERS === 'true', // Default: false
  superAdmin: {
    name: process.env.SEED_SUPERADMIN_NAME || 'Super Admin',
    email: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@darunquran.com',
    password: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123',
  },
  sampleUsers: [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin', // Use ROLES.ADMIN in seedUsers.ts
    },
    {
      name: 'Donor User',
      email: 'donor@example.com',
      password: 'Donor@123',
      role: 'donors', // Use ROLES.DONORS in seedUsers.ts
    },
  ],
};

