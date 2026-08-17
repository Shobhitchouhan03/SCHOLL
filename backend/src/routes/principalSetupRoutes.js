import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getSetupStatus,
  updateSchoolProfile,
  saveAcademicSession,
  saveClassesBulk,
  saveSectionsBulk,
  saveSubjectsBulk,
  saveSchoolConfiguration,
  completeSetup,
  getAcademicSessions,
  getClasses,
  getSections,
  getSubjects,
  getConfiguration,
} from '../controllers/academicStructureController.js';

const router = express.Router();

// Setup Wizard endpoints (Strictly Principal only)
router.get('/setup/status', authenticate, authorizeRoles('principal'), getSetupStatus);
router.patch('/setup/school-profile', authenticate, authorizeRoles('principal'), updateSchoolProfile);
router.post('/setup/academic-session', authenticate, authorizeRoles('principal'), saveAcademicSession);
router.post('/setup/classes/bulk', authenticate, authorizeRoles('principal'), saveClassesBulk);
router.post('/setup/sections/bulk', authenticate, authorizeRoles('principal'), saveSectionsBulk);
router.post('/setup/subjects/bulk', authenticate, authorizeRoles('principal'), saveSubjectsBulk);
router.patch('/setup/configuration', authenticate, authorizeRoles('principal'), saveSchoolConfiguration);
router.post('/setup/complete', authenticate, authorizeRoles('principal'), completeSetup);

// Supporting Read-Only Reference endpoints (Accessible by school staff)
const allowedStaffRoles = ['principal', 'teacher', 'accountant', 'admin', 'hr'];
router.get('/academic-sessions', authenticate, authorizeRoles(...allowedStaffRoles), getAcademicSessions);
router.get('/setup/academic-sessions', authenticate, authorizeRoles(...allowedStaffRoles), getAcademicSessions);
router.get('/classes', authenticate, authorizeRoles(...allowedStaffRoles), getClasses);
router.get('/sections', authenticate, authorizeRoles(...allowedStaffRoles), getSections);
router.get('/subjects', authenticate, authorizeRoles(...allowedStaffRoles), getSubjects);
router.get('/configuration', authenticate, authorizeRoles(...allowedStaffRoles), getConfiguration);

export default router;
