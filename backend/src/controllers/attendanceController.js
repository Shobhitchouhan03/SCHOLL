import mongoose from 'mongoose';
import { AttendanceSession } from '../models/AttendanceSession.js';
import { StudentAttendance } from '../models/StudentAttendance.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// Format Date helper to midnight UTC
const formatStartOfDay = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ==========================================
// TEACHER ATTENDANCE CONTROLLERS
// ==========================================

import { resolveTeacherProfile, resolveTeacherTeachingContext } from '../utils/teacherResolver.js';

// @desc    Get Teacher's Assigned Classes, Sections, and Current Session
// @route   GET /api/teacher/attendance/options
// @access  Private (Teacher)
export const getTeacherAttendanceOptions = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    const teacher = await resolveTeacherProfile(req, [
      { path: 'assignedClassIds', select: 'name displayName' },
      { path: 'assignedSectionIds', select: 'name classId' },
      { path: 'classTeacherClassId', select: 'name' },
      { path: 'classTeacherSectionId', select: 'name' },
    ]);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const currentSession = await AcademicSession.findOne({ schoolId, isCurrent: true });

    return res.status(200).json({
      success: true,
      teacher,
      currentSession,
    });
  } catch (error) {
    console.error('Get teacher attendance options error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance options.' });
  }
};

// @desc    Get or Initialize Attendance Session & Student Roster
// @route   GET /api/teacher/attendance/session
// @access  Private (Teacher, Principal)
export const getAttendanceSession = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, classId, sectionId, date } = req.query;

    if (!academicSessionId || !classId || !sectionId) {
      return res.status(400).json({ success: false, message: 'Academic session, class, and section are required.' });
    }

    const attendanceDate = formatStartOfDay(date);

    // Verify Teacher Assignment if caller is teacher
    if (req.user.role === 'teacher') {
      const context = await resolveTeacherTeachingContext(req);
      if (!context || !context.canAccessClassStudents(classId, sectionId)) {
        return res.status(403).json({ success: false, message: 'You are not assigned to view attendance for this section.' });
      }
    }

    // Fetch or create AttendanceSession
    let session = await AttendanceSession.findOne({
      schoolId,
      academicSessionId,
      classId,
      sectionId,
      attendanceDate,
    }).populate('markedBy', 'name role');

    // Fetch active students in class/section
    const students = await Student.find({
      schoolId,
      currentAcademicSessionId: academicSessionId,
      currentClassId: classId,
      currentSectionId: sectionId,
      status: 'active',
    }).sort({ rollNumber: 1, fullName: 1 });

    // Fetch existing attendance records
    const records = await StudentAttendance.find({
      schoolId,
      academicSessionId,
      classId,
      sectionId,
      attendanceDate,
    });

    const recordMap = new Map();
    records.forEach((r) => recordMap.set(String(r.studentId), r));

    // Combine student list with attendance status
    const studentRoster = students.map((s) => {
      const rec = recordMap.get(String(s._id));
      return {
        studentId: s._id,
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        status: rec ? rec.status : 'present',
        remark: rec ? rec.remark : '',
        checkInTime: rec ? rec.checkInTime : '',
      };
    });

    return res.status(200).json({
      success: true,
      session: session || {
        status: 'draft',
        attendanceDate,
        totalStudents: students.length,
      },
      studentRoster,
    });
  } catch (error) {
    console.error('Get attendance session error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load attendance session.' });
  }
};

