import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { StudentLeave } from '../models/StudentLeave.js';
import { Subject } from '../models/Subject.js';
import { SubjectAssignment } from '../models/SubjectAssignment.js';
import { SubjectRemark } from '../models/SubjectRemark.js';
import { SalaryRecord } from '../models/SalaryRecord.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { AuditLog } from '../models/AuditLog.js';
import { getTenantSchoolId, resolveTeacherProfile } from '../utils/teacherResolver.js';

// ==========================================
// PRINCIPAL TEACHER MANAGEMENT CONTROLLERS
// ==========================================

// @desc    Create new Teacher (Account + Profile)
// @route   POST /api/principal/teachers
// @access  Private (Principal)
export const createTeacher = async (req, res) => {
  let createdUserId = null;
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      name,
      employeeId,
      loginId,
      password,
      email,
      phone,
      gender,
      dob,
      joiningDate,
      qualification,
      experienceYears,
      address,
      photoUrl,
      salary,
      department,
      designation,
      teacherType,
      isClassTeacher,
      classTeacherClassId,
      classTeacherSectionId,
      assignedClassIds,
      assignedSectionIds,
      assignedSubjectIds,
      bloodGroup,
      emergencyContact,
      documents,
    } = req.body;

    if (!name || !employeeId || !loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Teacher Name, Employee ID, Login ID, and Password are required.',
      });
    }

    const formattedEmployeeId = employeeId.toUpperCase().trim();
    const formattedLoginId = loginId.toUpperCase().trim();

    // 1. Check duplicate Login ID in User model for this school
    const existingUser = await User.findOne({ schoolId, loginId: formattedLoginId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Login ID '${formattedLoginId}' already exists in this school.`,
      });
    }

    // 2. Check duplicate Employee ID in Teacher model for this school
    const existingTeacher = await Teacher.findOne({ schoolId, employeeId: formattedEmployeeId });
    if (existingTeacher) {
      return res.status(409).json({
        success: false,
        message: `Employee ID '${formattedEmployeeId}' already exists in this school.`,
      });
    }

    // 3. Compute teacherType and isClassTeacher
    const selectedTeacherType = teacherType || (isClassTeacher
      ? (Array.isArray(assignedSubjectIds) && assignedSubjectIds.length > 0 ? 'Class & Subject Teacher' : 'Class Teacher')
      : (Array.isArray(assignedSubjectIds) && assignedSubjectIds.length > 0 ? 'Subject Teacher' : 'Subject Teacher'));

    const computedIsClassTeacher = Boolean(
      selectedTeacherType === 'Class Teacher' ||
      selectedTeacherType === 'Class & Subject Teacher' ||
      isClassTeacher
    );

    // Validation rules per teacher type
    if ((selectedTeacherType === 'Class Teacher' || selectedTeacherType === 'Class & Subject Teacher') && (!classTeacherClassId || !classTeacherSectionId)) {
      return res.status(400).json({
        success: false,
        message: 'Class Teachers must have an assigned Class and Section.',
      });
    }

    if ((selectedTeacherType === 'Subject Teacher' || selectedTeacherType === 'Class & Subject Teacher') && (!Array.isArray(assignedSubjectIds) || assignedSubjectIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Subject Teachers must have at least one assigned Subject.',
      });
    }

    // Unique Class Teacher validation per Section
    if (computedIsClassTeacher && classTeacherSectionId) {
      const existingClassTeacher = await Teacher.findOne({
        schoolId,
        isClassTeacher: true,
        classTeacherSectionId,
      });

      if (existingClassTeacher) {
        return res.status(409).json({
          success: false,
          message: `This section already has an assigned Class Teacher (${existingClassTeacher.name}). Duplicate Class Teacher assignment is not allowed.`,
        });
      }
    }

    // 4. Create User Account
    const newUser = await User.create({
      schoolId,
      name: name.trim(),
      loginId: formattedLoginId,
      password, // Pre-save hook hashes password
      role: 'teacher',
      email: (email || '').toLowerCase().trim(),
      phone: (phone || '').trim(),
      isActive: true,
      createdBy: req.user._id,
    });

    createdUserId = newUser._id;

    // 5. Create Teacher Profile
    const newTeacher = await Teacher.create({
      schoolId,
      userId: newUser._id,
      loginId: formattedLoginId,
      employeeId: formattedEmployeeId,
      name: name.trim(),
      gender: gender || 'male',
      dob: dob ? new Date(dob) : null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      qualification: (qualification || '').trim(),
      experienceYears: Number(experienceYears) || 0,
      address: (address || '').trim(),
      photoUrl: (photoUrl || '').trim(),
      monthlySalary: Number(salary) || 0,
      department: (department || 'General').trim(),
      designation: (designation || 'Teacher').trim(),
      teacherType: selectedTeacherType,
      isClassTeacher: computedIsClassTeacher,
      classTeacherClassId: computedIsClassTeacher ? classTeacherClassId || null : null,
      classTeacherSectionId: computedIsClassTeacher ? classTeacherSectionId || null : null,
      assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
      assignedSectionIds: Array.isArray(assignedSectionIds) ? assignedSectionIds : [],
      assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
      bloodGroup: (bloodGroup || '').trim(),
      emergencyContact: (emergencyContact || '').trim(),
      documents: Array.isArray(documents) ? documents : [],
      createdBy: req.user._id,
    });

    // Bi-directional link persistence on User account
    newUser.teacherProfileId = newTeacher._id;
    await newUser.save();

    // Create initial Salary Record if monthlySalary > 0
    if (Number(salary) > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await SalaryRecord.create({
        schoolId,
        teacherId: newTeacher._id,
        month: currentMonth,
        baseSalary: Number(salary),
        netSalary: Number(salary),
        status: 'paid',
        paymentDate: new Date(),
        remarks: 'Initial joining monthly salary',
        createdBy: req.user._id,
      });
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_TEACHER',
      entity: 'Teacher',
      description: `Principal created teacher ${newTeacher.name} (EMP: ${newTeacher.employeeId}).`,
    });

    return res.status(201).json({
      success: true,
      message: `Teacher ${newTeacher.name} created successfully.`,
      teacher: newTeacher,
      credentials: {
        name: newTeacher.name,
        employeeId: newTeacher.employeeId,
        loginId: newUser.loginId,
        rawPassword: password,
      },
    });
  } catch (error) {
    console.error('Create teacher error:', error);

    // Rollback orphaned user account if teacher profile creation failed
    if (createdUserId) {
      await User.findByIdAndDelete(createdUserId).catch(() => {});
    }

    if (res.headersSent) return;

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Employee ID or Login ID already exists in this school.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create teacher. Please check form details.',
    });
  }
};

// @desc    Get All Teachers for School (Search, Filter, Pagination)
// @route   GET /api/principal/teachers
// @access  Private (Principal)
export const getTeachers = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const department = req.query.department;
    const status = req.query.status;
    const isClassTeacher = req.query.isClassTeacher;

    const query = { schoolId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    if (isClassTeacher !== undefined && isClassTeacher !== '') {
      query.isClassTeacher = isClassTeacher === 'true';
    }

    // Populate user to filter by status if requested
    const total = await Teacher.countDocuments(query);
    let teachers = await Teacher.find(query)
      .populate('userId', 'email phone isActive lastLogin')
      .populate('assignedClassIds', 'name displayName')
      .populate('assignedSectionIds', 'name')
      .populate('assignedSubjectIds', 'name code')
      .populate('classTeacherClassId', 'name')
      .populate('classTeacherSectionId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (status !== undefined && status !== '') {
      const activeFilter = status === 'active';
      teachers = teachers.filter((t) => t.userId && t.userId.isActive === activeFilter);
    }

    return res.status(200).json({
      success: true,
      teachers,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teachers.' });
  }
};

// @desc    Get Single Teacher Details
// @route   GET /api/principal/teachers/:id
// @access  Private (Principal)
export const getTeacherById = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const teacher = await Teacher.findOne({ _id: id, schoolId })
      .populate('userId', 'loginId email phone isActive lastLogin')
      .populate('assignedClassIds', 'name displayName category')
      .populate('assignedSectionIds', 'name capacity roomNumber')
      .populate('assignedSubjectIds', 'name code subjectType')
      .populate('classTeacherClassId', 'name')
      .populate('classTeacherSectionId', 'name');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const salaryHistory = await SalaryRecord.find({ schoolId, teacherId: teacher._id }).sort({ month: -1 });
    const leaveHistory = await LeaveRequest.find({ schoolId, teacherId: teacher._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      teacher,
      salaryHistory,
      leaveHistory,
    });
  } catch (error) {
    console.error('Get teacher by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher profile.' });
  }
};

// @desc    Update Teacher Profile & Assignments
// @route   PUT /api/principal/teachers/:id
// @access  Private (Principal)
export const updateTeacher = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;
    const {
      name,
      employeeId,
      gender,
      dob,
      joiningDate,
      qualification,
      experienceYears,
      address,
      photoUrl,
      salary,
      department,
      designation,
      isClassTeacher,
      classTeacherClassId,
      classTeacherSectionId,
      assignedClassIds,
      assignedSectionIds,
      assignedSubjectIds,
      bloodGroup,
      emergencyContact,
      documents,
      email,
      phone,
    } = req.body;

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    // Check Employee ID uniqueness if changed
    if (employeeId && employeeId.toUpperCase().trim() !== teacher.employeeId) {
      const formattedEmpId = employeeId.toUpperCase().trim();
      const dupEmp = await Teacher.findOne({ schoolId, employeeId: formattedEmpId, _id: { $ne: teacher._id } });
      if (dupEmp) {
        return res.status(409).json({ success: false, message: `Employee ID '${formattedEmpId}' is already in use.` });
      }
      teacher.employeeId = formattedEmpId;
    }

    // Unique Class Teacher validation
    if (isClassTeacher && classTeacherSectionId) {
      const existingClassTeacher = await Teacher.findOne({
        schoolId,
        isClassTeacher: true,
        classTeacherSectionId,
        _id: { $ne: teacher._id },
      });

      if (existingClassTeacher) {
        return res.status(409).json({
          success: false,
          message: `This section already has an assigned Class Teacher (${existingClassTeacher.name}). Duplicate Class Teacher assignment is not allowed.`,
        });
      }
    }

    if (name) teacher.name = name.trim();
    if (gender) teacher.gender = gender;
    if (dob) teacher.dob = new Date(dob);
    if (joiningDate) teacher.joiningDate = new Date(joiningDate);
    if (qualification !== undefined) teacher.qualification = qualification.trim();
    if (experienceYears !== undefined) teacher.experienceYears = Number(experienceYears);
    if (address !== undefined) teacher.address = address.trim();
    if (photoUrl !== undefined) teacher.photoUrl = photoUrl.trim();
    if (salary !== undefined) teacher.monthlySalary = Number(salary);
    if (department) teacher.department = department.trim();
    if (designation) teacher.designation = designation.trim();

    teacher.isClassTeacher = Boolean(isClassTeacher);
    teacher.classTeacherClassId = isClassTeacher ? classTeacherClassId || null : null;
    teacher.classTeacherSectionId = isClassTeacher ? classTeacherSectionId || null : null;

    if (Array.isArray(assignedClassIds)) teacher.assignedClassIds = assignedClassIds;
    if (Array.isArray(assignedSectionIds)) teacher.assignedSectionIds = assignedSectionIds;
    if (Array.isArray(assignedSubjectIds)) teacher.assignedSubjectIds = assignedSubjectIds;
    if (bloodGroup !== undefined) teacher.bloodGroup = bloodGroup.trim();
    if (emergencyContact !== undefined) teacher.emergencyContact = emergencyContact.trim();
    if (Array.isArray(documents)) teacher.documents = documents;
    teacher.updatedBy = req.user._id;

    await teacher.save();

    // Update User model name, email, phone
    await User.findByIdAndUpdate(teacher.userId, {
      name: teacher.name,
      email: (email || '').toLowerCase().trim(),
      phone: (phone || '').trim(),
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_TEACHER',
      entity: 'Teacher',
      description: `Principal updated teacher profile for ${teacher.name}.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Teacher profile updated successfully.',
      teacher,
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update teacher profile.' });
  }
};

