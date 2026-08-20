import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Subject } from '../models/Subject.js';
import { SubjectAssignment } from '../models/SubjectAssignment.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { Exam } from '../models/Exam.js';
import { ExamSchedule } from '../models/ExamSchedule.js';
import { StudentMarks } from '../models/StudentMarks.js';
import { Result } from '../models/Result.js';
import { connectDB } from '../config/db.js';

import {
  getTeacherExamOptions,
  createExam,
  getExams,
  getExamSchedules,
  getTeacherMarksEntryRoster,
  saveTeacherStudentMarks,
  getParentChildResults,
} from '../controllers/examController.js';
import { getChildResults } from '../controllers/parentController.js';
import examRouter from '../routes/examRoutes.js';

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

export const runStepT19Tests = async () => {
  console.log('\n==================================================');
  console.log('RUNNING STEP T19: TEACHER ASSESSMENT & MARKS HOTFIX TESTS');
  console.log('==================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const timestamp = Date.now();
  const schoolACode = `T19A_${timestamp}`.slice(0, 20);
  const schoolBCode = `T19B_${timestamp}`.slice(0, 20);

  let schoolA, schoolB, principalA;
  let teacherA, userTeacherA; // Class Teacher of 9-A
  let teacherB, userTeacherB; // Subject Teacher (Hindi) of 9-A
  let userParent, parentProfile;
  let sessionA, class9, sectionA, class10, sectionB;
  let subjectMath, subjectHindi, subjectEnglish;
  let student1, student2;

  try {
    // Setup School A
    schoolA = await School.create({
      name: 'Step T19 Academy A',
      schoolCode: schoolACode,
      schoolSlug: `t19-academy-a-${timestamp}`,
      subdomain: `t19a-${timestamp}`,
      isActive: true,
      subscription: { status: 'active' },
    });

    // Setup School B (for isolation test)
    schoolB = await School.create({
      name: 'Step T19 Academy B',
      schoolCode: schoolBCode,
      schoolSlug: `t19-academy-b-${timestamp}`,
      subdomain: `t19b-${timestamp}`,
      isActive: true,
      subscription: { status: 'active' },
    });

    // Principal
    principalA = await User.create({
      schoolId: schoolA._id,
      email: `principal_t19_${timestamp}@test.com`,
      loginId: `PRIN_T19_${timestamp}`.slice(0, 20),
      role: 'principal',
      name: 'Principal T19',
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });

    // Academic Session
    sessionA = await AcademicSession.create({
      schoolId: schoolA._id,
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
      status: 'active',
      createdBy: principalA._id,
    });

    // Classes & Sections
    class9 = await SchoolClass.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Class 9',
      displayName: 'Class 9',
      numericOrder: 9,
      createdBy: principalA._id,
    });

    sectionA = await Section.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      classId: class9._id,
      name: 'A',
      capacity: 40,
      createdBy: principalA._id,
    });

    class10 = await SchoolClass.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Class 10',
      displayName: 'Class 10',
      numericOrder: 10,
      createdBy: principalA._id,
    });

    sectionB = await Section.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      classId: class10._id,
      name: 'B',
      capacity: 40,
      createdBy: principalA._id,
    });

    // Subjects
    subjectMath = await Subject.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Mathematics',
      code: `MATH_${timestamp}`.slice(0, 10),
      subjectType: 'core',
      isActive: true,
      createdBy: principalA._id,
    });

    subjectHindi = await Subject.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'Hindi',
      code: `HIN_${timestamp}`.slice(0, 10),
      subjectType: 'language',
      isActive: true,
      createdBy: principalA._id,
    });

    subjectEnglish = await Subject.create({
      schoolId: schoolA._id,
      academicSessionId: sessionA._id,
      name: 'English',
      code: `ENG_${timestamp}`.slice(0, 10),
      subjectType: 'language',
      isActive: true,
      createdBy: principalA._id,
    });

    // Teacher A: Class Teacher of 9-A
    teacherA = await Teacher.create({
      schoolId: schoolA._id,
      name: 'Teacher A ClassTeacher',
      employeeId: `TCHA_${timestamp}`.slice(0, 20),
      loginId: `TCHA_${timestamp}`.slice(0, 20),
      isClassTeacher: true,
      classTeacherClassId: class9._id,
      classTeacherSectionId: sectionA._id,
      isActive: true,
    });

    userTeacherA = await User.create({
      schoolId: schoolA._id,
      email: `teacher_a_${timestamp}@test.com`,
      loginId: `TCHA_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'Teacher A ClassTeacher',
      teacherProfileId: teacherA._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    teacherA.userId = userTeacherA._id;
    await teacherA.save();

    // Teacher B: Subject Teacher for Hindi in Class 9-A
    teacherB = await Teacher.create({
      schoolId: schoolA._id,
      name: 'Teacher B HindiTeacher',
      employeeId: `TCHB_${timestamp}`.slice(0, 20),
      loginId: `TCHB_${timestamp}`.slice(0, 20),
      isClassTeacher: false,
      isActive: true,
    });

    userTeacherB = await User.create({
      schoolId: schoolA._id,
      email: `teacher_b_${timestamp}@test.com`,
      loginId: `TCHB_${timestamp}`.slice(0, 20),
      role: 'teacher',
      name: 'Teacher B HindiTeacher',
      teacherProfileId: teacherB._id,
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });
    teacherB.userId = userTeacherB._id;
    await teacherB.save();

    // Subject Assignment: Teacher B teaches Hindi to Class 9-A
    await SubjectAssignment.create({
      schoolId: schoolA._id,
      teacherId: teacherB._id,
      classId: class9._id,
      sectionId: sectionA._id,
      subjectId: subjectHindi._id,
      status: 'active',
    });

    // Students in Class 9-A
    student1 = await Student.create({
      schoolId: schoolA._id,
      permanentStudentId: `STU1_${timestamp}`.slice(0, 20),
      admissionNumber: `ADM1_${timestamp}`.slice(0, 20),
      rollNumber: 1,
      firstName: 'MOHIT',
      lastName: 'Student',
      fullName: 'MOHIT Student',
      dateOfBirth: new Date('2010-01-01'),
      currentAcademicSessionId: sessionA._id,
      currentClassId: class9._id,
      currentSectionId: sectionA._id,
      status: 'active',
    });

    student2 = await Student.create({
      schoolId: schoolA._id,
      permanentStudentId: `STU2_${timestamp}`.slice(0, 20),
      admissionNumber: `ADM2_${timestamp}`.slice(0, 20),
      rollNumber: 2,
      firstName: 'Sita',
      lastName: 'Sharma',
      fullName: 'Sita Sharma',
      dateOfBirth: new Date('2010-02-02'),
      currentAcademicSessionId: sessionA._id,
      currentClassId: class9._id,
      currentSectionId: sectionA._id,
      status: 'active',
    });

    // Parent User linked to student1
    userParent = await User.create({
      schoolId: schoolA._id,
      email: `parent_t19_${timestamp}@test.com`,
      loginId: `PAR_T19_${timestamp}`.slice(0, 20),
      role: 'parent',
      name: 'Parent of Mohit',
      password: 'TestPassword123!',
      passwordHash: 'dummyhash',
      isActive: true,
    });

    parentProfile = await ParentProfile.create({
      schoolId: schoolA._id,
      userId: userParent._id,
      familyCode: `FAM_${timestamp}`.slice(0, 20),
      primaryGuardian: {
        name: 'Parent of Mohit',
        relationship: 'Father',
        phone: '9876543210',
        email: `parent_t19_${timestamp}@test.com`,
      },
      linkedStudentIds: [student1._id],
    });

    // --- TEST 1: Teacher Exam Options for Class Teacher vs Subject Teacher ---
    console.log('[TEST 1] Teacher Exam Options resolution');
    const req1a = { user: userTeacherA, tenantSchoolId: schoolA._id };
    const res1a = mockRes();
    await getTeacherExamOptions(req1a, res1a);
    if (res1a.statusCode !== 200 || !res1a.body?.isClassTeacher || res1a.body.availableSubjects.length < 3) {
      throw new Error(`getTeacherExamOptions failed for Class Teacher: status ${res1a.statusCode}`);
    }

    const req1b = { user: userTeacherB, tenantSchoolId: schoolA._id };
    const res1b = mockRes();
    await getTeacherExamOptions(req1b, res1b);
    if (res1b.statusCode !== 200 || res1b.body?.isClassTeacher || res1b.body.subjectAssignments.length !== 1) {
      throw new Error(`getTeacherExamOptions failed for Subject Teacher: status ${res1b.statusCode}`);
    }
    console.log('✓ PASS: getTeacherExamOptions correctly resolved Class Teacher & Subject Teacher scopes');

    // --- TEST 2: Class Teacher Creates Assessment for Owned Class ---
    console.log('[TEST 2] Class Teacher creates Assessment for owned Class 9-A (Mathematics)');
    const req2 = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      body: {
        title: 'Class 9 Math Unit Test',
        assessmentType: 'unitTest',
        academicSessionId: sessionA._id.toString(),
        classId: class9._id.toString(),
        sectionId: sectionA._id.toString(),
        subjectId: subjectMath._id.toString(),
        examDate: '2026-08-20',
        maximumMarks: 50,
        passingMarks: 18,
        instructions: 'Attempt all questions.',
      },
    };
    const res2 = mockRes();
    await createExam(req2, res2);
    if (res2.statusCode !== 201 || !res2.body?.exam || !res2.body?.schedule) {
      throw new Error(`Class Teacher assessment creation failed: status ${res2.statusCode} msg: ${res2.body?.message}`);
    }
    const mathExam = res2.body.exam;
    const mathSchedule = res2.body.schedule;
    console.log('✓ PASS: Class Teacher successfully created assessment and atomic schedule');

    // --- TEST 3: Subject Teacher Creates Assessment for Assigned Subject (Hindi) ---
    console.log('[TEST 3] Subject Teacher creates Assessment for assigned Class 9-A (Hindi)');
    const req3 = {
      user: userTeacherB,
      tenantSchoolId: schoolA._id,
      body: {
        title: 'Class 9 Hindi Class Test',
        assessmentType: 'custom',
        academicSessionId: sessionA._id.toString(),
        classId: class9._id.toString(),
        sectionId: sectionA._id.toString(),
        subjectId: subjectHindi._id.toString(),
        examDate: '2026-08-21',
        maximumMarks: 25,
        passingMarks: 10,
      },
    };
    const res3 = mockRes();
    await createExam(req3, res3);
    if (res3.statusCode !== 201 || !res3.body?.exam || !res3.body?.schedule) {
      throw new Error(`Subject Teacher assessment creation failed: status ${res3.statusCode} msg: ${res3.body?.message}`);
    }
    const hindiExam = res3.body.exam;
    const hindiSchedule = res3.body.schedule;
    console.log('✓ PASS: Subject Teacher successfully created assessment for assigned subject');

    // --- TEST 4: Security Violation: Subject Teacher Blocked from Creating Unassigned Assessment ---
    console.log('[TEST 4] Subject Teacher blocked (403) from creating Math Assessment or Class 10 Assessment');
    // Attempt unassigned subject (Math)
    const req4a = {
      user: userTeacherB,
      tenantSchoolId: schoolA._id,
      body: {
        title: 'Unauthorized Math Test',
        academicSessionId: sessionA._id.toString(),
        classId: class9._id.toString(),
        sectionId: sectionA._id.toString(),
        subjectId: subjectMath._id.toString(),
        examDate: '2026-08-22',
        maximumMarks: 50,
      },
    };
    const res4a = mockRes();
    await createExam(req4a, res4a);
    if (res4a.statusCode !== 403) {
      throw new Error(`Expected 403 for Subject Teacher creating unassigned subject assessment, got ${res4a.statusCode}`);
    }

    // Attempt unassigned class (Class 10-B)
    const req4b = {
      user: userTeacherB,
      tenantSchoolId: schoolA._id,
      body: {
        title: 'Unauthorized Class 10 Test',
        academicSessionId: sessionA._id.toString(),
        classId: class10._id.toString(),
        sectionId: sectionB._id.toString(),
        subjectId: subjectHindi._id.toString(),
        examDate: '2026-08-22',
        maximumMarks: 50,
      },
    };
    const res4b = mockRes();
    await createExam(req4b, res4b);
    if (res4b.statusCode !== 403) {
      throw new Error(`Expected 403 for Subject Teacher creating unassigned class assessment, got ${res4b.statusCode}`);
    }
    console.log('✓ PASS: Unauthorized assessment creation properly rejected with HTTP 403 Forbidden');

    // --- TEST 5: Marks Entry Roster Loading ---
    console.log('[TEST 5] Marks Entry Roster loading for Math Assessment');
    const req5 = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      params: { examId: mathExam._id.toString() },
      query: { scheduleId: mathSchedule._id.toString(), sectionId: sectionA._id.toString() },
    };
    const res5 = mockRes();
    await getTeacherMarksEntryRoster(req5, res5);
    if (res5.statusCode !== 200 || !Array.isArray(res5.body.roster) || res5.body.roster.length !== 2) {
      throw new Error(`Failed to load marks roster: status ${res5.statusCode}, count: ${res5.body.roster?.length}`);
    }
    console.log('✓ PASS: Marks Entry Roster successfully loaded 2 enrolled students');

    // --- TEST 6: Marks Save Draft and Submit with Validation ---
    console.log('[TEST 6] Class Teacher saves Draft marks and Submits final marks');
    const marksData = [
      { studentId: student1._id.toString(), theoryMarks: 45, attendanceStatus: 'present', remark: 'Outstanding' },
      { studentId: student2._id.toString(), theoryMarks: 0, attendanceStatus: 'absent', remark: 'Sick leave' },
    ];

    // Draft
    const reqDraft = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      params: { examId: mathExam._id.toString() },
      body: {
        scheduleId: mathSchedule._id.toString(),
        sectionId: sectionA._id.toString(),
        targetStatus: 'draft',
        marksList: marksData,
      },
    };
    const resDraft = mockRes();
    await saveTeacherStudentMarks(reqDraft, resDraft);
    if (resDraft.statusCode !== 200 || !resDraft.body?.success) {
      throw new Error(`Save draft marks failed: status ${resDraft.statusCode}`);
    }

    // Submit
    const reqSubmit = {
      user: userTeacherA,
      tenantSchoolId: schoolA._id,
      params: { examId: mathExam._id.toString() },
      body: {
        scheduleId: mathSchedule._id.toString(),
        sectionId: sectionA._id.toString(),
        targetStatus: 'submitted',
        marksList: marksData,
      },
    };
    const resSubmit = mockRes();
    await saveTeacherStudentMarks(reqSubmit, resSubmit);
    if (resSubmit.statusCode !== 200 || !resSubmit.body?.success) {
      throw new Error(`Submit marks failed: status ${resSubmit.statusCode}`);
    }

    const savedMohitMark = await StudentMarks.findOne({
      schoolId: schoolA._id,
      examId: mathExam._id,
      studentId: student1._id,
      subjectId: subjectMath._id,
    });
    if (!savedMohitMark || savedMohitMark.theoryMarks !== 45 || savedMohitMark.status !== 'submitted') {
      throw new Error('Submitted marks verification failed in database.');
    }
    console.log('✓ PASS: Marks Draft and Submission persisted accurately in database');

    // --- TEST 7: Subject Teacher enters Hindi marks; Blocked from entering Math marks ---
    console.log('[TEST 7] Subject Teacher enters Hindi marks and is blocked (403) from Math marks');
    // Allowed: Hindi marks
    const reqHindiMarks = {
      user: userTeacherB,
      tenantSchoolId: schoolA._id,
      params: { examId: hindiExam._id.toString() },
      body: {
        scheduleId: hindiSchedule._id.toString(),
        sectionId: sectionA._id.toString(),
        targetStatus: 'submitted',
        marksList: [
          { studentId: student1._id.toString(), theoryMarks: 22, attendanceStatus: 'present', remark: 'Good' },
        ],
      },
    };
    const resHindiMarks = mockRes();
    await saveTeacherStudentMarks(reqHindiMarks, resHindiMarks);
    if (resHindiMarks.statusCode !== 200) {
      throw new Error(`Subject teacher failed to submit Hindi marks: status ${resHindiMarks.statusCode}`);
    }

    // Blocked: Math marks
    const reqUnauthorizedMarks = {
      user: userTeacherB,
      tenantSchoolId: schoolA._id,
      params: { examId: mathExam._id.toString() },
      body: {
        scheduleId: mathSchedule._id.toString(),
        sectionId: sectionA._id.toString(),
        targetStatus: 'submitted',
        marksList: [
          { studentId: student1._id.toString(), theoryMarks: 50, attendanceStatus: 'present' },
        ],
      },
    };
    const resUnauthorizedMarks = mockRes();
    await saveTeacherStudentMarks(reqUnauthorizedMarks, resUnauthorizedMarks);
    if (resUnauthorizedMarks.statusCode !== 403) {
      throw new Error(`Expected 403 for Subject Teacher entering unassigned subject marks, got ${resUnauthorizedMarks.statusCode}`);
    }
    console.log('✓ PASS: Subject Teacher successfully entered assigned marks and was blocked from unassigned marks');

    // --- TEST 8: Duplicate Marks Record Protection ---
    console.log('[TEST 8] Duplicate Marks record prevention');
    const marksCount = await StudentMarks.countDocuments({
      schoolId: schoolA._id,
      examId: mathExam._id,
      studentId: student1._id,
      subjectId: subjectMath._id,
    });
    if (marksCount !== 1) {
      throw new Error(`Expected exactly 1 marks record for student, found ${marksCount}`);
    }
    console.log('✓ PASS: Upsert logic and unique index prevented duplicate student marks records');

    // --- TEST 9: Parent Results Visibility for Linked Child ---
    console.log('[TEST 9] Parent Result visibility for linked child vs unlinked student');
    // Create published result for student 1
    const publishedResult = await Result.create({
      schoolId: schoolA._id,
      examId: mathExam._id,
      academicSessionId: sessionA._id,
      studentId: student1._id,
      classId: class9._id,
      sectionId: sectionA._id,
      subjectResults: [
        {
          subjectId: subjectMath._id,
          subjectName: 'Mathematics',
          obtainedMarks: 45,
          maximumMarks: 50,
          percentage: 90,
          grade: 'A',
          passStatus: 'pass',
          remark: 'Outstanding',
        },
      ],
      totalObtainedMarks: 45,
      totalMaximumMarks: 50,
      percentage: 90,
      overallGrade: 'A',
      resultStatus: 'pass',
      isPublished: true,
      publishedAt: new Date(),
    });

    // Parent queries linked child (student1)
    const reqParentLinked = {
      user: userParent,
      tenantSchoolId: schoolA._id,
      params: { studentId: student1._id.toString() },
    };
    const resParentLinked = mockRes();
    await getChildResults(reqParentLinked, resParentLinked);
    if (resParentLinked.statusCode !== 200 || resParentLinked.body.results.length === 0) {
      throw new Error(`Parent failed to view linked child results: status ${resParentLinked.statusCode}`);
    }

    // Parent attempts to query unlinked student (student2)
    const reqParentUnlinked = {
      user: userParent,
      tenantSchoolId: schoolA._id,
      params: { studentId: student2._id.toString() },
    };
    const resParentUnlinked = mockRes();
    await getChildResults(reqParentUnlinked, resParentUnlinked);
    if (resParentUnlinked.statusCode !== 403) {
      throw new Error(`Expected 403 for Parent viewing unlinked child results, got ${resParentUnlinked.statusCode}`);
    }
    console.log('✓ PASS: Parent can only view results of linked child; unlinked access rejected with 403');

    // --- TEST 10: Express Route Registration Contract ---
    console.log('[TEST 10] Express Route Registration for Exam & Assessment endpoints');
    const examRoutePaths = examRouter.stack.map((layer) => layer.route?.path).filter(Boolean);
    const requiredRoutes = [
      '/teacher/exams/options',
      '/teacher/exams',
      '/teacher/exams/:examId/schedules',
      '/teacher/exams/:examId/marks-entry',
      '/teacher/exams/:examId/marks/submit',
      '/principal/exams',
    ];
    for (const route of requiredRoutes) {
      if (!examRoutePaths.includes(route)) {
        throw new Error(`Required route ${route} is not registered in examRouter.`);
      }
    }
    console.log('✓ PASS: All teacher exam, options, schedule, and marks routes registered in Express router');

    console.log('\n==================================================');
    console.log('STEP T19 HOTFIX TESTS: ALL 10 TEST SUITES PASSED (100% GREEN)');
    console.log('==================================================\n');
  } finally {
    // Cleanup test data
    if (schoolA?._id) {
      await Result.deleteMany({ schoolId: schoolA._id });
      await StudentMarks.deleteMany({ schoolId: schoolA._id });
      await ExamSchedule.deleteMany({ schoolId: schoolA._id });
      await Exam.deleteMany({ schoolId: schoolA._id });
      await ParentProfile.deleteMany({ schoolId: schoolA._id });
      await Student.deleteMany({ schoolId: schoolA._id });
      await SubjectAssignment.deleteMany({ schoolId: schoolA._id });
      await Subject.deleteMany({ schoolId: schoolA._id });
      await Teacher.deleteMany({ schoolId: schoolA._id });
      await User.deleteMany({ schoolId: schoolA._id });
      await Section.deleteMany({ schoolId: schoolA._id });
      await SchoolClass.deleteMany({ schoolId: schoolA._id });
      await AcademicSession.deleteMany({ schoolId: schoolA._id });
      await School.deleteOne({ _id: schoolA._id });
    }
    if (schoolB?._id) {
      await School.deleteOne({ _id: schoolB._id });
    }
  }
};

if (process.argv[1]?.endsWith('stepT19TeacherAssessmentAndMarksHotfix.test.js')) {
  runStepT19Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test execution error:', err);
      process.exit(1);
    });
}
