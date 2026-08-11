import mongoose from 'mongoose';
import { FeeCategory } from '../models/FeeCategory.js';
import { FeeStructure } from '../models/FeeStructure.js';
import { StudentFeeAssignment } from '../models/StudentFeeAssignment.js';
import { FeeInvoice } from '../models/FeeInvoice.js';
import { FeeInvoiceItem } from '../models/FeeInvoiceItem.js';
import { FeePayment } from '../models/FeePayment.js';
import { FeeReceipt } from '../models/FeeReceipt.js';
import { FeeConcession } from '../models/FeeConcession.js';
import { FeeAdjustment } from '../models/FeeAdjustment.js';
import { FeeConfiguration } from '../models/FeeConfiguration.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { School } from '../models/School.js';
import { AuditLog } from '../models/AuditLog.js';
import { FeeCalculationService } from '../services/FeeCalculationService.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// FEE CATEGORY CONTROLLERS
// ==========================================

export const createFeeCategory = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, code, description, categoryType, isRefundable, isOptional, taxApplicable } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Category name and code are required.' });
    }

    const existingCode = await FeeCategory.findOne({ schoolId, code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Fee category code already exists for this school.' });
    }

    const category = await FeeCategory.create({
      schoolId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: (description || '').trim(),
      categoryType: categoryType || 'tuition',
      isRefundable: Boolean(isRefundable),
      isOptional: Boolean(isOptional),
      taxApplicable: Boolean(taxApplicable),
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Fee category created successfully.', category });
  } catch (error) {
    console.error('Create fee category error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create fee category.' });
  }
};

export const getFeeCategories = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const categories = await FeeCategory.find({ schoolId }).sort({ name: 1 });
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Get fee categories error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fee categories.' });
  }
};

// ==========================================
// FEE STRUCTURE CONTROLLERS
// ==========================================

export const createFeeStructure = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, name, code, applicableClassIds, billingFrequency, installments } = req.body;

    if (!academicSessionId || !name || !code || !Array.isArray(installments) || installments.length === 0) {
      return res.status(400).json({ success: false, message: 'Academic session, name, code, and installments are required.' });
    }

    const existingCode = await FeeStructure.findOne({ schoolId, academicSessionId, code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Fee structure code already exists for this session.' });
    }

    let totalPaise = 0;
    installments.forEach((inst) => {
      (inst.feeItems || []).forEach((item) => {
        const itemPaise = FeeCalculationService.toMinorUnits(item.amount || 0);
        totalPaise = FeeCalculationService.addMoney(totalPaise, itemPaise);
      });
    });

    const structure = await FeeStructure.create({
      schoolId,
      academicSessionId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      applicableClassIds: Array.isArray(applicableClassIds) ? applicableClassIds : [],
      billingFrequency: billingFrequency || 'annual',
      installments,
      totalAmount: FeeCalculationService.fromMinorUnits(totalPaise),
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Fee structure created successfully.', structure });
  } catch (error) {
    console.error('Create fee structure error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create fee structure.' });
  }
};

export const getFeeStructures = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const structures = await FeeStructure.find({ schoolId })
      .populate('academicSessionId', 'name')
      .populate('applicableClassIds', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, structures });
  } catch (error) {
    console.error('Get fee structures error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch fee structures.' });
  }
};

// ==========================================
// FEE ASSIGNMENT & INVOICE CONTROLLERS
// ==========================================

export const assignFeeToStudent = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, studentId, feeStructureId } = req.body;

    if (!academicSessionId || !studentId || !feeStructureId) {
      return res.status(400).json({ success: false, message: 'Academic session, student, and fee structure are required.' });
    }

    const structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId });
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    const existingAssignment = await StudentFeeAssignment.findOne({
      schoolId,
      academicSessionId,
      studentId,
      feeStructureId,
      status: 'active',
    });

    if (existingAssignment) {
      return res.status(409).json({ success: false, message: 'Student already has an active assignment for this fee structure.' });
    }

    const assignment = await StudentFeeAssignment.create({
      schoolId,
      academicSessionId,
      studentId,
      feeStructureId,
      assignedAmount: structure.totalAmount,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Fee structure assigned to student successfully.', assignment });
  } catch (error) {
    console.error('Assign fee to student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign fee structure.' });
  }
};

