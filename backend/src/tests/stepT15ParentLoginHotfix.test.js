import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { School } from '../models/School.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { schoolUserLogin } from '../controllers/authController.js';

export async function runStepT15ParentLoginHotfixTests() {
  console.log('\n=== RUNNING STEP T15 PARENT LOGIN & AUTHENTICATION HOTFIX TESTS ===');

  try {
    const schoolId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439001');
    const parentUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439099');

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

    // Save originals
    const origSchoolFindOne = School.findOne;
    const origUserFindOne = User.findOne;
    const origStudentFindOne = Student.findOne;
    const origParentProfileFindOne = ParentProfile.findOne;
    const origAuditCreate = AuditLog.create;

    const rawPassword = 'ParentSecure123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const mockSchool = {
      _id: schoolId,
      name: 'Greenwood High',
      schoolCode: 'SCH01',
      isActive: true,
      setupStatus: 'completed',
    };

    const mockParentUser = {
      _id: parentUserId,
      schoolId,
      name: 'Ramesh Sharma',
      loginId: 'RAMESH.PARENT@GMAIL.COM',
      email: 'ramesh.parent@gmail.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'parent',
      isActive: true,
      isLocked: () => false,
      matchPassword: async (pass) => await bcrypt.compare(pass, hashedPassword),
      incLoginAttempts: async () => {},
      resetLoginAttempts: async () => {},
      save: async () => {},
    };

    School.findOne = async () => mockSchool;
    AuditLog.create = async () => ({});

    const createQueryMock = (doc) => {
      const queryObj = {
        select: () => Promise.resolve(doc),
        then: (resolve, reject) => Promise.resolve(doc).then(resolve, reject),
      };
      return queryObj;
    };

    // TEST 1: Parent Login with Email (Case Insensitive)
    User.findOne = () => createQueryMock(mockParentUser);

    const reqEmail = {
      body: {
        schoolCode: 'SCH01',
        identifier: 'Ramesh.Parent@Gmail.Com',
        password: rawPassword,
      },
    };
    const resEmail = mockRes();
    await schoolUserLogin(reqEmail, resEmail);

    if (resEmail.statusCode !== 200 || !resEmail.body?.success || resEmail.body?.user?.role !== 'parent') {
      throw new Error(`TEST 1 Failed: Parent email login expected status 200, got ${resEmail.statusCode}. Msg: ${resEmail.body?.message}`);
    }
    console.log('✅ TEST 1 Passed: Parent login with case-insensitive email succeeded (200 OK, role: parent).');

    // TEST 2: Parent Login with Phone Number
    const reqPhone = {
      body: {
        schoolCode: 'SCH01',
        identifier: '9876543210',
        password: rawPassword,
      },
    };
    const resPhone = mockRes();
    await schoolUserLogin(reqPhone, resPhone);

    if (resPhone.statusCode !== 200 || !resPhone.body?.success || resPhone.body?.user?.role !== 'parent') {
      throw new Error(`TEST 2 Failed: Parent phone login expected status 200, got ${resPhone.statusCode}. Msg: ${resPhone.body?.message}`);
    }
    console.log('✅ TEST 2 Passed: Parent login with phone number succeeded (200 OK, role: parent).');

    // TEST 3: Parent Login with Student Admission Number Fallback
    let userQueryCount = 0;
    User.findOne = () => {
      userQueryCount++;
      if (userQueryCount === 1) return createQueryMock(null); // Direct user lookup returns null
      return createQueryMock(mockParentUser); // Fallback lookup by parentProfile.userId returns parent
    };

    Student.findOne = async () => ({
      _id: 'STUDENT_1',
      schoolId,
      admissionNumber: 'ADM999',
      parentAccountId: 'PARENT_PROFILE_1',
    });

    ParentProfile.findOne = async () => ({
      _id: 'PARENT_PROFILE_1',
      schoolId,
      userId: parentUserId,
    });

    const reqStudentAdm = {
      body: {
        schoolCode: 'SCH01',
        identifier: 'ADM999',
        password: rawPassword,
      },
    };
    const resStudentAdm = mockRes();
    await schoolUserLogin(reqStudentAdm, resStudentAdm);

    if (resStudentAdm.statusCode !== 200 || !resStudentAdm.body?.success || resStudentAdm.body?.user?.role !== 'parent') {
      throw new Error(`TEST 3 Failed: Parent login with student admission number expected 200, got ${resStudentAdm.statusCode}`);
    }
    console.log('✅ TEST 3 Passed: Parent login with student admission number fallback succeeded (200 OK, role: parent).');

    // TEST 4: Invalid Password Rejection (Generic Security Response)
    User.findOne = () => createQueryMock(mockParentUser);

    const reqWrongPass = {
      body: {
        schoolCode: 'SCH01',
        identifier: 'ramesh.parent@gmail.com',
        password: 'WrongPassword123!',
      },
    };
    const resWrongPass = mockRes();
    await schoolUserLogin(reqWrongPass, resWrongPass);

    if (resWrongPass.statusCode !== 401 || resWrongPass.body?.message !== 'Invalid credentials for this school.') {
      throw new Error(`TEST 4 Failed: Expected 401 generic invalid credentials message, got ${resWrongPass.statusCode}`);
    }
    console.log('✅ TEST 4 Passed: Invalid password rejected with generic secure error message.');

    // Restore originals
    School.findOne = origSchoolFindOne;
    User.findOne = origUserFindOne;
    Student.findOne = origStudentFindOne;
    ParentProfile.findOne = origParentProfileFindOne;
    AuditLog.create = origAuditCreate;

    console.log('🎉 ALL STEP T15 PARENT LOGIN & AUTHENTICATION CHECKS PASSED SUCCESSFULLY!\n');
    return true;
  } catch (err) {
    console.error('❌ Step T15 Test Failed:', err);
    throw err;
  }
}

runStepT15ParentLoginHotfixTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
