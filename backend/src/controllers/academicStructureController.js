import { School } from '../models/School.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Subject } from '../models/Subject.js';
import { SchoolConfiguration } from '../models/SchoolConfiguration.js';
import { AuditLog } from '../models/AuditLog.js';

// Helper: Ensure schoolId is derived strictly from authenticated user session
const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// SETUP WIZARD PROGRESS APIs
// ==========================================

// @desc    Get complete setup wizard status and existing step data
// @route   GET /api/principal/setup/status
// @access  Private (Principal)
export const getSetupStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School tenant not found.' });
    }

    const currentSession = await AcademicSession.findOne({ schoolId, isCurrent: true });
    const allSessions = await AcademicSession.find({ schoolId }).sort({ startDate: -1 });

    const activeSessionId = currentSession?._id || allSessions[0]?._id;

    let classes = [];
    let sections = [];
    let subjects = [];
    let configuration = null;

    if (activeSessionId) {
      classes = await SchoolClass.find({ schoolId, academicSessionId: activeSessionId }).sort({ numericOrder: 1 });
      sections = await Section.find({ schoolId, academicSessionId: activeSessionId }).populate('classId', 'name');
      subjects = await Subject.find({ schoolId, academicSessionId: activeSessionId }).populate('applicableClassIds', 'name');
      configuration = await SchoolConfiguration.findOne({ schoolId, academicSessionId: activeSessionId });
    }

    return res.status(200).json({
      success: true,
      setupStatus: school.setupStatus || 'notStarted',
      setupStep: school.setupStep || 1,
      school,
      activeSession: currentSession || allSessions[0] || null,
      sessions: allSessions,
      classes,
      sections,
      subjects,
      configuration,
    });
  } catch (error) {
    console.error('Get setup status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve setup status.' });
  }
};

// @desc    Step 1: Save School Profile details
// @route   PATCH /api/principal/setup/school-profile
// @access  Private (Principal)
export const updateSchoolProfile = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      name,
      email,
      phone,
      alternatePhone,
      address,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      website,
      logoUrl,
      principalSignatureUrl,
    } = req.body;

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found.' });
    }

    if (name) school.name = name;
    if (email !== undefined) school.email = email;
    if (phone !== undefined) school.phone = phone;
    if (alternatePhone !== undefined) school.alternatePhone = alternatePhone;
    if (address !== undefined) school.address = address;
    if (addressLine1 !== undefined) school.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) school.addressLine2 = addressLine2;
    if (city !== undefined) school.city = city;
    if (state !== undefined) school.state = state;
    if (postalCode !== undefined) school.postalCode = postalCode;
    if (country !== undefined) school.country = country;
    if (website !== undefined) school.website = website;
    if (logoUrl !== undefined) school.logoUrl = logoUrl;
    if (principalSignatureUrl !== undefined) school.principalSignatureUrl = principalSignatureUrl;

    if (school.setupStatus === 'notStarted') {
      school.setupStatus = 'inProgress';
    }
    school.setupStep = Math.max(school.setupStep || 1, 2);

    await school.save();

    return res.status(200).json({
      success: true,
      message: 'School profile updated successfully.',
      school,
    });
  } catch (error) {
    console.error('Update school profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update school profile.' });
  }
};

// @desc    Step 2: Save Academic Session
// @route   POST /api/principal/setup/academic-session
// @access  Private (Principal)
export const saveAcademicSession = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { name, startDate, endDate, isCurrent } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Session Name, Start Date, and End Date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End Date must be after Start Date.' });
    }

    // Check duplicate session name
    const existing = await AcademicSession.findOne({ schoolId, name: name.trim() });
    if (existing) {
      existing.startDate = start;
      existing.endDate = end;
      if (isCurrent) {
        await AcademicSession.updateMany({ schoolId }, { isCurrent: false });
        existing.isCurrent = true;
        existing.status = 'active';
      }
      existing.updatedBy = req.user._id;
      await existing.save();

      await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(existing.setupStep || 1, 3) });

      return res.status(200).json({ success: true, message: 'Academic session updated.', session: existing });
    }

    if (isCurrent) {
      await AcademicSession.updateMany({ schoolId }, { isCurrent: false });
    }

    const count = await AcademicSession.countDocuments({ schoolId });
    const shouldBeCurrent = isCurrent || count === 0;

    const session = await AcademicSession.create({
      schoolId,
      name: name.trim(),
      startDate: start,
      endDate: end,
      isCurrent: shouldBeCurrent,
      status: shouldBeCurrent ? 'active' : 'upcoming',
      createdBy: req.user._id,
    });

    await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(3) });

    return res.status(201).json({
      success: true,
      message: 'Academic session created successfully.',
      session,
    });
  } catch (error) {
    console.error('Save academic session error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An academic session with this name already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to save academic session.' });
  }
};

