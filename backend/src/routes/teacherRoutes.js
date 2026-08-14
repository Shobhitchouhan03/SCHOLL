import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus,
  resetTeacherPassword,
  changeTeacherLoginId,
  addTeacherSalaryRecord,
  manageLeaveRequest,
  getSchoolLeaveRequests,
  getTeacherSelfProfile,
  getTeacherSelfLeaves,
  applyTeacherLeave,
  getClassTeacherStudentLeaves,
  manageStudentLeaveByClassTeacher,
  getClassSubjectTeachers,
  assignSubjectTeacherToClass,
  removeSubjectTeacherAssignment,
} from '../controllers/teacherController.js';

const router = express.Router();

// ==========================================
// PRINCIPAL TEACHER MANAGEMENT ROUTES
// ==========================================
router.post('/principal/teachers', authenticate, authorizeRoles('principal'), createTeacher);
router.get('/principal/teachers', authenticate, authorizeRoles('principal'), getTeachers);
router.get('/principal/teachers/leaves', authenticate, authorizeRoles('principal'), getSchoolLeaveRequests);
router.patch('/principal/teachers/leave/:leaveId', authenticate, authorizeRoles('principal'), manageLeaveRequest);
router.get('/principal/teachers/:id', authenticate, authorizeRoles('principal'), getTeacherById);
router.put('/principal/teachers/:id', authenticate, authorizeRoles('principal'), updateTeacher);
router.delete('/principal/teachers/:id', authenticate, authorizeRoles('principal'), deleteTeacher);
router.patch('/principal/teachers/:id/status', authenticate, authorizeRoles('principal'), toggleTeacherStatus);
router.post('/principal/teachers/:id/reset-password', authenticate, authorizeRoles('principal'), resetTeacherPassword);
router.patch('/principal/teachers/:id/login-id', authenticate, authorizeRoles('principal'), changeTeacherLoginId);
router.post('/principal/teachers/:id/salary', authenticate, authorizeRoles('principal'), addTeacherSalaryRecord);

// ==========================================
// TEACHER PORTAL SELF ROUTES
// ==========================================
router.get('/teacher/me', authenticate, authorizeRoles('teacher'), getTeacherSelfProfile);
router.get('/teacher/leaves', authenticate, authorizeRoles('teacher'), getTeacherSelfLeaves);
router.post('/teacher/leaves', authenticate, authorizeRoles('teacher'), applyTeacherLeave);

// Student Leave Management for Class Teachers
router.get('/teacher/student-leaves', authenticate, authorizeRoles('teacher'), getClassTeacherStudentLeaves);
router.patch('/teacher/student-leaves/:leaveId', authenticate, authorizeRoles('teacher'), manageStudentLeaveByClassTeacher);

// Subject Teacher Management for Class Teachers
router.get('/teacher/subject-teachers', authenticate, authorizeRoles('teacher'), getClassSubjectTeachers);
router.post('/teacher/subject-teachers', authenticate, authorizeRoles('teacher'), assignSubjectTeacherToClass);
router.delete('/teacher/subject-teachers/:assignmentId', authenticate, authorizeRoles('teacher'), removeSubjectTeacherAssignment);

// Aliases matching frontend variations
router.get('/teacher/leave/requests', authenticate, authorizeRoles('teacher'), getTeacherSelfLeaves);
router.post('/teacher/leave/requests', authenticate, authorizeRoles('teacher'), applyTeacherLeave);

import {
  getStudentSubjectRemarks,
  createOrUpdateSubjectRemark,
} from '../controllers/subjectRemarkController.js';

// Subject Academic Remarks for Teachers
router.get('/teacher/students/:studentId/remarks', authenticate, authorizeRoles('teacher'), getStudentSubjectRemarks);
router.post('/teacher/students/:studentId/remarks', authenticate, authorizeRoles('teacher'), createOrUpdateSubjectRemark);

export default router;
