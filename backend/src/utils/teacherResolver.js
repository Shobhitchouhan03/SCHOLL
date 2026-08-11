import { Teacher } from '../models/Teacher.js';

/**
 * Derives the tenant schoolId strictly from authenticated user session or middleware
 */
export const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

/**
 * Shared central resolver for the authenticated Teacher profile.
 * Guarantees consistent Teacher.userId -> User._id lookup across all modules.
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

  // 1. Primary lookup by schoolId + userId
  let teacher = await Teacher.findOne({
    schoolId,
    userId: user._id,
    isActive: true,
  });

  // 2. Secondary fallback lookup by schoolId + loginId / employeeId / email
  if (!teacher && (user.loginId || user.email)) {
    const searchConditions = [];
    if (user.loginId) {
      searchConditions.push({ employeeId: user.loginId.toUpperCase() });
      searchConditions.push({ email: user.loginId.toLowerCase() });
    }
    if (user.email) {
      searchConditions.push({ email: user.email.toLowerCase() });
    }

    if (searchConditions.length > 0) {
      teacher = await Teacher.findOne({
        schoolId,
        isActive: true,
        $or: searchConditions,
      });

      // 3. Auto-repair: link userId to Teacher document if found
      if (teacher && !teacher.userId) {
        teacher.userId = user._id;
        await teacher.save();
      }
    }
  }

  if (teacher && populateFields) {
    await teacher.populate(populateFields);
  }

  return teacher;
};
