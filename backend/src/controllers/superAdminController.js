import { School, SUPPORTED_MODULES } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { isValidDomainFormat, normalizeHostname } from '../services/tenantResolver.js';

// Helper to generate unique URL-safe schoolSlug from school name
const generateSlug = async (name) => {
  let baseSlug = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!baseSlug) baseSlug = 'school';

  let slug = baseSlug;
  let counter = 1;
  while (await School.findOne({ schoolSlug: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// @desc    Create new School and initial Principal account
// @route   POST /api/super-admin/schools
// @access  Private (Super Admin)
export const createSchool = async (req, res) => {
  let createdSchoolId = null;
  try {
    const {
      name,
      schoolCode,
      email,
      phone,
      address,
      website,
      logoUrl,
      subscriptionPlan,
      subscriptionStartDate,
      subscriptionExpiryDate,
      enabledModules,
      principalName,
      principalLoginId,
      principalPassword,
      principalEmail,
      principalPhone,
      primaryColor,
      secondaryColor,
      portalTitle,
    } = req.body;

    if (process.env.NODE_ENV !== 'production') {
      console.log('[CreateSchool Request Payload]:', {
        schoolCode,
        principalLoginId,
        name,
        principalName,
      });
    }

    if (!name || !schoolCode || !principalName || !principalLoginId || !principalPassword) {
      return res.status(400).json({
        success: false,
        message: 'School Name, School Code, Principal Name, Principal Login ID, and Password are required.',
      });
    }

    const formattedCode = schoolCode.toUpperCase().trim();
    const formattedLoginId = principalLoginId.toUpperCase().trim();

    // 1. Pre-check duplicate school code
    const existingSchool = await School.findOne({ schoolCode: formattedCode });
    if (existingSchool) {
      return res.status(409).json({ success: false, message: 'School code already exists.' });
    }

    // 2. Pre-check duplicate principal login ID
    const existingPrincipal = await User.findOne({ loginId: formattedLoginId });
    if (existingPrincipal) {
      return res.status(409).json({ success: false, message: 'Principal login ID already exists.' });
    }

    // 3. Generate unique schoolSlug
    const schoolSlug = await generateSlug(name);

    // 4. Create School
    const school = await School.create({
      name,
      schoolCode: formattedCode,
      schoolSlug,
      email: email || '',
      phone: phone || '',
      address: address || '',
      website: website || '',
      logoUrl: logoUrl || '',
      primaryColor: primaryColor || '#8B263E',
      secondaryColor: secondaryColor || '#D8A47F',
      portalTitle: portalTitle || `${name} Portal`,
      subscription: {
        status: 'active',
        plan: subscriptionPlan || 'Standard',
        startDate: subscriptionStartDate ? new Date(subscriptionStartDate) : new Date(),
        expiresAt: subscriptionExpiryDate ? new Date(subscriptionExpiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      enabledModules: Array.isArray(enabledModules) && enabledModules.length > 0 ? enabledModules : undefined,
      isActive: true,
    });

    createdSchoolId = school._id;

    // 5. Create Principal User (Active immediately)
    const principal = await User.create({
      schoolId: school._id,
      name: principalName,
      loginId: formattedLoginId,
      password: principalPassword, // Pre-save hook hashes it
      role: 'principal',
      email: principalEmail || email || '',
      phone: principalPhone || phone || '',
      isActive: true,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'CREATE_SCHOOL',
      schoolId: school._id,
      description: `Super Admin created school ${school.name} (${school.schoolCode}) with Principal ${principal.loginId}`,
      entity: 'School',
    });

    return res.status(201).json({
      success: true,
      message: `School '${school.name}' created successfully.`,
      school: {
        id: school._id,
        name: school.name,
        schoolCode: school.schoolCode,
        schoolSlug: school.schoolSlug,
        publicWebsiteUrl: `/s/${school.schoolSlug}`,
        portalUrl: `/s/${school.schoolSlug}/login`,
        jobsUrl: `/s/${school.schoolSlug}/jobs`,
        subscription: school.subscription,
        enabledModules: school.enabledModules,
        isActive: school.isActive,
      },
      credentials: {
        schoolName: school.name,
        schoolCode: school.schoolCode,
        schoolSlug: school.schoolSlug,
        publicWebsiteUrl: `/s/${school.schoolSlug}`,
        portalUrl: `/s/${school.schoolSlug}/login`,
        jobsUrl: `/s/${school.schoolSlug}/jobs`,
        principalName: principal.name,
        principalLoginId: principal.loginId,
        rawPassword: principalPassword,
      },
    });
  } catch (error) {
    console.error('Create school error:', error);

    // Rollback school if principal creation failed
    if (createdSchoolId) {
      await School.findByIdAndDelete(createdSchoolId).catch(() => {});
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error. School Code or Login ID already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create school. ' + (error.message || ''),
    });
  }
};

// @desc    Get All Schools with Stats
// @route   GET /api/super-admin/schools
// @access  Private (Super Admin)
export const getAllSchools = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { schoolCode: { $regex: search, $options: 'i' } },
        { schoolSlug: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query['subscription.status'] = 'active';
    } else if (status === 'suspended') {
      query.$or = [{ isActive: false }, { 'subscription.status': 'suspended' }];
    } else if (status === 'expired') {
      query['subscription.status'] = 'expired';
    }

    const total = await School.countDocuments(query);
    const schools = await School.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const schoolsWithPrincipals = await Promise.all(
      schools.map(async (sch) => {
        const principal = await User.findOne({ schoolId: sch._id, role: 'principal' }).select(
          'name loginId email phone lastLogin isActive'
        );
        const doc = sch.toObject();

        if (!doc.schoolSlug) {
          doc.schoolSlug = sch.schoolCode.toLowerCase();
        }

        return {
          ...doc,
          portalUrl: `/s/${doc.schoolSlug}/login`,
          principal: principal
            ? {
                id: principal._id,
                name: principal.name,
                loginId: principal.loginId,
                email: principal.email,
                phone: principal.phone,
                lastLogin: principal.lastLogin,
                isActive: principal.isActive,
              }
            : null,
        };
      })
    );

    const totalPages = Math.ceil(total / Number(limit)) || 1;

    return res.status(200).json({
      success: true,
      count: schoolsWithPrincipals.length,
      total,
      page: Number(page),
      pages: totalPages,
      pagination: {
        total,
        page: Number(page),
        pages: totalPages,
        limit: Number(limit),
      },
      schools: schoolsWithPrincipals,
    });
  } catch (error) {
    console.error('Get all schools error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch schools.' });
  }
};

// @desc    Get Single School Details
// @route   GET /api/super-admin/schools/:id
// @access  Private (Super Admin)
export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    const principal = await User.findOne({ schoolId: school._id, role: 'principal' }).select(
      'name loginId email phone lastLogin isActive'
    );

    const doc = school.toObject();
    if (!doc.schoolSlug) doc.schoolSlug = school.schoolCode.toLowerCase();

    return res.status(200).json({
      success: true,
      school: {
        ...doc,
        portalUrl: `/s/${doc.schoolSlug}/login`,
        principal,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch school details.' });
  }
};

// @desc    Get Dependent Record Counts for School Deletion Confirmation
// @route   GET /api/super-admin/schools/:id/dependent-counts
// @access  Private (Super Admin)
export const getSchoolDependentCounts = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    const usersCount = await User.countDocuments({ schoolId: id });
    const teachersCount = await Teacher.countDocuments({ schoolId: id });
    const studentsCount = await Student.countDocuments({ schoolId: id });
    const familiesCount = await ParentProfile.countDocuments({ schoolId: id });

    return res.status(200).json({
      success: true,
      schoolCode: school.schoolCode,
      schoolName: school.name,
      dependentCounts: {
        users: usersCount,
        teachers: teachersCount,
        students: studentsCount,
        families: familiesCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch dependent counts.' });
  }
};

// @desc    Delete or Archive School Safely
// @route   DELETE /api/super-admin/schools/:id
// @access  Private (Super Admin)
export const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmSchoolCode, isHardDelete } = req.body;

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    if (!confirmSchoolCode || confirmSchoolCode.toUpperCase().trim() !== school.schoolCode.toUpperCase().trim()) {
      return res.status(400).json({
        success: false,
        message: `Deletion failed. You must type the exact school code '${school.schoolCode}' to confirm.`,
      });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev && isHardDelete) {
      // Development mode hard delete of test school
      await User.deleteMany({ schoolId: id });
      await Teacher.deleteMany({ schoolId: id });
      await Student.deleteMany({ schoolId: id });
      await ParentProfile.deleteMany({ schoolId: id });
      await School.findByIdAndDelete(id);

      await AuditLog.create({
        actor: req.user._id,
        action: 'HARD_DELETE_SCHOOL',
        description: `Super Admin permanently deleted test school ${school.name} (${school.schoolCode})`,
        entity: 'School',
      });

      return res.status(200).json({
        success: true,
        message: `School '${school.name}' (${school.schoolCode}) and all linked records deleted permanently.`,
      });
    } else {
      // Production soft delete / archive
      school.isActive = false;
      school.subscription.status = 'suspended';
      await school.save();

      await User.updateMany({ schoolId: id }, { $set: { isActive: false } });

      await AuditLog.create({
        actor: req.user._id,
        action: 'ARCHIVE_SCHOOL',
        schoolId: school._id,
        description: `Super Admin archived school ${school.name} (${school.schoolCode})`,
        entity: 'School',
      });

      return res.status(200).json({
        success: true,
        message: `School '${school.name}' (${school.schoolCode}) has been archived and deactivated safely.`,
      });
    }
  } catch (error) {
    console.error('Delete school error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete/archive school.' });
  }
};

