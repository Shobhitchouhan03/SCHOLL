# Development Progress

> [!NOTE]
> PRODUCTION DEPLOYMENT DEFERRED UNTIL FINAL TEACHER REBUILD STEP.

## Last Completed Patch
STEP T2 — Final Staff Role Architecture + Principal Access Cleanup (Local Verification Completed).

## Current Architecture
Multi-tenant School Management SaaS built on Node.js/Express, MongoDB (Mongoose with strict `schoolId` indexing), and React/Vite. Role architecture updated with strict separation: `superAdmin` (tenant setup), `principal` (executive setup, staff creation, oversight — no direct student/parent admission), `teacher` (academic operations, class/subject assignments — Library/Transport removed), `hr` (staff operations, Library & Transport ownership), `accountant` (financial operations only), and `parent` (linked children view). Server-enforced role restrictions on `createStudent` (restricted to Class Teachers) and `createUser` (Principal creates Teacher, Accountant, HR accounts only). 100% master verification pass (16 unit test suites), clean Vite frontend build.

## Completed
- **T1: Canonical Teacher Profile & Data Repair**: Established bi-directional `User.teacherProfileId` <-> `Teacher._id` / `Teacher.userId` <-> `User._id` relationship. Centralized `resolveTeacherProfile` with safe idempotent legacy repair matching ONLY strong identifiers (`stored userId`, `employeeId`, `loginId`, `normalized email` — NEVER name alone) within `schoolId`. `GET /api/teacher/me` returns server-derived `capabilities`, `primaryClassTeacherAssignment`, `subjectAssignments`, and real database metrics.
- **T2: Final Staff Role Architecture & Principal Cleanup**:
  - Restricted Principal creation roles in `principalController.js` to `teacher`, `accountant`, and `hr` only (blocking direct student/parent creation by Principal).
  - Server-enforced `createStudent` restriction in `studentController.js` locking student admission exclusively to Class Teachers (`role: 'teacher'`).
  - Removed Library & Transport from Teacher sidebar (`Sidebar.jsx`) and restricted backend routes.
  - Granted HR/Common Staff (`role: 'hr'`) ownership of Library and Transport modules (`libraryRoutes.js`, `transportRoutes.js`, `Sidebar.jsx`).
  - Updated Accountant UI/routes to financial operations only.
  - Updated `AddStudentPage.jsx` with 403 Forbidden banner for non-class staff attempting direct student admission.
  - Created `stepT2RoleArchitecture.test.js` regression suite. Passed `npm run verify` 100%.

## Partial
- None.

## Pending
- Final Teacher Rebuild Step: Production deployment & live Netlify + Render sync.

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
