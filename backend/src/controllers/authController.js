import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper to generate access & refresh tokens
const generateTokens = (userId, role, schoolId = null) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_fallback_key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_fallback_key';

  const accessToken = jwt.sign({ id: userId, role, schoolId }, accessSecret, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: userId, role, schoolId }, refreshSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// Set HttpOnly Cookies on Response
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawDomain = process.env.COOKIE_DOMAIN;
  const isPublicSuffix = rawDomain && (rawDomain.includes('onrender.com') || rawDomain.includes('netlify.app') || rawDomain === 'localhost');
  const domain = (rawDomain && !isPublicSuffix) ? rawDomain : undefined;

  const accessOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...(domain && { domain }),
  };

  const refreshOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...(domain && { domain }),
  };

  res.cookie('token', accessToken, accessOptions);
  res.cookie('refreshToken', refreshToken, refreshOptions);
};

// @desc    Super Admin Login
// @route   POST /api/auth/super-admin/login
export const superAdminLogin = async (req, res) => {
  try {
    const { identifier, loginId, password } = req.body;
    const rawIdentifier = (identifier || loginId || '').trim();

    if (!rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email, phone number or Super Admin ID, and password.' });
    }

    const normalizedLoginId = rawIdentifier.toUpperCase();
    const normalizedPhone = rawIdentifier.replace(/[\s\-\(\)]/g, '');
    const escapedRaw = rawIdentifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const user = await User.findOne({
      role: 'superAdmin',
      $or: [
        { loginId: normalizedLoginId },
        { email: { $regex: `^${escapedRaw}$`, $options: 'i' } },
        { phone: normalizedPhone },
        { phone: rawIdentifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Super Admin account is deactivated.' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to multiple failed attempts. Please try again after 15 minutes.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid Super Admin credentials.' });
    }

    // Success -> Reset attempts & record last login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role, null);
    setAuthCookies(res, accessToken, refreshToken);

    await AuditLog.create({
      actor: user._id,
      action: 'SUPER_ADMIN_LOGIN',
      description: `Super Admin ${user.loginId} logged in successfully`,
      entity: 'User',
    });

    return res.status(200).json({
      success: true,
      message: 'Super Admin logged in successfully.',
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        email: user.email,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Super Admin login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// @desc    School User Login (Principal, Teacher, Parent)
// @route   POST /api/auth/school/login
export const schoolUserLogin = async (req, res) => {
  try {
    const { schoolCode, identifier, loginId, password } = req.body;
    const rawIdentifier = (identifier || loginId || '').trim();

    if (!schoolCode || !rawIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'School code, login ID / email / phone, and password are required.' });
    }

    const formattedSchoolCode = schoolCode.toUpperCase().trim();
    const school = await School.findOne({ schoolCode: formattedSchoolCode });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found with the provided code.' });
    }

    if (!school.isActive) {
      return res.status(403).json({ success: false, message: 'School account is inactive.' });
    }

    const normalizedLoginId = rawIdentifier.toUpperCase();
    const normalizedPhone = rawIdentifier.replace(/[\s\-\(\)]/g, '');
    const escapedRaw = rawIdentifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const user = await User.findOne({
      schoolId: school._id,
      $or: [
        { loginId: normalizedLoginId },
        { email: { $regex: `^${escapedRaw}$`, $options: 'i' } },
        { phone: normalizedPhone },
        { phone: rawIdentifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials for this school.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is deactivated. Contact Principal.' });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to multiple failed attempts. Please try again after 15 minutes.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials for this school.' });
    }

    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role, school._id);
    setAuthCookies(res, accessToken, refreshToken);

    await AuditLog.create({
      actor: user._id,
      action: 'USER_LOGIN',
      schoolId: school._id,
      description: `User ${user.loginId} (${user.role}) logged in to school ${school.schoolCode}`,
      entity: 'User',
    });

    return res.status(200).json({
      success: true,
      message: `${user.role} logged in successfully.`,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        email: user.email,
        schoolId: user.schoolId,
        lastLogin: user.lastLogin,
      },
      school: {
        id: school._id,
        name: school.name,
        schoolCode: school.schoolCode,
        setupStatus: school.setupStatus || 'notStarted',
        setupStep: school.setupStep || 1,
      },
    });
  } catch (error) {
    console.error('School login error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during user login.' });
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!refreshTokenCookie) {
      return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_fallback_key';
    const decoded = jwt.verify(refreshTokenCookie, refreshSecret);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User session invalid or account inactive.' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role, user.schoolId);
    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully.',
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawDomain = process.env.COOKIE_DOMAIN;
  const isPublicSuffix = rawDomain && (rawDomain.includes('onrender.com') || rawDomain.includes('netlify.app') || rawDomain === 'localhost');
  const domain = (rawDomain && !isPublicSuffix) ? rawDomain : undefined;

  const cookieOptions = {
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    ...(domain && { domain }),
  };

  res.cookie('token', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Get Current User Profile & Tenant Info
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let school = null;

    if (user.schoolId) {
      school = await School.findById(user.schoolId);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        loginId: user.loginId,
        role: user.role,
        email: user.email,
        phone: user.phone,
        schoolId: user.schoolId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
      school: school
        ? {
            id: school._id,
            name: school.name,
            schoolCode: school.schoolCode,
            email: school.email,
            phone: school.phone,
            subscription: school.subscription,
            enabledModules: school.enabledModules,
            setupStatus: school.setupStatus || 'notStarted',
            setupStep: school.setupStep || 1,
          }
        : null,
    });
  } catch (error) {
    console.error('Get me error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving session.' });
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword; // Pre-save hook hashes password
    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: 'CHANGE_PASSWORD',
      schoolId: user.schoolId,
      description: `User ${user.loginId} changed their password`,
      entity: 'User',
    });

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
