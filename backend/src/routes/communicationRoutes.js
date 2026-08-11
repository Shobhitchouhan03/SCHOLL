import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
  getAnnouncements,
  createTeacherClassAnnouncement,
  getTeacherAnnouncements,
  getNotificationTemplates,
  updateNotificationTemplate,
  getCommunicationReports,
  getMessageLogs,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/communicationController.js';

const router = express.Router();

// PRINCIPAL COMMUNICATION ROUTES
router.post('/principal/communication/announcements', authenticate, authorizeRoles('principal'), createAnnouncement);
router.get('/principal/communication/announcements', authenticate, authorizeRoles('principal'), getAnnouncements);
router.post('/principal/communication/announcements/:id/publish', authenticate, authorizeRoles('principal'), publishAnnouncement);
router.post('/principal/communication/announcements/:id/archive', authenticate, authorizeRoles('principal'), archiveAnnouncement);

router.get('/principal/communication/templates', authenticate, authorizeRoles('principal'), getNotificationTemplates);
router.patch('/principal/communication/templates/:id', authenticate, authorizeRoles('principal'), updateNotificationTemplate);

router.get('/principal/communication/reports', authenticate, authorizeRoles('principal'), getCommunicationReports);
router.get('/principal/communication/logs', authenticate, authorizeRoles('principal'), getMessageLogs);

// TEACHER COMMUNICATION ROUTES
router.post('/teacher/communication/announcements', authenticate, authorizeRoles('teacher'), createTeacherClassAnnouncement);
router.get('/teacher/communication/announcements', authenticate, authorizeRoles('teacher'), getTeacherAnnouncements);

// USER IN-APP NOTIFICATIONS ROUTES (All Authenticated Users)
router.get('/notifications', authenticate, getUserNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);
router.post('/notifications/read-all', authenticate, markAllNotificationsRead);

export default router;
