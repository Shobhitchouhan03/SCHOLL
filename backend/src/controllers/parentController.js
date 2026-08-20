import { ParentProfile } from '../models/ParentProfile.js';
import { Student } from '../models/Student.js';
import { StudentAttendance } from '../models/StudentAttendance.js';
import { Homework } from '../models/Homework.js';
import { Exam } from '../models/Exam.js';
import { Result } from '../models/Result.js';
import { FeeInvoice } from '../models/FeeInvoice.js';
import { FeePayment } from '../models/FeePayment.js';
import { FeeReceipt } from '../models/FeeReceipt.js';
import { StudentLeave } from '../models/StudentLeave.js';
import { Notice } from '../models/Notice.js';
import { AcademicSession } from '../models/AcademicSession.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// Helper: Verify Parent Ownership & Child Linkage
const verifyParentChildLink = async (req, studentId) => {
  const schoolId = getTenantSchoolId(req);
  const userId = req.user._id;

  const parentProfile = await ParentProfile.findOne({ userId, schoolId });
  if (!parentProfile) {
    return { error: 'Parent profile record not found.', status: 404 };
  }

  const isLinked = (parentProfile.linkedStudentIds || []).some(
    (id) => String(id) === String(studentId)
  );
  if (!isLinked) {
    return { error: 'Access denied. Student is not linked to your family account.', status: 403 };
  }

  const student = await Student.findOne({ _id: studentId, schoolId })
    .populate('currentAcademicSessionId', 'name')
    .populate('currentClassId', 'name displayName category')
    .populate('currentSectionId', 'name roomNumber');

  if (!student) {
    return { error: 'Student record not found.', status: 404 };
  }

  return { parentProfile, student, schoolId };
};

// @desc    Get Logged-In Parent Profile & Linked Children List
// @route   GET /api/parent/me
// @access  Private (Parent)
export const getParentSelfProfile = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;

    const parentProfile = await ParentProfile.findOne({ userId, schoolId }).populate({
      path: 'linkedStudentIds',
      populate: [
        { path: 'currentAcademicSessionId', select: 'name' },
        { path: 'currentClassId', select: 'name displayName' },
        { path: 'currentSectionId', select: 'name roomNumber' },
      ],
    });

    if (!parentProfile) {
      return res.status(404).json({ success: false, message: 'Parent profile record not found.' });
    }

    return res.status(200).json({
      success: true,
      family: parentProfile,
      children: parentProfile.linkedStudentIds || [],
    });
  } catch (error) {
    console.error('Get parent self profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch parent profile.' });
  }
};

// @desc    Get Selected Linked Child's Profile
// @route   GET /api/parent/children/:studentId
// @access  Private (Parent)
export const getChildProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    return res.status(200).json({
      success: true,
      child: authCheck.student,
    });
  } catch (error) {
    console.error('Get child profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child profile.' });
  }
};

// @desc    Update Parent Self Contact Details
// @route   PATCH /api/parent/profile
// @access  Private (Parent)
export const updateParentSelfProfile = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { primaryGuardian, secondaryGuardian, address, preferredLanguage } = req.body;

    const parentProfile = await ParentProfile.findOne({ userId, schoolId });
    if (!parentProfile) {
      return res.status(404).json({ success: false, message: 'Parent profile not found.' });
    }

    if (primaryGuardian) {
      if (primaryGuardian.phone) parentProfile.primaryGuardian.phone = primaryGuardian.phone.trim();
      if (primaryGuardian.whatsapp) parentProfile.primaryGuardian.whatsapp = primaryGuardian.whatsapp.trim();
      if (primaryGuardian.email) parentProfile.primaryGuardian.email = primaryGuardian.email.toLowerCase().trim();
      if (primaryGuardian.occupation) parentProfile.primaryGuardian.occupation = primaryGuardian.occupation.trim();
    }

    if (secondaryGuardian) {
      if (secondaryGuardian.phone) parentProfile.secondaryGuardian.phone = secondaryGuardian.phone.trim();
      if (secondaryGuardian.email) parentProfile.secondaryGuardian.email = secondaryGuardian.email.toLowerCase().trim();
    }

    if (address) parentProfile.address = { ...parentProfile.address, ...address };
    if (preferredLanguage) parentProfile.preferredLanguage = preferredLanguage;

    await parentProfile.save();

    return res.status(200).json({
      success: true,
      message: 'Family contact details updated successfully.',
      family: parentProfile,
    });
  } catch (error) {
    console.error('Update parent profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update contact details.' });
  }
};

