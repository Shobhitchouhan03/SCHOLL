import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { StudentAcademicEnrollment } from '../models/StudentAcademicEnrollment.js';
import { StudentStatusHistory } from '../models/StudentStatusHistory.js';
import { AuditLog } from '../models/AuditLog.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { createStudent } from '../controllers/studentController.js';

export async function runStepT14StudentAdmissionHotfixTests() {
  console.log('\n=== RUNNING STEP T14 STUDENT ADMISSION & PARENT PASSWORD HOTFIX TESTS ===');

  try {
    const schoolId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439001');
    const classId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439002');
    const sectionId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439003');
    const teacherProfileId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439020');

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
      return res;
    };

    // Save originals
    const origTeacherFindOne = Teacher.findOne;
    const origStudentFindOne = Student.findOne;
    const origUserFindOne = User.findOne;
    const origUserCreate = User.create;
    const origParentProfileFindOne = ParentProfile.findOne;
    const origParentProfileCreate = ParentProfile.create;
    const origStudentCreate = Student.create;
    const origEnrollmentCreate = StudentAcademicEnrollment.create;
    const origStatusCreate = StudentStatusHistory.create;
    const origAuditCreate = AuditLog.create;
    const origSessionFindOne = AcademicSession.findOne;
    const origSchoolFindById = School.findById;
    const origClassFindById = SchoolClass.findById;
    const origSectionFindById = Section.findById;

    Teacher.findOne = async () => ({
      _id: teacherProfileId,
      schoolId,
      userId: '507f1f77bcf86cd799439010',
      isClassTeacher: true,
      teacherType: 'Class Teacher',
      canAdmitStudents: true,
      classTeacherClassId: classId,
      classTeacherSectionId: sectionId,
      save: async () => {},
    });

    User.findOne = async (query) => {
      if (query?.loginId === 'EXISTING_PARENT_LOGIN') {
        return { _id: 'EXISTING_USER_ID', loginId: query.loginId };
      }
      return { _id: '507f1f77bcf86cd799439010', schoolId, role: 'teacher', teacherProfileId };
    };

    AcademicSession.findOne = async () => ({ _id: 'SESSION_2026' });

    // Standard Class Teacher user mock
    const teacherUser = {
      _id: '507f1f77bcf86cd799439010',
      schoolId,
      role: 'teacher',
      teacherProfileId,
    };

    // TEST 1: Duplicate Admission Number Returns 409 Conflict
    Student.findOne = async () => ({ _id: 'EXISTING_STUDENT_ID' });
    const reqDupAdm = {
      user: teacherUser,
      tenantSchoolId: schoolId,
      body: {
        fullName: 'Test Student',
        admissionNumber: 'ADM100',
        currentClassId: classId,
        currentSectionId: sectionId,
      },
    };
    const resDupAdm = mockRes();
    await createStudent(reqDupAdm, resDupAdm);

    if (resDupAdm.statusCode !== 409 || !resDupAdm.body?.message?.includes('already registered')) {
      throw new Error(`TEST 1 Failed: Expected status 409 for duplicate admission number, got ${resDupAdm.statusCode}. Msg: ${resDupAdm.body?.message}`);
    }
    console.log('✅ TEST 1 Passed: Duplicate admission number detected early & rejected with 409 Conflict.');

    // TEST 2: Duplicate Parent Login ID Returns 409 Conflict
    Student.findOne = async () => null; // No duplicate student
    User.findOne = async ({ loginId }) => {
      if (loginId === 'EXISTING_PARENT_LOGIN') {
        return { _id: 'EXISTING_USER_ID', loginId };
      }
      return null;
    };

    const reqDupParent = {
      user: teacherUser,
      tenantSchoolId: schoolId,
      body: {
        fullName: 'Test Student',
        admissionNumber: 'ADM101',
        familyOption: 'new',
        parentLoginId: 'EXISTING_PARENT_LOGIN',
        parentPassword: 'Password123!',
        primaryGuardian: { name: 'Parent', phone: '9999999999' },
      },
    };
    const resDupParent = mockRes();
    await createStudent(reqDupParent, resDupParent);

    if (resDupParent.statusCode !== 409 || !resDupParent.body?.message?.includes('already in use')) {
      throw new Error(`TEST 2 Failed: Expected status 409 for duplicate parent login ID, got ${resDupParent.statusCode}. Msg: ${resDupParent.body?.message}`);
    }
    console.log('✅ TEST 2 Passed: Duplicate parent login ID detected early & rejected with 409 Conflict.');

    // TEST 3: Successful Admission creates Student + Parent User with Credentials
    Student.findOne = async () => null;
    User.findOne = async (query) => (query?.loginId || query?.phone ? null : { _id: '507f1f77bcf86cd799439010', schoolId, role: 'teacher', teacherProfileId });
    AcademicSession.findOne = async () => ({ _id: 'SESSION_2026' });
    School.findById = async () => ({ code: 'SCH100', name: 'Test School', slug: 'testschool' });
    SchoolClass.findById = async () => ({ name: '11' });
    Section.findById = async () => ({ name: 'A' });

    let createdUserPayload = null;
    User.create = async (data) => {
      createdUserPayload = data;
      return { _id: 'NEW_PARENT_USER_ID', ...data };
    };

    let createdParentProfilePayload = null;
    ParentProfile.create = async (data) => {
      createdParentProfilePayload = data;
      return { _id: 'NEW_PARENT_PROFILE_ID', linkedStudentIds: [], save: async () => {} };
    };

    let createdStudentPayload = null;
    Student.create = async (data) => {
      createdStudentPayload = data;
      return { _id: 'NEW_STUDENT_ID', fullName: data.fullName, admissionNumber: data.admissionNumber };
    };

    StudentAcademicEnrollment.create = async () => ({});
    StudentStatusHistory.create = async () => ({});
    AuditLog.create = async () => ({});

    const admNo = 'ADM_NEW_100';
    const parentPass = 'SecurePass123!';
    const reqSuccess = {
      user: teacherUser,
      tenantSchoolId: schoolId,
      body: {
        fullName: 'Rahul Varma',
        admissionNumber: admNo,
        rollNumber: '12',
        gender: 'male',
        familyOption: 'new',
        parentLoginId: 'rahul.parent@gmail.com',
        parentPassword: parentPass,
        primaryGuardian: {
          name: 'Vikram Varma',
          phone: '9876543210',
          email: 'rahul.parent@gmail.com',
          relationship: 'Father',
        },
      },
    };

    const resSuccess = mockRes();
    await createStudent(reqSuccess, resSuccess);

    if (resSuccess.statusCode !== 201 || !resSuccess.body?.success) {
      throw new Error(`TEST 3 Failed: Expected status 201, got ${resSuccess.statusCode}. Message: ${resSuccess.body?.message}`);
    }

    const creds = resSuccess.body.credentials;
    if (!creds || creds.loginId !== 'RAHUL.PARENT@GMAIL.COM' || creds.rawPassword !== parentPass) {
      throw new Error('TEST 3 Failed: Credentials payload missing or mismatched.');
    }
    if (creds.studentName !== 'Rahul Varma' || creds.className !== '11' || creds.sectionName !== 'A') {
      throw new Error('TEST 3 Failed: Credentials modal metadata missing student/class details.');
    }

    if (createdUserPayload.role !== 'parent' || createdUserPayload.password !== parentPass) {
      throw new Error('TEST 3 Failed: Parent User payload incorrect.');
    }
    console.log('✅ TEST 3 Passed: Class Teacher admits student with custom parent credentials. Credentials payload verified.');

    // TEST 4: Link Sibling to Existing Family Account
    let linkedStudentIdAdded = false;
    ParentProfile.findOne = async () => ({
      _id: 'EXISTING_FAMILY_PROFILE_ID',
      familyCode: 'FAM5555',
      linkedStudentIds: [],
      save: async () => {
        linkedStudentIdAdded = true;
      },
    });

    const reqLink = {
      user: teacherUser,
      tenantSchoolId: schoolId,
      body: {
        fullName: 'Sonia Varma',
        admissionNumber: 'ADM_NEW_101',
        familyOption: 'link',
        existingFamilyId: 'EXISTING_FAMILY_PROFILE_ID',
      },
    };

    const resLink = mockRes();
    await createStudent(reqLink, resLink);

    if (resLink.statusCode !== 201 || !linkedStudentIdAdded) {
      throw new Error(`TEST 4 Failed: Expected 201 and student linked to existing family, got ${resLink.statusCode}`);
    }
    console.log('✅ TEST 4 Passed: Link sibling to existing family account succeeded without creating duplicate Parent User.');

    // Restore originals
    Teacher.findOne = origTeacherFindOne;
    Student.findOne = origStudentFindOne;
    User.findOne = origUserFindOne;
    User.create = origUserCreate;
    ParentProfile.findOne = origParentProfileFindOne;
    ParentProfile.create = origParentProfileCreate;
    Student.create = origStudentCreate;
    StudentAcademicEnrollment.create = origEnrollmentCreate;
    StudentStatusHistory.create = origStatusCreate;
    AuditLog.create = origAuditCreate;
    AcademicSession.findOne = origSessionFindOne;
    School.findById = origSchoolFindById;
    SchoolClass.findById = origClassFindById;
    Section.findById = origSectionFindById;

    console.log('🎉 ALL STEP T14 STUDENT ADMISSION & PARENT PASSWORD HOTFIX CHECKS PASSED SUCCESSFULLY!\n');
    return true;
  } catch (err) {
    console.error('❌ Step T14 Test Failed:', err);
    throw err;
  }
}

runStepT14StudentAdmissionHotfixTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
