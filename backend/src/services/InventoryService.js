export class InventoryService {
  /**
   * Calculate straight-line annual depreciation for fixed asset
   */
  static calculateCurrentDepreciatedValueMinor({ purchaseCostMinor, purchaseDate, depreciationRate }) {
    if (!purchaseCostMinor || purchaseCostMinor <= 0) return 0;
    if (!depreciationRate || depreciationRate <= 0) return purchaseCostMinor;

    const purchase = new Date(purchaseDate);
    const now = new Date();
    const yearsElapsed = (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsElapsed <= 0) return purchaseCostMinor;

    const totalDepreciationPercentage = Math.min(100, yearsElapsed * depreciationRate);
    const depreciatedValue = Math.max(0, purchaseCostMinor * (1 - totalDepreciationPercentage / 100));

    return Math.round(depreciatedValue);
  }

  /**
   * Check whether consumable stock is at or below reorder level
   */
  static isLowStock({ currentStock, reorderLevel }) {
    return currentStock <= reorderLevel;
  }
}
