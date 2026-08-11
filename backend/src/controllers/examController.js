import mongoose from 'mongoose';
import { Exam } from '../models/Exam.js';
import { ExamSchedule } from '../models/ExamSchedule.js';
import { StudentMarks } from '../models/StudentMarks.js';
import { Result } from '../models/Result.js';
import { GradingScheme } from '../models/GradingScheme.js';
import { StudentPromotion } from '../models/StudentPromotion.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { StudentAcademicEnrollment } from '../models/StudentAcademicEnrollment.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { ResultCalculationService } from '../services/ResultCalculationService.js';
import { resolveTeacherProfile } from '../utils/teacherResolver.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// PRINCIPAL EXAM MANAGEMENT CONTROLLERS
// ==========================================

// @desc    Create Exam
// @route   POST /api/principal/exams
// @access  Private (Principal)
export const createExam = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      academicSessionId,
      name,
      code,
      examType,
      description,
      applicableClassIds,
      startDate,
      endDate,
    } = req.body;

    if (!academicSessionId || !name || !code || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Academic session, name, code, start date, and end date are required.' });
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);

    if (endD < startD) {
      return res.status(400).json({ success: false, message: 'End date must be after or equal to start date.' });
    }

    const existingCode = await Exam.findOne({ schoolId, academicSessionId, code: code.toUpperCase() });
    if (existingCode) {
      return res.status(409).json({ success: false, message: 'Exam code already exists for this academic session.' });
    }

    const exam = await Exam.create({
      schoolId,
      academicSessionId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      examType: examType || 'term',
      description: (description || '').trim(),
      applicableClassIds: Array.isArray(applicableClassIds) ? applicableClassIds : [],
      startDate: startD,
      endDate: endD,
      status: 'scheduled',
      createdBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_EXAM',
      entity: 'Exam',
      description: `Created exam "${exam.name}" (${exam.code}).`,
    });

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      exam,
    });
  } catch (error) {
    console.error('Create exam error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create exam.' });
  }
};

// @desc    List All School Exams
// @route   GET /api/principal/exams
// @access  Private (Principal, Teacher)
export const getExams = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { status, academicSessionId } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (academicSessionId) query.academicSessionId = academicSessionId;

    const exams = await Exam.find(query)
      .populate('academicSessionId', 'name')
      .populate('applicableClassIds', 'name')
      .sort({ startDate: -1 });

    return res.status(200).json({ success: true, exams });
  } catch (error) {
    console.error('Get exams error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
};

// @desc    Create Exam Subject Schedule
// @route   POST /api/principal/exams/:examId/schedules
// @access  Private (Principal)
export const createExamSchedule = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;
    const {
      classId,
      sectionIds,
      subjectId,
      examDate,
      startTime,
      endTime,
      maximumMarks,
      passingMarks,
      practicalMaximumMarks,
      practicalPassingMarks,
      roomNumber,
      instructions,
      assignedTeacherIds,
    } = req.body;

    if (!classId || !subjectId || !examDate || !maximumMarks || !passingMarks) {
      return res.status(400).json({ success: false, message: 'Class, subject, exam date, maximum marks, and passing marks are required.' });
    }

    if (Number(maximumMarks) <= 0) {
      return res.status(400).json({ success: false, message: 'Maximum marks must be greater than 0.' });
    }

    if (Number(passingMarks) > Number(maximumMarks)) {
      return res.status(400).json({ success: false, message: 'Passing marks cannot exceed maximum marks.' });
    }

    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const existingSchedule = await ExamSchedule.findOne({ schoolId, examId, classId, subjectId });
    if (existingSchedule) {
      return res.status(409).json({ success: false, message: 'Schedule already exists for this class and subject in this exam.' });
    }

    const schedule = await ExamSchedule.create({
      schoolId,
      examId,
      academicSessionId: exam.academicSessionId,
      classId,
      sectionIds: Array.isArray(sectionIds) ? sectionIds : [],
      subjectId,
      examDate: new Date(examDate),
      startTime: startTime || '09:00',
      endTime: endTime || '12:00',
      maximumMarks: Number(maximumMarks),
      passingMarks: Number(passingMarks),
      practicalMaximumMarks: Number(practicalMaximumMarks || 0),
      practicalPassingMarks: Number(practicalPassingMarks || 0),
      roomNumber: roomNumber || '',
      instructions: instructions || '',
      assignedTeacherIds: Array.isArray(assignedTeacherIds) ? assignedTeacherIds : [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Exam schedule created successfully.',
      schedule,
    });
  } catch (error) {
    console.error('Create exam schedule error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create exam schedule.' });
  }
};