// @desc    Save or Submit Attendance Session & Records
// @route   POST /api/teacher/attendance/session
// @access  Private (Teacher, Principal)
export const saveAttendanceSession = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      academicSessionId,
      classId,
      sectionId,
      date,
      status, // 'draft' or 'submitted'
      remarks,
      records, // Array of { studentId, status, remark }
    } = req.body;

    if (!academicSessionId || !classId || !sectionId || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Academic session, class, section, and student records are required.' });
    }

    const attendanceDate = formatStartOfDay(date);

    // Verify Teacher Assignment if caller is teacher
    if (req.user.role === 'teacher') {
      const context = await resolveTeacherTeachingContext(req);
      if (!context || !context.canManageClassStudents(classId, sectionId)) {
        return res.status(403).json({ success: false, message: 'Forbidden: Only the assigned Class Teacher can mark or submit attendance for this class and section.' });
      }
    }

    let session = await AttendanceSession.findOne({
      schoolId,
      academicSessionId,
      classId,
      sectionId,
      attendanceDate,
    });

    if (session && session.status === 'locked' && req.user.role !== 'superAdmin' && req.user.role !== 'principal') {
      return res.status(423).json({ success: false, message: 'Attendance for this date is locked by Principal.' });
    }

    if (session && session.status === 'submitted' && req.user.role === 'teacher') {
      return res.status(400).json({ success: false, message: 'Attendance is already submitted. Contact Principal to unlock.' });
    }

    // Compute live status counts
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;

    // Upsert student attendance records
    for (const r of records) {
      const stStatus = r.status || 'present';
      if (stStatus === 'present') presentCount++;
      else if (stStatus === 'absent') absentCount++;
      else if (stStatus === 'late') lateCount++;
      else if (stStatus === 'leave') leaveCount++;
      else if (stStatus === 'holiday') holidayCount++;

      await StudentAttendance.findOneAndUpdate(
        { schoolId, studentId: r.studentId, attendanceDate },
        {
          schoolId,
          attendanceSessionId: session?._id || new mongoose.Types.ObjectId(),
          studentId: r.studentId,
          academicSessionId,
          classId,
          sectionId,
          attendanceDate,
          status: stStatus,
          remark: r.remark || '',
          markedBy: req.user._id,
        },
        { upsert: true, new: true }
      );
    }

    const sessionStatus = status || 'draft';

    if (!session) {
      session = await AttendanceSession.create({
        schoolId,
        academicSessionId,
        classId,
        sectionId,
        attendanceDate,
        markedBy: req.user._id,
        submittedBy: sessionStatus === 'submitted' ? req.user._id : null,
        status: sessionStatus,
        totalStudents: records.length,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        holidayCount,
        remarks: remarks || '',
        submittedAt: sessionStatus === 'submitted' ? new Date() : null,
        createdBy: req.user._id,
      });
    } else {
      session.status = sessionStatus;
      session.totalStudents = records.length;
      session.presentCount = presentCount;
      session.absentCount = absentCount;
      session.lateCount = lateCount;
      session.leaveCount = leaveCount;
      session.holidayCount = holidayCount;
      if (remarks) session.remarks = remarks;
      if (sessionStatus === 'submitted') {
        session.submittedBy = req.user._id;
        session.submittedAt = new Date();
      }
      session.updatedBy = req.user._id;
      await session.save();
    }

    // Link updated session ID to StudentAttendance records
    await StudentAttendance.updateMany(
      { schoolId, academicSessionId, classId, sectionId, attendanceDate },
      { attendanceSessionId: session._id }
    );

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: sessionStatus === 'submitted' ? 'SUBMIT_ATTENDANCE' : 'SAVE_ATTENDANCE_DRAFT',
      entity: 'AttendanceSession',
      description: `${sessionStatus === 'submitted' ? 'Submitted' : 'Saved draft'} attendance for date ${attendanceDate.toISOString().slice(0, 10)}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Attendance ${sessionStatus === 'submitted' ? 'submitted' : 'draft saved'} successfully.`,
      session,
    });
  } catch (error) {
    console.error('Save attendance session error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save attendance.' });
  }
};

// ==========================================
// PRINCIPAL ATTENDANCE CONTROLLERS
// ==========================================

// @desc    Get Principal School-wide Attendance Overview & Summaries
// @route   GET /api/principal/attendance/summary
// @access  Private (Principal)
export const getPrincipalAttendanceSummary = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const date = formatStartOfDay(req.query.date);

    // Fetch current active academic session
    const currentSession = await AcademicSession.findOne({ schoolId, isCurrent: true });
    if (!currentSession) {
      return res.status(200).json({ success: true, summary: { overallPercentage: 0, totalStudents: 0 } });
    }

    const totalStudents = await Student.countDocuments({ schoolId, status: 'active' });
    const todaySessions = await AttendanceSession.find({ schoolId, attendanceDate: date })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('markedBy', 'name');

    const totalPresent = todaySessions.reduce((acc, s) => acc + s.presentCount + s.lateCount, 0);
    const totalMarkedStudents = todaySessions.reduce((acc, s) => acc + s.totalStudents, 0);
    const overallPercentage = totalMarkedStudents > 0 ? Math.round((totalPresent / totalMarkedStudents) * 100) : 0;

    // Fetch classes list to find missing attendance
    const allClasses = await SchoolClass.find({ schoolId, academicSessionId: currentSession._id });
    const allSections = await Section.find({ schoolId, academicSessionId: currentSession._id }).populate('classId', 'name');

    const markedSectionIds = new Set(todaySessions.map((s) => String(s.sectionId._id || s.sectionId)));
    const missingSections = allSections.filter((sec) => !markedSectionIds.has(String(sec._id)));

    return res.status(200).json({
      success: true,
      summary: {
        date,
        totalStudents,
        totalMarkedStudents,
        overallPercentage,
        todaySessions,
        missingSections,
      },
    });
  } catch (error) {
    console.error('Get principal attendance summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load attendance summary.' });
  }
};