export const generateInvoiceForStudent = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, studentId, feeStructureId, dueDate } = req.body;

    if (!academicSessionId || !studentId || !feeStructureId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Session, student, fee structure, and due date are required.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const structure = await FeeStructure.findOne({ _id: feeStructureId, schoolId });
    if (!structure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found.' });
    }

    const count = await FeeInvoice.countDocuments({ schoolId });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const itemsList = [];
    (structure.installments || []).forEach((inst) => {
      (inst.feeItems || []).forEach((item) => {
        const amt = Number(item.amount || 0);
        itemsList.push({
          schoolId,
          feeCategoryId: item.feeCategoryId,
          title: inst.title || 'Installment Item',
          originalAmount: amt,
          finalAmount: amt,
        });
      });
    });

    const totals = FeeCalculationService.calculateInvoiceTotals({
      items: itemsList,
      concessionAmount: 0,
      adjustmentAmount: 0,
      lateFeeAmount: 0,
      paidAmount: 0,
    });

    const invoice = await FeeInvoice.create({
      schoolId,
      academicSessionId,
      studentId: student._id,
      familyAccountId: student.parentProfileId,
      invoiceNumber,
      dueDate: new Date(dueDate),
      subtotal: totals.subtotal,
      concessionAmount: totals.concessionAmount,
      adjustmentAmount: totals.adjustmentAmount,
      lateFeeAmount: totals.lateFeeAmount,
      totalAmount: totals.totalAmount,
      paidAmount: 0,
      balanceAmount: totals.totalAmount,
      status: 'issued',
      issuedBy: req.user._id,
    });

    for (const it of itemsList) {
      it.invoiceId = invoice._id;
      await FeeInvoiceItem.create(it);
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'GENERATE_FEE_INVOICE',
      entity: 'FeeInvoice',
      description: `Generated invoice ${invoice.invoiceNumber} for student ${student.fullName}.`,
    });

    return res.status(201).json({ success: true, message: 'Invoice generated successfully.', invoice });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate invoice.' });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { status, studentId } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    const invoices = await FeeInvoice.find(query)
      .populate('studentId', 'fullName admissionNumber rollNumber')
      .populate('academicSessionId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch invoices.' });
  }
};

// ==========================================
// PAYMENT & RECEIPT CONTROLLERS
// ==========================================

