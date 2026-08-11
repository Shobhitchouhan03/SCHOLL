import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createFeeCategory,
  getFeeCategories,
  createFeeStructure,
  getFeeStructures,
  assignFeeToStudent,
  generateInvoiceForStudent,
  getInvoices,
  recordFeePayment,
  reverseFeePayment,
  getPayments,
  getParentChildInvoices,
} from '../controllers/feeController.js';

const router = express.Router();

// PRINCIPAL & ACCOUNTANT FEE SETUP & STRUCTURE ROUTES
router.post('/principal/fees/categories', authenticate, authorizeRoles('principal', 'accountant'), createFeeCategory);
router.get('/principal/fees/categories', authenticate, authorizeRoles('principal', 'accountant'), getFeeCategories);
router.post('/principal/fees/structures', authenticate, authorizeRoles('principal', 'accountant'), createFeeStructure);
router.get('/principal/fees/structures', authenticate, authorizeRoles('principal', 'accountant'), getFeeStructures);

// PRINCIPAL & ACCOUNTANT FEE ASSIGNMENT & INVOICE ROUTES
router.post('/principal/fees/assignments/student', authenticate, authorizeRoles('principal', 'accountant'), assignFeeToStudent);
router.post('/principal/fees/invoices/generate', authenticate, authorizeRoles('principal', 'accountant'), generateInvoiceForStudent);
router.get('/principal/fees/invoices', authenticate, authorizeRoles('principal', 'accountant'), getInvoices);

// PRINCIPAL & ACCOUNTANT PAYMENT & RECEIPT ROUTES
router.post('/principal/fees/payments', authenticate, authorizeRoles('principal', 'accountant'), recordFeePayment);
router.get('/principal/fees/payments', authenticate, authorizeRoles('principal', 'accountant'), getPayments);
router.post('/principal/fees/payments/:paymentId/reverse', authenticate, authorizeRoles('principal', 'accountant'), reverseFeePayment);

// PARENT FEE ROUTES
router.get('/parent/children/:studentId/invoices', authenticate, authorizeRoles('parent'), getParentChildInvoices);

export default router;
