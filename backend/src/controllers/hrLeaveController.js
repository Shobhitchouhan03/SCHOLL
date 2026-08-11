import { LeaveType } from '../models/LeaveType.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { Teacher } from '../models/Teacher.js';
import { AuditLog } from '../models/AuditLog.js';
import { getTenantSchoolId, resolveTeacherProfile } from '../utils/teacherResolver.js';

// ==========================================
// LEAVE TYPE CONTROLLERS
// ==========================================

export const createLeaveType = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, code, annualAllowance, paid, carryForwardAllowed, maximumCarryForward, requiresDocument } = req.body;

    if (!name || !code || annualAllowance === undefined) {
      return res.status(400).json({ success: false, message: 'Name, code, and annual allowance are required.' });
    }

    const existingCode = await LeaveType.findOne({ schoolId, code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Leave type code already exists.' });
    }

    const leaveType = await LeaveType.create({
      schoolId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      annualAllowance: Number(annualAllowance),
      paid: paid !== false,
      carryForwardAllowed: Boolean(carryForwardAllowed),
      maximumCarryForward: Number(maximumCarryForward || 0),
      requiresDocument: Boolean(requiresDocument),
    });

    return res.status(201).json({ success: true, message: 'Leave type created successfully.', leaveType });
  } catch (error) {
    console.error('Create leave type error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create leave type.' });
  }
};

export const getLeaveTypes = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const leaveTypes = await LeaveType.find({ schoolId, isActive: true }).sort({ name: 1 });
    return res.status(200).json({ success: true, leaveTypes });
  } catch (error) {
    console.error('Get leave types error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave types.' });
  }
};

// ==========================================
// LEAVE REQUEST CONTROLLERS
// ==========================================

export const submitTeacherLeaveRequest = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await resolveTeacherProfile(req);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const { leaveTypeId, startDate, endDate, reason, documentUrl } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date.' });
    }

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping pending or approved leave requests
    const overlap = await LeaveRequest.findOne({
      schoolId,
      teacherId: teacher._id,
      status: { $in: ['pending', 'approved'] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (overlap) {
      return res.status(409).json({ success: false, message: 'You already have an active leave request overlapping these dates.' });
    }

    let targetLeaveType = null;
    if (leaveTypeId) {
      targetLeaveType = await LeaveType.findOne({ _id: leaveTypeId, schoolId });
    }

    // Check leave balance if leaveType is provided
    if (targetLeaveType) {
      const currentYear = new Date().getFullYear();
      let balance = await LeaveBalance.findOne({
        schoolId,
        teacherId: teacher._id,
        leaveTypeId: targetLeaveType._id,
        year: currentYear,
      });

      if (!balance) {
        balance = await LeaveBalance.create({
          schoolId,
          teacherId: teacher._id,
          leaveTypeId: targetLeaveType._id,
          year: currentYear,
          annualAllowance: targetLeaveType.annualAllowance,
          available: targetLeaveType.annualAllowance,
        });
      }

      if (balance.available < totalDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Requested ${totalDays} days, available ${balance.available} days.`,
        });
      }
    }

    const validEnumTypes = ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'other'];
    const mappedType = targetLeaveType && validEnumTypes.includes(targetLeaveType.code.toLowerCase())
      ? targetLeaveType.code.toLowerCase()
      : 'casual';

    const request = await LeaveRequest.create({
      schoolId,
      teacherId: teacher._id,
      leaveTypeId: targetLeaveType ? targetLeaveType._id : undefined,
      leaveType: mappedType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      documentUrl: documentUrl || '',
      status: 'pending',
    });

    return res.status(201).json({ success: true, message: 'Leave request submitted successfully.', request });
  } catch (error) {
    console.error('Submit leave request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.' });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { requestId } = req.params;
    const { reviewRemark } = req.body;

    const request = await LeaveRequest.findOne({ _id: requestId, schoolId });
    if (!request) return res.status(404).json({ success: false, message: 'Leave request not found.' });

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewRemark = reviewRemark || 'Approved by Principal';
    await request.save();

    // Deduct from Leave Balance if leaveTypeId is present
    if (request.leaveTypeId) {
      const currentYear = new Date().getFullYear();
      const balance = await LeaveBalance.findOne({
        schoolId,
        teacherId: request.teacherId,
        leaveTypeId: request.leaveTypeId,
        year: currentYear,
      });

      if (balance) {
        balance.used += request.totalDays;
        balance.available = Math.max(0, balance.available - request.totalDays);
        await balance.save();
      }
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'APPROVE_LEAVE_REQUEST',
      entity: 'LeaveRequest',
      description: `Approved leave request for ${request.totalDays} days.`,
    });

    return res.status(200).json({ success: true, message: 'Leave request approved.', request });
  } catch (error) {
    console.error('Approve leave request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to approve leave request.' });
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { requestId } = req.params;
    const { reviewRemark } = req.body;

    const request = await LeaveRequest.findOne({ _id: requestId, schoolId });
    if (!request) return res.status(404).json({ success: false, message: 'Leave request not found.' });

    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewRemark = reviewRemark || 'Rejected by Principal';
    await request.save();

    return res.status(200).json({ success: true, message: 'Leave request rejected.', request });
  } catch (error) {
    console.error('Reject leave request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject leave request.' });
  }
};

export const cancelTeacherLeaveRequest = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { requestId } = req.params;

    const teacher = await resolveTeacherProfile(req);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const request = await LeaveRequest.findOne({ _id: requestId, schoolId, teacherId: teacher._id });
    if (!request) return res.status(404).json({ success: false, message: 'Leave request not found.' });

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled.' });
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();

    return res.status(200).json({ success: true, message: 'Leave request cancelled.', request });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel leave request.' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    let query = { schoolId };
    if (req.user.role === 'teacher') {
      const teacher = await resolveTeacherProfile(req);
      if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
      query.teacherId = teacher._id;
    }

    const requests = await LeaveRequest.find(query)
      .populate('teacherId', 'fullName name employeeId department')
      .populate('leaveTypeId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests.' });
  }
};

export const getTeacherLeaveBalance = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await resolveTeacherProfile(req);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const leaveTypes = await LeaveType.find({ schoolId, isActive: true });
    const currentYear = new Date().getFullYear();

    const balances = [];
    for (const lt of leaveTypes) {
      let bal = await LeaveBalance.findOne({ schoolId, teacherId: teacher._id, leaveTypeId: lt._id, year: currentYear });
      if (!bal) {
        bal = await LeaveBalance.create({
          schoolId,
          teacherId: teacher._id,
          leaveTypeId: lt._id,
          year: currentYear,
          openingBalance: lt.annualAllowance,
          available: lt.annualAllowance,
        });
      }
      balances.push({ leaveType: lt, balance: bal });
    }

    return res.status(200).json({ success: true, balances });
  } catch (error) {
    console.error('Get teacher leave balance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave balances.' });
  }
};
