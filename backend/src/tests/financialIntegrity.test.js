import { FeeCalculationService } from '../services/FeeCalculationService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runFinancialIntegrityTests() {
  console.log('=== RUNNING FINANCIAL INTEGRITY TESTS ===');

  const testCases = [
    { input: 0.01, expectedMinor: 1 },
    { input: 10.10, expectedMinor: 1010 },
    { input: 100.33, expectedMinor: 10033 },
    { input: 999.99, expectedMinor: 99999 },
    { input: 12345.67, expectedMinor: 1234567 },
  ];

  testCases.forEach(({ input, expectedMinor }) => {
    const minor = FeeCalculationService.toMinorUnits(input);
    const major = FeeCalculationService.fromMinorUnits(minor);

    assert(minor === expectedMinor, `Expected ₹${input} -> ${expectedMinor} minor units, got ${minor}`);
    assert(Math.abs(major - input) < 0.001, `Expected ${minor} minor units -> ₹${input}, got ${major}`);

    console.log(`✅ Passed: ₹${input} <-> ${minor} minor units`);
  });

  console.log('\n🎉 ALL FINANCIAL INTEGRITY TESTS PASSED!');
}

runFinancialIntegrityTests();
