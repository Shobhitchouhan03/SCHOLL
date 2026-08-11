import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  addStudentDocument,
  deleteStudent,
  getFamilies,
  getFamilyById,
  linkStudentToFamily,
  unlinkStudentFromFamily,
  resetFamilyPassword,
  toggleFamilyStatus,
} from '../controllers/studentController.js';
import {
  getParentSelfProfile,
  getChildProfile,
  updateParentSelfProfile,
} from '../controllers/parentController.js';

const router = express.Router();

// ==========================================
// PRINCIPAL STUDENT MANAGEMENT ROUTES
// ==========================================
router.post('/principal/students', authenticate, authorizeRoles('principal', 'teacher'), createStudent);
router.get('/principal/students', authenticate, authorizeRoles('principal'), getStudents);
router.get('/principal/students/:studentId', authenticate, authorizeRoles('principal'), getStudentById);
router.put('/principal/students/:studentId', authenticate, authorizeRoles('principal', 'teacher'), updateStudent);
router.patch('/principal/students/:studentId/status', authenticate, authorizeRoles('principal'), updateStudentStatus);
router.delete('/principal/students/:studentId', authenticate, authorizeRoles('principal'), deleteStudent);
router.post('/principal/students/:studentId/documents', authenticate, authorizeRoles('principal', 'teacher'), addStudentDocument);

// ==========================================
// PRINCIPAL FAMILY ACCOUNT MANAGEMENT ROUTES
// ==========================================
router.get('/principal/families', authenticate, authorizeRoles('principal'), getFamilies);
router.get('/principal/families/:familyId', authenticate, authorizeRoles('principal'), getFamilyById);
router.post('/principal/families/:familyId/link-student', authenticate, authorizeRoles('principal'), linkStudentToFamily);
router.delete('/principal/families/:familyId/unlink-student/:studentId', authenticate, authorizeRoles('principal'), unlinkStudentFromFamily);
router.post('/principal/families/:familyId/reset-password', authenticate, authorizeRoles('principal'), resetFamilyPassword);
router.patch('/principal/families/:familyId/status', authenticate, authorizeRoles('principal'), toggleFamilyStatus);

// ==========================================
// TEACHER STUDENT ROUTES (Assigned Class Scoped)
// ==========================================
router.get('/teacher/students', authenticate, authorizeRoles('teacher'), getStudents);
router.post('/teacher/students', authenticate, authorizeRoles('teacher'), createStudent);
router.get('/teacher/students/:studentId', authenticate, authorizeRoles('teacher'), getStudentById);
router.patch('/teacher/students/:studentId', authenticate, authorizeRoles('teacher'), updateStudent);

// ==========================================
// PARENT PORTAL SELF ROUTES
// ==========================================
router.get('/parent/me', authenticate, authorizeRoles('parent'), getParentSelfProfile);
router.get('/parent/children', authenticate, authorizeRoles('parent'), getParentSelfProfile);
router.get('/parent/children/:studentId', authenticate, authorizeRoles('parent'), getChildProfile);
router.patch('/parent/profile', authenticate, authorizeRoles('parent'), updateParentSelfProfile);

export default router;