// @desc    Get Selected Child's Live Dashboard Metrics Overview
// @route   GET /api/parent/children/:studentId/dashboard
// @access  Private (Parent)
export const getChildDashboardOverview = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;

    // 1. Attendance Metrics
    const attendanceRecords = await StudentAttendance.find({ schoolId, studentId: student._id });
    const totalMarkedDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'present').length;
    const absentDays = attendanceRecords.filter((a) => a.status === 'absent').length;
    const leaveDays = attendanceRecords.filter((a) => a.status === 'leave').length;
    const lateDays = attendanceRecords.filter((a) => a.status === 'late').length;
    const attendancePercentage = totalMarkedDays > 0
      ? Math.round(((presentDays + lateDays) / totalMarkedDays) * 100)
      : 100;

    // 2. Pending Fees & Next Due Date
    const invoices = await FeeInvoice.find({ schoolId, studentId: student._id });
    let totalPendingFeeMinor = 0;
    let nextDueDate = null;
    invoices.forEach((inv) => {
      if (inv.status !== 'paid' && inv.status !== 'cancelled') {
        const pendingAmount = (inv.finalAmountMinorUnits || 0) - (inv.paidAmountMinorUnits || 0);
        if (pendingAmount > 0) {
          totalPendingFeeMinor += pendingAmount;
          if (!nextDueDate || new Date(inv.dueDate) < new Date(nextDueDate)) {
            nextDueDate = inv.dueDate;
          }
        }
      }
    });

    // 3. Pending Homework
    const now = new Date();
    const homeworkList = await Homework.find({
      schoolId,
      classId: student.currentClassId?._id || student.currentClassId,
      sectionId: student.currentSectionId?._id || student.currentSectionId,
      status: 'published',
    }).populate('subjectId', 'name code').populate('createdBy', 'name');

    const pendingHomeworkCount = homeworkList.filter((h) => new Date(h.dueDate) >= now).length;

    // 4. Upcoming Exams
    const upcomingExams = await Exam.find({
      schoolId,
      classId: student.currentClassId?._id || student.currentClassId,
      status: 'published',
      examDate: { $gte: now },
    }).populate('subjectId', 'name').sort({ examDate: 1 }).limit(5);

    // 5. Latest Published Result
    const latestResult = await Result.findOne({
      schoolId,
      studentId: student._id,
      status: 'published',
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      metrics: {
        attendance: {
          percentage: attendancePercentage,
          totalMarkedDays,
          presentDays,
          absentDays,
          leaveDays,
          lateDays,
        },
        fees: {
          pendingAmountRupees: totalPendingFeeMinor / 100,
          pendingAmountMinorUnits: totalPendingFeeMinor,
          nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString().split('T')[0] : null,
        },
        homework: {
          pendingCount: pendingHomeworkCount,
          totalAssigned: homeworkList.length,
        },
        exams: {
          upcomingCount: upcomingExams.length,
          upcomingList: upcomingExams,
        },
        latestResult: latestResult || null,
      },
    });
  } catch (error) {
    console.error('Get child dashboard overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child dashboard metrics.' });
  }
};

// @desc    Get Selected Child's Attendance History
// @route   GET /api/parent/children/:studentId/attendance
// @access  Private (Parent)
export const getChildAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month } = req.query; // YYYY-MM
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;
    const query = { schoolId, studentId: student._id };

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const yearNum = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10) - 1;
      const startDate = new Date(Date.UTC(yearNum, monthNum, 1));
      const endDate = new Date(Date.UTC(yearNum, monthNum + 1, 0, 23, 59, 59));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await StudentAttendance.find(query).sort({ date: -1 });

    const totalMarked = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const leave = records.filter((r) => r.status === 'leave').length;
    const percentage = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 100;

    return res.status(200).json({
      success: true,
      student,
      summary: {
        totalMarked,
        present,
        absent,
        late,
        leave,
        percentage,
      },
      records,
    });
  } catch (error) {
    console.error('Get child attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child attendance.' });
  }
};

