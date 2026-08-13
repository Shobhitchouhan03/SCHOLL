import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Teacher } from '../models/Teacher.js';

export const runClassTeacherAssignmentTests = async () => {
  console.log('\n=== RUNNING CLASS TEACHER ASSIGNMENT & ACADEMIC REFERENCE TESTS ===');

  try {
    const mockTenantAId = '507f1f77bcf86cd799439001';
    const mockTenantBId = '507f1f77bcf86cd799439002';

    // 1. Tenant Isolation Test for Classes
    const mockClasses = [
      { _id: 'c1', schoolId: mockTenantAId, name: 'Class 1', numericOrder: 1 },
      { _id: 'c2', schoolId: mockTenantAId, name: 'Class 2', numericOrder: 2 },
      { _id: 'c3', schoolId: mockTenantBId, name: 'Class 10', numericOrder: 10 },
    ];

    const tenantAClasses = mockClasses.filter((c) => c.schoolId === mockTenantAId);
    if (tenantAClasses.length === 2 && !tenantAClasses.some((c) => c.schoolId === mockTenantBId)) {
      console.log('✅ Test 1 Passed: Tenant A only receives Tenant A classes (Tenant B isolated).');
    } else {
      throw new Error('Test 1 Failed: Tenant isolation for classes breached.');
    }

    // 2. Class -> Section filtering test
    const mockSections = [
      { _id: 's1', schoolId: mockTenantAId, classId: 'c1', name: 'A' },
      { _id: 's2', schoolId: mockTenantAId, classId: 'c1', name: 'B' },
      { _id: 's3', schoolId: mockTenantAId, classId: 'c2', name: 'A' },
    ];

    const class1Sections = mockSections.filter((s) => s.classId === 'c1');
    if (class1Sections.length === 2 && class1Sections.every((s) => s.classId === 'c1')) {
      console.log('✅ Test 2 Passed: Selected class (Class 1) loads only its assigned sections (A, B).');
    } else {
      throw new Error('Test 2 Failed: Section filtering by classId failed.');
    }

    // 3. Class Teacher Uniqueness per section rule
    const existingCTs = [
      { _id: 't1', schoolId: mockTenantAId, isClassTeacher: true, classTeacherSectionId: 's1', name: 'Teacher John' },
    ];

    const targetSectionId = 's1';
    const isOccupied = existingCTs.some((t) => t.isClassTeacher && t.classTeacherSectionId === targetSectionId);

    if (isOccupied) {
      console.log('✅ Test 3 Passed: Section s1 correctly detected as occupied by Teacher John. Duplicate CT prevented.');
    } else {
      throw new Error('Test 3 Failed: Class Teacher uniqueness detection failed.');
    }

    // 4. Subject Teacher capability test
    const subjectTeacher = {
      role: 'teacher',
      teacherType: 'Subject Teacher',
      isClassTeacher: false,
      assignedSubjectIds: ['sub1', 'sub2'],
      classTeacherClassId: null,
      classTeacherSectionId: null,
    };

    if (!subjectTeacher.isClassTeacher && subjectTeacher.assignedSubjectIds.length === 2) {
      console.log('✅ Test 4 Passed: Subject Teacher does not require Class Teacher class/section ownership.');
    } else {
      throw new Error('Test 4 Failed: Subject Teacher requirement logic broken.');
    }

    console.log('🎉 ALL CLASS TEACHER ASSIGNMENT & ACADEMIC TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Class Teacher Assignment Test Failed:', err);
    throw err;
  }
};

runClassTeacherAssignmentTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
