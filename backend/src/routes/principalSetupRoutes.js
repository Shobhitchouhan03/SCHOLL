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

// Apply authentication & Principal role enforcement for all setup routes
router.use(authenticate, authorizeRoles('principal'));

// Setup Wizard endpoints
router.get('/setup/status', getSetupStatus);
router.patch('/setup/school-profile', updateSchoolProfile);
router.post('/setup/academic-session', saveAcademicSession);
router.post('/setup/classes/bulk', saveClassesBulk);
router.post('/setup/sections/bulk', saveSectionsBulk);
router.post('/setup/subjects/bulk', saveSubjectsBulk);
router.patch('/setup/configuration', saveSchoolConfiguration);
router.post('/setup/complete', completeSetup);

// Supporting CRUD endpoints
router.get('/academic-sessions', getAcademicSessions);
router.get('/classes', getClasses);
router.get('/sections', getSections);
router.get('/subjects', getSubjects);
router.get('/configuration', getConfiguration);

export default router;
