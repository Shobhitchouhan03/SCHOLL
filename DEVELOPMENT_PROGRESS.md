# Development Progress

## Last Completed Patch
PATCH STEP T1 — Canonical Teacher Profile & Production Data Repair (Verified).

## Current Architecture
Multi-tenant School Management SaaS built on Node.js/Express, MongoDB (Mongoose with strict `schoolId` indexing), and React/Vite. Supports role-based access control (`superAdmin`, `principal`, `accountant`, `teacher`, `parent`), tenant resolution abstraction (`resolveTenantFromRequest`) by route slug (`/s/:schoolSlug`), custom FQDN domain (`littlestarsschool.com`), subdomain (`little-stars.yourdomain.com`), or authenticated session `schoolId`. Bi-directional canonical relationship (`User.teacherProfileId` <-> `Teacher._id` and `Teacher.userId` <-> `User._id`). Centralized `resolveTeacherProfile` with tenant-safe idempotent legacy repair matching ONLY strong identifiers (`stored userId`, `employeeId`, `loginId`, `normalized email` — NEVER name alone) within the same `schoolId`. `GET /api/teacher/me` returns server-derived `capabilities`, `primaryClassTeacherAssignment`, `subjectAssignments`, and real database-driven assignment metrics. 100% master verification pass, clean production build (1667 modules), and 15 unit test suites passed.

## Completed
- **1. Canonical Account Relationship**: Added `teacherProfileId` to `User` model schema (ref `Teacher`, indexed) and updated `Teacher` model schema to store `userId` (ref `User`, indexed) and `loginId`.
- **2. Safe Idempotent Legacy Repair**: Upgraded `resolveTeacherProfile` in `backend/src/utils/teacherResolver.js` to match legacy teacher accounts strictly by strong identifiers (`userId`, `employeeId`, `loginId`, `email`) within the same `schoolId` (NEVER matching by name alone), automatically persisting bi-directional canonical links on first request.
- **3. Onboarding Bi-directional Persistence**: Updated `createTeacher` in `teacherController.js` to persist `newUser.teacherProfileId = newTeacher._id` and `newTeacher.userId = newUser._id` atomically upon teacher creation.
- **4. Enhanced `GET /api/teacher/me` Payload**: Enhanced `getTeacherSelfProfile` response structure to return `primaryClassTeacherAssignment`, `subjectAssignments`, server-derived `capabilities`, and real database student/salary/leave metrics.
- **5. Status-Aware Frontend Error Handling**: Updated `TeacherDashboard.jsx` to render status-aware error banners distinguishing HTTP 401 (auth expired), 403 (forbidden), 404 (missing profile/route), 409 (conflict), and 500 (server fault), preventing generic error masking.
- **6. Regression Test Suite**: Created `backend/src/tests/teacherProfileCanonical.test.js` validating canonical profile resolution, strong identifier legacy repair, tenant isolation, and Express route contracts. Passed `npm run verify` 100%.

## Partial
- None.

## Pending
- None. All Step T1 requirements verified and ready for deployment sync.

## Known Bugs
- None (0 runtime errors, 0 build warnings).

## Role Ownership
- **Super Admin**: Platform management, school onboarding, subscription management, tenant module configuration, custom domain & subdomain management, platform stats, access via `/admin/login`.
- **Principal**: School head overview, academic setup, attendance summary, student summary, teacher summary, notices, school branding, gallery, reports, school settings, workspace switching to HR.
- **HR**: Alternate workspace for Principal handling staff directory, teacher onboarding, departments & designations, employee records & documents, recruitment & jobs, leave approvals, holiday calendar, staff notices, staff assets, transport staff, library operations, and HR reports.
- **Accountant**: Financial management owning fee categories, fee structures, fee assignments, invoice generation, payment collection, receipts, payment reversals, concessions, adjustments, financial collection reports, and payroll payouts.
- **Teacher**: Classroom operations including student list, class teacher student admission, attendance marking, homework creation & reviews, exam marks entry, salary payslip viewing, teacher leave requests, route transport roster, and class notices.
- **Parent**: Linked-child portal for attendance, homework, exam results, printable report card, fee invoices/receipts, transport status, library history, student leave requests, and notices.

## Current Routes
- `/login` — School Users Login (Principal, Accountant, Teacher, Parent)
- `/admin/login` — Super Admin Security Portal
- `/admin/dashboard` — SaaS Platform Control Center
- `/s/:schoolSlug` — Tenant Public Website
- `/s/:schoolSlug/jobs` — Tenant Careers & Job Applications
- `/s/:schoolSlug/login` — Tenant Direct Portal Login
- `/super-admin/dashboard` — SaaS Control Center Alias
- `/principal/dashboard` — Principal Overview & Analytics
- `/principal/branding` — School Branding & Theme Assets
- `/principal/gallery` — School Photo Gallery Management
- `/principal/settings` — Tenant Configuration & User Access
- `/principal/hr` — HR & Staff Control Center
- `/accountant/dashboard` — Financial & Payroll Operations Console
- `/accountant/payments` — Accountant Fee Payments
- `/accountant/invoices` — Accountant Fee Invoices
- `/accountant/payroll` — Accountant Payroll Payouts
- `/accountant/reports` — Accountant Financial Reports

## Next Recommended Patch
- **Production Deployment Execution (Docker Containerization / Cloud Run / Vercel Deployment)**.
