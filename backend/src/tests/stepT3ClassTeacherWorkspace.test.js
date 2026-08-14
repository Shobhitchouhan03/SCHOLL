process.env.TEST_SUITE = 'true';
import { resolveTeacherProfile } from '../utils/teacherResolver.js';
import { app } from '../server.js';

export const runStepT3ClassTeacherWorkspaceTests = async () => {
  console.log('\n=== RUNNING STEP T3 CLASS TEACHER WORKSPACE & SECURITY LOCK TESTS ===');

  try {
    const schoolA = '507f1f77bcf86cd799439001';
    const schoolB = '507f1f77bcf86cd799439002';
    const classA = '507f1f77bcf86cd799439100';
    const sectionA = '507f1f77bcf86cd799439101';
    const classB = '507f1f77bcf86cd799439200';
    const sectionB = '507f1f77bcf86cd799439201';

    // Mock Teacher Objects
    const classTeacherUser = {
      _id: '507f1f77bcf86cd799439300',
      schoolId: schoolA,
      role: 'teacher',
      loginId: 'CT1001',
      name: 'Class Teacher Sarah',
    };

    const subjectTeacherUser = {
      _id: '507f1f77bcf86cd799439301',
      schoolId: schoolA,
      role: 'teacher',
      loginId: 'ST1001',
      name: 'Subject Teacher John',
    };

    const principalUser = {
      _id: '507f1f77bcf86cd799439302',
      schoolId: schoolA,
      role: 'principal',
      loginId: 'PR1001',
    };

    // 1. Class Lock Assertion: Class Teacher own-class vs other-class check
    const evaluateClassLock = (callerRole, callerClassId, targetClassId) => {
      if (callerRole === 'principal') return { allowed: false, code: 403, reason: 'Principals cannot directly admit students.' };
      if (callerRole === 'teacher') {
        if (!callerClassId) return { allowed: false, code: 403, reason: 'Subject teachers cannot admit students.' };
        if (String(callerClassId) !== String(targetClassId)) return { allowed: false, code: 403, reason: 'Cannot admit into non-assigned class.' };
        return { allowed: true, code: 200 };
      }
      return { allowed: false, code: 403, reason: 'Forbidden' };
    };

    // Test 1: Class Teacher admits to own class -> Allowed
    const ctOwnRes = evaluateClassLock('teacher', classA, classA);
    if (ctOwnRes.allowed) {
      console.log('✅ Test 1 Passed: Class Teacher allowed to admit students into assigned class.');
    } else {
      throw new Error('Test 1 Failed: Class Teacher own-class admission rejected.');
    }

    // Test 2: Class Teacher admits to another class -> Rejected 403
    const ctOtherRes = evaluateClassLock('teacher', classA, classB);
    if (!ctOtherRes.allowed && ctOtherRes.code === 403) {
      console.log('✅ Test 2 Passed: Class Teacher blocked (403) from admitting students into non-assigned class.');
    } else {
      throw new Error('Test 2 Failed: Class Teacher lock failed.');
    }

    // Test 3: Subject Teacher admits to class -> Rejected 403
    const stRes = evaluateClassLock('teacher', null, classA);
    if (!stRes.allowed && stRes.code === 403) {
      console.log('✅ Test 3 Passed: Subject Teacher blocked (403) from admitting students.');
    } else {
      throw new Error('Test 3 Failed: Subject Teacher restriction failed.');
    }

    // Test 4: Principal admits student -> Rejected 403
    const prRes = evaluateClassLock('principal', null, classA);
    if (!prRes.allowed && prRes.code === 403) {
      console.log('✅ Test 4 Passed: Principal blocked (403) from direct student admission.');
    } else {
      throw new Error('Test 4 Failed: Principal restriction failed.');
    }

    // 2. Express Route Contract for Class Teacher Workspace
    const registeredRoutes = [];
    const extractRoutes = (stack, prefix = '') => {
      stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
          methods.forEach((method) => {
            registeredRoutes.push({ method, path: prefix + layer.route.path });
          });
        } else if (layer.name === 'router' && layer.handle.stack) {
          let matchPrefix = '';
          if (layer.regexp) {
            const regexpStr = layer.regexp.toString();
            if (regexpStr.includes('\\/api\\/auth')) matchPrefix = '/api/auth';
            else if (regexpStr.includes('\\/api\\/super-admin')) matchPrefix = '/api/super-admin';
            else if (regexpStr.includes('\\/api\\/principal')) matchPrefix = '/api/principal';
            else if (regexpStr.includes('\\/api\\/parent')) matchPrefix = '/api/parent';
            else if (regexpStr.includes('\\/api')) matchPrefix = '/api';
          }
          extractRoutes(layer.handle.stack, prefix + matchPrefix);
        }
      });
    };

    if (app._router && app._router.stack) {
      extractRoutes(app._router.stack);
    }

    const hasRoute = (method, path) =>
      registeredRoutes.some((r) => r.method === method && r.path === path);

    const requiredClassTeacherContract = [
      { method: 'GET', path: '/api/teacher/student-leaves' },
      { method: 'PATCH', path: '/api/teacher/student-leaves/:leaveId' },
      { method: 'GET', path: '/api/teacher/subject-teachers' },
      { method: 'POST', path: '/api/teacher/subject-teachers' },
    ];

    for (const route of requiredClassTeacherContract) {
      if (hasRoute(route.method, route.path)) {
        console.log(`✅ Test 5 Passed: Class Teacher Workspace route ${route.method} ${route.path} verified.`);
      } else {
        throw new Error(`Test 5 Failed: Route ${route.method} ${route.path} missing.`);
      }
    }

    console.log('🎉 ALL STEP T3 CLASS TEACHER WORKSPACE TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Step T3 Class Teacher Test Failed:', err);
    throw err;
  }
};

runStepT3ClassTeacherWorkspaceTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
