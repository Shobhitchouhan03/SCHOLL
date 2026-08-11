import { SalaryStructure } from '../models/SalaryStructure.js';
import { PayrollRun } from '../models/PayrollRun.js';
import { PayrollRecord } from '../models/PayrollRecord.js';
import { PayrollAdjustment } from '../models/PayrollAdjustment.js';
import { Teacher } from '../models/Teacher.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { AuditLog } from '../models/AuditLog.js';
import { PayrollCalculationService } from '../services/PayrollCalculationService.js';
import { FeeCalculationService } from '../services/FeeCalculationService.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// SALARY STRUCTURE CONTROLLERS
// ==========================================

export const createSalaryStructure = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { teacherId, academicSessionId, effectiveFrom, baseSalary, allowances, deductions, overtimeRate } = req.body;

    if (!teacherId || !academicSessionId || !effectiveFrom || baseSalary === undefined) {
      return res.status(400).json({ success: false, message: 'Teacher, academic session, effective date, and base salary are required.' });
    }

    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    // Mark previous active structure for this teacher as superseded
    await SalaryStructure.updateMany(
      { schoolId, teacherId, status: 'active' },
      { $set: { status: 'superseded', effectiveTo: new Date(effectiveFrom) } }
    );

    const baseSalaryMinor = FeeCalculationService.toMinorUnits(baseSalary);
    const allowancesList = (allowances || []).map((a) => ({
      name: a.name,
      amountMinor: FeeCalculationService.toMinorUnits(a.amount || a.amountMinor),
      taxable: a.taxable !== false,
    }));
    const deductionsList = (deductions || []).map((d) => ({
      name: d.name,
      amountMinor: FeeCalculationService.toMinorUnits(d.amount || d.amountMinor),
      deductionType: d.deductionType || 'other',
    }));

    const structure = await SalaryStructure.create({
      schoolId,
      teacherId,
      academicSessionId,
      effectiveFrom: new Date(effectiveFrom),
      baseSalaryMinor,
      allowances: allowancesList,
      deductions: deductionsList,
      overtimeRateMinor: FeeCalculationService.toMinorUnits(overtimeRate || 0),
      status: 'active',
      createdBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_SALARY_STRUCTURE',
      entity: 'SalaryStructure',
      description: `Created salary structure for teacher ${teacher.fullName} (Base: ₹${baseSalary}).`,
    });

    return res.status(201).json({ success: true, message: 'Salary structure created successfully.', structure });
  } catch (error) {
    console.error('Create salary structure error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create salary structure.' });
  }
};

export const getSalaryStructures = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const structures = await SalaryStructure.find({ schoolId, status: 'active' })
      .populate('teacherId', 'fullName employeeId designation department')
      .populate('academicSessionId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, structures });
  } catch (error) {
    console.error('Get salary structures error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch salary structures.' });
  }
};

// ==========================================
// PAYROLL RUN CONTROLLERS
// ==========================================

export const generatePayrollRun = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required.' });
    }

    const existingRun = await PayrollRun.findOne({ schoolId, month: Number(month), year: Number(year) });
    if (existingRun) {
      return res.status(409).json({ success: false, message: `Payroll run for ${month}/${year} already exists.` });
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    const payrollRun = await PayrollRun.create({
      schoolId,
      month: Number(month),
      year: Number(year),
      periodStart,
      periodEnd,
      status: 'draft',
      generatedBy: req.user._id,
    });

    // Fetch active teachers & salary structures
    const teachers = await Teacher.find({ schoolId });
    const monthName = periodStart.toLocaleString('default', { month: 'long' });

    for (const teacher of teachers) {
      const structure = await SalaryStructure.findOne({ schoolId, teacherId: teacher._id, status: 'active' });
      if (!structure) continue;

      // Count unpaid leave days in this period
      const unpaidLeaves = await LeaveRequest.find({
        schoolId,
        teacherId: teacher._id,
        status: 'approved',
        leaveType: 'unpaid',
        startDate: { $gte: periodStart, $lte: periodEnd },
      });

      const unpaidLeaveDays = unpaidLeaves.reduce((acc, l) => acc + (l.totalDays || 1), 0);

      const calc = PayrollCalculationService.calculateTeacherPayroll({
        salaryStructure: structure,
        unpaidLeaveDays,
        workingDaysInMonth: 30,
      });

      await PayrollRecord.create({
        schoolId,
        payrollRunId: payrollRun._id,
        teacherId: teacher._id,
        salaryStructureId: structure._id,
        baseSalaryMinor: calc.baseSalaryMinor,
        allowancesMinor: calc.allowancesMinor,
        deductionsMinor: calc.deductionsMinor,
        leaveDeductionMinor: calc.leaveDeductionMinor,
        overtimeMinor: 0,
        bonusMinor: 0,
        grossSalaryMinor: calc.grossSalaryMinor,
        netSalaryMinor: calc.netSalaryMinor,
        paymentStatus: 'pending',
        snapshot: {
          teacherName: teacher.name || teacher.fullName || 'Teacher',
          employeeId: teacher.employeeId || 'EMP',
          designation: teacher.designation || 'Teacher',
          department: teacher.department || 'Academics',
          monthName,
          year: Number(year),
          baseSalaryRupees: calc.baseSalaryRupees,
          grossSalaryRupees: calc.grossSalaryRupees,
          netSalaryRupees: calc.netSalaryRupees,
        },
      });
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'GENERATE_PAYROLL_RUN',
      entity: 'PayrollRun',
      description: `Generated payroll run for ${monthName} ${year}.`,
    });

    return res.status(201).json({ success: true, message: 'Payroll run generated successfully.', payrollRun });
  } catch (error) {
    console.error('Generate payroll run error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate payroll run.' });
  }
};

