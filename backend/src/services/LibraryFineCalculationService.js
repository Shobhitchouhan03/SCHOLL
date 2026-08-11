import { FeeCalculationService } from './FeeCalculationService.js';

export class LibraryFineCalculationService {
  /**
   * Calculate overdue days between due date and return date (or current date)
   */
  static calculateOverdueDays(dueDate, returnDate = new Date()) {
    const due = new Date(dueDate);
    const ret = new Date(returnDate);

    // Reset hours to compare calendar days cleanly
    due.setHours(0, 0, 0, 0);
    ret.setHours(0, 0, 0, 0);

    if (ret <= due) return 0;

    const diffTime = ret.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate overdue fine amount in minor units
   */
  static calculateOverdueFineMinor({ dueDate, returnDate = new Date(), dailyRateMinor = 1000 }) {
    const overdueDays = this.calculateOverdueDays(dueDate, returnDate);
    if (overdueDays <= 0) return 0;
    return overdueDays * dailyRateMinor;
  }

  /**
   * Calculate lost book penalty in minor units based on configuration
   */
  static calculateLostBookPenaltyMinor({ bookCopyPriceMinor = 0, lostBookChargeMode = 'bookPrice', fixedChargeMinor = 50000 }) {
    if (lostBookChargeMode === 'fixed') {
      return fixedChargeMinor;
    }
    if (lostBookChargeMode === 'bookPrice') {
      return bookCopyPriceMinor > 0 ? bookCopyPriceMinor : fixedChargeMinor;
    }
    return Math.max(bookCopyPriceMinor, fixedChargeMinor);
  }
}
