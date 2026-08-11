import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

export const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'superAdmin' });
    if (!existingAdmin) {
      const name = process.env.SUPER_ADMIN_NAME || 'System Super Admin';
      const loginId = (process.env.SUPER_ADMIN_LOGIN_ID || 'SUPERADMIN').toUpperCase();
      const password = process.env.SUPER_ADMIN_PASSWORD;
      const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@schoolsaas.com';

      if (!password) {
        console.error('[Seed Error] SUPER_ADMIN_PASSWORD environment variable is missing in .env.');
        return;
      }

      await User.create({
        name,
        loginId,
        password, // Pre-save hook hashes password
        email,
        role: 'superAdmin',
        schoolId: null,
        isActive: true,
      });

      console.log('--------------------------------------------------');
      console.log('[Seed] Super Admin initialized successfully!');
      console.log(`[Seed] Name: ${name}`);
      console.log(`[Seed] Login ID: ${loginId}`);
      console.log(`[Seed] Email: ${email}`);
      console.log('--------------------------------------------------');
    } else {
      console.log('[Seed] Super Admin account already exists.');
    }
  } catch (error) {
    console.error('[Seed] Error seeding Super Admin:', error.message);
  }
};

// If run directly from terminal
if (process.argv[1] && process.argv[1].endsWith('seedSuperAdmin.js')) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }

  mongoose
    .connect(uri)
    .then(async () => {
      await seedSuperAdmin();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database connection error during seeding:', err.message);
      process.exit(1);
    });
}
