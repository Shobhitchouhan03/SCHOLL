import { Homework } from '../models/Homework.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { AuditLog } from '../models/AuditLog.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// TEACHER HOMEWORK CONTROLLERS
// ==========================================

// @desc    Create Homework (Draft or Published)
// @route   POST /api/teacher/homework
// @access  Private (Teacher)
export const createHomework = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const {
      academicSessionId,
      classId,
      sectionIds,
      subjectId,
      title,
      description,
      instructions,
      assignedDate,
      dueDate,
      priority,
      status, // 'draft' or 'published'
      attachmentUrls,
    } = req.body;

    if (!academicSessionId || !classId || !Array.isArray(sectionIds) || !subjectId || !title || !description || !dueDate) {
      return res.status(400).json({ success: false, message: 'Class, sections, subject, title, description, and due date are required.' });
    }

    const assignD = assignedDate ? new Date(assignedDate) : new Date();
    const dueD = new Date(dueDate);

    if (dueD < assignD) {
      return res.status(400).json({ success: false, message: 'Due date cannot be before assigned date.' });
    }

    // Verify Teacher Assignment for class and subject
    const teacher = await Teacher.findOne({ userId, schoolId });
    if (!teacher) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }

    const assignedClasses = (teacher.assignedClassIds || []).map(String);
    if (teacher.isClassTeacher) assignedClasses.push(String(teacher.classTeacherClassId));
    if (!assignedClasses.includes(String(classId))) {
      return res.status(403).json({ success: false, message: 'You are not assigned to create homework for this class.' });
    }

    const hwStatus = status || 'draft';

    const homework = await Homework.create({
      schoolId,
      academicSessionId,
      teacherId: userId,
      classId,
      sectionIds,
      subjectId,
      title: title.trim(),
      description: description.trim(),
      instructions: (instructions || '').trim(),
      assignedDate: assignD,
      dueDate: dueD,
      priority: priority || 'normal',
      status: hwStatus,
      attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls : [],
      publishedAt: hwStatus === 'published' ? new Date() : null,
      createdBy: userId,
    });

    await AuditLog.create({
      schoolId,
      actor: userId,
      action: hwStatus === 'published' ? 'PUBLISH_HOMEWORK' : 'CREATE_HOMEWORK_DRAFT',
      entity: 'Homework',
      description: `Teacher ${hwStatus === 'published' ? 'published' : 'created draft'} homework "${homework.title}".`,
    });

    return res.status(201).json({
      success: true,
      message: `Homework ${hwStatus === 'published' ? 'published' : 'draft saved'} successfully.`,
      homework,
    });
  } catch (error) {
    console.error('Create homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create homework.' });
  }
};

// @desc    Get Teacher's Homework Assignments List
// @route   GET /api/teacher/homework
// @access  Private (Teacher)
export const getTeacherHomework = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { status, classId, subjectId } = req.query;

    const query = { schoolId, teacherId: userId };
    if (status) query.status = status;
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;

    const homeworks = await Homework.find(query)
      .populate('classId', 'name')
      .populate('sectionIds', 'name')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, homeworks });
  } catch (error) {
    console.error('Get teacher homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch homework.' });
  }
};

// @desc    Publish Draft Homework
// @route   POST /api/teacher/homework/:homeworkId/publish
// @access  Private (Teacher)
export const publishHomework = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { homeworkId } = req.params;

    const homework = await Homework.findOne({ _id: homeworkId, schoolId, teacherId: userId });
    if (!homework) {
      return res.status(404).json({ success: false, message: 'Homework not found.' });
    }

    homework.status = 'published';
    homework.publishedAt = new Date();
    await homework.save();

    return res.status(200).json({
      success: true,
      message: 'Homework published successfully. Now visible to parents.',
      homework,
    });
  } catch (error) {
    console.error('Publish homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish homework.' });
  }
};

// ==========================================
// PRINCIPAL HOMEWORK CONTROLLERS
// ==========================================

// @desc    View All School Homework Assignments & Summary
// @route   GET /api/principal/homework
// @access  Private (Principal)
export const getPrincipalHomework = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { status, classId, subjectId, teacherId } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;

    const homeworks = await Homework.find(query)
      .populate('teacherId', 'name email')
      .populate('classId', 'name')
      .populate('sectionIds', 'name')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    const totalPublished = homeworks.filter((h) => h.status === 'published').length;
    const totalDrafts = homeworks.filter((h) => h.status === 'draft').length;

    return res.status(200).json({
      success: true,
      summary: { totalPublished, totalDrafts, totalCount: homeworks.length },
      homeworks,
    });
  } catch (error) {
    console.error('Get principal homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch homework.' });
  }
};

// ==========================================
// PARENT HOMEWORK CONTROLLERS
// ==========================================

// @desc    Get Published Homework Assignments for Linked Child
// @route   GET /api/parent/children/:studentId/homework
// @access  Private (Parent)
export const getParentChildHomework = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const userId = req.user._id;
    const { studentId } = req.params;

    // Verify parent linkage
    const parentProfile = await ParentProfile.findOne({ userId, schoolId });
    if (!parentProfile || !parentProfile.linkedStudentIds.some((id) => String(id) === String(studentId))) {
      return res.status(403).json({ success: false, message: 'Access denied. Student is not linked to your family account.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Fetch published homework for student's class and section
    const homeworks = await Homework.find({
      schoolId,
      classId: student.currentClassId,
      sectionIds: student.currentSectionId,
      status: 'published',
    })
      .populate('teacherId', 'name')
      .populate('subjectId', 'name code')
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      homeworks,
    });
  } catch (error) {
    console.error('Get parent child homework error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch child homework.' });
  }
};
