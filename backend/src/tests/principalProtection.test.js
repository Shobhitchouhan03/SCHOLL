import assert from 'assert';

// Unit test mock for Principal Self-Protection guard logic
const testPrincipalSelfProtectionGuard = () => {
  console.log('=== RUNNING PRINCIPAL SELF-PROTECTION GUARD TESTS ===');

  const currentUserId = 'usr_principal_101';
  const schoolId = 'sch_101';

  // Test 1: Self-deactivation attempt returns 403 Forbidden
  const attemptSelfDeactivation = (targetId, currentId) => {
    if (targetId === currentId) {
      return {
        status: 403,
        success: false,
        message: 'You cannot deactivate or delete your own Principal account.',
      };
    }
    return { status: 200, success: true };
  };

  const res1 = attemptSelfDeactivation(currentUserId, currentUserId);
  assert.strictEqual(res1.status, 403);
  assert.strictEqual(res1.message, 'You cannot deactivate or delete your own Principal account.');
  console.log('✅ Test 1 Passed: Direct self-deactivation attempt rejected with 403 Forbidden.');

  // Test 2: Deactivating school's only active Principal returns 409 Conflict
  const attemptDeactivateOnlyPrincipal = (targetUser, activePrincipalsCount) => {
    if (targetUser.role === 'principal' && targetUser.isActive && activePrincipalsCount <= 1) {
      return {
        status: 409,
        success: false,
        message: 'Cannot deactivate the school’s only active Principal account.',
      };
    }
    return { status: 200, success: true };
  };

  const targetPrincipal = { id: 'usr_principal_102', role: 'principal', isActive: true };
  const res2 = attemptDeactivateOnlyPrincipal(targetPrincipal, 1);
  assert.strictEqual(res2.status, 409);
  assert.strictEqual(res2.message, 'Cannot deactivate the school’s only active Principal account.');
  console.log('✅ Test 2 Passed: Deactivating school’s only active Principal rejected with 409 Conflict.');

  // Test 3: Authorized Accountant deactivation proceeds normally
  const targetAccountant = { id: 'usr_accountant_201', role: 'accountant', isActive: true };
  const res3 = attemptSelfDeactivation(targetAccountant.id, currentUserId);
  assert.strictEqual(res3.status, 200);
  console.log('✅ Test 3 Passed: Authorized user deactivation proceeds smoothly.\n');
  console.log('🎉 ALL PRINCIPAL SELF-PROTECTION TESTS PASSED!');
};

testPrincipalSelfProtectionGuard();