// @desc    Delete Teacher Profile & User Account
// @route   DELETE /api/principal/teachers/:id
// @access  Private (Principal)
export const deleteTeacher = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    // Delete associated User account
    await User.findByIdAndDelete(teacher.userId);
    // Delete Teacher profile
    await Teacher.findByIdAndDelete(teacher._id);

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'DELETE_TEACHER',
      entity: 'Teacher',
      description: `Principal deleted teacher ${teacher.name} (EMP: ${teacher.employeeId}).`,
    });

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.name} deleted successfully.`,
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete teacher.' });
  }
};

// @desc    Toggle Teacher Account Active / Inactive Status
// @route   PATCH /api/principal/teachers/:id/status
// @access  Private (Principal)
export const toggleTeacherStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const user = await User.findById(teacher.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Teacher user account missing.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: user.isActive ? 'ACTIVATE_TEACHER' : 'DEACTIVATE_TEACHER',
      entity: 'Teacher',
      description: `Principal ${user.isActive ? 'activated' : 'deactivated'} teacher ${teacher.name}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.name} account is now ${user.isActive ? 'Active' : 'Inactive'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Toggle teacher status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to toggle teacher status.' });
  }
};

// @desc    Reset Teacher Password
// @route   POST /api/principal/teachers/:id/reset-password
// @access  Private (Principal)
export const resetTeacherPassword = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const user = await User.findById(teacher.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.password = newPassword.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${teacher.name}.`,
      credentials: {
        name: teacher.name,
        employeeId: teacher.employeeId,
        loginId: user.loginId,
        rawPassword: newPassword.trim(),
      },
    });
  } catch (error) {
    console.error('Reset teacher password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// @desc    Change Teacher Login ID
// @route   PATCH /api/principal/teachers/:id/login-id
// @access  Private (Principal)
export const changeTeacherLoginId = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;
    const { newLoginId } = req.body;

    if (!newLoginId) {
      return res.status(400).json({ success: false, message: 'New Login ID is required.' });
    }

    const formattedLoginId = newLoginId.toUpperCase().trim();

    const existing = await User.findOne({ schoolId, loginId: formattedLoginId });
    if (existing) {
      return res.status(409).json({ success: false, message: `Login ID '${formattedLoginId}' is already in use.` });
    }

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    await User.findByIdAndUpdate(teacher.userId, { loginId: formattedLoginId });

    return res.status(200).json({
      success: true,
      message: `Login ID updated to '${formattedLoginId}'.`,
      loginId: formattedLoginId,
    });
  } catch (error) {
    console.error('Change login ID error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change login ID.' });
  }
};

// @desc    Add / Issue Teacher Monthly Salary Record
// @route   POST /api/principal/teachers/:id/salary
// @access  Private (Principal)
export const addTeacherSalaryRecord = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;
    const { month, baseSalary, allowances, deductions, remarks, status } = req.body;

    if (!month || baseSalary === undefined) {
      return res.status(400).json({ success: false, message: 'Month (YYYY-MM) and Base Salary are required.' });
    }

    const teacher = await Teacher.findOne({ _id: id, schoolId });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found.' });
    }

    const base = Number(baseSalary) || 0;
    const allow = Number(allowances) || 0;
    const ded = Number(deductions) || 0;
    const net = base + allow - ded;

    let salaryRecord = await SalaryRecord.findOne({ schoolId, teacherId: teacher._id, month });

    if (salaryRecord) {
      salaryRecord.baseSalary = base;
      salaryRecord.allowances = allow;
      salaryRecord.deductions = ded;
      salaryRecord.netSalary = net;
      if (status) salaryRecord.status = status;
      if (remarks) salaryRecord.remarks = remarks;
      salaryRecord.paymentDate = new Date();
      await salaryRecord.save();
    } else {
      salaryRecord = await SalaryRecord.create({
        schoolId,
        teacherId: teacher._id,
        month,
        baseSalary: base,
        allowances: allow,
        deductions: ded,
        netSalary: net,
        status: status || 'paid',
        paymentDate: new Date(),
        remarks: remarks || '',
        createdBy: req.user._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Salary record for ${month} saved successfully.`,
      salaryRecord,
    });
  } catch (error) {
    console.error('Add salary record error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record salary.' });
  }
};

