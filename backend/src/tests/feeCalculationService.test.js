import { FeeCalculationService } from '../services/FeeCalculationService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runFeeCalculationTests() {
  console.log('=== RUNNING FEE CALCULATION SERVICE UNIT TESTS ===');

  // Test 1: Minor Unit Conversion & Exact Precision
  const testAmounts = [0.01, 10.10, 100.33, 999.99, 12345.67];
  testAmounts.forEach((amt) => {
    const paise = FeeCalculationService.toMinorUnits(amt);
    const rupees = FeeCalculationService.fromMinorUnits(paise);
    assert(rupees === amt, `Conversion mismatch for ₹${amt}: got ₹${rupees} (paise: ${paise})`);
  });
  console.log('✅ Test 1 Passed: Minor unit conversions for test amounts [0.01, 10.10, 100.33, 999.99, 12345.67].');

  // Test 2: Integer Money Addition
  const a = FeeCalculationService.toMinorUnits(100.33); // 10033
  const b = FeeCalculationService.toMinorUnits(999.99); // 99999
  const sumPaise = FeeCalculationService.addMoney(a, b);
  assert(sumPaise === 110032, `Addition error: expected 110032, got ${sumPaise}`);
  assert(FeeCalculationService.fromMinorUnits(sumPaise) === 1100.32, 'Addition rupee formatting mismatch');
  console.log('✅ Test 2 Passed: Integer money addition (₹100.33 + ₹999.99 = ₹1100.32).');

  // Test 3: Non-Negative Subtraction
  const sub1 = FeeCalculationService.subtractMoney(50000, 20000);
  assert(sub1 === 30000, 'Subtraction error');
  const sub2 = FeeCalculationService.subtractMoney(20000, 50000);
  assert(sub2 === 0, 'Non-negative constraint failed');
  console.log('✅ Test 3 Passed: Non-negative subtraction constraint.');

  // Test 4: Percentage Concession Deterministic Rounding
  const basePaise = FeeCalculationService.toMinorUnits(12345.67); // 1234567 paise
  const percentageConcession = FeeCalculationService.calculatePercentageAmount(basePaise, 15); // 15%
  assert(percentageConcession === 185185, `Percentage error: expected 185185 paise, got ${percentageConcession}`);
  assert(FeeCalculationService.fromMinorUnits(percentageConcession) === 1851.85, 'Rupee conversion for percentage failed');
  console.log('✅ Test 4 Passed: Deterministic HALF_UP percentage concession (15% of ₹12345.67 = ₹1851.85).');

  // Test 5: Invoice Totals & Status Transitions
  const items = [{ amount: 500 }, { amount: 50 }]; // ₹500 + ₹50 = ₹550
  const totals = FeeCalculationService.calculateInvoiceTotals({
    items,
    concessionAmount: 50,
    lateFeeAmount: 10,
    paidAmount: 200,
  });

  assert(totals.subtotal === 550, 'Subtotal mismatch');
  assert(totals.totalAmount === 510, 'Total amount mismatch (550 - 50 + 10 = 510)');
  assert(totals.balanceAmount === 310, 'Balance mismatch (510 - 200 = 310)');
  assert(totals.status === 'partial', 'Status mismatch for partial payment');
  console.log('✅ Test 5 Passed: Invoice totals & partial payment status.');

  // Test 6: Full Payment & Status
  const fullPaymentTotals = FeeCalculationService.calculateInvoiceTotals({
    items,
    concessionAmount: 50,
    lateFeeAmount: 10,
    paidAmount: 510,
  });
  assert(fullPaymentTotals.balanceAmount === 0, 'Balance must be 0 for full payment');
  assert(fullPaymentTotals.status === 'paid', 'Status must be paid');
  console.log('✅ Test 6 Passed: Full payment status transition to paid.');

  console.log('\n🎉 ALL FEE CALCULATION UNIT TESTS PASSED!');
}

runFeeCalculationTests();