// @desc    Get Selected Child's Published Homework Roster
// @route   GET /api/parent/children/:studentId/homework
// @access  Private (Parent)
export const getChildHomework = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;

    const homeworkList = await Homework.find({
      schoolId,
      classId: student.currentClassId?._id || student.currentClassId,
      sectionId: student.currentSectionId?._id || student.currentSectionId,
      status: 'published',
    })
      .populate('subjectId', 'name code')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      student,
      homework: homeworkList,
    });
  } catch (error) {
    console.error('Get child homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child homework.' });
  }
};

// @desc    Get Selected Child's Upcoming Exams & Schedules
// @route   GET /api/parent/children/:studentId/exams
// @access  Private (Parent)
export const getChildExams = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;

    const exams = await Exam.find({
      schoolId,
      classId: student.currentClassId?._id || student.currentClassId,
      status: 'published',
    })
      .populate('subjectId', 'name code')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      student,
      exams,
    });
  } catch (error) {
    console.error('Get child exams error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child exams.' });
  }
};

// @desc    Get Selected Child's Published Exam Results
// @route   GET /api/parent/children/:studentId/results
// @access  Private (Parent)
export const getChildResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;

    const results = await Result.find({
      schoolId,
      studentId: student._id,
      $or: [{ isPublished: true }, { status: 'published' }],
    })
      .populate('examId', 'name code examType startDate')
      .sort({ generatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      results,
    });
  } catch (error) {
    console.error('Get child results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child results.' });
  }
};

// @desc    Get Selected Child's Report Card (Current & Historical)
// @route   GET /api/parent/children/:studentId/report-card
// @access  Private (Parent)
export const getChildReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { sessionId } = req.query;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;
    const targetSessionId = sessionId || (student.currentAcademicSessionId?._id || student.currentAcademicSessionId);

    const availableSessions = await AcademicSession.find({ schoolId }).sort({ startDate: -1 });

    const results = await Result.find({
      schoolId,
      studentId: student._id,
      status: 'published',
      ...(targetSessionId && { academicSessionId: targetSessionId }),
    }).populate('subjectId', 'name code');

    // Aggregate marks
    let totalObtained = 0;
    let totalMax = 0;
    const subjectBreakdown = results.map((r) => {
      totalObtained += r.marksObtained || 0;
      totalMax += r.maxMarks || 100;
      return {
        subject: r.subjectId?.name || 'Subject',
        code: r.subjectId?.code || '',
        marksObtained: r.marksObtained,
        maxMarks: r.maxMarks,
        passingMarks: r.passingMarks,
        grade: r.grade || 'A',
        isPassed: r.marksObtained >= r.passingMarks,
        remarks: r.remarks || '',
      };
    });

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else if (percentage >= 40) overallGrade = 'D';

    const attendanceRecords = await StudentAttendance.find({ schoolId, studentId: student._id });
    const attendanceSummary = {
      totalMarked: attendanceRecords.length,
      present: attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length,
      percentage: attendanceRecords.length > 0
        ? Math.round(((attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length) / attendanceRecords.length) * 100)
        : 100,
    };

    return res.status(200).json({
      success: true,
      student,
      targetSessionId,
      availableSessions,
      reportCard: {
        totalObtained,
        totalMax,
        percentage,
        overallGrade,
        subjectBreakdown,
        attendanceSummary,
        promotionStatus: percentage >= 40 ? 'Promoted' : 'Needs Improvement',
        teacherRemarks: percentage >= 80 ? 'Excellent academic performance!' : 'Regular effort required.',
      },
    });
  } catch (error) {
    console.error('Get child report card error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child report card.' });
  }
};

