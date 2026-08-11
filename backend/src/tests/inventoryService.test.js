import { InventoryService } from '../services/InventoryService.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
}

export function runInventoryUnitTests() {
  console.log('=== RUNNING INVENTORY SERVICE UNIT TESTS ===');

  const purchaseCostMinor = 5000000; // ₹50,000 in minor units
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const currentValue = InventoryService.calculateCurrentDepreciatedValueMinor({
    purchaseCostMinor,
    purchaseDate: oneYearAgo,
    depreciationRate: 10,
  });

  assert(currentValue >= 4490000 && currentValue <= 4510000, `Expected depreciated value to be ~4500000 minor units (₹45,000.00), got ${currentValue}`);
  console.log(`✅ Test 1 Passed: Asset depreciation calculates ${currentValue} minor units (₹${(currentValue / 100).toFixed(2)}).`);

  // Test 2: Low stock trigger check
  const isLow1 = InventoryService.isLowStock({ currentStock: 5, reorderLevel: 10 });
  assert(isLow1 === true, 'Current stock 5 with reorder level 10 must trigger low stock alert.');

  const isLow2 = InventoryService.isLowStock({ currentStock: 25, reorderLevel: 10 });
  assert(isLow2 === false, 'Current stock 25 with reorder level 10 must not trigger low stock alert.');
  console.log('✅ Test 2 Passed: Low stock trigger evaluates correctly.');

  console.log('\n🎉 ALL INVENTORY SERVICE UNIT TESTS PASSED!');
}

runInventoryUnitTests();
