import mongoose from 'mongoose';

export const getHealthStatus = async (req, res) => {
  return res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};

export const getDatabaseHealth = async (req, res) => {
  try {
    const start = Date.now();
    const isConnected = mongoose.connection.readyState === 1;
    let latencyMs = 0;

    if (isConnected) {
      await mongoose.connection.db.admin().ping();
      latencyMs = Date.now() - start;
    }

    return res.status(isConnected ? 200 : 503).json({
      status: isConnected ? 'connected' : 'disconnected',
      database: 'mongodb',
      latencyMs,
    });
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: 'Database health check failed.',
    });
  }
};

export const getReadinessProbe = async (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (!isDbReady) {
    return res.status(503).json({ ready: false, reason: 'Database connection unavailable' });
  }
  return res.status(200).json({ ready: true });
};

export const getLivenessProbe = async (req, res) => {
  return res.status(200).json({ alive: true });
};
