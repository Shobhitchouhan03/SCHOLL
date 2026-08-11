import express from 'express';
import {
  createUser,
  getSchoolUsers,
  toggleUserStatus,
  resetUserPassword,
  getSchoolStats,
  getSchoolSettings,
  updateSchoolSettings,
  getSchoolBranding,
  updateSchoolBranding,
  getStaffAttendance,
} from '../controllers/principalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantGuard } from '../middleware/tenantGuard.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(protect);
router.use(roleGuard('principal'));
router.use(tenantGuard);

router.get('/hr/staff-attendance', getStaffAttendance);

router.route('/users')
  .post(createUser)
  .get(getSchoolUsers);

router.patch('/users/:id/status', toggleUserStatus);
router.post('/users/:id/reset-password', resetUserPassword);
router.get('/stats', getSchoolStats);

router.route('/settings')
  .get(getSchoolSettings)
  .put(updateSchoolSettings);

router.route('/branding')
  .get(getSchoolBranding)
  .put(updateSchoolBranding);

export default router;
