/**
 * FeeCalculationService
 *
 * Financial Ledger Engine using Minor Currency Units (Paise for INR, Cent for USD).
 * 
 * Rounding Rule:
 * All percentage calculations (concessions, late fees, tax) use HALF_UP rounding
 * to the nearest minor unit integer: Math.round(minorUnits * percentage / 100).
 * No ledger arithmetic is performed using floating-point major units.
 */
export class FeeCalculationService {
  /**
   * Convert Major Currency Units (Rupees) to Minor Currency Units (Paise)
   * Example: 500.75 -> 55075, 500 -> 50000
   */
  static toMinorUnits(rupees) {
    if (rupees === null || rupees === undefined) return 0;
    return Math.round(Number(rupees) * 100);
  }

  /**
   * Convert Minor Currency Units (Paise) to Major Currency Units (Rupees)
   * Example: 55075 -> 550.75, 50000 -> 500
   */
  static fromMinorUnits(paise) {
    if (paise === null || paise === undefined) return 0;
    return Math.round(Number(paise)) / 100;
  }

  /**
   * Add two minor unit monetary amounts safely in integer space
   */
  static addMoney(aPaise, bPaise) {
    return Math.round(Number(aPaise || 0)) + Math.round(Number(bPaise || 0));
  }

  /**
   * Subtract minor unit monetary amounts safely with optional non-negative bounds
   */
  static subtractMoney(aPaise, bPaise, allowNegative = false) {
    const diff = Math.round(Number(aPaise || 0)) - Math.round(Number(bPaise || 0));
    return allowNegative ? diff : Math.max(0, diff);
  }

  /**
   * Calculate percentage concession/late fee with deterministic HALF_UP rounding to minor unit integer
   * Example: 10% of 50000 paise (₹500.00) -> 5000 paise (₹50.00)
   */
  static calculatePercentageAmount(basePaise, percentage) {
    const p = Number(percentage || 0);
    if (p <= 0) return 0;
    return Math.round((Math.round(Number(basePaise || 0)) * p) / 100);
  }

  /**
   * Calculate Invoice Summary totals in Minor Units (Paise) and Major Units (Rupees)
   */
  static calculateInvoiceTotals({ items = [], concessionAmount = 0, adjustmentAmount = 0, lateFeeAmount = 0, paidAmount = 0 }) {
    let subtotalPaise = 0;
    (items || []).forEach((item) => {
      const itemAmt = this.toMinorUnits(item.amount || item.originalAmount || 0);
      subtotalPaise = this.addMoney(subtotalPaise, itemAmt);
    });

    const concessionPaise = this.toMinorUnits(concessionAmount);
    const adjustmentPaise = this.toMinorUnits(adjustmentAmount);
    const lateFeePaise = this.toMinorUnits(lateFeeAmount);

    const netBeforeAdj = this.subtractMoney(subtotalPaise, concessionPaise);
    const netPlusLate = this.addMoney(netBeforeAdj, lateFeePaise);
    const totalPaise = this.addMoney(netPlusLate, adjustmentPaise);

    const paidPaise = this.toMinorUnits(paidAmount);
    const balancePaise = this.subtractMoney(totalPaise, paidPaise);

    let status = 'issued';
    if (paidPaise >= totalPaise && totalPaise > 0) {
      status = 'paid';
    } else if (paidPaise > 0) {
      status = 'partial';
    }

    return {
      subtotalPaise,
      concessionPaise,
      adjustmentPaise,
      lateFeePaise,
      totalPaise,
      paidPaise,
      balancePaise,

      // Format to major units for API & UI compatibility
      subtotal: this.fromMinorUnits(subtotalPaise),
      concessionAmount: this.fromMinorUnits(concessionPaise),
      adjustmentAmount: this.fromMinorUnits(adjustmentPaise),
      lateFeeAmount: this.fromMinorUnits(lateFeePaise),
      totalAmount: this.fromMinorUnits(totalPaise),
      paidAmount: this.fromMinorUnits(paidPaise),
      balanceAmount: this.fromMinorUnits(balancePaise),
      status,
    };
  }

  /**
   * Recalculate invoice status when payments change or are reversed
   */
  static updateInvoiceBalanceAndStatus(invoice, newPaidRupees) {
    const totalPaise = this.toMinorUnits(invoice.totalAmount);
    const paidPaise = this.toMinorUnits(newPaidRupees);
    const balancePaise = this.subtractMoney(totalPaise, paidPaise);

    let status = 'issued';
    if (paidPaise >= totalPaise && totalPaise > 0) {
      status = 'paid';
    } else if (paidPaise > 0) {
      status = 'partial';
    } else if (invoice.dueDate && new Date() > new Date(invoice.dueDate)) {
      status = 'overdue';
    }

    invoice.paidAmount = this.fromMinorUnits(paidPaise);
    invoice.balanceAmount = this.fromMinorUnits(balancePaise);
    invoice.status = status;

    return invoice;
  }
}
