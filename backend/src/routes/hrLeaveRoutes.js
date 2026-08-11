import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createLeaveType,
  getLeaveTypes,
  submitTeacherLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelTeacherLeaveRequest,
  getLeaveRequests,
  getTeacherLeaveBalance,
} from '../controllers/hrLeaveController.js';

const router = express.Router();

// PRINCIPAL LEAVE ROUTES
router.post('/principal/leave/types', authenticate, authorizeRoles('principal'), createLeaveType);
router.get('/principal/leave/types', authenticate, authorizeRoles('principal'), getLeaveTypes);
router.get('/principal/leave/requests', authenticate, authorizeRoles('principal'), getLeaveRequests);
router.post('/principal/leave/requests/:requestId/approve', authenticate, authorizeRoles('principal'), approveLeaveRequest);
router.post('/principal/leave/requests/:requestId/reject', authenticate, authorizeRoles('principal'), rejectLeaveRequest);

// TEACHER LEAVE ROUTES
router.get('/teacher/leave/types', authenticate, authorizeRoles('teacher'), getLeaveTypes);
router.get('/teacher/leave/balance', authenticate, authorizeRoles('teacher'), getTeacherLeaveBalance);
router.get('/teacher/leave/requests', authenticate, authorizeRoles('teacher'), getLeaveRequests);
router.post('/teacher/leave/requests', authenticate, authorizeRoles('teacher'), submitTeacherLeaveRequest);
router.post('/teacher/leave/requests/:requestId/cancel', authenticate, authorizeRoles('teacher'), cancelTeacherLeaveRequest);

export default router;
