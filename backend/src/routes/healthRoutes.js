import express from 'express';
import {
  getHealthStatus,
  getDatabaseHealth,
  getReadinessProbe,
  getLivenessProbe,
} from '../controllers/healthController.js';

const router = express.Router();

router.get('/health', getHealthStatus);
router.get('/health/database', getDatabaseHealth);
router.get('/health/readiness', getReadinessProbe);
router.get('/health/liveness', getLivenessProbe);

export default router;
