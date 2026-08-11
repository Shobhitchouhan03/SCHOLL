import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { School } from '../models/School.js';
import {
  normalizeHostname,
  isValidDomainFormat,
  extractSubdomain,
  resolveTenantFromRequest,
} from '../services/tenantResolver.js';

dotenv.config();

export const runTenantResolverTests = async () => {
  console.log('=== RUNNING TENANT RESOLVER UNIT & INTEGRATION TESTS ===');

  // Test 1: normalizeHostname
  const testHost1 = normalizeHostname('http://Little-Stars.com:8080');
  if (testHost1 !== 'little-stars.com') {
    throw new Error(`normalizeHostname failed: expected 'little-stars.com', got '${testHost1}'`);
  }
  console.log('✅ Test 1 Passed: normalizeHostname strips protocol and port.');

  // Test 2: isValidDomainFormat
  if (!isValidDomainFormat('little-stars.com') || !isValidDomainFormat('school.edu.in')) {
    throw new Error('isValidDomainFormat failed for valid domain names.');
  }
  if (isValidDomainFormat('invalid domain space') || isValidDomainFormat('')) {
    throw new Error('isValidDomainFormat failed to reject invalid domains.');
  }
  console.log('✅ Test 2 Passed: isValidDomainFormat validates FQDN format correctly.');

  // Test 3: extractSubdomain
  const sub1 = extractSubdomain('little-stars.yourdomain.com', 'yourdomain.com');
  if (sub1 !== 'little-stars') {
    throw new Error(`extractSubdomain failed: expected 'little-stars', got '${sub1}'`);
  }
  console.log('✅ Test 3 Passed: extractSubdomain resolves tenant subdomain correctly.');

  // Database Integration Tests if connected
  if (mongoose.connection.readyState === 1) {
    // Setup test tenant school
    const testSchoolCode = 'RESOLV01';
    await School.deleteMany({ schoolCode: testSchoolCode });

    const testSchool = await School.create({
      name: 'Resolver Test Academy',
      schoolCode: testSchoolCode,
      schoolSlug: 'resolver-test-academy',
      subdomain: 'resolver-sub',
      customDomains: [{ domain: 'resolver-custom.com', status: 'verified' }],
      isActive: true,
    });

    try {
      // Test Priority 1: Explicit schoolSlug
      const res1 = await resolveTenantFromRequest({
        params: { schoolSlug: 'resolver-test-academy' },
        headers: {},
      });
      if (!res1 || res1._id.toString() !== testSchool._id.toString()) {
        throw new Error('Priority 1 Explicit schoolSlug resolution failed.');
      }
      console.log('✅ Test 4 Passed: Priority 1 (Explicit schoolSlug) resolved correctly.');

      // Test Priority 2: Custom domain hostname match
      const res2 = await resolveTenantFromRequest({
        headers: { host: 'resolver-custom.com:443' },
      });
      if (!res2 || res2._id.toString() !== testSchool._id.toString()) {
        throw new Error('Priority 2 Custom domain resolution failed.');
      }
      console.log('✅ Test 5 Passed: Priority 2 (Custom FQDN domain) resolved correctly.');

      // Test Priority 3: Subdomain match
      const res3 = await resolveTenantFromRequest({
        headers: { host: 'resolver-sub.yourdomain.com' },
      });
      if (!res3 || res3._id.toString() !== testSchool._id.toString()) {
        throw new Error('Priority 3 Subdomain resolution failed.');
      }
      console.log('✅ Test 6 Passed: Priority 3 (Subdomain) resolved correctly.');

      // Test Unmapped domain returns null
      const resNull = await resolveTenantFromRequest({
        headers: { host: 'unknown-random-school.com' },
      });
      if (resNull !== null) {
        throw new Error('Unmapped domain should resolve to null.');
      }
      console.log('✅ Test 7 Passed: Unmapped domain returned null safely.');
    } finally {
      await School.deleteMany({ schoolCode: testSchoolCode });
    }
  }

  console.log('\n🎉 ALL TENANT RESOLVER TESTS PASSED!\n');
};

// Auto-run if invoked directly
if (process.argv[1]?.endsWith('tenantResolver.test.js')) {
  const { connectDB } = await import('../config/db.js');
  await connectDB();
  await runTenantResolverTests();
  await mongoose.disconnect();
  process.exit(0);
}