// @desc    Get Selected Child's Financial Ledger (Invoices, Receipts, Payments)
// @route   GET /api/parent/children/:studentId/fees
// @access  Private (Parent)
export const getChildFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;

    const invoices = await FeeInvoice.find({ schoolId, studentId: student._id }).sort({ createdAt: -1 });
    const payments = await FeePayment.find({ schoolId, studentId: student._id }).sort({ createdAt: -1 });
    const receipts = await FeeReceipt.find({ schoolId, studentId: student._id }).sort({ createdAt: -1 });

    let totalAssignedMinor = 0;
    let totalDiscountMinor = 0;
    let totalPaidMinor = 0;
    let totalPendingMinor = 0;
    let nextDueDate = null;

    invoices.forEach((inv) => {
      totalAssignedMinor += inv.totalAmountMinorUnits || 0;
      totalDiscountMinor += inv.discountAmountMinorUnits || 0;
      totalPaidMinor += inv.paidAmountMinorUnits || 0;
      if (inv.status !== 'paid' && inv.status !== 'cancelled') {
        const pending = (inv.finalAmountMinorUnits || 0) - (inv.paidAmountMinorUnits || 0);
        if (pending > 0) {
          totalPendingMinor += pending;
          if (!nextDueDate || new Date(inv.dueDate) < new Date(nextDueDate)) {
            nextDueDate = inv.dueDate;
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      student,
      summary: {
        totalAssignedRupees: totalAssignedMinor / 100,
        totalDiscountRupees: totalDiscountMinor / 100,
        totalPaidRupees: totalPaidMinor / 100,
        totalPendingRupees: totalPendingMinor / 100,
        nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString().split('T')[0] : null,
      },
      invoices,
      payments,
      receipts,
    });
  } catch (error) {
    console.error('Get child fees error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child fee records.' });
  }
};

// @desc    Submit Student Leave Application by Parent
// @route   POST /api/parent/children/:studentId/leave
// @access  Private (Parent)
export const submitStudentLeave = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required.' });
    }

    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, parentProfile, schoolId } = authCheck;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping active student leave requests
    const overlap = await StudentLeave.findOne({
      schoolId,
      studentId: student._id,
      status: { $in: ['pending', 'approved'] },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (overlap) {
      return res.status(409).json({ success: false, message: 'An active leave request already exists overlapping these dates.' });
    }

    const leave = await StudentLeave.create({
      schoolId,
      studentId: student._id,
      parentAccountId: parentProfile._id,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Student leave application submitted successfully for review.',
      leave,
    });
  } catch (error) {
    console.error('Submit student leave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit student leave application.' });
  }
};

// @desc    Get Student Leave Application History
// @route   GET /api/parent/children/:studentId/leave
// @access  Private (Parent)
export const getStudentLeaveHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const authCheck = await verifyParentChildLink(req, studentId);
    if (authCheck.error) {
      return res.status(authCheck.status).json({ success: false, message: authCheck.error });
    }

    const { student, schoolId } = authCheck;
    const leaves = await StudentLeave.find({ schoolId, studentId: student._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      leaves,
    });
  } catch (error) {
    console.error('Get student leave history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student leave history.' });
  }
};

// @desc    Get Targeted Notices for Parent & Student
// @route   GET /api/parent/notices
// @access  Private (Parent)
export const getChildNotices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;

    const parentProfile = await ParentProfile.findOne({ userId, schoolId }).populate('linkedStudentIds');
    if (!parentProfile) {
      return res.status(404).json({ success: false, message: 'Parent profile record not found.' });
    }

    const childrenClassIds = (parentProfile.linkedStudentIds || []).map((s) => s.currentClassId).filter(Boolean);

    const notices = await Notice.find({
      schoolId,
      status: 'published',
      targetAudience: { $in: ['all', 'parents', 'students'] },
      $or: [
        { targetClassIds: { $exists: false } },
        { targetClassIds: { $size: 0 } },
        { targetClassIds: { $in: childrenClassIds } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notices,
    });
  } catch (error) {
    console.error('Get child notices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch targeted notices.' });
  }
};
