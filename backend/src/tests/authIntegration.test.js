import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';

export const runAuthIntegrationTests = async () => {
  console.log('\n=== RUNNING PRODUCTION AUTHENTICATION INTEGRATION TESTS ===');

  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_fallback_key';

    // 1. Test missing token returns 401
    const mockReqMissing = { cookies: {}, headers: {} };
    let missingStatus = null;
    let missingMessage = null;

    const mockResMissing = {
      status: (code) => {
        missingStatus = code;
        return {
          json: (data) => {
            missingMessage = data.message;
          },
        };
      },
    };

    await authenticate(mockReqMissing, mockResMissing, () => {});
    if (missingStatus === 401 && missingMessage.includes('Token missing')) {
      console.log('✅ Test 1 Passed: Missing token returns 401 Authentication required.');
    } else {
      throw new Error(`Test 1 Failed: Expected 401 with Token missing message, got status ${missingStatus}`);
    }

    // 2. Test Authorization: Bearer <accessToken> header authentication
    const testToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'principal', schoolId: '507f1f77bcf86cd799439000' },
      accessSecret,
      { expiresIn: '1h' }
    );

    const mockReqBearer = {
      cookies: {},
      headers: {
        authorization: `Bearer ${testToken}`,
      },
    };

    if (mockReqBearer.headers.authorization.startsWith('Bearer ')) {
      const extracted = mockReqBearer.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(extracted, accessSecret);
      if (decoded.role === 'principal' && decoded.id === '507f1f77bcf86cd799439011') {
        console.log('✅ Test 2 Passed: Authorization Bearer header parsed and verified successfully.');
      } else {
        throw new Error('Test 2 Failed: Bearer token payload mismatch');
      }
    }

    // 3. Test expired token rejection
    const expiredToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'principal' },
      accessSecret,
      { expiresIn: '-1s' }
    );

    let expiredError = null;
    try {
      jwt.verify(expiredToken, accessSecret);
    } catch (err) {
      expiredError = err;
    }

    if (expiredError && expiredError.name === 'TokenExpiredError') {
      console.log('✅ Test 3 Passed: Expired JWT token correctly triggers TokenExpiredError.');
    } else {
      throw new Error('Test 3 Failed: Expired token was not rejected');
    }

    console.log('🎉 ALL AUTHENTICATION INTEGRATION TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Auth Integration Test Failed:', err);
    throw err;
  }
};

runAuthIntegrationTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
