# Development Progress

> [!NOTE]
> PRODUCTION DEPLOYMENT DEFERRED UNTIL FINAL TEACHER REBUILD STEP.

## Last Completed Patch
STEP T4 — Subject Teacher Cross-Class Assignment & Contextual Access (Local Verification Completed).

## Current Architecture
Multi-tenant School Management SaaS built on Node.js/Express, MongoDB (Mongoose with strict `schoolId` indexing), and React/Vite. Complete Subject Teacher cross-class architecture: single Principal-created Teacher login account supporting contextual Class Teacher and Subject Teacher assignments. Implemented `SubjectAssignment` model (`schoolId`, `teacherId`, `classId`, `sectionId`, `subjectId`, `status`) and `SubjectRemark` model (`schoolId`, `studentId`, `teacherId`, `classId`, `sectionId`, `subjectId`, `remark`). Contextual security resolver `resolveTeacherTeachingContext` in `teacherResolver.js` enforcing server-side class/subject permissions: Subject Teachers can read student roster, write marks ONLY for assigned subject (`examController.js`), write subject remarks (`subjectRemarkController.js`), and publish subject announcements (`communicationController.js`), but are blocked (`403 Forbidden`) from student admission, deletion, parent management, attendance, leave approval, and class configuration. 100% master verification pass (18 unit test suites), clean Vite frontend build.

## Completed
- **T1: Canonical Teacher Profile & Data Repair**: Established bi-directional `User.teacherProfileId` <-> `Teacher._id` / `Teacher.userId` <-> `User._id` relationship. Centralized `resolveTeacherProfile` with safe idempotent legacy repair matching ONLY strong identifiers (`stored userId`, `employeeId`, `loginId`, `normalized email` — NEVER name alone) within `schoolId`.
- **T2: Final Staff Role Architecture & Principal Cleanup**: Restricted Principal creation roles to `teacher`, `accountant`, and `hr`. Server-enforced `createStudent` restriction in `studentController.js` locking student admission exclusively to Class Teachers. Removed Library & Transport from Teacher navigation.
- **T3: Class Teacher Complete Workspace**: Class Teacher Dashboard displaying real DB stats and primary assigned Class & Section banner. Manual Student Admission in `AddStudentPage.jsx` with read-only locked class & section. Student Leave review endpoints (`GET/PATCH /api/teacher/student-leaves`). Class Announcements fix in `TeacherNoticesPage.jsx`.
- **T4: Subject Teacher Cross-Class Access**:
  - Implemented `SubjectAssignment` model (`backend/src/models/SubjectAssignment.js`) and `SubjectRemark` model (`backend/src/models/SubjectRemark.js`).
  - Added `resolveTeacherTeachingContext` helper in `teacherResolver.js` for contextual permissions (`isOwnedClass`, `hasSubjectAssignment`, `canAccessClassStudents`, `canManageClassStudents`, `canEnterSubjectMarks`, `canPublishSubjectAnnouncement`).
  - Implemented Subject Teacher management endpoints (`GET/POST/DELETE /api/teacher/subject-teachers`).
  - Implemented Subject Academic Remarks endpoints (`GET/POST /api/teacher/students/:studentId/remarks`).
  - Enforced server-side contextual marks security in `saveTeacherStudentMarks` (`examController.js`).
  - Created `stepT4SubjectTeacherCrossClass.test.js` regression suite covering all 16 test cases. Passed `npm run verify` 100%.

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
