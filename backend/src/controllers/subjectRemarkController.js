import { SubjectRemark } from '../models/SubjectRemark.js';
import { getTenantSchoolId, resolveTeacherTeachingContext } from '../utils/teacherResolver.js';

// @desc    Get Subject Academic Remarks for a Student
// @route   GET /api/teacher/students/:studentId/remarks
// @access  Private (Teacher)
export const getStudentSubjectRemarks = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const context = await resolveTeacherTeachingContext(req);

    if (!context) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const remarks = await SubjectRemark.find({ schoolId, studentId })
      .populate('teacherId', 'name employeeId designation')
      .populate('subjectId', 'name code subjectType')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, remarks });
  } catch (error) {
    console.error('Get student subject remarks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student subject remarks.' });
  }
};

// @desc    Create or Update Subject Academic Remark
// @route   POST /api/teacher/students/:studentId/remarks
// @access  Private (Teacher - Subject Teacher or Class Teacher)
export const createOrUpdateSubjectRemark = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const { classId, sectionId, subjectId, remark } = req.body;

    if (!classId || !subjectId || !remark || !remark.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Class ID, Subject ID, and remark content are required.',
      });
    }

    const context = await resolveTeacherTeachingContext(req);
    if (!context) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    if (!context.canEnterSubjectMarks(classId, sectionId, subjectId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Security Violation: You can only add remarks for your assigned class and subject.',
      });
    }

    const updatedRemark = await SubjectRemark.findOneAndUpdate(
      { schoolId, studentId, subjectId, teacherId: context.teacher._id },
      {
        $set: {
          classId,
          sectionId: sectionId || null,
          remark: remark.trim(),
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Subject academic remark saved successfully.',
      remark: updatedRemark,
    });
  } catch (error) {
    console.error('Save subject remark error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save subject remark.' });
  }
};
