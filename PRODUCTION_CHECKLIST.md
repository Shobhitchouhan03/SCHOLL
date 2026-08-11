# Production Deployment Checklist

This document details mandatory pre-deployment verification steps for launching the Multi-Tenant School Management SaaS in a production environment.

## 1. Environment & Secrets Setup
- [ ] Configure `NODE_ENV=production` in backend application environment.
- [ ] Generate secure 64-character random strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] Set `MONGODB_URI` connection string for production MongoDB Atlas cluster.
- [ ] Configure `FRONTEND_URL` and `COOKIE_DOMAIN` for cross-origin authentication.
- [ ] Ensure `.env` and `DEV_CREDENTIALS.local.md` are ignored in `.gitignore`.

## 2. Database Infrastructure (MongoDB Atlas)
- [ ] Verify IP Access List includes production backend deployment IP addresses.
- [ ] Ensure database user has minimum required read/write permissions.
- [ ] Verify compound indexes for `schoolId` multi-tenancy are built.
- [ ] Enable automated daily Atlas backups with 30-day retention.

## 3. Backend Deployment (Render / Railway / AWS / GCP)
- [ ] Set Node.js engine version $\ge 18.0.0$.
- [ ] Build & start command: `npm run start --prefix backend`.
- [ ] Verify health probes:
  - `GET /health` (Status 200 OK)
  - `GET /health/database` (Status 200 OK)
  - `GET /health/readiness` (Status 200 OK)
  - `GET /health/liveness` (Status 200 OK)
- [ ] Verify rate limiting and Helmet headers are active.

## 4. Frontend Deployment (Vercel / Netlify)
- [ ] Set `VITE_API_BASE_URL` to production backend URL.
- [ ] Build command: `npm run build`.
- [ ] Output directory: `dist`.
- [ ] Configure SPA routing fallback rules (`index.html` rewrite for client-side routing).

## 5. Security & Verification
- [ ] Run `npm run verify` from root directory to execute automated test suite.
- [ ] Confirm no hardcoded credentials exist in tracked Git repository files.
- [ ] Verify HTTPS is enforced on both frontend and backend domains.