export const calculatePayrollRun = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { runId } = req.params;

    const payrollRun = await PayrollRun.findOne({ _id: runId, schoolId });
    if (!payrollRun) return res.status(404).json({ success: false, message: 'Payroll run not found.' });

    if (payrollRun.status === 'locked') {
      return res.status(400).json({ success: false, message: 'Locked payroll run cannot be recalculated.' });
    }

    const records = await PayrollRecord.find({ schoolId, payrollRunId: runId });
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    records.forEach((r) => {
      totalGross += r.grossSalaryMinor;
      totalDeductions += r.deductionsMinor + r.leaveDeductionMinor;
      totalNet += r.netSalaryMinor;
    });

    payrollRun.totalGrossMinor = totalGross;
    payrollRun.totalDeductionsMinor = totalDeductions;
    payrollRun.totalNetMinor = totalNet;
    payrollRun.status = 'calculated';
    await payrollRun.save();

    return res.status(200).json({ success: true, message: 'Payroll run calculated successfully.', payrollRun });
  } catch (error) {
    console.error('Calculate payroll run error:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate payroll run.' });
  }
};

export const approvePayrollRun = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { runId } = req.params;

    const payrollRun = await PayrollRun.findOne({ _id: runId, schoolId });
    if (!payrollRun) return res.status(404).json({ success: false, message: 'Payroll run not found.' });

    payrollRun.status = 'approved';
    payrollRun.approvedBy = req.user._id;
    await payrollRun.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'APPROVE_PAYROLL_RUN',
      entity: 'PayrollRun',
      description: `Approved payroll run for period ${payrollRun.month}/${payrollRun.year}.`,
    });

    return res.status(200).json({ success: true, message: 'Payroll run approved.', payrollRun });
  } catch (error) {
    console.error('Approve payroll run error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve payroll run.' });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { runId } = req.params;

    const payrollRun = await PayrollRun.findOne({ _id: runId, schoolId });
    if (!payrollRun) return res.status(404).json({ success: false, message: 'Payroll run not found.' });

    payrollRun.status = 'paid';
    payrollRun.paidBy = req.user._id;
    await payrollRun.save();

    await PayrollRecord.updateMany(
      { schoolId, payrollRunId: runId, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'paid', paymentDate: new Date() } }
    );

    return res.status(200).json({ success: true, message: 'Payroll marked as paid.', payrollRun });
  } catch (error) {
    console.error('Mark payroll paid error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark payroll paid.' });
  }
};

export const lockPayrollRun = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { runId } = req.params;

    const payrollRun = await PayrollRun.findOne({ _id: runId, schoolId });
    if (!payrollRun) return res.status(404).json({ success: false, message: 'Payroll run not found.' });

    payrollRun.status = 'locked';
    await payrollRun.save();

    return res.status(200).json({ success: true, message: 'Payroll run locked permanently.', payrollRun });
  } catch (error) {
    console.error('Lock payroll run error:', error);
    return res.status(500).json({ success: false, message: 'Failed to lock payroll run.' });
  }
};

export const getPayrollRuns = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const runs = await PayrollRun.find({ schoolId }).sort({ year: -1, month: -1 });
    return res.status(200).json({ success: true, runs });
  } catch (error) {
    console.error('Get payroll runs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll runs.' });
  }
};

export const getPayrollRecordsForRun = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { runId } = req.params;

    const records = await PayrollRecord.find({ schoolId, payrollRunId: runId })
      .populate('teacherId', 'fullName employeeId designation department')
      .sort({ 'snapshot.teacherName': 1 });

    return res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('Get payroll records error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll records.' });
  }
};

// ==========================================
// TEACHER PAYROLL CONTROLLERS
// ==========================================

export const getTeacherPayrollHistory = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    const teacher = await Teacher.findOne({
      schoolId,
      $or: [{ userId: req.user._id }, { _id: req.user.teacherId || req.user._id }],
    });
    const targetTeacherId = teacher ? teacher._id : (req.user.teacherId || req.user._id);

    const records = await PayrollRecord.find({ schoolId, teacherId: targetTeacherId })
      .populate('payrollRunId', 'month year status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('Get teacher payroll history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch payslips.' });
  }
};

export const getTeacherSalaryStructure = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await Teacher.findOne({
      schoolId,
      $or: [{ userId: req.user._id }, { _id: req.user.teacherId || req.user._id }],
    });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const structure = await SalaryStructure.findOne({ schoolId, teacherId: teacher._id, status: 'active' });
    return res.status(200).json({ success: true, structure });
  } catch (error) {
    console.error('Get teacher salary structure error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch salary structure.' });
  }
};
