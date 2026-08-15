import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { StudentAcademicEnrollment } from '../models/StudentAcademicEnrollment.js';
import { StudentDocument } from '../models/StudentDocument.js';
import { StudentStatusHistory } from '../models/StudentStatusHistory.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Teacher } from '../models/Teacher.js';
import { AuditLog } from '../models/AuditLog.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { School } from '../models/School.js';
import { getTenantSchoolId, resolveTeacherProfile } from '../utils/teacherResolver.js';

const getIdStr = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val._id && val._id !== val) return getIdStr(val._id);
    if (typeof val.toString === 'function') return val.toString();
  }
  return String(val);
};

// ==========================================
// PRINCIPAL & AUTHORIZED TEACHER STUDENT APIS
// ==========================================

// @desc    Onboard / Admit New Student (Atomic with Family Account creation or linkage)
// @route   POST /api/principal/students & POST /api/teacher/students
// @access  Private (Principal, Class Teacher)
export const createStudent = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    const {
      firstName: rawFirstName,
      middleName = '',
      lastName: rawLastName = '',
      fullName,
      dateOfBirth,
      gender = 'male',
      bloodGroup = '',
      photoUrl = '',
      aadhaarNumber = '',
      nationality = 'Indian',
      religion = '',
      category = 'General',
      house = '',
      address = {},
      admissionNumber,
      rollNumber,
      admissionDate,
      previousSchool = '',
      medicalNotes = '',
      emergencyContact = '',
      primaryGuardian,
      secondaryGuardian = {},
      familyOption = 'new',
      existingFamilyId,
      parentLoginId,
      parentPassword,
      currentAcademicSessionId,
      currentClassId,
      currentSectionId,
    } = req.body;

    let finalAcademicSessionId = currentAcademicSessionId;
    let finalClassId = currentClassId;
    let finalSectionId = currentSectionId;

    if (req.user.role !== 'teacher' && req.user.role !== 'principal') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only authorized Class Teachers and Principals can admit new students.',
      });
    }

    if (req.user.role === 'teacher') {
      const teacher = await resolveTeacherProfile(req);
      if (!teacher) {
        return res.status(403).json({
          success: false,
          message: 'Teacher profile not found for this account. Contact your administrator.',
        });
      }

      const isClassTeacherRole = Boolean(
        teacher.isClassTeacher ||
        teacher.teacherType === 'Class Teacher' ||
        teacher.teacherType === 'Class & Subject Teacher' ||
        Boolean(teacher.classTeacherClassId)
      );

      if (!isClassTeacherRole && !teacher.canAdmitStudents) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only authorized Class Teachers can admit new students.',
        });
      }

      const assignedClassId = teacher.classTeacherClassId?._id || teacher.classTeacherClassId;
      const assignedSectionId = teacher.classTeacherSectionId?._id || teacher.classTeacherSectionId;

      if (!assignedClassId || !assignedSectionId) {
        return res.status(403).json({
          success: false,
          message: 'Class Teacher has no assigned class or section for student admission.',
        });
      }

      if (finalClassId && String(finalClassId) !== String(assignedClassId)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Class Teachers can only add students to their assigned class.',
        });
      }

      if (finalSectionId && String(finalSectionId) !== String(assignedSectionId)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Class Teachers can only add students to their assigned section.',
        });
      }

      finalClassId = assignedClassId;
      finalSectionId = assignedSectionId;
    }

    // Name formatting
    let firstName = rawFirstName;
    let lastName = rawLastName;
    if (!firstName && fullName) {
      const parts = fullName.trim().split(' ');
      firstName = parts[0];
      lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'Student';
    }

    if (!firstName) {
      return res.status(400).json({ success: false, message: 'Student name is required.' });
    }

    if (!admissionNumber) {
      return res.status(400).json({ success: false, message: 'Admission number is required.' });
    }
    const formattedAdmissionNumber = admissionNumber.toUpperCase().trim();

    // Check duplicate admission number early
    const existingStudent = await Student.findOne({ schoolId, admissionNumber: formattedAdmissionNumber });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Admission number '${formattedAdmissionNumber}' is already registered in this school.`,
      });
    }

    // Auto-resolve active academic session if missing
    if (!finalAcademicSessionId) {
      const activeSession = await AcademicSession.findOne({ schoolId, isCurrent: true });
      if (activeSession) {
        finalAcademicSessionId = activeSession._id;
      } else {
        const anySession = await AcademicSession.findOne({ schoolId });
        if (anySession) finalAcademicSessionId = anySession._id;
      }
    }

    let parentProfileRecord = null;
    let createdCredentials = null;

    // Handle Family Account (New vs Link)
    if (familyOption === 'link') {
      if (!existingFamilyId) {
        return res.status(400).json({ success: false, message: 'Existing Family Account ID is required when linking.' });
      }
      parentProfileRecord = await ParentProfile.findOne({ _id: existingFamilyId, schoolId });
      if (!parentProfileRecord) {
        return res.status(404).json({ success: false, message: 'Selected Family Account not found in this school.' });
      }
    } else {
      // Create NEW Family Account
      if (!primaryGuardian || !primaryGuardian.name || !primaryGuardian.phone) {
        return res.status(400).json({ success: false, message: 'Primary Guardian Name and Phone are required for new family account.' });
      }

      // Auto-derive loginId if not explicitly provided
      let resolvedParentLoginId = parentLoginId;
      if (!resolvedParentLoginId) {
        if (primaryGuardian.email && primaryGuardian.email.trim()) {
          resolvedParentLoginId = primaryGuardian.email.trim();
        } else if (primaryGuardian.phone && primaryGuardian.phone.trim()) {
          resolvedParentLoginId = primaryGuardian.phone.trim();
        } else {
          resolvedParentLoginId = `PARENT_${formattedAdmissionNumber}`;
        }
      }

      if (!parentPassword) {
        return res.status(400).json({ success: false, message: 'Parent Login Password is required for new family account.' });
      }

      const formattedParentLoginId = resolvedParentLoginId.toUpperCase().trim();

      // Check unique Login ID in User model
      const existingUser = await User.findOne({ schoolId, loginId: formattedParentLoginId });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `Parent Login ID '${formattedParentLoginId}' is already in use at this school.`,
        });
      }

      // Check duplicate phone for parent users
      if (primaryGuardian.phone) {
        const existingPhoneUser = await User.findOne({ schoolId, phone: primaryGuardian.phone.trim(), role: 'parent' });
        if (existingPhoneUser) {
          return res.status(409).json({
            success: false,
            message: `A parent account with phone number '${primaryGuardian.phone.trim()}' already exists. Please choose 'Link to Existing Family' instead.`,
          });
        }
      }

      const parentName = primaryGuardian.name.trim();

      // Fetch School details for credentials modal
      const schoolDoc = await School.findById(schoolId);
      const schoolCode = schoolDoc?.code || schoolDoc?.schoolCode || '';
      const schoolName = schoolDoc?.name || '';
      const schoolSlug = schoolDoc?.slug || '';

      // Create Parent User Account (User model pre-save hook hashes password)
      const newParentUser = await User.create({
        schoolId,
        name: parentName,
        loginId: formattedParentLoginId,
        password: parentPassword,
        role: 'parent',
        email: (primaryGuardian.email || '').toLowerCase().trim(),
        phone: primaryGuardian.phone.trim(),
        isActive: true,
        createdBy: req.user._id,
      });

      const familyCode = `FAM${Math.floor(10000 + Math.random() * 90000)}`;

      // Create ParentProfile
      parentProfileRecord = await ParentProfile.create({
        schoolId,
        userId: newParentUser._id,
        familyCode,
        primaryGuardian: {
          name: parentName,
          relationship: primaryGuardian.relationship || 'Father',
          phone: primaryGuardian.phone.trim(),
          whatsapp: primaryGuardian.whatsapp || primaryGuardian.phone.trim(),
          email: (primaryGuardian.email || '').toLowerCase().trim(),
          occupation: primaryGuardian.occupation || '',
          qualification: primaryGuardian.qualification || '',
        },
        secondaryGuardian: secondaryGuardian || {},
        address: address || {},
        createdBy: req.user._id,
      });

      createdCredentials = {
        name: parentName,
        familyCode: parentProfileRecord.familyCode,
        loginId: newParentUser.loginId,
        rawPassword: parentPassword,
        schoolCode,
        schoolName,
        schoolSlug,
      };
    }

    const permanentStudentId = `STU${new Date().getFullYear()}${Math.floor(10000 + Math.random() * 90000)}`;
    const constructFullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

    // Create Student
    const newStudent = await Student.create({
      schoolId,
      permanentStudentId,
      admissionNumber: formattedAdmissionNumber,
      rollNumber: rollNumber ? Number(rollNumber) : null,
      firstName: firstName.trim(),
      middleName: (middleName || '').trim(),
      lastName: (lastName || '').trim(),
      fullName: constructFullName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2015-01-01'),
      gender,
      bloodGroup: (bloodGroup || '').trim(),
      photoUrl: (photoUrl || '').trim(),
      aadhaarNumber: (aadhaarNumber || '').trim(),
      nationality: (nationality || 'Indian').trim(),
      religion: (religion || '').trim(),
      category: (category || 'General').trim(),
      house: (house || '').trim(),
      address: address || {},
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      previousSchool: (previousSchool || '').trim(),
      medicalNotes: (medicalNotes || '').trim(),
      emergencyContact: (emergencyContact || '').trim(),
      currentAcademicSessionId: finalAcademicSessionId,
      currentClassId: finalClassId,
      currentSectionId: finalSectionId,
      parentAccountId: parentProfileRecord._id,
      status: 'active',
      createdBy: req.user._id,
    });

    // Create Student Academic Enrollment Record
    await StudentAcademicEnrollment.create({
      schoolId,
      studentId: newStudent._id,
      academicSessionId: finalAcademicSessionId,
      classId: finalClassId,
      sectionId: finalSectionId,
      rollNumber: rollNumber ? Number(rollNumber) : null,
      status: 'active',
      createdBy: req.user._id,
    });

    // Link Student to ParentProfile
    if (!parentProfileRecord.linkedStudentIds.includes(newStudent._id)) {
      parentProfileRecord.linkedStudentIds.push(newStudent._id);
      await parentProfileRecord.save();
    }

    // Initial Status History
    await StudentStatusHistory.create({
      schoolId,
      studentId: newStudent._id,
      previousStatus: 'new',
      newStatus: 'active',
      reason: 'New Admission Completed',
      changedBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'ADMIT_STUDENT',
      entity: 'Student',
      description: `Admitted student ${newStudent.fullName} (${newStudent.admissionNumber}).`,
    });

    const targetClassObj = finalClassId ? await SchoolClass.findById(finalClassId) : null;
    const targetSectionObj = finalSectionId ? await Section.findById(finalSectionId) : null;

    if (createdCredentials) {
      createdCredentials.studentName = constructFullName;
      createdCredentials.admissionNumber = formattedAdmissionNumber;
      createdCredentials.className = targetClassObj?.name || '';
      createdCredentials.sectionName = targetSectionObj?.name || '';
    }

    return res.status(201).json({
      success: true,
      message: `Student ${newStudent.fullName} admitted successfully.`,
      student: newStudent,
      credentials: createdCredentials,
      createdCredentials,
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Admission number or Parent login ID already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Failed to admit student.' });
  }
};

// @desc    Get Paginated Student Directory with Filters
// @route   GET /api/principal/students (also /api/teacher/students)
// @access  Private (Principal, Teacher)
export const getStudents = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const academicSessionId = req.query.academicSessionId;
    const classId = req.query.classId;
    const sectionId = req.query.sectionId;
    const status = req.query.status;

    const query = { schoolId };

    // Teacher class-restriction enforcement
    if (req.user.role === 'teacher') {
      const teacherProfile = await resolveTeacherProfile(req);
      if (!teacherProfile) {
        return res.status(200).json({
          success: true,
          students: [],
          pagination: { total: 0, page: 1, pages: 0, limit },
          message: 'Teacher profile missing for this account.',
        });
      }

      const allowedClassIds = [];
      if (teacherProfile.classTeacherClassId) allowedClassIds.push(teacherProfile.classTeacherClassId._id || teacherProfile.classTeacherClassId);
      if (Array.isArray(teacherProfile.assignedClassIds)) {
        teacherProfile.assignedClassIds.forEach((c) => {
          const cid = c._id || c;
          if (cid) allowedClassIds.push(cid);
        });
      }

      const allowedSectionIds = [];
      if (teacherProfile.classTeacherSectionId) allowedSectionIds.push(teacherProfile.classTeacherSectionId._id || teacherProfile.classTeacherSectionId);
      if (Array.isArray(teacherProfile.assignedSectionIds)) {
        teacherProfile.assignedSectionIds.forEach((s) => {
          const sid = s._id || s;
          if (sid) allowedSectionIds.push(sid);
        });
      }

      if (allowedClassIds.length > 0 && allowedSectionIds.length > 0) {
        query.$or = [
          { currentClassId: { $in: allowedClassIds } },
          { currentSectionId: { $in: allowedSectionIds } },
        ];
      } else if (allowedClassIds.length > 0) {
        query.currentClassId = { $in: allowedClassIds };
      } else if (allowedSectionIds.length > 0) {
        query.currentSectionId = { $in: allowedSectionIds };
      }
    }

    if (academicSessionId) query.currentAcademicSessionId = academicSessionId;
    if (classId) query.currentClassId = classId;
    if (sectionId) query.currentSectionId = sectionId;
    if (status) query.status = status;

    if (search) {
      const searchOr = [
        { fullName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { permanentStudentId: { $regex: search, $options: 'i' } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('currentClassId', 'name displayName')
      .populate('currentSectionId', 'name roomNumber')
      .populate('parentAccountId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

// @desc    Get Detailed Student Profile
// @route   GET /api/principal/students/:studentId & GET /api/teacher/students/:studentId
// @access  Private (Principal, Teacher)
export const getStudentById = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId })
      .populate('currentAcademicSessionId', 'name isCurrent')
      .populate('currentClassId', 'name displayName category')
      .populate('currentSectionId', 'name roomNumber')
      .populate({
        path: 'parentAccountId',
        populate: { path: 'userId', select: 'loginId email phone isActive' },
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    let canManageStudent = true;
    let isClassTeacherForStudent = true;

    // Teacher authorization check
    if (req.user.role === 'teacher') {
      const teacherProfile = await resolveTeacherProfile(req);
      if (!teacherProfile) {
        return res.status(403).json({ success: false, message: 'Teacher profile missing.' });
      }

      const assignedClassIdStr = getIdStr(teacherProfile.classTeacherClassId);
      const assignedSectionIdStr = getIdStr(teacherProfile.classTeacherSectionId);
      const studentClassIdStr = getIdStr(student.currentClassId);
      const studentSectionIdStr = getIdStr(student.currentSectionId);

      const isClassTeacher = Boolean(
        assignedClassIdStr &&
        assignedSectionIdStr &&
        assignedClassIdStr === studentClassIdStr &&
        assignedSectionIdStr === studentSectionIdStr
      );

      const assignedSections = (teacherProfile.assignedSectionIds || []).map(getIdStr);
      const assignedClasses = (teacherProfile.assignedClassIds || []).map(getIdStr);
      if (assignedSectionIdStr) assignedSections.push(assignedSectionIdStr);
      if (assignedClassIdStr) assignedClasses.push(assignedClassIdStr);

      const hasAccess = assignedSections.includes(studentSectionIdStr) || assignedClasses.includes(studentClassIdStr);

      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Access denied to unassigned student.' });
      }

      canManageStudent = isClassTeacher;
      isClassTeacherForStudent = isClassTeacher;
    }

    const enrollments = await StudentAcademicEnrollment.find({ schoolId, studentId: student._id })
      .populate('academicSessionId', 'name')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ createdAt: -1 });

    const documents = await StudentDocument.find({ schoolId, studentId: student._id }).sort({ createdAt: -1 });
    const statusHistory = await StudentStatusHistory.find({ schoolId, studentId: student._id })
      .populate('changedBy', 'name role')
      .sort({ changedAt: -1 });

    return res.status(200).json({
      success: true,
      student,
      enrollments,
      documents,
      statusHistory,
      canManageStudent,
      isClassTeacherForStudent,
    });
  } catch (error) {
    console.error('Get student by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
};

// @desc    Update Student Profile
// @route   PUT /api/principal/students/:studentId (or PATCH)
// @access  Private (Principal, Class Teacher)
export const updateStudent = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      photoUrl,
      aadhaarNumber,
      nationality,
      religion,
      category,
      house,
      address,
      previousSchool,
      medicalNotes,
      emergencyContact,
      rollNumber,
    } = req.body;

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Teacher authorization check: MUST be Class Teacher of this student
    if (req.user.role === 'teacher') {
      const teacherProfile = await resolveTeacherProfile(req);
      const assignedClassIdStr = getIdStr(teacherProfile?.classTeacherClassId);
      const assignedSectionIdStr = getIdStr(teacherProfile?.classTeacherSectionId);
      const studentClassIdStr = getIdStr(student.currentClassId);
      const studentSectionIdStr = getIdStr(student.currentSectionId);

      const isClassTeacher = Boolean(
        assignedClassIdStr &&
        assignedSectionIdStr &&
        assignedClassIdStr === studentClassIdStr &&
        assignedSectionIdStr === studentSectionIdStr
      );

      if (!isClassTeacher) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the assigned Class Teacher can edit student profiles in their class.',
        });
      }
    } else if (req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to edit student profiles.' });
    }

    if (firstName) student.firstName = firstName.trim();
    if (middleName !== undefined) student.middleName = middleName.trim();
    if (lastName !== undefined) student.lastName = lastName.trim();

    student.fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ').trim();
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
    if (gender) student.gender = gender;
    if (bloodGroup !== undefined) student.bloodGroup = bloodGroup.trim();
    if (photoUrl !== undefined) student.photoUrl = photoUrl.trim();
    if (aadhaarNumber !== undefined) student.aadhaarNumber = aadhaarNumber.trim();
    if (nationality !== undefined) student.nationality = nationality.trim();
    if (religion !== undefined) student.religion = religion.trim();
    if (category !== undefined) student.category = category.trim();
    if (house !== undefined) student.house = house.trim();
    if (address !== undefined) student.address = address;
    if (previousSchool !== undefined) student.previousSchool = previousSchool.trim();
    if (medicalNotes !== undefined) student.medicalNotes = medicalNotes.trim();
    if (emergencyContact !== undefined) student.emergencyContact = emergencyContact.trim();
    if (rollNumber !== undefined) student.rollNumber = Number(rollNumber);

    await student.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      description: `Updated profile details for student ${student.fullName}.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
};

