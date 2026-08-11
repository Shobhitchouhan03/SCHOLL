import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  getTransportConfiguration,
  updateTransportConfiguration,
  createVehicle,
  getVehicles,
  updateVehicleStatus,
  createStaff,
  getStaff,
  createRoute,
  getRoutes,
  addRouteStop,
  getRouteStops,
  createAssignment,
  getAssignments,
  createMaintenance,
  getMaintenanceLogs,
  createFuelLog,
  getFuelLogs,
  getTeacherRouteStudents,
  getParentChildTransport,
} from '../controllers/transportController.js';

const router = express.Router();

// PRINCIPAL TRANSPORT ROUTES
router.get('/principal/transport/configuration', authenticate, authorizeRoles('principal'), getTransportConfiguration);
router.patch('/principal/transport/configuration', authenticate, authorizeRoles('principal'), updateTransportConfiguration);

router.get('/principal/transport/vehicles', authenticate, authorizeRoles('principal'), getVehicles);
router.post('/principal/transport/vehicles', authenticate, authorizeRoles('principal'), createVehicle);
router.patch('/principal/transport/vehicles/:vehicleId/status', authenticate, authorizeRoles('principal'), updateVehicleStatus);

router.get('/principal/transport/staff', authenticate, authorizeRoles('principal'), getStaff);
router.post('/principal/transport/staff', authenticate, authorizeRoles('principal'), createStaff);

router.get('/principal/transport/routes', authenticate, authorizeRoles('principal', 'teacher'), getRoutes);
router.post('/principal/transport/routes', authenticate, authorizeRoles('principal'), createRoute);

router.get('/principal/transport/routes/:routeId/stops', authenticate, authorizeRoles('principal', 'teacher'), getRouteStops);
router.post('/principal/transport/routes/:routeId/stops', authenticate, authorizeRoles('principal'), addRouteStop);

router.get('/principal/transport/assignments', authenticate, authorizeRoles('principal'), getAssignments);
router.post('/principal/transport/assignments', authenticate, authorizeRoles('principal'), createAssignment);

router.get('/principal/transport/maintenance', authenticate, authorizeRoles('principal'), getMaintenanceLogs);
router.post('/principal/transport/maintenance', authenticate, authorizeRoles('principal'), createMaintenance);

router.get('/principal/transport/fuel-logs', authenticate, authorizeRoles('principal'), getFuelLogs);
router.post('/principal/transport/fuel-logs', authenticate, authorizeRoles('principal'), createFuelLog);

// TEACHER TRANSPORT ROUTES
router.get('/teacher/transport/routes/:routeId/students', authenticate, authorizeRoles('teacher', 'principal'), getTeacherRouteStudents);

// PARENT TRANSPORT ROUTES
router.get('/parent/children/:studentId/transport', authenticate, authorizeRoles('parent', 'principal'), getParentChildTransport);

export default router;