// @desc    Update School Enabled Modules
// @route   PATCH /api/super-admin/schools/:id/modules
// @access  Private (Super Admin)
export const updateSchoolModules = async (req, res) => {
  try {
    const { enabledModules } = req.body;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    const validModules = (enabledModules || []).filter((m) => SUPPORTED_MODULES.includes(m));
    school.enabledModules = validModules;
    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_SCHOOL_MODULES',
      schoolId: school._id,
      description: `Super Admin updated enabled modules for ${school.name}: ${validModules.join(', ')}`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: 'School modules updated successfully.',
      enabledModules: school.enabledModules,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update school modules.' });
  }
};

// @desc    Update School Subscription
// @route   PATCH /api/super-admin/schools/:id/subscription
// @access  Private (Super Admin)
export const updateSchoolSubscription = async (req, res) => {
  try {
    const { status, plan, startDate, expiresAt } = req.body;
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    if (status && ['active', 'suspended', 'expired'].includes(status)) {
      school.subscription.status = status;
    }
    if (plan) school.subscription.plan = plan;
    if (startDate) school.subscription.startDate = new Date(startDate);
    if (expiresAt) school.subscription.expiresAt = new Date(expiresAt);

    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_SCHOOL_SUBSCRIPTION',
      schoolId: school._id,
      description: `Super Admin updated subscription for ${school.name} (Status: ${school.subscription.status}, Plan: ${school.subscription.plan})`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription updated successfully.',
      subscription: school.subscription,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update subscription.' });
  }
};

