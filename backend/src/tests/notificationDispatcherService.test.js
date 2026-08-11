import { NotificationDispatcherService } from '../services/NotificationDispatcherService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runNotificationDispatcherTests() {
  console.log('=== RUNNING NOTIFICATION DISPATCHER SERVICE UNIT TESTS ===');

  assert(typeof NotificationDispatcherService.resolveTargetUsers === 'function', 'resolveTargetUsers method missing');
  assert(typeof NotificationDispatcherService.dispatchAnnouncement === 'function', 'dispatchAnnouncement method missing');

  console.log('✅ Test 1 Passed: NotificationDispatcherService methods exported correctly.');
  console.log('\n🎉 ALL NOTIFICATION DISPATCHER UNIT TESTS PASSED!');
}

runNotificationDispatcherTests();
