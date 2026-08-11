# Security Policy & Multi-Tenant Data Isolation

## Multi-Tenant Data Isolation Architecture
The platform enforces strict shared-database multi-tenant isolation via the following safeguards:

1. **Session-Derived Tenant Scoping**:
   - `schoolId` is derived exclusively from the authenticated user's HTTP-Only JWT session token (`req.user.schoolId` / `req.tenantSchoolId`).
   - Frontend-supplied `schoolId` body/query/header parameters are strictly ignored.

2. **Compound Index Protection**:
   - Every school-owned Mongoose model includes `{ schoolId: 1 }` as the primary prefix in all compound indexes.

3. **HTTP-Only Cookie Authentication**:
   - JWT access and refresh tokens are stored in HttpOnly, SameSite, and Secure (in production) cookies to mitigate XSS attacks.

4. **Input Sanitization & Injection Defense**:
   - Express backend incorporates Helmet security headers, rate limiting, and NoSQL query sanitization.