export const recordFeePayment = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { invoiceId, amount, paymentMode, referenceNumber, chequeNumber, bankName, notes } = req.body;

    if (!invoiceId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invoice ID and valid positive payment amount are required.' });
    }

    const payAmtPaise = FeeCalculationService.toMinorUnits(amount);
    const payAmtRupees = FeeCalculationService.fromMinorUnits(payAmtPaise);

    const invoice = await FeeInvoice.findOne({ _id: invoiceId, schoolId }).populate('studentId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const currentBalancePaise = FeeCalculationService.toMinorUnits(invoice.balanceAmount);

    if (payAmtPaise > currentBalancePaise) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${payAmtRupees}) exceeds remaining invoice balance (₹${invoice.balanceAmount}).`,
      });
    }

    const payCount = await FeePayment.countDocuments({ schoolId });
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, '0')}`;

    const rctCount = await FeeReceipt.countDocuments({ schoolId });
    const receiptNumber = `RCT-${new Date().getFullYear()}-${String(rctCount + 1).padStart(4, '0')}`;

    const studentObj = invoice.studentId;
    const studentIdVal = studentObj._id || studentObj;
    const studentNameVal = studentObj.fullName || 'Student';
    const admissionNoVal = studentObj.admissionNumber || '';

    const payment = await FeePayment.create({
      schoolId,
      studentId: studentIdVal,
      familyAccountId: invoice.familyAccountId,
      invoiceId: invoice._id,
      paymentNumber,
      amount: payAmtRupees,
      paymentMode: paymentMode || 'cash',
      referenceNumber: referenceNumber || '',
      chequeNumber: chequeNumber || '',
      bankName: bankName || '',
      notes: notes || '',
      status: 'recorded',
      recordedBy: req.user._id,
    });

    const currentPaidPaise = FeeCalculationService.toMinorUnits(invoice.paidAmount);
    const newPaidPaise = FeeCalculationService.addMoney(currentPaidPaise, payAmtPaise);
    const newPaidRupees = FeeCalculationService.fromMinorUnits(newPaidPaise);

    FeeCalculationService.updateInvoiceBalanceAndStatus(invoice, newPaidRupees);
    await invoice.save();

    const school = await School.findById(schoolId);

    const receipt = await FeeReceipt.create({
      schoolId,
      receiptNumber,
      paymentId: payment._id,
      invoiceId: invoice._id,
      studentId: studentIdVal,
      familyAccountId: invoice.familyAccountId,
      issuedBy: req.user._id,
      snapshot: {
        schoolName: school ? school.name : 'School',
        schoolCode: school ? school.schoolCode : 'SCH',
        studentName: studentNameVal,
        admissionNumber: admissionNoVal,
        className: 'Class 10',
        sectionName: 'A',
        paymentAmount: payAmtRupees,
        paymentMode: paymentMode || 'cash',
        paymentDate: new Date(),
        invoiceNumber: invoice.invoiceNumber,
        remainingBalance: invoice.balanceAmount,
        isReversed: false,
      },
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'RECORD_FEE_PAYMENT',
      entity: 'FeePayment',
      description: `Recorded payment ${payment.paymentNumber} of ₹${payAmtRupees} for invoice ${invoice.invoiceNumber}.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully and receipt generated.',
      payment,
      receipt,
      invoice,
    });
  } catch (error) {
    console.error('Record fee payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
};

export const reverseFeePayment = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { paymentId } = req.params;
    const { reversalReason } = req.body;

    const payment = await FeePayment.findOne({ _id: paymentId, schoolId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.status === 'reversed') {
      return res.status(400).json({ success: false, message: 'Payment has already been reversed.' });
    }

    const invoice = await FeeInvoice.findOne({ _id: payment.invoiceId, schoolId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Associated invoice not found.' });
    }

    payment.status = 'reversed';
    payment.reversedBy = req.user._id;
    payment.reversedAt = new Date();
    payment.reversalReason = reversalReason || 'Payment reversed by Principal.';
    await payment.save();

    const receipt = await FeeReceipt.findOne({ paymentId: payment._id, schoolId });
    if (receipt) {
      receipt.snapshot.isReversed = true;
      await receipt.save();
    }

    const currentPaidPaise = FeeCalculationService.toMinorUnits(invoice.paidAmount);
    const payAmtPaise = FeeCalculationService.toMinorUnits(payment.amount);
    const newPaidPaise = FeeCalculationService.subtractMoney(currentPaidPaise, payAmtPaise);
    const newPaidRupees = FeeCalculationService.fromMinorUnits(newPaidPaise);

    FeeCalculationService.updateInvoiceBalanceAndStatus(invoice, newPaidRupees);
    await invoice.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'REVERSE_FEE_PAYMENT',
      entity: 'FeePayment',
      description: `Reversed payment ${payment.paymentNumber} of ₹${payment.amount}. Reason: ${payment.reversalReason}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment reversed successfully and invoice balance recalculated.',
      payment,
      invoice,
    });
  } catch (error) {
    console.error('Reverse fee payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reverse payment.' });
  }
};

export const getPayments = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const payments = await FeePayment.find({ schoolId })
      .populate('studentId', 'fullName admissionNumber')
      .populate('invoiceId', 'invoiceNumber totalAmount balanceAmount')
      .sort({ paymentDate: -1 });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
};

// ==========================================
// PARENT PORTAL FEE CONTROLLERS
// ==========================================

export const getParentChildInvoices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { studentId } = req.params;

    const parentProfile = await ParentProfile.findOne({ userId, schoolId });
    if (!parentProfile || !parentProfile.linkedStudentIds.some((id) => String(id) === String(studentId))) {
      return res.status(403).json({ success: false, message: 'Access denied. Student is not linked to your family account.' });
    }

    const invoices = await FeeInvoice.find({ schoolId, studentId, status: { $ne: 'draft' } }).sort({ invoiceDate: -1 });
    return res.status(200).json({ success: true, invoices });
  } catch (error) {
    console.error('Get parent child invoices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child invoices.' });
  }
};
