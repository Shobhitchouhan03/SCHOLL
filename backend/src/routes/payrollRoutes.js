import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createSalaryStructure,
  getSalaryStructures,
  generatePayrollRun,
  getPayrollRuns,
  calculatePayrollRun,
  approvePayrollRun,
  markPayrollPaid,
  lockPayrollRun,
  getPayrollRecordsForRun,
  getTeacherPayrollHistory,
  getTeacherSalaryStructure,
} from '../controllers/payrollController.js';

const router = express.Router();

// PRINCIPAL & ACCOUNTANT PAYROLL ROUTES
router.post('/principal/payroll/structures', authenticate, authorizeRoles('principal', 'accountant'), createSalaryStructure);
router.get('/principal/payroll/structures', authenticate, authorizeRoles('principal', 'accountant'), getSalaryStructures);

router.post('/principal/payroll/runs', authenticate, authorizeRoles('principal', 'accountant'), generatePayrollRun);
router.get('/principal/payroll/runs', authenticate, authorizeRoles('principal', 'accountant'), getPayrollRuns);
router.post('/principal/payroll/runs/:runId/calculate', authenticate, authorizeRoles('principal', 'accountant'), calculatePayrollRun);
router.post('/principal/payroll/runs/:runId/approve', authenticate, authorizeRoles('principal', 'accountant'), approvePayrollRun);
router.post('/principal/payroll/runs/:runId/mark-paid', authenticate, authorizeRoles('principal', 'accountant'), markPayrollPaid);
router.post('/principal/payroll/runs/:runId/lock', authenticate, authorizeRoles('principal', 'accountant'), lockPayrollRun);
router.get('/principal/payroll/runs/:runId/records', authenticate, authorizeRoles('principal', 'accountant'), getPayrollRecordsForRun);

// TEACHER PAYROLL ROUTES
router.get('/teacher/payroll', authenticate, authorizeRoles('teacher'), getTeacherPayrollHistory);
router.get('/teacher/salary-structure', authenticate, authorizeRoles('teacher'), getTeacherSalaryStructure);

export default router;
