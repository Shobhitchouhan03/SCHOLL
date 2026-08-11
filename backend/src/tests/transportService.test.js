import { GpsService } from '../services/GpsService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export async function runTransportUnitTests() {
  console.log('=== RUNNING TRANSPORT SERVICE UNIT TESTS ===');

  const loc = await GpsService.getVehicleLocation('dummy_v_id');
  assert(loc.integrationConfigured === false, 'GPS integrationConfigured must be false by default');
  assert(loc.location === null, 'GPS location must be null without provider');

  const eta = await GpsService.getEstimatedArrival('dummy_stop_id');
  assert(eta.integrationConfigured === false, 'ETA integrationConfigured must be false');

  console.log('✅ Test 1 Passed: GPS Provider Abstraction returns integrationConfigured: false without fake data.');
  console.log('\n🎉 ALL TRANSPORT UNIT TESTS PASSED!');
}

runTransportUnitTests().catch(console.error);
