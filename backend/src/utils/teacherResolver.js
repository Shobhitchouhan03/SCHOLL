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
      isActive: true,
    });
  }

  // 2. Direct Canonical lookup via Teacher.userId
  if (!teacher && user._id) {
    teacher = await Teacher.findOne({
      schoolId,
      userId: user._id,
      isActive: true,
    });
  }

  // 3. Safe Idempotent Legacy Fallback (Strictly within same school, strong identifiers ONLY)
  if (!teacher) {
    const searchConditions = [];

    if (user.loginId) {
      const cleanLogin = user.loginId.trim().toUpperCase();
      searchConditions.push({ employeeId: cleanLogin });
      searchConditions.push({ loginId: cleanLogin });
    }

    if (user.email && user.email.trim().length > 0) {
      const cleanEmail = user.email.trim().toLowerCase();
      searchConditions.push({ email: cleanEmail });
    }

    if (searchConditions.length > 0) {
      teacher = await Teacher.findOne({
        schoolId,
        isActive: true,
        $or: searchConditions,
      });
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