// @desc    Add Student Document
// @route   POST /api/principal/students/:studentId/documents & POST /api/teacher/students/:studentId/documents
// @access  Private (Principal, Class Teacher)
export const addStudentDocument = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const { documentType, documentName, documentUrl, issueDate, expiryDate, notes } = req.body;

    if (!documentType || !documentName) {
      return res.status(400).json({ success: false, message: 'Document type and document name are required.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Teacher authorization check: MUST be Class Teacher of this student
    if (req.user.role === 'teacher') {
      const teacherProfile = await resolveTeacherProfile(req);
      if (!teacherProfile) {
        return res.status(403).json({ success: false, message: 'Teacher profile missing.' });
      }

      const assignedClassIdStr = getIdStr(teacherProfile.classTeacherClassId);
      const assignedSectionIdStr = getIdStr(teacherProfile.classTeacherSectionId);
      const studentClassIdStr = getIdStr(student.currentClassId);
      const studentSectionIdStr = getIdStr(student.currentSectionId);

      const isClassTeacher = Boolean(
        assignedClassIdStr &&
        assignedSectionIdStr &&
        assignedClassIdStr === studentClassIdStr &&
        assignedSectionIdStr === studentSectionIdStr
      );

      if (!isClassTeacher) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the assigned Class Teacher can upload documents for students in their class.',
        });
      }
    } else if (req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to upload student documents.' });
    }

    const finalDocUrl = (documentUrl && documentUrl.trim()) ? documentUrl.trim() : `https://storage.schoolsaas.com/docs/${Date.now()}_${documentName.replace(/\s+/g, '_')}.pdf`;

    const doc = await StudentDocument.create({
      schoolId,
      studentId: student._id,
      documentType: documentType.trim(),
      documentName: documentName.trim(),
      documentUrl: finalDocUrl,
      notes: (notes || '').trim(),
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      uploadedBy: req.user._id,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: doc,
    });
  } catch (error) {
    console.error('Add student document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add document.' });
  }
};

