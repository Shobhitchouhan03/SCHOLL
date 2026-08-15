import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { StudentDocument } from '../models/StudentDocument.js';
import { StudentAcademicEnrollment } from '../models/StudentAcademicEnrollment.js';
import { StudentStatusHistory } from '../models/StudentStatusHistory.js';
import { Exam } from '../models/Exam.js';
import { ExamSchedule } from '../models/ExamSchedule.js';
import { StudentMarks } from '../models/StudentMarks.js';
import { SubjectAssignment } from '../models/SubjectAssignment.js';
import { AuditLog } from '../models/AuditLog.js';

import {
  getStudentById,
  updateStudent,
  addStudentDocument,
  resetStudentCredential,
} from '../controllers/studentController.js';

import {
  createExam,
  createExamSchedule,
  saveTeacherStudentMarks,
} from '../controllers/examController.js';

import { schoolUserLogin } from '../controllers/authController.js';

export async function runStepT16StudentProfileAndMarksHotfixTests() {
  console.log('\n==================================================');
  console.log('RUNNING STEP T16: STUDENT PROFILE & MARKS HOTFIX TESTS');
  console.log('==================================================');

  const schoolId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439001');
  const classId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439002');
  const sectionId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439003');
  const subjectId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439004');
  const studentId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439005');
  const parentUserId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439006');
  const parentProfileId = new mongoose.Types.ObjectId('607f1f77bcf86cd799439007');

  const classTeacherUserId = new mongoose.Types.ObjectId();
  const subjectTeacherUserId = new mongoose.Types.ObjectId();

  const mockRes = () => {
    const res = {};
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.body = data;
      return res;
    };
    res.cookie = () => {};
    return res;
  };

  const rawPassword = 'ParentPassword123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Mock Objects
  const mockSchool = {
    _id: schoolId,
    name: 'Step T16 School',
    code: 'SCH16',
    schoolCode: 'SCH16',
    status: 'active',
    isActive: true,
  };

  const mockParentUser = {
    _id: parentUserId,
    schoolId,
    name: 'Parent User',
    loginId: 'PARENT16@TEST.COM',
    email: 'parent16@test.com',
    password: hashedPassword,
    role: 'parent',
    isActive: true,
    isLocked: function () { return false; },
    matchPassword: async function (enteredPassword) {
      return bcrypt.compare(enteredPassword, this.password);
    },
    resetLoginAttempts: async function () { return; },
    incLoginAttempts: async function () { return; },
    save: async function () {
      if (this.password && !this.password.startsWith('$2')) {
        this.password = await bcrypt.hash(this.password, 10);
      }
      return this;
    },
  };

  const mockParentProfile = {
    _id: parentProfileId,
    schoolId,
    userId: mockParentUser,
    familyCode: 'FAM16001',
    primaryGuardian: {
      name: 'Parent 16',
      relationship: 'Father',
      phone: '9876543210',
      email: 'parent16@test.com',
    },
    linkedStudentIds: [studentId],
  };

  const mockStudent = {
    _id: studentId,
    schoolId,
    permanentStudentId: 'STU16001',
    admissionNumber: 'ADM16001',
    rollNumber: 1,
    firstName: 'Rahul',
    lastName: 'Sharma',
    fullName: 'Rahul Sharma',
    currentClassId: { _id: classId, name: 'Class 10' },
    currentSectionId: { _id: sectionId, name: 'A' },
    currentAcademicSessionId: { _id: new mongoose.Types.ObjectId(), name: '2026-2027' },
    parentAccountId: mockParentProfile,
    status: 'active',
    save: async function () { return this; },
  };

  const mockClassTeacherProfile = {
    _id: new mongoose.Types.ObjectId(),
    schoolId,
    userId: classTeacherUserId,
    isClassTeacher: true,
    classTeacherClassId: classId,
    classTeacherSectionId: sectionId,
    assignedClassIds: [classId],
    assignedSectionIds: [sectionId],
    save: async function () { return this; },
  };

  const mockSubjectTeacherProfile = {
    _id: new mongoose.Types.ObjectId(),
    schoolId,
    userId: subjectTeacherUserId,
    isClassTeacher: false,
    assignedClassIds: [classId],
    assignedSectionIds: [sectionId],
    save: async function () { return this; },
  };

  const mockTeacherQuery = (profile) => {
    const p = Promise.resolve(profile);
    p.populate = async () => profile;
    return p;
  };

  // Preserve originals
  const origStudentFindOne = Student.findOne;
  const origStudentDocCreate = StudentDocument.create;
  const origStudentDocFind = StudentDocument.find;
  const origEnrollmentFind = StudentAcademicEnrollment.find;
  const origStatusHistoryFind = StudentStatusHistory.find;
  const origUserFindById = User.findById;
  const origSchoolFindById = School.findById;
  const origAuditCreate = AuditLog.create;
  const origTeacherFindOne = Teacher.findOne;
  const origSubjectAssignmentFind = SubjectAssignment.find;

  try {
    // Audit Log stub
    AuditLog.create = async () => ({});
    const chainableSubjectQuery = { populate: () => chainableSubjectQuery, lean: () => chainableSubjectQuery, then: (resolve, reject) => Promise.resolve([]).then(resolve, reject) };
    SubjectAssignment.find = () => chainableSubjectQuery;
    StudentAcademicEnrollment.find = () => ({ populate: () => ({ populate: () => ({ populate: () => ({ sort: async () => [] }) }) }) });
    StudentDocument.find = () => ({ sort: async () => [] });
    StudentStatusHistory.find = () => ({ populate: () => ({ sort: async () => [] }) });

    // TEST A: Class Teacher views Student Profile -> canManageStudent === true
    console.log('\n--- Test A: Class Teacher views Student Profile ---');
    Student.findOne = () => ({
      populate: () => ({
        populate: () => ({
          populate: () => ({
            populate: async () => mockStudent,
          }),
        }),
      }),
    });
    Teacher.findOne = () => mockTeacherQuery(mockClassTeacherProfile);

    const reqA = {
      user: { _id: classTeacherUserId, teacherProfileId: mockClassTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
    };
    const resA = mockRes();
    await getStudentById(reqA, resA);

    if (resA.statusCode !== 200 || !resA.body?.canManageStudent) {
      throw new Error(`Test A Failed: Expected HTTP 200 & canManageStudent: true, got ${resA.statusCode} - ${JSON.stringify(resA.body)}`);
    }
    console.log('✓ PASS Test A: Class Teacher view returns canManageStudent = true.');

    // TEST B: Subject Teacher views Student Profile -> canManageStudent === false
    console.log('\n--- Test B: Subject Teacher views Student Profile ---');
    Teacher.findOne = () => mockTeacherQuery(mockSubjectTeacherProfile);

    const reqB = {
      user: { _id: subjectTeacherUserId, teacherProfileId: mockSubjectTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
    };
    const resB = mockRes();
    await getStudentById(reqB, resB);

    if (resB.statusCode !== 200 || resB.body?.canManageStudent !== false) {
      throw new Error(`Test B Failed: Expected HTTP 200 & canManageStudent: false, got ${resB.statusCode} - ${JSON.stringify(resB.body)}`);
    }
    console.log('✓ PASS Test B: Subject Teacher view returns canManageStudent = false.');

    // TEST C: Class Teacher edits Student Details -> 200 OK
    console.log('\n--- Test C: Class Teacher edits Student Profile ---');
    Student.findOne = async () => mockStudent;
    Teacher.findOne = () => mockTeacherQuery(mockClassTeacherProfile);

    const reqC = {
      user: { _id: classTeacherUserId, teacherProfileId: mockClassTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
      body: { firstName: 'Rahul', lastName: 'Kumar' },
    };
    const resC = mockRes();
    await updateStudent(reqC, resC);

    if (resC.statusCode !== 200) {
      throw new Error(`Test C Failed: Expected HTTP 200, got ${resC.statusCode} - ${JSON.stringify(resC.body)}`);
    }
    console.log('✓ PASS Test C: Class Teacher successfully edited student profile.');

    // TEST D: Subject Teacher attempts to edit Student Details -> 403 Forbidden
    console.log('\n--- Test D: Subject Teacher attempts to edit Student Profile ---');
    Teacher.findOne = () => mockTeacherQuery(mockSubjectTeacherProfile);

    const reqD = {
      user: { _id: subjectTeacherUserId, teacherProfileId: mockSubjectTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
      body: { firstName: 'Hacked' },
    };
    const resD = mockRes();
    await updateStudent(reqD, resD);

    if (resD.statusCode !== 403) {
      throw new Error(`Test D Failed: Expected HTTP 403 Forbidden for Subject Teacher edit, got ${resD.statusCode}`);
    }
    console.log('✓ PASS Test D: Subject Teacher edit correctly blocked with HTTP 403 Forbidden.');

    // TEST E: Class Teacher uploads student document -> 201 Created
    console.log('\n--- Test E: Class Teacher uploads Student Document ---');
    Teacher.findOne = () => mockTeacherQuery(mockClassTeacherProfile);
    StudentDocument.create = async (docData) => ({ _id: new mongoose.Types.ObjectId(), ...docData });

    const reqE = {
      user: { _id: classTeacherUserId, teacherProfileId: mockClassTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
      body: {
        documentType: 'Birth Certificate',
        documentName: 'Birth Certificate 2026',
        documentUrl: 'https://storage.schoolsaas.com/docs/birth_cert.pdf',
      },
    };
    const resE = mockRes();
    await addStudentDocument(reqE, resE);

    if (resE.statusCode !== 201 || !resE.body?.document?._id) {
      throw new Error(`Test E Failed: Expected HTTP 201 Created, got ${resE.statusCode} - ${JSON.stringify(resE.body)}`);
    }
    console.log('✓ PASS Test E: Class Teacher successfully uploaded student document.');

    // TEST F: Subject Teacher attempts to upload document -> 403 Forbidden
    console.log('\n--- Test F: Subject Teacher attempts to upload document ---');
    Teacher.findOne = () => mockTeacherQuery(mockSubjectTeacherProfile);

    const reqF = {
      user: { _id: subjectTeacherUserId, teacherProfileId: mockSubjectTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
      body: {
        documentType: 'Aadhaar / ID',
        documentName: 'Unauthorized Document',
      },
    };
    const resF = mockRes();
    await addStudentDocument(reqF, resF);

    if (resF.statusCode !== 403) {
      throw new Error(`Test F Failed: Expected HTTP 403 Forbidden, got ${resF.statusCode}`);
    }
    console.log('✓ PASS Test F: Subject Teacher document upload correctly blocked with HTTP 403 Forbidden.');

    // TEST G: Class Teacher resets Parent Password -> 200 OK & one-time credentials
    console.log('\n--- Test G: Class Teacher resets Parent Password ---');
    Teacher.findOne = () => mockTeacherQuery(mockClassTeacherProfile);
    Student.findOne = () => ({
      populate: async () => mockStudent,
    });
    User.findById = async () => mockParentUser;
    School.findById = async () => mockSchool;

    const newPass = 'NewPassword123!';
    const reqG = {
      user: { _id: classTeacherUserId, teacherProfileId: mockClassTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { studentId: String(studentId) },
      body: { newPassword: newPass },
    };
    const resG = mockRes();
    await resetStudentCredential(reqG, resG);

    if (resG.statusCode !== 200 || resG.body?.credentials?.rawPassword !== newPass) {
      throw new Error(`Test G Failed: Expected HTTP 200 & rawPassword, got ${resG.statusCode} - ${JSON.stringify(resG.body)}`);
    }
    console.log('✓ PASS Test G: Class Teacher successfully reset password and returned one-time credentials payload.');

    // TEST H: Parent logs in with newly reset password -> 200 OK
    console.log('\n--- Test H: Parent logs in with reset password ---');
    School.findOne = async () => mockSchool;
    User.findOne = () => ({
      select: async () => mockParentUser,
    });
    Student.findOne = async () => mockStudent;
    ParentProfile.findOne = async () => mockParentProfile;

    const reqH = {
      headers: { 'x-school-code': 'SCH16' },
      body: {
        loginId: 'PARENT16@TEST.COM',
        password: newPass,
        schoolCode: 'SCH16',
      },
    };
    const resH = mockRes();
    await schoolUserLogin(reqH, resH);

    if (resH.statusCode !== 200 || !resH.body?.success || resH.body?.user?.role !== 'parent') {
      throw new Error(`Test H Failed: Expected HTTP 200 & success for parent login, got ${resH.statusCode} - ${JSON.stringify(resH.body)}`);
    }
    console.log('✓ PASS Test H: Parent successfully logged in using newly reset password.');

    // TEST I: Teacher Exam Marks Submission Validations
    console.log('\n--- Test I: Teacher Marks Entry Validations ---');
    const mockExam = { _id: new mongoose.Types.ObjectId(), schoolId, academicSessionId: new mongoose.Types.ObjectId() };
    const mockSchedule = {
      _id: new mongoose.Types.ObjectId(),
      schoolId,
      examId: mockExam._id,
      academicSessionId: mockExam.academicSessionId,
      classId,
      subjectId,
      maximumMarks: 100,
    };

    ExamSchedule.findOne = async () => mockSchedule;
    Teacher.findOne = () => mockTeacherQuery(mockClassTeacherProfile);
    StudentMarks.findOneAndUpdate = async () => ({ _id: new mongoose.Types.ObjectId() });

    const reqI = {
      user: { _id: classTeacherUserId, teacherProfileId: mockClassTeacherProfile._id, role: 'teacher', schoolId },
      tenantSchoolId: schoolId,
      params: { examId: String(mockExam._id) },
      body: {
        scheduleId: String(mockSchedule._id),
        sectionId: String(sectionId),
        targetStatus: 'submitted',
        marksList: [
          { studentId: String(studentId), theoryMarks: 80, practicalMarks: 15, attendanceStatus: 'present', remark: 'Good' },
        ],
      },
    };
    const resI = mockRes();
    await saveTeacherStudentMarks(reqI, resI);

    if (resI.statusCode !== 200) {
      throw new Error(`Test I Failed: Expected HTTP 200 for marks submission, got ${resI.statusCode} - ${JSON.stringify(resI.body)}`);
    }
    console.log('✓ PASS Test I: Teacher exam marks submission validated and saved successfully.');

    console.log('\n==================================================');
    console.log('ALL STEP T16 TESTS PASSED (100% GREEN)');
    console.log('==================================================\n');
  } finally {
    // Restore originals
    Student.findOne = origStudentFindOne;
    StudentDocument.create = origStudentDocCreate;
    StudentDocument.find = origStudentDocFind;
    StudentAcademicEnrollment.find = origEnrollmentFind;
    StudentStatusHistory.find = origStatusHistoryFind;
    User.findById = origUserFindById;
    School.findById = origSchoolFindById;
    AuditLog.create = origAuditCreate;
    Teacher.findOne = origTeacherFindOne;
    SubjectAssignment.find = origSubjectAssignmentFind;
  }
}

runStepT16StudentProfileAndMarksHotfixTests()
  .then(() => {
    setTimeout(() => process.exit(0), 200);
  })
  .catch((err) => {
    console.error('Test execution failed:', err);
    setTimeout(() => process.exit(1), 200);
  });
