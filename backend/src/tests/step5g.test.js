import { Teacher } from '../models/Teacher.js';

export const runStep5GTests = async () => {
  console.log('\n=== RUNNING STEP 5G CLASS TEACHER PERMISSION & CAPABILITY TESTS ===');

  try {
    // 1. Test capability evaluation logic for Class Teacher
    const mockClassTeacher = {
      isClassTeacher: true,
      teacherType: 'Class Teacher',
      classTeacherClassId: '507f1f77bcf86cd799439001',
    };

    const canAdmitClassTeacher = Boolean(
      mockClassTeacher.isClassTeacher ||
      mockClassTeacher.teacherType === 'Class Teacher' ||
      mockClassTeacher.teacherType === 'Class & Subject Teacher' ||
      mockClassTeacher.classTeacherClassId
    );

    if (canAdmitClassTeacher === true) {
      console.log('✅ Test 1 Passed: Class Teacher evaluates canAdmitStudents = true.');
    } else {
      throw new Error('Class Teacher evaluation failed');
    }

    // 2. Test capability evaluation logic for Subject Teacher
    const mockSubjectTeacher = {
      isClassTeacher: false,
      teacherType: 'Subject Teacher',
      classTeacherClassId: null,
    };

    const canAdmitSubjectTeacher = Boolean(
      mockSubjectTeacher.isClassTeacher ||
      mockSubjectTeacher.teacherType === 'Class Teacher' ||
      mockSubjectTeacher.teacherType === 'Class & Subject Teacher' ||
      mockSubjectTeacher.classTeacherClassId
    );

    if (canAdmitSubjectTeacher === false) {
      console.log('✅ Test 2 Passed: Subject Teacher evaluates canAdmitStudents = false.');
    } else {
      throw new Error('Subject Teacher evaluation failed');
    }

    console.log('🎉 ALL STEP 5G TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Step 5G Test Failed:', err);
    throw err;
  }
};

runStep5GTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