// @desc    Step 3: Save Classes in Bulk
// @route   POST /api/principal/setup/classes/bulk
// @access  Private (Principal)
export const saveClassesBulk = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, classes } = req.body;

    if (!academicSessionId || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ success: false, message: 'Academic Session and at least one Class are required.' });
    }

    // Verify session belongs to school
    const session = await AcademicSession.findOne({ _id: academicSessionId, schoolId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Invalid academic session for this school.' });
    }

    const savedClasses = [];
    for (let index = 0; index < classes.length; index++) {
      const cls = classes[index];
      const className = cls.name.trim();
      const numericOrder = cls.numericOrder || index + 1;
      const category = cls.category || 'primary';
      const displayName = cls.displayName || className;

      let existingClass = await SchoolClass.findOne({ schoolId, academicSessionId, name: className });

      if (existingClass) {
        existingClass.numericOrder = numericOrder;
        existingClass.category = category;
        existingClass.displayName = displayName;
        existingClass.updatedBy = req.user._id;
        await existingClass.save();
        savedClasses.push(existingClass);
      } else {
        const newClass = await SchoolClass.create({
          schoolId,
          academicSessionId,
          name: className,
          displayName,
          numericOrder,
          category,
          createdBy: req.user._id,
        });
        savedClasses.push(newClass);
      }
    }

    await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(4) });

    return res.status(200).json({
      success: true,
      message: `${savedClasses.length} classes configured successfully.`,
      classes: savedClasses,
    });
  } catch (error) {
    console.error('Save classes bulk error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save classes.' });
  }
};

// @desc    Step 4: Save Sections in Bulk
// @route   POST /api/principal/setup/sections/bulk
// @access  Private (Principal)
export const saveSectionsBulk = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, sections } = req.body;

    if (!academicSessionId || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: 'Academic Session and at least one Section are required.' });
    }

    const savedSections = [];
    for (const sec of sections) {
      const { classId, name, capacity, roomNumber } = sec;
      const sectionName = name.trim();

      // Verify class belongs to school
      const schoolClass = await SchoolClass.findOne({ _id: classId, schoolId, academicSessionId });
      if (!schoolClass) continue;

      let existingSection = await Section.findOne({ schoolId, academicSessionId, classId, name: sectionName });

      if (existingSection) {
        existingSection.capacity = capacity || 40;
        existingSection.roomNumber = roomNumber || '';
        existingSection.updatedBy = req.user._id;
        await existingSection.save();
        savedSections.push(existingSection);
      } else {
        const newSection = await Section.create({
          schoolId,
          academicSessionId,
          classId,
          name: sectionName,
          capacity: capacity || 40,
          roomNumber: roomNumber || '',
          createdBy: req.user._id,
        });
        savedSections.push(newSection);
      }
    }

    await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(5) });

    return res.status(200).json({
      success: true,
      message: `${savedSections.length} sections configured successfully.`,
      sections: savedSections,
    });
  } catch (error) {
    console.error('Save sections bulk error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save sections.' });
  }
};