// @desc    Toggle School Status (Activate / Suspend)
// @route   PATCH /api/super-admin/schools/:id/status
// @access  Private (Super Admin)
export const toggleSchoolStatus = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    school.isActive = !school.isActive;
    if (!school.isActive) {
      school.subscription.status = 'suspended';
    } else {
      school.subscription.status = 'active';
    }
    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: school.isActive ? 'ACTIVATE_SCHOOL' : 'SUSPEND_SCHOOL',
      schoolId: school._id,
      description: `Super Admin ${school.isActive ? 'activated' : 'suspended'} school ${school.name}`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: `School ${school.name} is now ${school.isActive ? 'Active' : 'Suspended'}.`,
      school,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update school status.' });
  }
};

// @desc    Super Admin Reset Principal Password
// @route   POST /api/super-admin/schools/:id/reset-principal-password
// @access  Private (Super Admin)
export const resetPrincipalPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    const principal = await User.findOne({ schoolId: school._id, role: 'principal' });
    if (!principal) {
      return res.status(404).json({ success: false, message: 'No Principal account found for this school.' });
    }

    principal.password = newPassword; // Pre-save hook hashes it
    await principal.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'RESET_PRINCIPAL_PASSWORD',
      schoolId: school._id,
      description: `Super Admin reset password for Principal ${principal.loginId}`,
      entity: 'User',
    });

    // Return raw credentials ONCE
    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${principal.name}.`,
      credentials: {
        schoolName: school.name,
        schoolCode: school.schoolCode,
        schoolSlug: school.schoolSlug || school.schoolCode.toLowerCase(),
        portalUrl: `/s/${school.schoolSlug || school.schoolCode.toLowerCase()}/login`,
        principalName: principal.name,
        principalLoginId: principal.loginId,
        rawPassword: newPassword,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset principal password.' });
  }
};

// @desc    Get Super Admin Platform Stats (Real Live DB Data)
// @route   GET /api/super-admin/stats
// @access  Private (Super Admin)
export const getPlatformStats = async (req, res) => {
  try {
    const totalSchools = await School.countDocuments();
    const activeSchools = await School.countDocuments({ isActive: true, 'subscription.status': 'active' });
    const suspendedSchools = await School.countDocuments({
      $or: [{ 'subscription.status': 'suspended' }, { isActive: false }],
    });
    const totalPrincipals = await User.countDocuments({ role: 'principal' });

    // Expiring subscriptions within next 30 days
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringSubscriptions = await School.countDocuments({
      'subscription.expiresAt': { $lte: thirtyDaysFromNow, $gte: new Date() },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalSchools,
        activeSchools,
        suspendedSchools,
        totalPrincipals,
        expiringSubscriptions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch platform stats.' });
  }
};

// @desc    Add Custom Domain to School
// @route   POST /api/super-admin/schools/:id/domains
// @access  Private (Super Admin)
export const addCustomDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain } = req.body;

    const normalized = normalizeHostname(domain);
    if (!normalized || !isValidDomainFormat(normalized)) {
      return res.status(400).json({
        success: false,
        message: `Invalid domain name format '${domain}'. Must be a valid fully qualified domain name (e.g. school.com).`,
      });
    }

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    // Pre-check duplicate domain across all schools
    const existingSchoolWithDomain = await School.findOne({ 'customDomains.domain': normalized });
    if (existingSchoolWithDomain) {
      return res.status(409).json({
        success: false,
        message: `Domain '${normalized}' is already mapped to school '${existingSchoolWithDomain.name}' (${existingSchoolWithDomain.schoolCode}).`,
      });
    }

    if (!school.customDomains) school.customDomains = [];
    school.customDomains.push({
      domain: normalized,
      status: 'pending',
      addedAt: new Date(),
    });

    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'ADD_CUSTOM_DOMAIN',
      schoolId: school._id,
      description: `Super Admin mapped custom domain '${normalized}' to ${school.name}`,
      entity: 'School',
    });

    return res.status(201).json({
      success: true,
      message: `Custom domain '${normalized}' added to ${school.name}.`,
      customDomains: school.customDomains,
    });
  } catch (error) {
    console.error('Add custom domain error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Domain name is already mapped to another school in the system.',
      });
    }
    return res.status(500).json({ success: false, message: 'Failed to add custom domain.' });
  }
};

// @desc    Remove Custom Domain from School
// @route   DELETE /api/super-admin/schools/:id/domains/:domainName
// @access  Private (Super Admin)
export const removeCustomDomain = async (req, res) => {
  try {
    const { id, domainName } = req.params;
    const normalized = normalizeHostname(domainName);

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    school.customDomains = (school.customDomains || []).filter((d) => d.domain !== normalized);
    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'REMOVE_CUSTOM_DOMAIN',
      schoolId: school._id,
      description: `Super Admin removed custom domain '${normalized}' from ${school.name}`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: `Custom domain '${normalized}' removed from ${school.name}.`,
      customDomains: school.customDomains,
    });
  } catch (error) {
    console.error('Remove custom domain error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove custom domain.' });
  }
};

// @desc    Update Custom Domain Status
// @route   PATCH /api/super-admin/schools/:id/domains/:domainName/status
// @access  Private (Super Admin)
export const updateDomainStatus = async (req, res) => {
  try {
    const { id, domainName } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'disabled'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'pending', 'verified', or 'disabled'." });
    }

    const normalized = normalizeHostname(domainName);
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    const targetDomain = (school.customDomains || []).find((d) => d.domain === normalized);
    if (!targetDomain) {
      return res.status(404).json({ success: false, message: `Domain '${normalized}' is not mapped to this school.` });
    }

    targetDomain.status = status;
    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_DOMAIN_STATUS',
      schoolId: school._id,
      description: `Super Admin updated custom domain '${normalized}' status to '${status}'`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: `Custom domain '${normalized}' status updated to '${status}'.`,
      customDomains: school.customDomains,
    });
  } catch (error) {
    console.error('Update domain status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update domain status.' });
  }
};

// @desc    Update School Subdomain
// @route   PATCH /api/super-admin/schools/:id/subdomain
// @access  Private (Super Admin)
export const updateSubdomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { subdomain } = req.body;

    const cleanSub = (subdomain || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    if (cleanSub) {
      const existing = await School.findOne({ _id: { $ne: id }, subdomain: cleanSub });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Subdomain '${cleanSub}' is already in use by school '${existing.name}'.`,
        });
      }
      school.subdomain = cleanSub;
    } else {
      school.subdomain = null;
    }

    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'UPDATE_SUBDOMAIN',
      schoolId: school._id,
      description: `Super Admin updated subdomain for ${school.name} to '${school.subdomain || 'none'}'`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: `Subdomain updated for ${school.name}.`,
      subdomain: school.subdomain,
    });
  } catch (error) {
    console.error('Update subdomain error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update subdomain.' });
  }
};