// @desc    Get Exam Schedules for an Exam
// @route   GET /api/principal/exams/:examId/schedules
// @access  Private (Principal, Teacher)
export const getExamSchedules = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;

    const schedules = await ExamSchedule.find({ schoolId, examId })
      .populate('classId', 'name')
      .populate('sectionIds', 'name')
      .populate('subjectId', 'name code')
      .populate('assignedTeacherIds', 'name email')
      .sort({ examDate: 1 });

    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error('Get exam schedules error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch exam schedules.' });
  }
};

// ==========================================
// TEACHER MARKS ENTRY CONTROLLERS
// ==========================================

// @desc    Get Student Marks Roster for Teacher Marks Entry
// @route   GET /api/teacher/exams/:examId/marks-entry
// @access  Private (Teacher)
export const getTeacherMarksEntryRoster = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;
    const { scheduleId, sectionId } = req.query;

    if (!scheduleId || !sectionId) {
      return res.status(400).json({ success: false, message: 'Schedule ID and Section ID are required.' });
    }

    const schedule = await ExamSchedule.findOne({ _id: scheduleId, schoolId, examId })
      .populate('subjectId', 'name code')
      .populate('classId', 'name');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Exam schedule not found.' });
    }

    // Verify Teacher Assignment for class and subject
    const teacher = await resolveTeacherProfile(req);
    if (!teacher) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }

    const students = await Student.find({
      schoolId,
      currentClassId: schedule.classId._id,
      currentSectionId: sectionId,
      status: 'active',
    }).sort({ rollNumber: 1, fullName: 1 });

    const existingMarks = await StudentMarks.find({
      schoolId,
      examId,
      examScheduleId: scheduleId,
      sectionId,
    });

    const marksMap = new Map();
    existingMarks.forEach((m) => marksMap.set(String(m.studentId), m));

    const roster = students.map((s) => {
      const markRec = marksMap.get(String(s._id));
      return {
        studentId: s._id,
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        theoryMarks: markRec ? markRec.theoryMarks : 0,
        practicalMarks: markRec ? markRec.practicalMarks : 0,
        totalMarks: markRec ? markRec.totalMarks : 0,
        attendanceStatus: markRec ? markRec.attendanceStatus : 'present',
        status: markRec ? markRec.status : 'draft',
        returnReason: markRec ? markRec.returnReason : '',
        remark: markRec ? markRec.remark : '',
      };
    });

    return res.status(200).json({
      success: true,
      schedule,
      roster,
    });
  } catch (error) {
    console.error('Get teacher marks entry roster error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load marks entry roster.' });
  }
};

