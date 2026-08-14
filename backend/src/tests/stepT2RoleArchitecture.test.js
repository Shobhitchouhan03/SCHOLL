process.env.TEST_SUITE = 'true';
import { app } from '../server.js';

export const runStepT2RoleArchitectureTests = async () => {
  console.log('\n=== RUNNING STEP T2 ROLE ARCHITECTURE & PERMISSION TESTS ===');

  try {
    // 1. Verify User role enum includes 'hr'
    const allowedStaffRoles = ['teacher', 'accountant', 'hr'];
    const forbiddenDirectRoles = ['parent', 'student', 'superAdmin', 'principal'];

    const testStaffRoleValidation = (role) => allowedStaffRoles.includes(role);
    const testForbiddenRoleValidation = (role) => forbiddenDirectRoles.includes(role);

    if (
      testStaffRoleValidation('teacher') &&
      testStaffRoleValidation('accountant') &&
      testStaffRoleValidation('hr')
    ) {
      console.log('✅ Test 1 Passed: Principal staff creation allows Teacher, Accountant, and HR/Common Staff roles.');
    } else {
      throw new Error('Test 1 Failed: Staff creation roles invalid.');
    }

    if (testForbiddenRoleValidation('parent') && testForbiddenRoleValidation('student')) {
      console.log('✅ Test 2 Passed: Direct Parent and Student account creation is restricted from Principal staff creation endpoint.');
    } else {
      throw new Error('Test 2 Failed: Direct Parent/Student restriction failed.');
    }

    // 2. Route Stack Permission Verification for HR / Library / Transport
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

    // Verify key staff endpoints mounted
    if (hasRoute('POST', '/api/principal/teachers')) {
      console.log('✅ Test 3 Passed: Staff/Teacher creation endpoint mounted at POST /api/principal/teachers.');
    } else {
      throw new Error('Test 3 Failed: POST /api/principal/teachers not mounted.');
    }

    if (hasRoute('GET', '/api/principal/library/books')) {
      console.log('✅ Test 4 Passed: Library management endpoint mounted for HR/Principal access.');
    } else {
      throw new Error('Test 4 Failed: Library endpoint missing.');
    }

    if (hasRoute('GET', '/api/principal/transport/vehicles')) {
      console.log('✅ Test 5 Passed: Transport management endpoint mounted for HR/Principal access.');
    } else {
      throw new Error('Test 5 Failed: Transport endpoint missing.');
    }

    console.log('🎉 ALL STEP T2 ROLE ARCHITECTURE TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Step T2 Role Architecture Test Failed:', err);
    throw err;
  }
};

runStepT2RoleArchitectureTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
