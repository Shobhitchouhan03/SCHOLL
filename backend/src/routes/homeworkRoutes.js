import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createHomework,
  getTeacherHomework,
  publishHomework,
  getPrincipalHomework,
  getParentChildHomework,
} from '../controllers/homeworkController.js';

const router = express.Router();

// TEACHER HOMEWORK ROUTES
router.post('/teacher/homework', authenticate, authorizeRoles('teacher'), createHomework);
router.get('/teacher/homework', authenticate, authorizeRoles('teacher'), getTeacherHomework);
router.post('/teacher/homework/:homeworkId/publish', authenticate, authorizeRoles('teacher'), publishHomework);

// PRINCIPAL HOMEWORK ROUTES
router.get('/principal/homework', authenticate, authorizeRoles('principal'), getPrincipalHomework);

// PARENT HOMEWORK ROUTES
router.get('/parent/children/:studentId/homework', authenticate, authorizeRoles('parent'), getParentChildHomework);

export default router;
