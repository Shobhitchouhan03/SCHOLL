import { FeeCalculationService } from './FeeCalculationService.js';

export class PayrollCalculationService {
  /**
   * Calculate single teacher payroll record from Salary Structure and attendance/unpaid leave records
   */
  static calculateTeacherPayroll({
    salaryStructure,
    unpaidLeaveDays = 0,
    workingDaysInMonth = 30,
    overtimeHours = 0,
    bonusRupees = 0,
  }) {
    // 1. Base Salary in Minor Units
    const baseSalaryMinor = salaryStructure.baseSalaryMinor !== undefined
      ? Number(salaryStructure.baseSalaryMinor)
      : FeeCalculationService.toMinorUnits(salaryStructure.baseSalary || 0);

    // 2. Total Allowances in Minor Units
    let allowancesMinor = 0;
    (salaryStructure.allowances || []).forEach((allow) => {
      const amt = allow.amountMinor !== undefined ? Number(allow.amountMinor) : FeeCalculationService.toMinorUnits(allow.amount || 0);
      allowancesMinor = FeeCalculationService.addMoney(allowancesMinor, amt);
    });

    // 3. Total Standard Deductions in Minor Units
    let deductionsMinor = 0;
    (salaryStructure.deductions || []).forEach((ded) => {
      const amt = ded.amountMinor !== undefined ? Number(ded.amountMinor) : FeeCalculationService.toMinorUnits(ded.amount || 0);
      deductionsMinor = FeeCalculationService.addMoney(deductionsMinor, amt);
    });

    // 4. Unpaid Leave Deduction (Prorated daily base salary)
    let leaveDeductionMinor = 0;
    if (unpaidLeaveDays > 0 && workingDaysInMonth > 0) {
      const dailyBaseMinor = baseSalaryMinor / workingDaysInMonth;
      leaveDeductionMinor = Math.round(dailyBaseMinor * unpaidLeaveDays);
    }

    // 5. Overtime Pay
    let overtimeMinor = 0;
    if (overtimeHours > 0 && (salaryStructure.overtimeRateMinor || salaryStructure.overtimeRate)) {
      const rateMinor = salaryStructure.overtimeRateMinor !== undefined
        ? Number(salaryStructure.overtimeRateMinor)
        : FeeCalculationService.toMinorUnits(salaryStructure.overtimeRate || 0);
      overtimeMinor = Math.round(rateMinor * overtimeHours);
    }

    // 6. Bonus Pay
    const bonusMinor = FeeCalculationService.toMinorUnits(bonusRupees);

    // 7. Gross Salary = Base + Allowances + Overtime + Bonus
    const grossSalaryMinor = FeeCalculationService.addMoney(
      FeeCalculationService.addMoney(baseSalaryMinor, allowancesMinor),
      FeeCalculationService.addMoney(overtimeMinor, bonusMinor)
    );

    // 8. Total Deductions = Standard Deductions + Unpaid Leave Deduction
    const totalDeductionMinor = FeeCalculationService.addMoney(deductionsMinor, leaveDeductionMinor);

    // 9. Net Salary = Gross Salary - Total Deductions (Non-negative bound)
    const netSalaryMinor = FeeCalculationService.subtractMoney(grossSalaryMinor, totalDeductionMinor);

    return {
      baseSalaryMinor,
      allowancesMinor,
      deductionsMinor,
      leaveDeductionMinor,
      overtimeMinor,
      bonusMinor,
      grossSalaryMinor,
      netSalaryMinor,

      // Formatted Major Unit Rupee values for API & Payslip snapshot
      baseSalaryRupees: FeeCalculationService.fromMinorUnits(baseSalaryMinor),
      allowancesRupees: FeeCalculationService.fromMinorUnits(allowancesMinor),
      deductionsRupees: FeeCalculationService.fromMinorUnits(deductionsMinor),
      leaveDeductionRupees: FeeCalculationService.fromMinorUnits(leaveDeductionMinor),
      overtimeRupees: FeeCalculationService.fromMinorUnits(overtimeMinor),
      bonusRupees: FeeCalculationService.fromMinorUnits(bonusMinor),
      grossSalaryRupees: FeeCalculationService.fromMinorUnits(grossSalaryMinor),
      netSalaryRupees: FeeCalculationService.fromMinorUnits(netSalaryMinor),
    };
  }
}
