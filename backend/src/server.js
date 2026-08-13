import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import { seedSuperAdmin } from './utils/seedSuperAdmin.js';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import principalRoutes from './routes/principalRoutes.js';
import principalSetupRoutes from './routes/principalSetupRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import examRoutes from './routes/examRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import hrLeaveRoutes from './routes/hrLeaveRoutes.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for Render reverse proxy compatibility
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.PUBLIC_APP_URL,
  'https://school-saasfrontend.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const rootDomain = process.env.ROOT_DOMAIN;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Dynamic Netlify / Vercel deployment matching
      if (origin.endsWith('.netlify.app') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Dynamic subdomain matching if ROOT_DOMAIN is configured (e.g., *.yourdomain.com)
      if (rootDomain && (origin.endsWith(`.${rootDomain}`) || origin === `https://${rootDomain}` || origin === `http://${rootDomain}`)) {
        return callback(null, true);
      }

      // Permissive fallback in development mode
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error('CORS policy error: Origin not allowed by multi-tenant security policy.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-School-ID'],
  })
);

// Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use('/api/auth', authLimiter);

// Root API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Tenant School Management SaaS API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      superAdmin: '/api/super-admin',
      principal: '/api/principal',
      health: '/api/health',
      dbHealth: '/api/health/database',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
app.get('/api/health/database', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    database: {
      status: stateCode === 1 ? 'healthy' : 'degraded',
      connectionState: dbState[stateCode] || 'unknown',
      readyState: stateCode,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/principal', principalSetupRoutes);
app.use('/api', teacherRoutes);
app.use('/api', studentRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', homeworkRoutes);
app.use('/api', examRoutes);
app.use('/api', feeRoutes);
app.use('/api', payrollRoutes);
app.use('/api', hrLeaveRoutes);
app.use('/api', recruitmentRoutes);
app.use('/api', noticeRoutes);
app.use('/api', communicationRoutes);
app.use('/api', transportRoutes);
app.use('/api', libraryRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', publicRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api', galleryRoutes);
app.use('/', healthRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Connect to Database & Start Server
const startServer = async () => {
  // Trigger DB connection in background without crashing HTTP server start
  connectDB().then(() => {
    seedSuperAdmin().catch((err) => console.error('[Seed Error]', err.message));
  }).catch((err) => {
    console.warn('[Database] Initial connection failed, server continuing in offline mode.');
  });

  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 School SaaS Backend Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
  });
};

const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.env.TEST_SUITE === 'true' ||
  process.argv.some((arg) => arg.includes('.test.js'));

if (!isTestMode) {
  startServer();
}

export { app };
export default app;
