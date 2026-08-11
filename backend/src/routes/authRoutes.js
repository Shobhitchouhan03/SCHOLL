import express from 'express';
import {
  superAdminLogin,
  schoolUserLogin,
  refreshToken,
  logout,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/super-admin/login', superAdminLogin);
router.post('/school/login', schoolUserLogin);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

export default router;
