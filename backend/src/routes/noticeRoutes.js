import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createNotice,
  getPrincipalNotices,
  archiveNotice,
  getTeacherNotices,
  getParentNotices,
  createTeacherClassAnnouncement,
  getTeacherCreatedAnnouncements,
} from '../controllers/noticeController.js';

const router = express.Router();

// PRINCIPAL NOTICE ROUTES
router.post('/principal/notices', authenticate, authorizeRoles('principal'), createNotice);
router.get('/principal/notices', authenticate, authorizeRoles('principal'), getPrincipalNotices);
router.post('/principal/notices/:noticeId/archive', authenticate, authorizeRoles('principal'), archiveNotice);

// TEACHER NOTICE & CLASS ANNOUNCEMENT ROUTES
router.get('/teacher/notices', authenticate, authorizeRoles('teacher'), getTeacherNotices);
router.get('/teacher/announcements/my', authenticate, authorizeRoles('teacher'), getTeacherCreatedAnnouncements);
router.post('/teacher/announcements', authenticate, authorizeRoles('teacher'), createTeacherClassAnnouncement);

// PARENT NOTICE ROUTES
router.get('/parent/notices', authenticate, authorizeRoles('parent'), getParentNotices);

export default router;
