import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getParentSelfProfile,
  getChildProfile,
  updateParentSelfProfile,
  getChildDashboardOverview,
  getChildAttendance,
  getChildHomework,
  getChildExams,
  getChildResults,
  getChildReportCard,
  getChildFees,
  submitStudentLeave,
  getStudentLeaveHistory,
  getChildNotices,
} from '../controllers/parentController.js';

const router = express.Router();

// All routes require Parent authentication
router.use(authenticate, authorizeRoles('parent'));

// Family Profile & Children List
router.get('/me', getParentSelfProfile);
router.get('/children', getParentSelfProfile);
router.get('/children/:studentId', getChildProfile);
router.patch('/profile', updateParentSelfProfile);

// Child Specific Information & Academics
router.get('/children/:studentId/dashboard', getChildDashboardOverview);
router.get('/children/:studentId/attendance', getChildAttendance);
router.get('/children/:studentId/homework', getChildHomework);
router.get('/children/:studentId/exams', getChildExams);
router.get('/children/:studentId/results', getChildResults);
router.get('/children/:studentId/report-card', getChildReportCard);
router.get('/children/:studentId/fees', getChildFees);

// Student Leave Management
router.post('/children/:studentId/leave', submitStudentLeave);
router.get('/children/:studentId/leave', getStudentLeaveHistory);

// Notices Targeted to Parents/Children
router.get('/notices', getChildNotices);

export default router;
