import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getTeacherAttendanceOptions,
  getAttendanceSession,
  saveAttendanceSession,
  getPrincipalAttendanceSummary,
  unlockAttendanceSession,
  correctStudentAttendanceRecord,
  exportAttendanceCSV,
  getParentChildAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

// TEACHER ATTENDANCE ROUTES
router.get('/teacher/attendance/options', authenticate, authorizeRoles('teacher'), getTeacherAttendanceOptions);
router.get('/teacher/attendance/session', authenticate, authorizeRoles('teacher', 'principal'), getAttendanceSession);
router.post('/teacher/attendance/session', authenticate, authorizeRoles('teacher', 'principal'), saveAttendanceSession);

// PRINCIPAL ATTENDANCE ROUTES
router.get('/principal/attendance/summary', authenticate, authorizeRoles('principal'), getPrincipalAttendanceSummary);
router.patch('/principal/attendance/session/:sessionId/unlock', authenticate, authorizeRoles('principal'), unlockAttendanceSession);
router.patch('/principal/attendance/records/:recordId', authenticate, authorizeRoles('principal'), correctStudentAttendanceRecord);
router.get('/principal/attendance/export', authenticate, authorizeRoles('principal'), exportAttendanceCSV);

// PARENT ATTENDANCE ROUTES
router.get('/parent/children/:studentId/attendance', authenticate, authorizeRoles('parent'), getParentChildAttendance);

export default router;
