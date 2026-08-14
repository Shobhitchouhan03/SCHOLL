# Development Progress

> [!NOTE]
> PRODUCTION DEPLOYMENT DEFERRED UNTIL FINAL TEACHER REBUILD STEP.

## Last Completed Patch
STEP T6 — Attendance, Results, Student Leave & Announcements Finalization (Local Verification Completed).

## Current Architecture
Multi-tenant School Management SaaS built on Node.js/Express, MongoDB (Mongoose with strict `schoolId` indexing), and React/Vite. Complete Class Teacher & Subject Teacher workspace finalization: locked attendance marking for Class Teachers (`attendanceController.js`), contextual subject marks boundary in `saveTeacherStudentMarks` (`examController.js`), Subject Academic Remarks (`SubjectRemark`), Class Teacher student leave administration vs Teacher personal leave (`teacherController.js`), contextual announcement creation for class/subject (`communicationController.js`), and Parent portal visibility integration. 100% master verification pass (20 unit test suites), clean Vite frontend build.

## Completed
- **T1: Canonical Teacher Profile & Data Repair**: Bi-directional canonical `User.teacherProfileId` <-> `Teacher._id` relationship with safe idempotent legacy repair.
- **T2: Final Staff Role Architecture & Principal Cleanup**: Restricted Principal creation roles to staff (`teacher`, `accountant`, `hr`). Enforced Class Teacher requirement for student admission.
- **T3: Class Teacher Complete Workspace**: Class Teacher Dashboard, locked admission form, student leave approval, class announcements fix, marks entry action.
- **T4: Subject Teacher Cross-Class Access**: Contextual permissions for Subject Teachers (`resolveTeacherTeachingContext`), subject marks security, subject remarks (`SubjectRemark`), subject announcements.
- **T5: Class Teacher Student & Parent Lifecycle**: Manual student admission with locked class/section, new family creation & sibling linkage, contextual student privacy.
- **T6: Attendance, Results, Leave & Announcements Finalization**:
  - Locked Class Teacher attendance marking in `getAttendanceSession` and `saveAttendanceSession` (`attendanceController.js`).
  - Contextual subject marks entry guard in `saveTeacherStudentMarks` (`examController.js`).
  - Class Teacher Student Leave recording & review vs Teacher Personal Leave (`teacherController.js`).
  - Contextual announcements security in `createTeacherClassAnnouncement` (`communicationController.js`).
  - Created `stepT6Finalization.test.js` regression suite covering all 21 test cases. Passed `npm run verify` 100%.

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
