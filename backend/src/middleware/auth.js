import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { School } from '../models/School.js';

// Authenticate user session via JWT token in HttpOnly cookie or Authorization header
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Token missing.' });
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_fallback_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    if (user.isLocked && user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Try again later.',
      });
    }

    if (user.role !== 'superAdmin' && user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (!school) {
        return res.status(403).json({ success: false, message: 'Associated school not found.' });
      }
      if (!school.isActive) {
        return res.status(403).json({ success: false, message: 'School account is currently inactive.' });
      }
      req.school = school;
    }

    req.user = user;
    req.schoolId = user.schoolId ? user.schoolId.toString() : null;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication session.' });
  }
};

// Authorize user by roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden for role '${req.user.role}'. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

// Require Super Admin shortcut
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superAdmin') {
    return res.status(403).json({ success: false, message: 'Super Admin access required.' });
  }
  next();
};

// Request Validator helper
export const validateRequest = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body || req.body[field] === undefined || req.body[field] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required request parameters: ${missing.join(', ')}`,
      });
    }
    next();
  };
};
