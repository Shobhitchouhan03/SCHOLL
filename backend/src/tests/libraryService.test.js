import { LibraryFineCalculationService } from '../services/LibraryFineCalculationService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runLibraryUnitTests() {
  console.log('=== RUNNING LIBRARY SERVICE UNIT TESTS ===');

  // Test 1: On-time return zero fine
  const dueDate = new Date('2026-08-10');
  const returnDateOnTime = new Date('2026-08-10');
  const fineOnTime = LibraryFineCalculationService.calculateOverdueFineMinor({
    dueDate,
    returnDate: returnDateOnTime,
    dailyRateMinor: 1000, // ₹10 / day
  });
  assert(fineOnTime === 0, 'On-time return must result in ₹0 fine.');
  console.log('✅ Test 1 Passed: On-time return results in ₹0 overdue fine.');

  // Test 2: Overdue return fine calculation (5 days overdue @ ₹10/day = ₹50 = 5000 minor units)
  const returnDateLate = new Date('2026-08-15');
  const fineLate = LibraryFineCalculationService.calculateOverdueFineMinor({
    dueDate,
    returnDate: returnDateLate,
    dailyRateMinor: 1000,
  });
  assert(fineLate === 5000, '5 days overdue @ ₹10/day must equal 5000 minor units (₹50.00).');
  console.log('✅ Test 2 Passed: 5 days overdue calculates 5000 minor units (₹50.00).');

  // Test 3: Lost book penalty calculation
  const lostPenalty = LibraryFineCalculationService.calculateLostBookPenaltyMinor({
    bookCopyPriceMinor: 25000, // ₹250
    lostBookChargeMode: 'bookPrice',
    fixedChargeMinor: 50000,
  });
  assert(lostPenalty === 25000, 'Lost book penalty using bookPrice mode must equal book copy purchase price (25000 minor units).');
  console.log('✅ Test 3 Passed: Lost book penalty uses book copy price accurately.');

  console.log('\n🎉 ALL LIBRARY SERVICE UNIT TESTS PASSED!');
}

runLibraryUnitTests();
