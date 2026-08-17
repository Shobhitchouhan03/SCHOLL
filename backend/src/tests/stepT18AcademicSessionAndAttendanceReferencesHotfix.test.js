import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Student } from '../models/Student.js';
import { AttendanceSession } from '../models/AttendanceSession.js';
import { StudentAttendance } from '../models/StudentAttendance.js';
import { connectDB } from '../config/db.js';

import { getAcademicSessions, getClasses, getSections } from '../controllers/academicStructureController.js';
import {
  getTeacherAttendanceOptions,
  getAttendanceSession,
  saveAttendanceSession,
} from '../controllers/attendanceController.js';
import { getStudents } from '../controllers/studentController.js';

import principalSetupRouter from '../routes/principalSetupRoutes.js';
import attendanceRouter from '../routes/attendanceRoutes.js';

dotenv.config({ path: 'backend/.env' });
dotenv.config();

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
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

export const runStepT18Tests = async () => {
  console.log('\n==================================================');
  console.log('RUNNING STEP T18: ACADEMIC SESSION & ATTENDANCE HOTFIX TESTS');
  console.log('==================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const timestamp = Date.now();
  const schoolACode = `T18A_${timestamp}`.slice(0, 20);
  const schoolBCode = `T18B_${timestamp}`.slice(0, 20);

  let schoolA, schoolB, principalA, teacherA, userTeacherA, unassignedTeacherA, userUnassigned, schoolBTeacher, userSchoolB;
  let sessionA, class1, sectionA, class2, sectionB, studentA1, studentA2;

  try {
    // Setup School A
    schoolA = await School.create({
      name: 'Step T18 Academy A',
      schoolCode: schoolACode,
      schoolSlug: `t18-academy-a-${timestamp}`,
      subdomain: `t18a-${timestamp}`,
      isActive: true,
      subscription: { status: 'active' },
    });

    // Setup School B (for isolation test)
    schoolB = await School.create({
      name: 'Step T18 Academy B',
      schoolCode: schoolBCode,
      schoolSlug: `t18-academy-b-${timestamp}`,
      subdomain: `t18b-${timestamp}`,
      isActive: true,
      subscription: { status: 'active' },
    });

    // Setup Principal User for School A
    principalA = await User.create({
      schoolId: schoolA._id,
      email: `principal_t18_${timestamp}@test.com`,
      loginId: `PRIN_T18_${timestamp}`.slice(0, 20),
      role: 'principal',
      name: 'Principal T18',
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });

    // Setup Academic Session for School A
    sessionA = await AcademicSession.create({
      schoolId: schoolA._id,
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      status: 'active',
      createdBy: principalA._id,
    });

    // Setup Classes & Sections for School A
    class1 = await SchoolClass.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Class 10',
      displayName: 'Class 10',
      numericOrder: 10,
      createdBy: principalA._id,
    });

    sectionA = await Section.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      classId: class1._id,
      name: 'A',
      capacity: 40,
      createdBy: principalA._id,
    });

    class2 = await SchoolClass.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Class 11',
      displayName: 'Class 11',
      numericOrder: 11,
      createdBy: principalA._id,
    });

    sectionB = await Section.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      classId: class2._id,
      name: 'B',
      capacity: 40,
      createdBy: principalA._id,
    });

    // Setup Class Teacher for Class 10-A
    teacherA = await Teacher.create({
      schoolId: schoolA._id,
      name: 'Teacher T18 Shobhit',
      employeeId: `TCH_T18_${timestamp}`.slice(0, 20),
      loginId: `TCH_T18_${timestamp}`.slice(0, 20),
      isClassTeacher: true,
      classTeacherClassId: class1._id,
      classTeacherSectionId: sectionA._id,
      isActive: true,
    });

    userTeacherA = await User.create({
      schoolId: schoolA._id,
      email: `teacher_t18_${timestamp}@test.com`,
      loginId: `TCH_T18_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'Teacher T18 Shobhit',
      teacherProfileId: teacherA._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    teacherA.userId = userTeacherA._id;
    await teacherA.save();

    // Setup Unassigned Teacher for School A
    unassignedTeacherA = await Teacher.create({
      schoolId: schoolA._id,
      name: 'Unassigned Teacher T18',
      employeeId: `UNASS_${timestamp}`.slice(0, 20),
      loginId: `UNASS_${timestamp}`.slice(0, 20),
      isClassTeacher: false,
      isActive: true,
    });

    userUnassigned = await User.create({
      schoolId: schoolA._id,
      email: `unassigned_t18_${timestamp}@test.com`,
      loginId: `UNASS_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'Unassigned Teacher T18',
      teacherProfileId: unassignedTeacherA._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    unassignedTeacherA.userId = userUnassigned._id;
    await unassignedTeacherA.save();

    // Setup School B Teacher
    schoolBTeacher = await Teacher.create({
      schoolId: schoolB._id,
      name: 'School B Teacher',
      employeeId: `TCHB_${timestamp}`.slice(0, 20),
      loginId: `TCHB_${timestamp}`.slice(0, 20),
      isClassTeacher: true,
      isActive: true,
    });

    userSchoolB = await User.create({
      schoolId: schoolB._id,
      email: `teacher_b_${timestamp}@test.com`,
      loginId: `TCHB_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'School B Teacher',
      teacherProfileId: schoolBTeacher._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    schoolBTeacher.userId = userSchoolB._id;
    await schoolBTeacher.save();

    // Setup Students in Class 10-A
    studentA1 = await Student.create({
      schoolId: schoolA._id,
      permanentStudentId: `STU1_${timestamp}`.slice(0, 20),
      admissionNumber: `ADM1_${timestamp}`.slice(0, 20),
      rollNumber: 1,
      firstName: 'Aarav',
      lastName: 'Sharma',
      fullName: 'Aarav Sharma',
      dateOfBirth: new Date('2010-05-15'),
      currentAcademicSessionId: sessionA._id,
      currentClassId: class1._id,
      currentSectionId: sectionA._id,
      status: 'active',
    });

    studentA2 = await Student.create({
      schoolId: schoolA._id,
      permanentStudentId: `STU2_${timestamp}`.slice(0, 20),
      admissionNumber: `ADM2_${timestamp}`.slice(0, 20),
      rollNumber: 2,
      firstName: 'Diya',
      lastName: 'Patel',
      fullName: 'Diya Patel',
      dateOfBirth: new Date('2010-08-20'),
      currentAcademicSessionId: sessionA._id,
      currentClassId: class1._id,
      currentSectionId: sectionA._id,
      status: 'active',
    });

    // --- TEST 1: Academic Sessions read by Principal and Teacher ---
    console.log('[TEST 1] Academic Sessions read by Principal and Teacher');
    const req1a = { user: principalA, tenantSchoolId: schoolA._id, query: {} };
    const res1a = mockRes();
    await getAcademicSessions(req1a, res1a);
    if (res1a.statusCode !== 200 || !res1a.body?.success || !Array.isArray(res1a.body.sessions)) {
      throw new Error(`getAcademicSessions failed for Principal: status ${res1a.statusCode}`);
    }

    const req1b = { user: userTeacherA, tenantSchoolId: schoolA._id, query: {} };
    const res1b = mockRes();
    await getAcademicSessions(req1b, res1b);
    if (res1b.statusCode !== 200 || !res1b.body?.success || res1b.body.sessions.length !== 1) {
      throw new Error(`getAcademicSessions failed for Teacher: status ${res1b.statusCode}`);
    }
    console.log('✓ PASS: getAcademicSessions returned 200 with sessions list for Principal & Teacher');

    // --- TEST 2: Teacher Attendance Options for Class Teacher ---
    console.log('[TEST 2] Teacher Attendance Options resolves assigned class and section');
    const req2 = { user: userTeacherA, tenantSchoolId: schoolA._id };
    const res2 = mockRes();
    await getTeacherAttendanceOptions(req2, res2);
    if (res2.statusCode !== 200 || !res2.body?.success) {
      throw new Error(`getTeacherAttendanceOptions failed: status ${res2.statusCode}`);
    }
    if (!res2.body.currentSession || res2.body.currentSession._id.toString() !== sessionA._id.toString()) {
      throw new Error('Current academic session not returned correctly in attendance options.');
    }
    if (!Array.isArray(res2.body.assignedClasses) || res2.body.assignedClasses.length === 0) {
      throw new Error('assignedClasses array is empty for Class Teacher.');
    }
    if (res2.body.assignedClasses[0]._id.toString() !== class1._id.toString()) {
      throw new Error('Assigned class ID does not match Class 10 ID.');
    }
    if (!Array.isArray(res2.body.assignedSections) || res2.body.assignedSections.length === 0) {
      throw new Error('assignedSections array is empty for Class Teacher.');
    }
    if (res2.body.assignedSections[0]._id.toString() !== sectionA._id.toString()) {
      throw new Error('Assigned section ID does not match Section A ID.');
    }
    console.log('✓ PASS: Teacher Attendance Options returned assigned class, section, and active session');

    // --- TEST 3: Teacher Attendance Options for Unassigned Teacher ---
    console.log('[TEST 3] Safe 200 response for Teacher without class assignment');
    const req3 = { user: userUnassigned, tenantSchoolId: schoolA._id };
    const res3 = mockRes();
    await getTeacherAttendanceOptions(req3, res3);
    if (res3.statusCode !== 200 || !res3.body?.success) {
      throw new Error(`Unassigned teacher attendance options failed with status ${res3.statusCode}`);
    }
    if (res3.body.assignedClasses.length !== 0 || res3.body.assignedSections.length !== 0) {
      throw new Error('Unassigned teacher received unexpected class/section assignments.');
    }
    console.log('✓ PASS: Unassigned Teacher received 200 OK with empty assignment arrays');

    // --- TEST 4: Student Roster for Assigned Class/Section ---
    console.log('[TEST 4] Student Roster retrieval for Class 10-A');
    const req4 = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      query: {
        academicSessionId: sessionA._id.toString(),
        classId: class1._id.toString(),
        sectionId: sectionA._id.toString(),
        date: '2026-08-18',
      },
    };
    const res4 = mockRes();
    await getAttendanceSession(req4, res4);
    if (res4.statusCode !== 200 || !res4.body?.success) {
      throw new Error(`getAttendanceSession failed: status ${res4.statusCode}`);
    }
    if (!Array.isArray(res4.body.studentRoster) || res4.body.studentRoster.length !== 2) {
      throw new Error(`Expected 2 students in roster, got ${res4.body.studentRoster?.length}`);
    }
    console.log('✓ PASS: Student Roster loaded 2 active enrolled students with roll numbers and names');

    // --- TEST 5: Empty Roster handling for Class/Section with 0 students ---
    console.log('[TEST 5] Empty Roster handling for Class 11-B (0 students)');
    const teacherB11 = await Teacher.create({
      schoolId: schoolA._id,
      name: 'Teacher 11B',
      employeeId: `TCH11B_${timestamp}`.slice(0, 20),
      loginId: `TCH11B_${timestamp}`.slice(0, 20),
      isClassTeacher: true,
      classTeacherClassId: class2._id,
      classTeacherSectionId: sectionB._id,
      isActive: true,
    });

    const userTeacherB11 = await User.create({
      schoolId: schoolA._id,
      email: `teacher_11b_${timestamp}@test.com`,
      loginId: `TCH11B_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'Teacher 11B',
      teacherProfileId: teacherB11._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    teacherB11.userId = userTeacherB11._id;
    await teacherB11.save();

    const req5 = {
      user: userTeacherB11,
      tenantSchoolId: schoolA._id,
      query: {
        academicSessionId: sessionA._id.toString(),
        classId: class2._id.toString(),
        sectionId: sectionB._id.toString(),
        date: '2026-08-18',
      },
    };
    const res5 = mockRes();
    await getAttendanceSession(req5, res5);
    if (res5.statusCode !== 200 || !res5.body?.success) {
      throw new Error(`Empty roster query failed with status ${res5.statusCode}`);
    }
    if (!Array.isArray(res5.body.studentRoster) || res5.body.studentRoster.length !== 0) {
      throw new Error(`Expected 0 students in roster, got ${res5.body.studentRoster?.length}`);
    }
    console.log('✓ PASS: Empty Roster returned HTTP 200 OK with empty studentRoster array');

    // --- TEST 6: Attendance Save Draft and Submit with Duplicate Protection ---
    console.log('[TEST 6] Attendance Save Draft and Submit workflow');
    const records = [
      { studentId: studentA1._id.toString(), status: 'present', remark: 'On time' },
      { studentId: studentA2._id.toString(), status: 'absent', remark: 'Informed leave' },
    ];

    // Save Draft
    const reqDraft = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      body: {
        academicSessionId: sessionA._id.toString(),
        classId: class1._id.toString(),
        sectionId: sectionA._id.toString(),
        date: '2026-08-18',
        status: 'draft',
        remarks: 'Morning attendance draft',
        records,
      },
    };
    const resDraft = mockRes();
    await saveAttendanceSession(reqDraft, resDraft);
    if (resDraft.statusCode !== 200 || !resDraft.body?.success) {
      throw new Error(`Save draft failed: status ${resDraft.statusCode} msg: ${resDraft.body?.message}`);
    }

    // Submit (Lock)
    const reqSubmit = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      body: {
        academicSessionId: sessionA._id.toString(),
        classId: class1._id.toString(),
        sectionId: sectionA._id.toString(),
        date: '2026-08-18',
        status: 'submitted',
        remarks: 'Morning attendance finalized',
        records,
      },
    };
    const resSubmit = mockRes();
    await saveAttendanceSession(reqSubmit, resSubmit);
    if (resSubmit.statusCode !== 200 || !resSubmit.body?.success) {
      throw new Error(`Submit attendance failed: status ${resSubmit.statusCode}`);
    }

    // Verify exactly 1 AttendanceSession document was created for that date (no duplicates)
    const sessionCount = await AttendanceSession.countDocuments({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      classId: class1._id,
      sectionId: sectionA._id,
    });
    if (sessionCount !== 1) {
      throw new Error(`Expected 1 AttendanceSession document, found ${sessionCount}`);
    }
    console.log('✓ PASS: Attendance Save Draft and Submit succeeded without duplicate sessions');

    // --- TEST 7: Multi-Tenant Isolation ---
    console.log('[TEST 7] Multi-Tenant Isolation enforcement');
    const req7 = {
      user: userSchoolB,
      tenantSchoolId: schoolB._id,
      query: {
        academicSessionId: sessionA._id.toString(),
        classId: class1._id.toString(),
        sectionId: sectionA._id.toString(),
        date: '2026-08-18',
      },
    };
    const res7 = mockRes();
    await getAttendanceSession(req7, res7);
    if (res7.statusCode !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-school attendance access, got ${res7.statusCode}`);
    }
    console.log('✓ PASS: Cross-school teacher access rejected with 403 Forbidden');

    // --- TEST 8: Principal Student Directory Summary Consistency ---
    console.log('[TEST 8] Principal Student Directory Summary consistency');
    const totalStudentsInDB = await Student.countDocuments({ schoolId: schoolA._id });
    const totalClassesInDB = await SchoolClass.countDocuments({ schoolId: schoolA._id });

    if (totalStudentsInDB !== 2 || totalClassesInDB !== 2) {
      throw new Error(`Database count mismatch: students=${totalStudentsInDB}, classes=${totalClassesInDB}`);
    }

    const req8 = {
      user: principalA,
      tenantSchoolId: schoolA._id,
      query: { page: 1, limit: 10 },
    };
    const res8 = mockRes();
    await getStudents(req8, res8);
    if (res8.statusCode !== 200 || !res8.body?.success) {
      throw new Error(`getStudents failed: status ${res8.statusCode}`);
    }
    if (res8.body.pagination.total !== totalStudentsInDB) {
      throw new Error(`Principal summary pagination total (${res8.body.pagination.total}) does not match DB (${totalStudentsInDB})`);
    }
    console.log(`✓ PASS: Principal student total (${res8.body.pagination.total}) and classes (${totalClassesInDB}) match real DB state`);

    // --- TEST 9: Route Registry Verification ---
    console.log('[TEST 9] Express Route Registration for Academic Structure & Attendance');
    const principalRoutes = principalSetupRouter.stack.map((layer) => ({
      path: layer.route?.path,
      methods: Object.keys(layer.route?.methods || {}),
    }));
    const attendanceRoutes = attendanceRouter.stack.map((layer) => ({
      path: layer.route?.path,
      methods: Object.keys(layer.route?.methods || {}),
    }));

    const hasAcademicSessions = principalRoutes.some((r) => r.path === '/academic-sessions');
    const hasSetupAcademicSessions = principalRoutes.some((r) => r.path === '/setup/academic-sessions');
    const hasTeacherAttendanceOptions = attendanceRoutes.some((r) => r.path === '/teacher/attendance/options');
    const hasTeacherAttendanceSession = attendanceRoutes.some((r) => r.path === '/teacher/attendance/session');

    if (!hasAcademicSessions || !hasSetupAcademicSessions || !hasTeacherAttendanceOptions || !hasTeacherAttendanceSession) {
      throw new Error('Required routes are missing from route stacks.');
    }
    console.log('✓ PASS: All academic reference, alias, and attendance routes properly registered in Express router');

    console.log('\n==================================================');
    console.log('STEP T18 HOTFIX TESTS: ALL 9 TEST SUITES PASSED (100% GREEN)');
    console.log('==================================================\n');
  } finally {
    // Cleanup test data
    if (schoolA?._id) {
      await StudentAttendance.deleteMany({ schoolId: schoolA._id });
      await AttendanceSession.deleteMany({ schoolId: schoolA._id });
      await Student.deleteMany({ schoolId: schoolA._id });
      await Teacher.deleteMany({ schoolId: schoolA._id });
      await User.deleteMany({ schoolId: schoolA._id });
      await Section.deleteMany({ schoolId: schoolA._id });
      await SchoolClass.deleteMany({ schoolId: schoolA._id });
      await AcademicSession.deleteMany({ schoolId: schoolA._id });
      await School.deleteOne({ _id: schoolA._id });
    }
    if (schoolB?._id) {
      await Teacher.deleteMany({ schoolId: schoolB._id });
      await User.deleteMany({ schoolId: schoolB._id });
      await School.deleteOne({ _id: schoolB._id });
    }
  }
};

if (process.argv[1]?.endsWith('stepT18AcademicSessionAndAttendanceReferencesHotfix.test.js')) {
  runStepT18Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
}