// @desc    Step 5: Save Subjects in Bulk
// @route   POST /api/principal/setup/subjects/bulk
// @access  Private (Principal)
export const saveSubjectsBulk = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId, subjects } = req.body;

    if (!academicSessionId || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ success: false, message: 'Academic Session and at least one Subject are required.' });
    }

    const savedSubjects = [];
    for (const sub of subjects) {
      const { name, code, subjectType, applicableClassIds, description } = sub;
      const subjectName = name.trim();
      const subjectCode = (code || subjectName.substring(0, 4)).toUpperCase().trim();

      // Verify all applicable classes belong to this school
      let validClassIds = [];
      if (Array.isArray(applicableClassIds) && applicableClassIds.length > 0) {
        const foundClasses = await SchoolClass.find({
          _id: { $in: applicableClassIds },
          schoolId,
          academicSessionId,
        });
        validClassIds = foundClasses.map((c) => c._id);
      }

      let existingSubject = await Subject.findOne({ schoolId, academicSessionId, code: subjectCode });

      if (existingSubject) {
        existingSubject.name = subjectName;
        existingSubject.subjectType = subjectType || 'core';
        existingSubject.description = description || '';
        if (validClassIds.length > 0) existingSubject.applicableClassIds = validClassIds;
        existingSubject.updatedBy = req.user._id;
        await existingSubject.save();
        savedSubjects.push(existingSubject);
      } else {
        const newSubject = await Subject.create({
          schoolId,
          academicSessionId,
          name: subjectName,
          code: subjectCode,
          subjectType: subjectType || 'core',
          description: description || '',
          applicableClassIds: validClassIds,
          createdBy: req.user._id,
        });
        savedSubjects.push(newSubject);
      }
    }

    await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(6) });

    return res.status(200).json({
      success: true,
      message: `${savedSubjects.length} subjects configured successfully.`,
      subjects: savedSubjects,
    });
  } catch (error) {
    console.error('Save subjects bulk error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Subject code or name already exists in this session.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to save subjects.' });
  }
};

// @desc    Step 6: Save School Configuration / Rules
// @route   PATCH /api/principal/setup/configuration
// @access  Private (Principal)
export const saveSchoolConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const {
      academicSessionId,
      workingDays,
      schoolStartTime,
      schoolEndTime,
      attendanceClosingTime,
      minimumAttendancePercentage,
      passingPercentage,
      gradingSystem,
      examTerms,
      timezone,
      dateFormat,
    } = req.body;

    if (!academicSessionId) {
      return res.status(400).json({ success: false, message: 'Academic Session ID is required.' });
    }

    if (passingPercentage < 0 || passingPercentage > 100) {
      return res.status(400).json({ success: false, message: 'Passing percentage must be between 0 and 100.' });
    }

    if (minimumAttendancePercentage < 0 || minimumAttendancePercentage > 100) {
      return res.status(400).json({ success: false, message: 'Minimum attendance percentage must be between 0 and 100.' });
    }

    // Validate Grade Ranges Non-Overlap
    if (Array.isArray(gradingSystem) && gradingSystem.length > 0) {
      for (let i = 0; i < gradingSystem.length; i++) {
        for (let j = i + 1; j < gradingSystem.length; j++) {
          const g1 = gradingSystem[i];
          const g2 = gradingSystem[j];
          if (
            Math.max(g1.minimumPercentage, g2.minimumPercentage) <=
            Math.min(g1.maximumPercentage, g2.maximumPercentage)
          ) {
            return res.status(400).json({
              success: false,
              message: `Grade percentage ranges overlap between '${g1.grade}' and '${g2.grade}'.`,
            });
          }
        }
      }
    }

    let config = await SchoolConfiguration.findOne({ schoolId, academicSessionId });

    if (config) {
      if (workingDays) config.workingDays = workingDays;
      if (schoolStartTime) config.schoolStartTime = schoolStartTime;
      if (schoolEndTime) config.schoolEndTime = schoolEndTime;
      if (attendanceClosingTime) config.attendanceClosingTime = attendanceClosingTime;
      if (minimumAttendancePercentage !== undefined) config.minimumAttendancePercentage = minimumAttendancePercentage;
      if (passingPercentage !== undefined) config.passingPercentage = passingPercentage;
      if (gradingSystem) config.gradingSystem = gradingSystem;
      if (examTerms) config.examTerms = examTerms;
      if (timezone) config.timezone = timezone;
      if (dateFormat) config.dateFormat = dateFormat;
      config.updatedBy = req.user._id;
      await config.save();
    } else {
      config = await SchoolConfiguration.create({
        schoolId,
        academicSessionId,
        workingDays: workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        schoolStartTime: schoolStartTime || '08:00',
        schoolEndTime: schoolEndTime || '14:30',
        attendanceClosingTime: attendanceClosingTime || '09:00',
        minimumAttendancePercentage: minimumAttendancePercentage ?? 75,
        passingPercentage: passingPercentage ?? 40,
        gradingSystem: gradingSystem || undefined,
        examTerms: examTerms || ['Term 1', 'Term 2', 'Final Exam'],
        timezone: timezone || 'Asia/Kolkata',
        dateFormat: dateFormat || 'DD/MM/YYYY',
        createdBy: req.user._id,
      });
    }

    await School.findByIdAndUpdate(schoolId, { setupStatus: 'inProgress', setupStep: Math.max(7) });

    return res.status(200).json({
      success: true,
      message: 'School configuration and rules saved successfully.',
      configuration: config,
    });
  } catch (error) {
    console.error('Save configuration error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save school rules.' });
  }
};

