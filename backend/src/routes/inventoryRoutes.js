import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createAssetCategory,
  getAssetCategories,
  createVendor,
  getVendors,
  createAsset,
  getAssets,
  assignAsset,
  returnAsset,
  getAssignments,
  createMaintenance,
  createConsumableItem,
  getConsumables,
  recordStockTransaction,
  getTeacherAssignedAssets,
  fileDamageReport,
} from '../controllers/inventoryController.js';

const router = express.Router();

// PRINCIPAL INVENTORY ROUTES
router.get('/principal/inventory/categories', authenticate, authorizeRoles('principal'), getAssetCategories);
router.post('/principal/inventory/categories', authenticate, authorizeRoles('principal'), createAssetCategory);

router.get('/principal/inventory/vendors', authenticate, authorizeRoles('principal'), getVendors);
router.post('/principal/inventory/vendors', authenticate, authorizeRoles('principal'), createVendor);

router.get('/principal/inventory/assets', authenticate, authorizeRoles('principal', 'teacher'), getAssets);
router.post('/principal/inventory/assets', authenticate, authorizeRoles('principal'), createAsset);

router.get('/principal/inventory/assignments', authenticate, authorizeRoles('principal'), getAssignments);
router.post('/principal/inventory/assignments', authenticate, authorizeRoles('principal'), assignAsset);
router.post('/principal/inventory/assignments/:assignmentId/return', authenticate, authorizeRoles('principal'), returnAsset);

router.post('/principal/inventory/maintenance', authenticate, authorizeRoles('principal'), createMaintenance);

router.get('/principal/inventory/consumables', authenticate, authorizeRoles('principal'), getConsumables);
router.post('/principal/inventory/consumables', authenticate, authorizeRoles('principal'), createConsumableItem);
router.post('/principal/inventory/stock-transactions', authenticate, authorizeRoles('principal'), recordStockTransaction);

// TEACHER INVENTORY ROUTES
router.get('/teacher/inventory/assigned-assets', authenticate, authorizeRoles('teacher', 'principal'), getTeacherAssignedAssets);
router.post('/teacher/inventory/damage-reports', authenticate, authorizeRoles('teacher', 'principal'), fileDamageReport);

export default router;