// @desc    Unlock Attendance Session (Principal Only)
// @route   PATCH /api/principal/attendance/session/:sessionId/unlock
// @access  Private (Principal)
export const unlockAttendanceSession = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { sessionId } = req.params;

    const session = await AttendanceSession.findOne({ _id: sessionId, schoolId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found.' });
    }

    session.status = 'draft';
    await session.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UNLOCK_ATTENDANCE',
      entity: 'AttendanceSession',
      description: `Principal unlocked attendance session for date ${session.attendanceDate.toISOString().slice(0, 10)}.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance session unlocked for editing.',
      session,
    });
  } catch (error) {
    console.error('Unlock attendance session error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unlock attendance session.' });
  }
};

// @desc    Correct Individual Student Attendance Record (Principal)
// @route   PATCH /api/principal/attendance/records/:recordId
// @access  Private (Principal)
export const correctStudentAttendanceRecord = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { recordId } = req.params;
    const { status, remark } = req.body;

    const record = await StudentAttendance.findOne({ _id: recordId, schoolId });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    const oldStatus = record.status;
    record.status = status;
    if (remark) record.remark = remark;
    record.updatedBy = req.user._id;
    await record.save();

    // Recalculate session counts
    const session = await AttendanceSession.findById(record.attendanceSessionId);
    if (session) {
      const records = await StudentAttendance.find({ attendanceSessionId: session._id });
      session.presentCount = records.filter((r) => r.status === 'present').length;
      session.absentCount = records.filter((r) => r.status === 'absent').length;
      session.lateCount = records.filter((r) => r.status === 'late').length;
      session.leaveCount = records.filter((r) => r.status === 'leave').length;
      await session.save();
    }

    return res.status(200).json({
      success: true,
      message: `Student attendance status updated from ${oldStatus} to ${status}.`,
      record,
    });
  } catch (error) {
    console.error('Correct attendance record error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update attendance record.' });
  }
};

// @desc    Export Attendance CSV
// @route   GET /api/principal/attendance/export
// @access  Private (Principal)
export const exportAttendanceCSV = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { startDate, endDate, classId, sectionId } = req.query;

    const query = { schoolId };
    if (startDate && endDate) {
      query.attendanceDate = { $gte: formatStartOfDay(startDate), $lte: formatStartOfDay(endDate) };
    }
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const records = await StudentAttendance.find(query)
      .populate('studentId', 'fullName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('markedBy', 'name')
      .sort({ attendanceDate: -1 });

    const headers = ['Date', 'Student Name', 'Admission No', 'Class', 'Section', 'Status', 'Remark', 'Marked By'];
    const rows = records.map((r) => [
      r.attendanceDate.toISOString().slice(0, 10),
      `"${r.studentId?.fullName || ''}"`,
      r.studentId?.admissionNumber || '',
      r.classId?.name || '',
      r.sectionId?.name || '',
      r.status,
      `"${r.remark || ''}"`,
      `"${r.markedBy?.name || ''}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    return res.status(200).send(csvString);
  } catch (error) {
    console.error('Export attendance CSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export attendance.' });
  }
};

// ==========================================
// PARENT ATTENDANCE CONTROLLERS
// ==========================================

// @desc    Get Linked Child Attendance History & Monthly Percentage
// @route   GET /api/parent/children/:studentId/attendance
// @access  Private (Parent)
export const getParentChildAttendance = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { studentId } = req.params;

    // Verify parent linkage
    const parentProfile = await ParentProfile.findOne({ userId, schoolId });
    if (!parentProfile || !parentProfile.linkedStudentIds.some((id) => String(id) === String(studentId))) {
      return res.status(403).json({ success: false, message: 'Access denied. Student is not linked to your family account.' });
    }

    const records = await StudentAttendance.find({ schoolId, studentId })
      .sort({ attendanceDate: -1 })
      .limit(60);

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const leaveDays = records.filter((r) => r.status === 'leave').length;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return res.status(200).json({
      success: true,
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        leaveDays,
        percentage,
        records,
      },
    });
  } catch (error) {
    console.error('Get parent child attendance error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child attendance.' });
  }
};