// @desc    Step 7: Complete Setup Wizard
// @route   POST /api/principal/setup/complete
// @access  Private (Principal)
export const completeSetup = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { academicSessionId } = req.body;

    const session = await AcademicSession.findOne({ schoolId, isCurrent: true }) || await AcademicSession.findOne({ _id: academicSessionId, schoolId });
    if (!session) {
      return res.status(400).json({ success: false, message: 'No active academic session configured.' });
    }

    const classCount = await SchoolClass.countDocuments({ schoolId, academicSessionId: session._id });
    if (classCount === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one Class before completing setup.' });
    }

    const sectionCount = await Section.countDocuments({ schoolId, academicSessionId: session._id });
    if (sectionCount === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one Section before completing setup.' });
    }

    const subjectCount = await Subject.countDocuments({ schoolId, academicSessionId: session._id });
    if (subjectCount === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one Subject before completing setup.' });
    }

    let config = await SchoolConfiguration.findOne({ schoolId, academicSessionId: session._id });
    if (!config) {
      config = await SchoolConfiguration.create({
        schoolId,
        academicSessionId: session._id,
        createdBy: req.user._id,
      });
    }

    config.setupCompleted = true;
    config.setupCompletedAt = new Date();
    config.setupCompletedBy = req.user._id;
    await config.save();

    const school = await School.findById(schoolId);
    school.setupStatus = 'completed';
    school.setupStep = 7;
    school.setupCompletedAt = new Date();
    await school.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'COMPLETE_SETUP_WIZARD',
      schoolId,
      description: `Principal ${req.user.name} completed initial Setup Wizard for ${school.name}.`,
      entity: 'School',
    });

    return res.status(200).json({
      success: true,
      message: 'Initial School Setup Wizard completed successfully!',
      setupStatus: 'completed',
      school,
    });
  } catch (error) {
    console.error('Complete setup error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete setup wizard.' });
  }
};

// ==========================================
// SUPPORTING CRUD APIs (ACADEMIC STRUCTURE)
// ==========================================

export const getAcademicSessions = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const sessions = await AcademicSession.find({ schoolId }).sort({ startDate: -1 });
    return res.status(200).json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sessions.' });
  }
};

export const getClasses = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { sessionId } = req.query;
    const query = { schoolId };
    if (sessionId) query.academicSessionId = sessionId;

    const classes = await SchoolClass.find(query).sort({ numericOrder: 1 });
    return res.status(200).json({ success: true, classes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
  }
};

export const getSections = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { sessionId, classId } = req.query;
    const query = { schoolId };
    if (sessionId) query.academicSessionId = sessionId;
    if (classId) query.classId = classId;

    const sections = await Section.find(query).populate('classId', 'name displayName');
    return res.status(200).json({ success: true, sections });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sections.' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { sessionId } = req.query;
    const query = { schoolId };
    if (sessionId) query.academicSessionId = sessionId;

    const subjects = await Subject.find(query).populate('applicableClassIds', 'name displayName');
    return res.status(200).json({ success: true, subjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
};

export const getConfiguration = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const session = await AcademicSession.findOne({ schoolId, isCurrent: true });
    if (!session) {
      return res.status(200).json({ success: true, configuration: null });
    }

    const configuration = await SchoolConfiguration.findOne({ schoolId, academicSessionId: session._id });
    return res.status(200).json({ success: true, configuration });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch configuration.' });
  }
};