// @desc    Reset Student / Parent Login Password
// @route   POST /api/principal/students/:studentId/reset-password & POST /api/teacher/students/:studentId/reset-password
// @access  Private (Principal, Class Teacher)
export const resetStudentCredential = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId })
      .populate({
        path: 'parentAccountId',
        populate: { path: 'userId' },
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    // Security check: If teacher, MUST be the Class Teacher of student's assigned class & section!
    if (req.user.role === 'teacher') {
      const teacherProfile = await resolveTeacherProfile(req);
      if (!teacherProfile) {
        return res.status(403).json({ success: false, message: 'Teacher profile missing.' });
      }

      const assignedClassIdStr = getIdStr(teacherProfile.classTeacherClassId);
      const assignedSectionIdStr = getIdStr(teacherProfile.classTeacherSectionId);
      const studentClassIdStr = getIdStr(student.currentClassId);
      const studentSectionIdStr = getIdStr(student.currentSectionId);

      const isClassTeacherForThisStudent = Boolean(
        assignedClassIdStr &&
        assignedSectionIdStr &&
        assignedClassIdStr === studentClassIdStr &&
        assignedSectionIdStr === studentSectionIdStr
      );

      if (!isClassTeacherForThisStudent) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only the assigned Class Teacher can reset credentials for students in their class.',
        });
      }
    } else if (req.user.role !== 'principal') {
      return res.status(403).json({ success: false, message: 'Forbidden: Unauthorized to reset credentials.' });
    }

    // Determine target User account (If student has user account, use that. Otherwise use parent account's User)
    let targetUser = null;
    let accountType = 'Parent / Family Account';

    if (student.userId) {
      targetUser = await User.findById(student.userId);
      accountType = 'Student Account';
    }

    if (!targetUser && student.parentAccountId) {
      const family = student.parentAccountId;
      if (family.userId) {
        targetUser = typeof family.userId === 'object' && family.userId._id
          ? family.userId
          : await User.findById(family.userId);
      }
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'No associated login account found for this student or parent.',
      });
    }

    targetUser.password = newPassword.trim();
    await targetUser.save(); // User pre-save hook hashes password cleanly with bcrypt

    const schoolDoc = await School.findById(schoolId);

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'RESET_CREDENTIALS',
      entity: 'User',
      description: `Reset password for ${accountType} linked to student ${student.fullName}.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      credentials: {
        schoolCode: schoolDoc?.schoolCode || schoolDoc?.code || '',
        accountType,
        loginId: targetUser.loginId,
        rawPassword: newPassword.trim(),
        studentName: student.fullName,
      },
    });
  } catch (error) {
    console.error('Reset student credential error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// @desc    Update Student Status (Activate, Deactivate, Suspend, Archive)
// @route   PATCH /api/principal/students/:studentId/status
// @access  Private (Principal)
export const updateStudentStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['active', 'inactive', 'suspended', 'transferred', 'archived', 'graduated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const prev = student.status;
    student.status = status;
    await student.save();

    await StudentStatusHistory.create({
      schoolId,
      studentId: student._id,
      previousStatus: prev,
      newStatus: status,
      reason: reason || 'Status updated by Principal',
      changedBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_STUDENT_STATUS',
      entity: 'Student',
      description: `Changed status of ${student.fullName} from ${prev} to ${status}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Student status updated to ${status}.`,
      status,
    });
  } catch (error) {
    console.error('Update student status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update student status.' });
  }
};

// ==========================================
// FAMILY ACCOUNT APIS (PRINCIPAL)
// ==========================================

// @desc    List / Search Family Accounts
// @route   GET /api/principal/families
// @access  Private (Principal)
export const getFamilies = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const search = req.query.search || '';

    const query = { schoolId };

    if (search) {
      query.$or = [
        { familyCode: { $regex: search, $options: 'i' } },
        { 'primaryGuardian.name': { $regex: search, $options: 'i' } },
        { 'primaryGuardian.phone': { $regex: search, $options: 'i' } },
        { 'primaryGuardian.email': { $regex: search, $options: 'i' } },
      ];
    }

    const families = await ParentProfile.find(query)
      .populate('userId', 'loginId email phone isActive')
      .populate('linkedStudentIds', 'fullName admissionNumber currentClassId currentSectionId status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, families });
  } catch (error) {
    console.error('Get families error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch family accounts.' });
  }
};

// @desc    Get Family Account Details with Siblings
// @route   GET /api/principal/families/:familyId
// @access  Private (Principal)
export const getFamilyById = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { familyId } = req.params;

    const family = await ParentProfile.findOne({ _id: familyId, schoolId })
      .populate('userId', 'loginId email phone isActive lastLogin')
      .populate({
        path: 'linkedStudentIds',
        populate: [
          { path: 'currentClassId', select: 'name' },
          { path: 'currentSectionId', select: 'name' },
        ],
      });

    if (!family) {
      return res.status(404).json({ success: false, message: 'Family account not found.' });
    }

    return res.status(200).json({ success: true, family });
  } catch (error) {
    console.error('Get family by id error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch family account details.' });
  }
};

// @desc    Link Sibling Student to Family Account
// @route   POST /api/principal/families/:familyId/link-student
// @access  Private (Principal)
export const linkStudentToFamily = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { familyId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const family = await ParentProfile.findOne({ _id: familyId, schoolId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family account not found.' });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found in this school.' });
    }

    if (family.linkedStudentIds.includes(student._id)) {
      return res.status(409).json({ success: false, message: 'Student is already linked to this family account.' });
    }

    family.linkedStudentIds.push(student._id);
    await family.save();

    student.parentAccountId = family._id;
    await student.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'LINK_SIBLING',
      entity: 'ParentProfile',
      description: `Linked student ${student.fullName} to Family ${family.familyCode}.`,
    });

    return res.status(200).json({
      success: true,
      message: `Student ${student.fullName} successfully linked to Family Account ${family.familyCode}.`,
      family,
    });
  } catch (error) {
    console.error('Link student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to link student.' });
  }
};

// @desc    Unlink Student from Family Account
// @route   DELETE /api/principal/families/:familyId/unlink-student/:studentId
// @access  Private (Principal)
export const unlinkStudentFromFamily = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { familyId, studentId } = req.params;

    const family = await ParentProfile.findOne({ _id: familyId, schoolId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family account not found.' });
    }

    family.linkedStudentIds = family.linkedStudentIds.filter((id) => String(id) !== String(studentId));
    await family.save();

    await Student.findOneAndUpdate({ _id: studentId, schoolId }, { parentAccountId: null });

    return res.status(200).json({
      success: true,
      message: 'Student unlinked from family account.',
    });
  } catch (error) {
    console.error('Unlink student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to unlink student.' });
  }
};

// @desc    Reset Parent Account Password
// @route   POST /api/principal/families/:familyId/reset-password
// @access  Private (Principal)
export const resetFamilyPassword = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { familyId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const family = await ParentProfile.findOne({ _id: familyId, schoolId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family account not found.' });
    }

    const user = await User.findById(family.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account missing.' });
    }

    user.password = newPassword.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for Parent Account (${family.primaryGuardian.name}).`,
      credentials: {
        name: family.primaryGuardian.name,
        familyCode: family.familyCode,
        loginId: user.loginId,
        rawPassword: newPassword.trim(),
      },
    });
  } catch (error) {
    console.error('Reset family password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// @desc    Toggle Family Account Active / Inactive Status
// @route   PATCH /api/principal/families/:familyId/status
// @access  Private (Principal)
export const toggleFamilyStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { familyId } = req.params;

    const family = await ParentProfile.findOne({ _id: familyId, schoolId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family account not found.' });
    }

    const user = await User.findById(family.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account missing.' });
    }

    user.isActive = !user.isActive;
    await user.save();
    family.isActive = user.isActive;
    await family.save();

    return res.status(200).json({
      success: true,
      message: `Family account (${family.familyCode}) is now ${user.isActive ? 'Active' : 'Inactive'}.`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Toggle family status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update family account status.' });
  }
};

// @desc    Delete or Archive Student Safely
// @route   DELETE /api/principal/students/:studentId
// @access  Private (Principal)
export const deleteStudent = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { studentId } = req.params;

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (process.env.NODE_ENV === 'production') {
      student.status = 'archived';
      await student.save();

      await AuditLog.create({
        schoolId,
        actor: req.user._id,
        action: 'ARCHIVE_STUDENT',
        entity: 'Student',
        description: `Principal archived student ${student.firstName} ${student.lastName} (Adm: ${student.admissionNumber})`,
      });

      return res.status(200).json({
        success: true,
        message: `Student ${student.firstName} ${student.lastName} archived safely.`,
      });
    } else {
      await Student.findByIdAndDelete(studentId);

      await AuditLog.create({
        schoolId,
        actor: req.user._id,
        action: 'DELETE_STUDENT',
        entity: 'Student',
        description: `Principal deleted test student ${student.firstName} ${student.lastName} (Adm: ${student.admissionNumber})`,
      });

      return res.status(200).json({
        success: true,
        message: `Student ${student.firstName} ${student.lastName} deleted permanently.`,
      });
    }
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};