// @desc    Save or Submit Teacher Student Marks
// @route   POST /api/teacher/exams/:examId/marks/submit
// @access  Private (Teacher)
export const saveTeacherStudentMarks = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;
    const { scheduleId, sectionId, targetStatus, marksList } = req.body; // targetStatus: 'draft' or 'submitted'

    if (!scheduleId || !sectionId || !Array.isArray(marksList)) {
      return res.status(400).json({ success: false, message: 'Schedule ID, section ID, and marks list are required.' });
    }

    const schedule = await ExamSchedule.findOne({ _id: scheduleId, schoolId, examId });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Exam schedule not found.' });
    }

    for (const item of marksList) {
      const theory = Number(item.theoryMarks || 0);
      const practical = Number(item.practicalMarks || 0);
      const total = theory + practical;

      if (total > schedule.maximumMarks) {
        return res.status(400).json({ success: false, message: `Marks for student exceed maximum allowed marks (${schedule.maximumMarks}).` });
      }

      const statusVal = targetStatus === 'submitted' ? 'submitted' : 'draft';

      await StudentMarks.findOneAndUpdate(
        { schoolId, examId, studentId: item.studentId, subjectId: schedule.subjectId },
        {
          schoolId,
          examId,
          examScheduleId: scheduleId,
          academicSessionId: schedule.academicSessionId,
          studentId: item.studentId,
          classId: schedule.classId,
          sectionId,
          subjectId: schedule.subjectId,
          theoryMarks: theory,
          practicalMarks: practical,
          totalMarks: total,
          maximumMarks: schedule.maximumMarks,
          status: statusVal,
          attendanceStatus: item.attendanceStatus || 'present',
          remark: item.remark || '',
          enteredBy: req.user._id,
          submittedAt: statusVal === 'submitted' ? new Date() : null,
        },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Student marks ${targetStatus === 'submitted' ? 'submitted for review' : 'saved as draft'}.`,
    });
  } catch (error) {
    console.error('Save teacher student marks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save student marks.' });
  }
};

// ==========================================
// PRINCIPAL REVIEW, APPROVAL & RESULTS CONTROLLERS
// ==========================================

// @desc    Get Submitted Student Marks Submissions for Principal Review
// @route   GET /api/principal/exams/:examId/marks-review
// @access  Private (Principal)
export const getPrincipalMarksReview = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;

    const schedules = await ExamSchedule.find({ schoolId, examId })
      .populate('classId', 'name')
      .populate('subjectId', 'name code');

    const marksSubmissions = await StudentMarks.find({ schoolId, examId })
      .populate('studentId', 'fullName admissionNumber rollNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('enteredBy', 'name');

    return res.status(200).json({
      success: true,
      schedules,
      marksSubmissions,
    });
  } catch (error) {
    console.error('Get principal marks review error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load marks review.' });
  }
};

// @desc    Approve or Return Individual Student Marks
// @route   POST /api/principal/marks/:marksId/approve
// @access  Private (Principal)
export const approveOrReturnStudentMarks = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { marksId } = req.params;
    const { action, returnReason } = req.body; // action: 'approve' or 'return'

    const markRecord = await StudentMarks.findOne({ _id: marksId, schoolId });
    if (!markRecord) {
      return res.status(404).json({ success: false, message: 'Student marks record not found.' });
    }

    if (action === 'approve') {
      markRecord.status = 'approved';
      markRecord.approvedBy = req.user._id;
      markRecord.approvedAt = new Date();
    } else if (action === 'return') {
      markRecord.status = 'returned';
      markRecord.returnedBy = req.user._id;
      markRecord.returnReason = returnReason || 'Returned by Principal for correction.';
    }

    await markRecord.save();

    return res.status(200).json({
      success: true,
      message: `Marks record ${action === 'approve' ? 'approved' : 'returned for correction'}.`,
      markRecord,
    });
  } catch (error) {
    console.error('Approve or return student marks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process marks approval.' });
  }
};

// @desc    Generate Exam Results for Class Students
// @route   POST /api/principal/exams/:examId/generate-results
// @access  Private (Principal)
export const generateExamResults = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;
    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required.' });
    }

    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const students = await Student.find({ schoolId, currentClassId: classId, status: 'active' });
    const generatedResults = [];

    for (const student of students) {
      const approvedMarks = await StudentMarks.find({
        schoolId,
        examId,
        studentId: student._id,
      });

      if (approvedMarks.length === 0) continue;

      const calc = await ResultCalculationService.calculateStudentResult({
        schoolId,
        examId,
        student,
        approvedMarksList: approvedMarks,
        academicSessionId: exam.academicSessionId,
      });

      const resObj = await Result.findOneAndUpdate(
        { schoolId, examId, studentId: student._id },
        calc,
        { upsert: true, new: true }
      );

      generatedResults.push(resObj);
    }

    return res.status(200).json({
      success: true,
      message: `Exam results generated for ${generatedResults.length} students.`,
      count: generatedResults.length,
    });
  } catch (error) {
    console.error('Generate exam results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate results.' });
  }
};

// @desc    Publish Exam Results (Principal Only)
// @route   POST /api/principal/exams/:examId/publish-results
// @access  Private (Principal)
export const publishExamResults = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { examId } = req.params;

    const exam = await Exam.findOne({ _id: examId, schoolId });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    await Result.updateMany(
      { schoolId, examId },
      { isPublished: true, publishedAt: new Date(), publishedBy: req.user._id }
    );

    exam.status = 'published';
    exam.resultPublishDate = new Date();
    await exam.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'PUBLISH_EXAM_RESULTS',
      entity: 'Exam',
      description: `Principal published results for exam "${exam.name}".`,
    });

    return res.status(200).json({
      success: true,
      message: 'Exam results published successfully! Now visible to parents.',
    });
  } catch (error) {
    console.error('Publish exam results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish results.' });
  }
};

// ==========================================
// PARENT RESULTS & REPORT CARD CONTROLLERS
// ==========================================

// @desc    Get Published Results for Linked Child
// @route   GET /api/parent/children/:studentId/results
// @access  Private (Parent)
export const getParentChildResults = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { studentId } = req.params;

    // Verify parent linkage
    const parentProfile = await ParentProfile.findOne({ userId, schoolId });
    if (!parentProfile || !parentProfile.linkedStudentIds.some((id) => String(id) === String(studentId))) {
      return res.status(403).json({ success: false, message: 'Access denied. Student is not linked to your family account.' });
    }

    const results = await Result.find({ schoolId, studentId, isPublished: true })
      .populate('examId', 'name code examType startDate')
      .sort({ generatedAt: -1 });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Get parent child results error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child results.' });
  }
};

// ==========================================
// STUDENT PROMOTION CONTROLLERS
// ==========================================

// @desc    Execute Student Session-End Promotion & Graduation
// @route   POST /api/principal/promotions
// @access  Private (Principal)
export const executeStudentPromotions = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      fromAcademicSessionId,
      toAcademicSessionId,
      fromClassId,
      promotions, // Array of { studentId, toClassId, toSectionId, decision, newRollNumber }
    } = req.body;

    if (!fromAcademicSessionId || !toAcademicSessionId || !Array.isArray(promotions)) {
      return res.status(400).json({ success: false, message: 'Sessions and promotion items are required.' });
    }

    const processed = [];

    for (const item of promotions) {
      const student = await Student.findOne({ _id: item.studentId, schoolId });
      if (!student) continue;

      const decision = item.decision || 'promoted';

      const prom = await StudentPromotion.create({
        schoolId,
        studentId: student._id,
        fromAcademicSessionId,
        toAcademicSessionId,
        fromClassId: student.currentClassId,
        fromSectionId: student.currentSectionId,
        toClassId: decision === 'promoted' ? item.toClassId : student.currentClassId,
        toSectionId: decision === 'promoted' ? item.toSectionId : student.currentSectionId,
        promotionDecision: decision,
        previousRollNumber: student.rollNumber,
        newRollNumber: item.newRollNumber || student.rollNumber,
        decidedBy: req.user._id,
      });

      if (decision === 'promoted') {
        student.currentAcademicSessionId = toAcademicSessionId;
        student.currentClassId = item.toClassId;
        student.currentSectionId = item.toSectionId;
        if (item.newRollNumber) student.rollNumber = item.newRollNumber;
        await student.save();

        // Create new academic enrollment history
        await StudentAcademicEnrollment.create({
          schoolId,
          studentId: student._id,
          academicSessionId: toAcademicSessionId,
          classId: item.toClassId,
          sectionId: item.toSectionId,
          rollNumber: item.newRollNumber || student.rollNumber,
          status: 'active',
        });
      } else if (decision === 'graduated') {
        student.status = 'graduated';
        await student.save();
      }

      processed.push(prom);
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'EXECUTE_STUDENT_PROMOTIONS',
      entity: 'StudentPromotion',
      description: `Principal executed promotion for ${processed.length} students.`,
    });

    return res.status(200).json({
      success: true,
      message: `Successfully processed promotions for ${processed.length} students.`,
      count: processed.length,
    });
  } catch (error) {
    console.error('Execute student promotions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process student promotions.' });
  }
};