// @desc    Approve or Reject Teacher Leave Request
// @route   PATCH /api/principal/teachers/leave/:leaveId
// @access  Private (Principal)
export const manageLeaveRequest = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { leaveId } = req.params;
    const { status, actionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const leave = await LeaveRequest.findOne({ _id: leaveId, schoolId });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leave.status = status;
    leave.actionReason = actionReason || '';
    leave.actionBy = req.user._id;
    leave.actionAt = new Date();
    await leave.save();

    // Deduct leave balance if approved
    if (status === 'approved') {
      const teacher = await Teacher.findById(leave.teacherId);
      if (teacher && teacher.leaveBalance) {
        const type = leave.leaveType;
        if (teacher.leaveBalance[type] !== undefined) {
          teacher.leaveBalance[type] = Math.max(0, teacher.leaveBalance[type] - (leave.totalDays || 1));
          await teacher.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully.`,
      leave,
    });
  } catch (error) {
    console.error('Manage leave request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process leave request.' });
  }
};

// @desc    Get All Leave Requests for School
// @route   GET /api/principal/teachers/leaves
// @access  Private (Principal)
export const getSchoolLeaveRequests = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const leaves = await LeaveRequest.find({ schoolId })
      .populate('teacherId', 'name employeeId department designation')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaves });
  } catch (error) {
    console.error('Get school leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests.' });
  }
};

// ==========================================
// TEACHER PORTAL SELF CONTROLLERS
// ==========================================

// @desc    Get Logged-In Teacher's Own Profile & Portal Dashboard
// @route   GET /api/teacher/me
// @access  Private (Teacher)
export const getTeacherSelfProfile = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    const teacher = await resolveTeacherProfile(req, [
      { path: 'assignedClassIds', select: 'name displayName category' },
      { path: 'assignedSectionIds', select: 'name capacity roomNumber' },
      { path: 'assignedSubjectIds', select: 'name code subjectType' },
      { path: 'classTeacherClassId', select: 'name' },
      { path: 'classTeacherSectionId', select: 'name' },
    ]);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found for this account.' });
    }

    const isClassTeacherRole = Boolean(
      teacher.isClassTeacher ||
      teacher.teacherType === 'Class Teacher' ||
      teacher.teacherType === 'Class & Subject Teacher' ||
      Boolean(teacher.classTeacherClassId)
    );

    if (isClassTeacherRole && !teacher.isClassTeacher) {
      teacher.isClassTeacher = true;
      await teacher.save();
    }

    const capabilities = {
      canAdmitStudents: isClassTeacherRole,
      canManageOwnClass: isClassTeacherRole,
      canMarkAttendance: true,
      canEnterMarks: true,
      canCreateClassAnnouncement: true,
      canAssignSubjectTeacher: false,
    };

    const primaryClassTeacherAssignment = isClassTeacherRole && teacher.classTeacherClassId ? {
      class: teacher.classTeacherClassId,
      section: teacher.classTeacherSectionId,
    } : null;

    // Fetch active Subject Assignments from SubjectAssignment collection
    const activeSubjectAssignments = await SubjectAssignment.find({
      schoolId,
      teacherId: teacher._id,
      status: 'active',
    })
      .populate('classId', 'name displayName category')
      .populate('sectionId', 'name capacity roomNumber')
      .populate('subjectId', 'name code subjectType');

    const allowedClassIds = new Set();
    const allowedSectionIds = new Set();

    if (teacher.classTeacherClassId) allowedClassIds.add(String(teacher.classTeacherClassId._id || teacher.classTeacherClassId));
    if (teacher.classTeacherSectionId) allowedSectionIds.add(String(teacher.classTeacherSectionId._id || teacher.classTeacherSectionId));

    if (Array.isArray(teacher.assignedClassIds)) {
      teacher.assignedClassIds.forEach((c) => allowedClassIds.add(String(c._id || c)));
    }
    if (Array.isArray(teacher.assignedSectionIds)) {
      teacher.assignedSectionIds.forEach((s) => allowedSectionIds.add(String(s._id || s)));
    }

    activeSubjectAssignments.forEach((sa) => {
      if (sa.classId) allowedClassIds.add(String(sa.classId._id || sa.classId));
      if (sa.sectionId) allowedSectionIds.add(String(sa.sectionId._id || sa.sectionId));
    });

    const classIdArray = Array.from(allowedClassIds);
    const sectionIdArray = Array.from(allowedSectionIds);

    let studentQuery = { schoolId, status: 'active' };
    if (classIdArray.length > 0 && sectionIdArray.length > 0) {
      studentQuery.$or = [
        { currentClassId: { $in: classIdArray } },
        { currentSectionId: { $in: sectionIdArray } },
      ];
    } else if (classIdArray.length > 0) {
      studentQuery.currentClassId = { $in: classIdArray };
    } else if (sectionIdArray.length > 0) {
      studentQuery.currentSectionId = { $in: sectionIdArray };
    }

    const assignedStudentCount = (classIdArray.length > 0 || sectionIdArray.length > 0)
      ? await Student.countDocuments(studentQuery)
      : 0;

    const salaryHistory = await SalaryRecord.find({ schoolId, teacherId: teacher._id }).sort({ month: -1 }).limit(6);
    const leaveRequests = await LeaveRequest.find({ schoolId, teacherId: teacher._id }).sort({ createdAt: -1 }).limit(10);

    const subjectAssignmentsList = Array.isArray(activeSubjectAssignments) ? activeSubjectAssignments : [];

    return res.status(200).json({
      success: true,
      teacher,
      primaryClassTeacherAssignment,
      subjectAssignments: subjectAssignmentsList,
      activeSubjectAssignments: subjectAssignmentsList,
      capabilities,
      teacherCapabilities: capabilities,
      assignedStudentCount,
      salaryHistory,
      leaveRequests,
    });
  } catch (error) {
    console.error('Get teacher self profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher profile.' });
  }
};

// @desc    Teacher Apply for Leave
// @route   POST /api/teacher/leaves
// @access  Private (Teacher)
export const applyTeacherLeave = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Start date, end date, and reason are required.' });
    }

    const teacher = await resolveTeacherProfile(req);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date.' });
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await LeaveRequest.create({
      schoolId,
      teacherId: teacher._id,
      leaveType: leaveType || 'casual',
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave,
    });
  } catch (error) {
    console.error('Apply teacher leave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.' });
  }
};

// @desc    Get Logged-In Teacher's Own Leave Requests
// @route   GET /api/teacher/leaves
// @access  Private (Teacher)
export const getTeacherSelfLeaves = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await resolveTeacherProfile(req);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found for this account.' });
    }

    const leaves = await LeaveRequest.find({ schoolId, teacherId: teacher._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      leaves,
      requests: leaves,
    });
  } catch (error) {
    console.error('Get teacher self leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher leave requests.' });
  }
};

// @desc    Get Student Leave Requests for Class Teacher's assigned class & section
// @route   GET /api/teacher/student-leaves
// @access  Private (Class Teacher)
export const getClassTeacherStudentLeaves = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await resolveTeacherProfile(req);

    if (!teacher || (!teacher.isClassTeacher && !teacher.classTeacherClassId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Class Teachers can access student leave requests.',
      });
    }

    const classId = teacher.classTeacherClassId._id || teacher.classTeacherClassId;
    const sectionId = teacher.classTeacherSectionId?._id || teacher.classTeacherSectionId;

    const studentQuery = { schoolId, currentClassId: classId };
    if (sectionId) studentQuery.currentSectionId = sectionId;

    const students = await Student.find(studentQuery).select('_id');
    const studentIds = students.map((s) => s._id);

    const leaves = await StudentLeave.find({ schoolId, studentId: { $in: studentIds } })
      .populate({
        path: 'studentId',
        select: 'fullName admissionNumber rollNumber currentClassId currentSectionId',
        populate: [
          { path: 'currentClassId', select: 'name' },
          { path: 'currentSectionId', select: 'name' },
        ],
      })
      .populate('parentAccountId', 'primaryGuardian')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, leaves, requests: leaves });
  } catch (error) {
    console.error('Get class teacher student leaves error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student leave requests.' });
  }
};

// @desc    Approve / Reject Student Leave Request by Class Teacher
// @route   PATCH /api/teacher/student-leaves/:leaveId
// @access  Private (Class Teacher)
export const manageStudentLeaveByClassTeacher = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { leaveId } = req.params;
    const { status, reviewRemark } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const teacher = await resolveTeacherProfile(req);
    if (!teacher || (!teacher.isClassTeacher && !teacher.classTeacherClassId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Class Teachers can approve or reject student leave requests.',
      });
    }

    const leave = await StudentLeave.findOne({ _id: leaveId, schoolId }).populate('studentId');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Student leave request not found.' });
    }

    const classId = teacher.classTeacherClassId._id || teacher.classTeacherClassId;
    const sectionId = teacher.classTeacherSectionId?._id || teacher.classTeacherSectionId;

    const studentClassId = leave.studentId?.currentClassId;
    const studentSectionId = leave.studentId?.currentSectionId;

    if (
      String(studentClassId) !== String(classId) ||
      (sectionId && String(studentSectionId) !== String(sectionId))
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only review student leave requests for your assigned class and section.',
      });
    }

    leave.status = status;
    leave.reviewRemark = (reviewRemark || '').trim();
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    return res.status(200).json({ success: true, message: `Student leave request ${status}.`, leave });
  } catch (error) {
    console.error('Manage student leave by class teacher error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student leave request.' });
  }
};

// @desc    Record Student Leave by Class Teacher
// @route   POST /api/teacher/student-leaves
// @access  Private (Class Teacher)
export const createStudentLeaveByClassTeacher = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId, startDate, endDate, reason } = req.body;

    if (!studentId || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Student ID, start date, end date, and reason are required.' });
    }

    const context = await resolveTeacherTeachingContext(req);
    if (!context) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (!context.canManageClassStudents(student.currentClassId, student.currentSectionId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only record leave for students in your assigned class and section.',
      });
    }

    const leave = await StudentLeave.create({
      schoolId,
      studentId: student._id,
      parentAccountId: student.parentAccountId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason.trim(),
      status: 'approved',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    });

    return res.status(201).json({ success: true, message: 'Student leave recorded successfully.', leave });
  } catch (error) {
    console.error('Create student leave error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record student leave.' });
  }
};

// @desc    Get Subject Teachers assigned to Class Teacher's Class
// @route   GET /api/teacher/subject-teachers
// @access  Private (Class Teacher)
export const getClassSubjectTeachers = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const teacher = await resolveTeacherProfile(req);

    if (!teacher || (!teacher.isClassTeacher && !teacher.classTeacherClassId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Class Teachers can manage class subject teachers.',
      });
    }

    const classId = teacher.classTeacherClassId._id || teacher.classTeacherClassId;

    const assignments = await SubjectAssignment.find({
      schoolId,
      classId,
      status: 'active',
    })
      .populate('teacherId', 'name employeeId email department designation')
      .populate('subjectId', 'name code subjectType');

    const availableTeachers = await Teacher.find({ schoolId, isActive: { $ne: false } })
      .select('_id name employeeId designation department')
      .sort({ name: 1 });

    const availableSubjects = await Subject.find({ schoolId, classId }).select('_id name code subjectType');

    return res.status(200).json({
      success: true,
      assignments,
      availableTeachers,
      availableSubjects,
    });
  } catch (error) {
    console.error('Get class subject teachers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch subject teachers.' });
  }
};

// @desc    Assign Subject Teacher to Class Teacher's Class
// @route   POST /api/teacher/subject-teachers
// @access  Private (Class Teacher)
export const assignSubjectTeacherToClass = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { teacherId, subjectId } = req.body;

    if (!teacherId || !subjectId) {
      return res.status(400).json({ success: false, message: 'Teacher ID and Subject ID are required.' });
    }

    const classTeacher = await resolveTeacherProfile(req);
    if (!classTeacher || (!classTeacher.isClassTeacher && !classTeacher.classTeacherClassId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Class Teachers can assign subject teachers.',
      });
    }

    const classId = classTeacher.classTeacherClassId._id || classTeacher.classTeacherClassId;
    const sectionId = classTeacher.classTeacherSectionId?._id || classTeacher.classTeacherSectionId;

    const targetTeacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!targetTeacher) {
      return res.status(404).json({ success: false, message: 'Selected teacher account not found.' });
    }

    // Upsert SubjectAssignment document atomically with compound index protection
    const assignment = await SubjectAssignment.findOneAndUpdate(
      { schoolId, teacherId, classId, sectionId: sectionId || null, subjectId },
      {
        $set: {
          assignedByTeacherId: req.user._id,
          assignmentType: 'SUBJECT_TEACHER',
          status: 'active',
        },
      },
      { upsert: true, new: true }
    );

    if (!targetTeacher.assignedClassIds.some((c) => String(c) === String(classId))) {
      targetTeacher.assignedClassIds.push(classId);
    }
    if (sectionId && !targetTeacher.assignedSectionIds.some((s) => String(s) === String(sectionId))) {
      targetTeacher.assignedSectionIds.push(sectionId);
    }
    if (!targetTeacher.assignedSubjectIds.some((sub) => String(sub) === String(subjectId))) {
      targetTeacher.assignedSubjectIds.push(subjectId);
    }

    await targetTeacher.save();

    return res.status(200).json({
      success: true,
      message: `Subject teacher ${targetTeacher.name} assigned successfully.`,
      assignment,
      teacher: targetTeacher,
    });
  } catch (error) {
    console.error('Assign subject teacher error:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign subject teacher.' });
  }
};

// @desc    Remove Subject Teacher Assignment from Class Teacher's Class
// @route   DELETE /api/teacher/subject-teachers/:assignmentId
// @access  Private (Class Teacher)
export const removeSubjectTeacherAssignment = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { assignmentId } = req.params;

    const classTeacher = await resolveTeacherProfile(req);
    if (!classTeacher || (!classTeacher.isClassTeacher && !classTeacher.classTeacherClassId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Class Teachers can remove subject teacher assignments.',
      });
    }

    const assignment = await SubjectAssignment.findOne({ _id: assignmentId, schoolId });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Subject assignment not found.' });
    }

    const classId = classTeacher.classTeacherClassId._id || classTeacher.classTeacherClassId;
    if (String(assignment.classId) !== String(classId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only manage subject teacher assignments for your assigned class.',
      });
    }

    assignment.status = 'inactive';
    await assignment.save();

    return res.status(200).json({ success: true, message: 'Subject teacher assignment removed successfully.' });
  } catch (error) {
    console.error('Remove subject teacher assignment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove subject teacher assignment.' });
  }
};
