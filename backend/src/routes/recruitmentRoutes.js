import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createJobPost,
  updateJobPostStatus,
  getJobPosts,
  getJobApplications,
  updateApplicationStatus,
  getPublicSchoolJobs,
  submitPublicJobApplication,
} from '../controllers/recruitmentController.js';

const router = express.Router();

// PRINCIPAL RECRUITMENT ROUTES
router.post('/principal/jobs', authenticate, authorizeRoles('principal'), createJobPost);
router.get('/principal/jobs', authenticate, authorizeRoles('principal'), getJobPosts);
router.patch('/principal/jobs/:jobId/status', authenticate, authorizeRoles('principal'), updateJobPostStatus);

router.get('/principal/jobs/:jobId/applications', authenticate, authorizeRoles('principal'), getJobApplications);
router.patch('/principal/applications/:applicationId/status', authenticate, authorizeRoles('principal'), updateApplicationStatus);

// PUBLIC UNAUTHENTICATED JOB ROUTES
router.get('/public/schools/:schoolCode/jobs', getPublicSchoolJobs);
router.post('/public/schools/:schoolCode/jobs/:jobId/apply', submitPublicJobApplication);

export default router;
