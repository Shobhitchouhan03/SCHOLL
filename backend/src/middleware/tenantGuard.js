export const tenantGuard = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated for tenant guard.' });
  }

  if (req.user.role === 'superAdmin') {
    // SuperAdmin can specify target school via query/header or default to global
    req.tenantSchoolId = req.headers['x-school-id'] || req.query.schoolId || req.body?.schoolId || null;
  } else {
    // Strictly derive from authenticated user session
    if (!req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'User does not belong to any valid school tenant.' });
    }

    req.tenantSchoolId = req.user.schoolId.toString();

    // Prevent body/query schoolId spoofing by overwriting
    if (req.body && typeof req.body === 'object') {
      req.body.schoolId = req.tenantSchoolId;
    }
    if (req.query) {
      req.query.schoolId = req.tenantSchoolId;
    }
  }

  next();
};
