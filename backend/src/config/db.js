import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: process.env.NODE_ENV !== 'production',
    };

    mongoose.connection.on('connected', () => {
      console.log('[Database] MongoDB connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected.');
    });

    await mongoose.connect(connStr, options);

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed through app termination.');
      process.exit(0);
    });

  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error.message);
    // Don't crash immediately in dev mode if database is offline, but log warning
  }
};
