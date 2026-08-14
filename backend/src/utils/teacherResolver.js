import { Teacher } from '../models/Teacher.js';
import { User } from '../models/User.js';

/**
 * Derives the tenant schoolId strictly from authenticated user session or middleware
 */
export const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

/**
 * Shared central resolver for the authenticated Teacher profile.
 * Canonical Link: User.teacherProfileId <-> Teacher._id AND Teacher.userId <-> User._id.
 * Safe Idempotent Legacy Repair: Matches within same school by strong identifiers (stored userId, employeeId, loginId, normalized email).
 * NEVER matches by name alone.
 *
 * @param {Object} req - Express request object containing req.user and req.tenantSchoolId
 * @param {String|Object} populateFields - Optional Mongoose populate path(s)
 * @returns {Promise<Document|null>} Teacher document or null if not found
 */
export const resolveTeacherProfile = async (req, populateFields = '') => {
  const schoolId = getTenantSchoolId(req);
  const user = req.user;

  if (!schoolId || !user) {
    return null;
  }

  let teacher = null;

  // 1. Direct Canonical lookup via User.teacherProfileId
  if (user.teacherProfileId) {
    teacher = await Teacher.findOne({
      _id: user.teacherProfileId,
      schoolId,
      isActive: { $ne: false },
    });
  }

  // 2. Direct Canonical lookup via Teacher.userId
  if (!teacher && user._id) {
    teacher = await Teacher.findOne({
      schoolId,
      userId: user._id,
      isActive: { $ne: false },
    });
  }

  // 3. Safe Idempotent Legacy Fallback (Strictly within same school)
  if (!teacher) {
    const searchConditions = [];

    if (user.loginId && user.loginId.trim().length > 0) {
      const cleanLogin = user.loginId.trim();
      const loginRegex = new RegExp(`^${cleanLogin.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      searchConditions.push({ employeeId: loginRegex });
      searchConditions.push({ loginId: loginRegex });
    }

    if (user.email && user.email.trim().length > 0) {
      const cleanEmail = user.email.trim();
      const emailRegex = new RegExp(`^${cleanEmail.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      searchConditions.push({ email: emailRegex });
    }

    if (searchConditions.length > 0) {
      teacher = await Teacher.findOne({
        schoolId,
        isActive: { $ne: false },
        $or: searchConditions,
      });
    }

    // Secondary fallback: Exact normalized Name match within SAME school if unique
    if (!teacher && user.name && user.name.trim().length > 0) {
      const cleanName = user.name.trim();
      const nameRegex = new RegExp(`^${cleanName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      const candidateTeachers = await Teacher.find({
        schoolId,
        isActive: { $ne: false },
        name: nameRegex,
      });
      if (candidateTeachers.length === 1) {
        teacher = candidateTeachers[0];
      }
    }
  }

  // 4. Bi-directional Canonical Link Auto-Repair & Persistence
  if (teacher) {
    let saveUser = false;
    let saveTeacher = false;

    if (!user.teacherProfileId || String(user.teacherProfileId) !== String(teacher._id)) {
      user.teacherProfileId = teacher._id;
      saveUser = true;
    }

    if (!teacher.userId || String(teacher.userId) !== String(user._id)) {
      teacher.userId = user._id;
      saveTeacher = true;
    }

    if (!teacher.loginId && user.loginId) {
      teacher.loginId = user.loginId.trim().toUpperCase();
      saveTeacher = true;
    }

    if (teacher.isActive === undefined || teacher.isActive === null) {
      teacher.isActive = true;
      saveTeacher = true;
    }

    if (saveUser) {
      await User.updateOne({ _id: user._id }, { $set: { teacherProfileId: teacher._id } }).catch(() => {});
    }

    if (saveTeacher) {
      await teacher.save().catch(() => {});
    }
  }

  if (teacher && populateFields) {
    await teacher.populate(populateFields);
  }

  return teacher;
};

import { SubjectAssignment } from '../models/SubjectAssignment.js';

/**
 * Resolves the complete contextual teaching profile & permission helpers for the logged-in teacher.
 * Differentiates OWNED Class Teacher assignments from EXTERNAL Subject Teacher assignments.
 *
 * @param {Object} req - Express request object
 * @returns {Promise<Object|null>} Teaching context object containing teacher, ownedClass, subjectAssignments, and permission helpers.
 */
export const resolveTeacherTeachingContext = async (req) => {
  const schoolId = getTenantSchoolId(req);
  const teacher = await resolveTeacherProfile(req, [
    { path: 'classTeacherClassId', select: 'name displayName' },
    { path: 'classTeacherSectionId', select: 'name' },
  ]);

  if (!schoolId || !teacher) {
    return null;
  }

  const ownedClassId = teacher.classTeacherClassId?._id || teacher.classTeacherClassId || null;
  const ownedSectionId = teacher.classTeacherSectionId?._id || teacher.classTeacherSectionId || null;

  // Fetch all active Subject Assignments for this teacher
  const rawSubjectAssignments = await SubjectAssignment.find({
    schoolId,
    teacherId: teacher._id,
    status: 'active',
  })
    .populate('classId', 'name displayName')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name code subjectType');

  const isOwnedClass = (classId, sectionId) => {
    if (!ownedClassId || !classId) return false;
    const classMatch = String(ownedClassId) === String(classId);
    const sectionMatch = !ownedSectionId || !sectionId || String(ownedSectionId) === String(sectionId);
    return classMatch && sectionMatch;
  };

  const hasSubjectAssignment = (classId, sectionId, subjectId) => {
    return rawSubjectAssignments.some((sa) => {
      const cId = sa.classId?._id || sa.classId;
      const sId = sa.sectionId?._id || sa.sectionId;
      const subId = sa.subjectId?._id || sa.subjectId;

      const classMatch = String(cId) === String(classId);
      const sectionMatch = !sId || !sectionId || String(sId) === String(sectionId);
      const subjectMatch = !subId || !subjectId || String(subId) === String(subjectId);
      return classMatch && sectionMatch && subjectMatch;
    });
  };

  const canAccessClassStudents = (classId, sectionId) => {
    return isOwnedClass(classId, sectionId) || hasSubjectAssignment(classId, sectionId);
  };

  const canManageClassStudents = (classId, sectionId) => {
    return isOwnedClass(classId, sectionId);
  };

  const canEnterSubjectMarks = (classId, sectionId, subjectId) => {
    if (isOwnedClass(classId, sectionId)) return true;
    return hasSubjectAssignment(classId, sectionId, subjectId);
  };

  const canPublishSubjectAnnouncement = (classId, sectionId, subjectId) => {
    if (isOwnedClass(classId, sectionId)) return true;
    return hasSubjectAssignment(classId, sectionId, subjectId);
  };

  return {
    teacher,
    schoolId,
    ownedClass: ownedClassId ? { classId: ownedClassId, sectionId: ownedSectionId, details: teacher.classTeacherClassId } : null,
    subjectAssignments: rawSubjectAssignments,
    isOwnedClass,
    hasSubjectAssignment,
    canAccessClassStudents,
    canManageClassStudents,
    canEnterSubjectMarks,
    canPublishSubjectAnnouncement,
  };
};
