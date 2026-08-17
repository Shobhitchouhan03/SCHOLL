import express from 'express';
import {
  createSchool,
  getAllSchools,
  getSchoolById,
  getSchoolDependentCounts,
  getBulkDependentCounts,
  deleteSchool,
  bulkDeleteSchools,
  archiveSchool,
  bulkArchiveSchools,
  updateSchoolModules,
  updateSchoolSubscription,
  toggleSchoolStatus,
  resetPrincipalPassword,
  getPlatformStats,
  addCustomDomain,
  removeCustomDomain,
  updateDomainStatus,
  updateSubdomain,
} from '../controllers/superAdminController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSuperAdmin);

router.route('/schools')
  .post(createSchool)
  .get(getAllSchools);

// Bulk actions
router.post('/schools/bulk-delete', bulkDeleteSchools);
router.post('/schools/bulk-archive', bulkArchiveSchools);
router.post('/schools/bulk-dependent-counts', getBulkDependentCounts);

router.route('/schools/:id')
  .get(getSchoolById)
  .delete(deleteSchool);

router.get('/schools/:id/dependent-counts', getSchoolDependentCounts);
router.post('/schools/:id/archive', archiveSchool);
router.patch('/schools/:id/modules', updateSchoolModules);
router.patch('/schools/:id/subscription', updateSchoolSubscription);
router.patch('/schools/:id/status', toggleSchoolStatus);
router.post('/schools/:id/reset-principal-password', resetPrincipalPassword);

// Custom Domain & Subdomain Management Routes
router.post('/schools/:id/domains', addCustomDomain);
router.delete('/schools/:id/domains/:domainName', removeCustomDomain);
router.patch('/schools/:id/domains/:domainName/status', updateDomainStatus);
router.patch('/schools/:id/subdomain', updateSubdomain);

router.get('/stats', getPlatformStats);

export default router;

