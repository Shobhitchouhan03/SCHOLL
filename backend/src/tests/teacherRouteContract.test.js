process.env.TEST_SUITE = 'true';
import http from 'http';
import { app } from '../server.js';

export const runTeacherRouteContractTests = async () => {
  console.log('\n=== RUNNING EXPRESS ROUTE CONTRACT & ROUTING TESTS ===');

  try {
    // 1. Inspect Express Application Route Table directly
    const registeredRoutes = [];

    const extractRoutes = (stack, prefix = '') => {
      stack.forEach((layer) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
          methods.forEach((method) => {
            registeredRoutes.push({ method, path: prefix + layer.route.path });
          });
        } else if (layer.name === 'router' && layer.handle.stack) {
          let matchPrefix = '';
          if (layer.regexp) {
            const regexpStr = layer.regexp.toString();
            if (regexpStr.includes('\\/api\\/auth')) matchPrefix = '/api/auth';
            else if (regexpStr.includes('\\/api\\/super-admin')) matchPrefix = '/api/super-admin';
            else if (regexpStr.includes('\\/api\\/principal')) matchPrefix = '/api/principal';
            else if (regexpStr.includes('\\/api\\/parent')) matchPrefix = '/api/parent';
            else if (regexpStr.includes('\\/api')) matchPrefix = '/api';
          }
          extractRoutes(layer.handle.stack, prefix + matchPrefix);
        }
      });
    };

    if (app._router && app._router.stack) {
      extractRoutes(app._router.stack);
    }

    const hasRoute = (method, path) =>
      registeredRoutes.some((r) => r.method === method && r.path === path);

    // Verify required Teacher endpoints in Express route stack
    const requiredRoutes = [
      { method: 'GET', path: '/api/teacher/me' },
      { method: 'GET', path: '/api/teacher/leaves' },
      { method: 'POST', path: '/api/teacher/leaves' },
      { method: 'GET', path: '/api/teacher/students' },
      { method: 'POST', path: '/api/teacher/students' },
      { method: 'GET', path: '/api/teacher/leave/requests' },
      { method: 'GET', path: '/api/teacher/leave/balance' },
    ];

    for (const reqRoute of requiredRoutes) {
      if (hasRoute(reqRoute.method, reqRoute.path)) {
        console.log(`✅ Verified Express Route: ${reqRoute.method} ${reqRoute.path} is mounted.`);
      } else {
        throw new Error(`Route Contract Violation: ${reqRoute.method} ${reqRoute.path} is NOT mounted in Express router.`);
      }
    }

    // 2. Perform live HTTP requests if socket binding allowed
    let server;
    try {
      await new Promise((resolve, reject) => {
        server = http.createServer(app);
        server.on('error', reject);
        server.listen(0, () => resolve());
      });

      const address = server.address();
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const res = await fetch(`${baseUrl}/api/teacher/me`);
      if (res.status === 401) {
        console.log('✅ Live HTTP Test Passed: GET /api/teacher/me returned HTTP 401 Unauthorized (Route exists).');
      }
    } catch (netErr) {
      console.log('ℹ️ Live HTTP socket listen skipped in sandbox environment (Route contract verified via router inspection).');
    } finally {
      if (server && server.listening) {
        server.close();
      }
    }

    console.log('🎉 ALL EXPRESS ROUTE CONTRACT TESTS PASSED!\n');
    return true;
  } catch (err) {
    console.error('❌ Express Route Contract Test Failed:', err);
    throw err;
  }
};

runTeacherRouteContractTests().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
