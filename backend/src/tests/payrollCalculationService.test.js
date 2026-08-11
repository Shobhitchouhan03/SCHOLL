import { PayrollCalculationService } from '../services/PayrollCalculationService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runPayrollCalculationTests() {
  console.log('=== RUNNING PAYROLL CALCULATION SERVICE UNIT TESTS ===');

  const salaryStructure = {
    baseSalaryMinor: 6000000, // ₹60,000.00
    allowances: [
      { name: 'HRA', amountMinor: 500000 }, // ₹5,000.00
      { name: 'Medical', amountMinor: 200000 }, // ₹2,000.00
    ],
    deductions: [
      { name: 'PF', amountMinor: 200000 }, // ₹2,000.00
      { name: 'Tax', amountMinor: 100000 }, // ₹1,000.00
    ],
    overtimeRateMinor: 50000, // ₹500.00 per hour
  };

  // Test 1: Standard Pay Calculation (0 unpaid leaves, 0 overtime, 0 bonus)
  const calc1 = PayrollCalculationService.calculateTeacherPayroll({
    salaryStructure,
    unpaidLeaveDays: 0,
    workingDaysInMonth: 30,
  });

  assert(calc1.baseSalaryRupees === 60000, `Base salary mismatch: expected 60000, got ${calc1.baseSalaryRupees}`);
  assert(calc1.allowancesRupees === 7000, `Allowances mismatch: expected 7000, got ${calc1.allowancesRupees}`);
  assert(calc1.deductionsRupees === 3000, `Deductions mismatch: expected 3000, got ${calc1.deductionsRupees}`);
  assert(calc1.grossSalaryRupees === 67000, `Gross salary mismatch: expected 67000, got ${calc1.grossSalaryRupees}`);
  assert(calc1.netSalaryRupees === 64000, `Net salary mismatch: expected 64000, got ${calc1.netSalaryRupees}`);
  console.log('✅ Test 1 Passed: Standard payroll calculation (Gross: ₹67,000, Net: ₹64,000).');

  // Test 2: Unpaid Leave Deductions (3 unpaid leave days out of 30 working days = ₹6,000 deduction)
  const calc2 = PayrollCalculationService.calculateTeacherPayroll({
    salaryStructure,
    unpaidLeaveDays: 3,
    workingDaysInMonth: 30,
  });

  assert(calc2.leaveDeductionRupees === 6000, `Leave deduction mismatch: expected 6000, got ${calc2.leaveDeductionRupees}`);
  assert(calc2.netSalaryRupees === 58000, `Net salary after unpaid leave mismatch: expected 58000, got ${calc2.netSalaryRupees}`);
  console.log('✅ Test 2 Passed: Unpaid leave deduction (3 days = ₹6,000 deduction, Net: ₹58,000).');

  // Test 3: Overtime & Bonus Addition
  const calc3 = PayrollCalculationService.calculateTeacherPayroll({
    salaryStructure,
    unpaidLeaveDays: 0,
    workingDaysInMonth: 30,
    overtimeHours: 4, // 4 hrs * ₹500 = ₹2,000
    bonusRupees: 5000, // ₹5,000
  });

  assert(calc3.overtimeRupees === 2000, `Overtime mismatch: expected 2000, got ${calc3.overtimeRupees}`);
  assert(calc3.bonusRupees === 5000, `Bonus mismatch: expected 5000, got ${calc3.bonusRupees}`);
  assert(calc3.grossSalaryRupees === 74000, `Gross salary mismatch: expected 74000, got ${calc3.grossSalaryRupees}`);
  assert(calc3.netSalaryRupees === 71000, `Net salary mismatch: expected 71000, got ${calc3.netSalaryRupees}`);
  console.log('✅ Test 3 Passed: Overtime & Bonus addition (Gross: ₹74,000, Net: ₹71,000).');

  console.log('\n🎉 ALL PAYROLL CALCULATION UNIT TESTS PASSED!');
}

runPayrollCalculationTests();
