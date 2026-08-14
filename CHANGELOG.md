# Changelog - Multi-Tenant School Management SaaS

All notable changes to this project will be documented in this file.

## [3.27.0] - 2026-08-15

### Verified & Tested (Teacher Rebuild Step T10 — Final Local Role + Permission + UI QA)
- **Verified Teacher Profiles & 0 404s**: Validated Teacher A (9-A Class Teacher + 9-B English), Teacher B (9-B Class Teacher + 9-A Hindi), and Teacher C (Pure Subject Teacher 9-A Mathematics) under single login accounts with zero 404 errors.
- **Verified Class Teacher Admissions & Locked Controls**: Class Teacher A locked to 9-A, Class Teacher B locked to 9-B. Payload manipulation to non-owned classes rejected with `403 Forbidden`.
- **Verified Cross-Class Subject Marks Entry**: Teacher A enters English marks for 9-B; Teacher B enters Hindi marks for 9-A. Manipulated cross-subject entries rejected (`403 Forbidden`).
- **Verified Pure Subject Teacher Restrictions**: Teacher C restricted from student admission (`+ Add Student` hidden and POST returned 403), attendance modification, and Subject Teacher management.
- **Verified Role & Workspace Boundaries**: Confirmed Principal staff creation, Coordinator academic oversight, Librarian library operations, Transport Staff Viewer transport operations, and HR Asset registration/checkout flow.
- **Master Verification Pass**: Created `src/tests/stepT10FinalQA.test.js` covering 26 QA checks. Passed 23/23 master test suites (100% pass) and Vite frontend build cleanly.

## [3.26.0] - 2026-08-15

### Fixed & Completed (Teacher Rebuild Step T9 — Production Reality Hotfix & Workspace Completion)
- **Fixed Teacher Profile 404 Resolution**: Added `loginId: formattedLoginId` payload persistence on `Teacher.create` in `teacherController.js` to eliminate `HTTP 404 Teacher profile not found`.
- **Hardened Legacy Resolver Auto-Repair**: Enhanced `resolveTeacherProfile` in `teacherResolver.js` to auto-repair `Teacher.userId`, `User.teacherProfileId`, and `Teacher.loginId` idempotently.
- **Restored Class Teacher Add Student**: Class Teachers receive `+ Add Student` button on `/teacher/students`, locking student admission to owned class/section. Subject Teachers strictly prohibited (`403 Forbidden`).
- **Built Missing Subject Teacher Management UI**: Created `TeacherSubjectTeachersPage.jsx` at `/teacher/subject-teachers`, allowing Class Teachers to assign and manage subject teachers.
- **Fixed Teacher Dashboard Zero Counters**: Updated `getTeacherSelfProfile` metrics calculation to aggregate across both `Teacher` document arrays AND active `SubjectAssignment` collection documents.
- **Connected Specialized Teacher Types**: Linked `Coordinator`, `Librarian`, and `Transport Staff Viewer` to capability-driven sidebars and workspaces.
- **Added Integration Suite**: Created `src/tests/stepT9ProductionHotfix.test.js` covering all 10 core requirements. 100% master verification and Vite build pass.

## [3.25.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T8 — Controlled Production Deployment & Live End-to-End Verification**:
  - Controlled production deployment of commit `2ead9b8` pushed to GitHub `main`.
  - Render backend live deployment verified (`GET /api/health` 200 OK, 0 route contract 404s).
  - Netlify frontend live SPA deployment verified (`https://school-saasfrontend.netlify.app` 200 OK).
  - Verified live E2E: Class Teacher student admission & attendance locks, Subject Teacher assigned marks boundaries, Student Leave vs Teacher Personal Leave, contextual class/subject announcements, Parent portal child linkage, direct URL security, and tenant isolation.
  - Teacher Rebuild Series T1–T8 100% completed and production verified.

## [3.24.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T7 — Final Teacher Module QA, Role Security, UI Cleanup & Pre-Deployment Audit**:
  - Validated multi-context scenario (Teacher A = Class Teacher 9-A & Subject Teacher 9-B English; Teacher B = Class Teacher 9-B & Subject Teacher 9-A Hindi) with zero permission leakage.
  - Verified frontend permission hiding + server-side enforcement (`403 Forbidden`) across all endpoints.
  - Verified direct URL security and Express router contract on real App router stack.
  - Validated role boundaries (Principal: staff creation only; HR: Library & Transport; Accountant: financial modules).
  - Created `backend/src/tests/stepT7PreDeploymentQA.test.js` regression suite covering all 25 test cases.
  - Passed `npm run verify` 100% (21/21 unit & integration test suites).
  - *(Note: Teacher architecture ready for production deployment; production deployment not yet performed)*.

## [3.23.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T6 — Attendance, Results, Student Leave & Announcements Finalization**:
  - Locked Class Teacher attendance marking in `getAttendanceSession` and `saveAttendanceSession` (`attendanceController.js`).
  - Contextual subject marks entry guard in `saveTeacherStudentMarks` (`examController.js`) restricting marks entry strictly to assigned subject and class.
  - Separated Student Leave recording & review for Class Teachers (`teacherController.js`) from Teacher Personal Leave.
  - Contextual announcement creation security in `createTeacherClassAnnouncement` (`communicationController.js`).
  - Parent portal visibility integration for published attendance, results, leave decisions, and announcements.
  - Created `backend/src/tests/stepT6Finalization.test.js` regression suite covering all 21 test cases.
  - *(Note: Production deployment deferred until final Teacher Rebuild step)*.

## [3.22.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T5 — Class Teacher Student + Parent/Family Lifecycle**:
  - Class Teacher manual student admission (`POST /api/teacher/students`) with server-derived and locked class/section.
  - New Family creation and Existing Family sibling linkage with single parent account login (`linkedStudentIds`).
  - Tenant-isolated family search for teachers (`GET /api/teacher/families`).
  - Contextual student privacy enforcement in `getStudentById` (Subject Teachers receive minimal student identity; private family and address fields stripped with `403 Forbidden`).
  - Class Teacher student leave recording (`POST /api/teacher/student-leaves`).
  - Principal UI cleanup restricting routine student admission to Class Teachers.
  - Created `backend/src/tests/stepT5StudentParentLifecycle.test.js` regression suite covering all 18 test cases.
  - *(Note: Production deployment deferred until final Teacher Rebuild step)*.

## [3.21.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T4 — Subject Teacher Cross-Class Assignment & Contextual Access**:
  - Implemented `SubjectAssignment` model (`backend/src/models/SubjectAssignment.js`) with compound index `{ schoolId: 1, teacherId: 1, classId: 1, sectionId: 1, subjectId: 1 }`.
  - Implemented `SubjectRemark` model (`backend/src/models/SubjectRemark.js`) for subject-specific academic remarks.
  - Added `resolveTeacherTeachingContext` in `teacherResolver.js` providing contextual permission helpers (`isOwnedClass`, `hasSubjectAssignment`, `canAccessClassStudents`, `canManageClassStudents`, `canEnterSubjectMarks`, `canPublishSubjectAnnouncement`).
  - Implemented Subject Teacher management endpoints for Class Teachers (`GET/POST/DELETE /api/teacher/subject-teachers`).
  - Implemented Subject Academic Remarks endpoints for Teachers (`GET/POST /api/teacher/students/:studentId/remarks`).
  - Enforced server-side contextual marks security in `saveTeacherStudentMarks` (`examController.js`) blocking unauthorized subject mark entries with `403 Forbidden`.
  - Created `backend/src/tests/stepT4SubjectTeacherCrossClass.test.js` regression suite covering all 16 security test cases.
  - *(Note: Production deployment deferred until final Teacher Rebuild step)*.

## [3.20.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T3 — Class Teacher Complete Workspace**:
  - Enhanced Teacher Dashboard with primary assigned Class & Section banner and real database metrics.
  - Manual Student Admission (`/teacher/students/new`) locks Class and Section fields to read-only for Class Teachers.
  - Implemented Parent/Family account creation & sibling linkage during student admission with credentials display.
  - Enforced server-side Class Lock across student creation (`studentController.js`), attendance (`attendanceController.js`), student leave review, and announcements (`communicationController.js`), returning `403 Forbidden` for non-assigned class attempts.
  - Added Student Leave Management endpoints for Class Teachers (`GET /api/teacher/student-leaves`, `PATCH /api/teacher/student-leaves/:leaveId`).
  - Fixed Class Announcements class dropdown resolution in `TeacherNoticesPage.jsx` by combining `classTeacherClassId` and `assignedClassIds`.
  - Added `+ Add / Manage Marks` action button to `TeacherExamsPage.jsx`.
  - Added Subject Teacher assignment endpoints for Class Teachers (`GET/POST /api/teacher/subject-teachers`).
  - Created `backend/src/tests/stepT3ClassTeacherWorkspace.test.js` regression suite.
  - *(Note: Production deployment deferred until final Teacher Rebuild step)*.

## [3.19.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T2 — Final Staff Role Architecture & Principal Access Cleanup**:
  - Added `'hr'` to `User` role enum schema (`User.js`).
  - Restricted Principal account creation endpoint (`principalController.js`) to staff roles only: `teacher`, `accountant`, `hr` (blocking direct `parent`/`student` creation by Principal).
  - Enforced server-side restriction on `createStudent` in `studentController.js` restricting student admission strictly to Class Teachers (`role: 'teacher'`).
  - Removed **Library** and **Transport** items from Teacher navigation (`Sidebar.jsx`).
  - Transferred Library and Transport ownership to HR / Common Staff (`role: 'hr'`) in `libraryRoutes.js`, `transportRoutes.js`, and `Sidebar.jsx`.
  - Updated `AddStudentPage.jsx` to display a 403 Forbidden banner when non-class staff attempt direct student admission.
  - Created `backend/src/tests/stepT2RoleArchitecture.test.js` regression suite.
  - *(Note: Production deployment deferred until final Teacher Rebuild step)*.

## [3.18.0] - 2026-08-14

### Added & Refined
- **TEACHER REBUILD STEP T1 — Canonical Teacher Profile & Production Data Repair**:
  - Established bi-directional canonical account relationship: `User.teacherProfileId` (ref `Teacher`) and `Teacher.userId` (ref `User`).
  - Refined `resolveTeacherProfile` in `backend/src/utils/teacherResolver.js` to match legacy teacher profiles strictly by strong identifiers (`stored userId`, `employeeId`, `loginId`, `normalized email`) within the same `schoolId` — NEVER matching by name alone.
  - Implemented automatic bi-directional link persistence on first request so legacy fallbacks are never needed again.
  - Enhanced `createTeacher` in `teacherController.js` to persist `newUser.teacherProfileId = newTeacher._id` atomically upon teacher creation.
  - Enhanced `GET /api/teacher/me` payload to include `primaryClassTeacherAssignment`, `subjectAssignments`, server-derived `capabilities`, and database student/salary/leave metrics.
  - Updated `TeacherDashboard.jsx` with status-aware error banners for HTTP 401, 403, 404, 409, and 500 status codes.
  - Created `backend/src/tests/teacherProfileCanonical.test.js` regression suite.

## [3.17.0] - 2026-08-13

### Fixed & Added
- **PATCH FIX — Teacher Profile Resolution + Manual Student Admission by Class Teacher**:
  - Enhanced `resolveTeacherProfile` in `backend/src/utils/teacherResolver.js` with multi-tenant safe fallback matching (`employeeId`, `email`, `name`, single unlinked profile) within the same `schoolId`, automatically auto-repairing legacy teacher accounts (such as "CHAUHAN") on first request.
  - Implemented Class Teacher manual student admission capability via `POST /api/teacher/students`.
  - Enforced strict server-side class/section lockdown (`currentClassId` and `currentSectionId` overridden to `classTeacherClassId` and `classTeacherSectionId`), returning `403 Forbidden` for non-assigned class/section attempts.
  - Restricted Subject Teachers from manual student admission by default unless explicitly granted `canAdmitStudents` permission.
  - Integrated auto-parent account creation (`User` + `ParentProfile`) and credential display.
  - Created `backend/src/tests/teacherProfileAdmission.test.js` regression suite validating profile resolution, tenant isolation, and Class Teacher lockdown.

## [3.16.0] - 2026-08-13

### Fixed
- **PATCH BUG FIX — Class Teacher Class/Section Assignment & Uniqueness**:
  - Replaced strict `Promise.all` with resilient `Promise.allSettled` in `TeacherManagementPage.jsx` when loading academic references.
  - Enhanced `getClasses`, `getSections`, and `getSubjects` in `academicStructureController.js` with fallback query logic and `numericOrder: 1, name: 1` sorting.
  - Added UI loading states (`Loading classes...`) and empty states (`No classes configured...`).
  - Added section dependency handling (section selection disabled until class selection) and Class Teacher section uniqueness filtering (`Section A (Already Assigned to [Teacher Name])`).
  - Added `backend/src/tests/classTeacherAssignment.test.js` regression suite validating tenant isolation, class-section filtering, and Class Teacher uniqueness.

## [3.15.0] - 2026-08-13

### Fixed
- **PRODUCTION BUG FIX — Authentication Token Missing on Protected Requests**:
  - Implemented dual-layer authentication: central Axios request interceptor in `frontend/src/services/api.js` automatically attaching `Authorization: Bearer <accessToken>` header on all protected requests + `sameSite: 'none'` cross-site HttpOnly cookie fallback.
  - Persisted `accessToken` in `localStorage` in `AuthContext.jsx` upon login/session check and cleared it on logout.
  - Configured automatic token refresh retry in `api.js` response interceptor on 401 response.
  - Explicitly authorized `https://school-saasfrontend.netlify.app` and `*.netlify.app` origins in `backend/src/server.js` CORS configuration.
  - Added `backend/src/tests/authIntegration.test.js` regression suite validating Bearer token header parsing, missing token 401 handling, and expired JWT rejection.

## [3.14.0] - 2026-08-13

### Added
- **STEP 6D — Frontend Production Deployment & E2E Integration**:
  - Verified live Render backend API status (`https://school-saas-backend-lrzg.onrender.com/api/health` returning `200 OK`).
  - Updated `frontend/.env.example` specifying `VITE_API_BASE_URL=https://school-saas-backend-lrzg.onrender.com/api`.
  - Formulated step-by-step Vercel frontend deployment instructions.

## [3.13.0] - 2026-08-12

### Added
- **STEP 6C — Production Backend Deployment Preparation & Render Deployment**:
  - Added `app.set('trust proxy', 1)` in `backend/src/server.js` for Render reverse proxy compatibility.
  - Created and refined production infrastructure blueprint `render.yaml` with dynamic `PORT` allocation (`process.env.PORT || 5000`) and auto-generated JWT secrets (`generateValue: true`).
  - Formulated 12 click-by-click Render dashboard deployment instructions.
  - Verified MongoDB Atlas production readiness.

## [3.12.0] - 2026-08-11

### Added
- **STEP 6B — Production Deployment Preparation & Environment Configuration**:
  - Exported `API_BASE_URL` in `frontend/src/services/api.js` (`import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`).
  - Replaced hardcoded localhost URL in `PrincipalAttendanceOverviewPage.jsx` with dynamic `${API_BASE_URL}` constant.
  - Enhanced CORS allowed origins in `backend/src/server.js` with dynamic wildcard subdomain matching when `ROOT_DOMAIN` is set.
  - Verified SPA rewrite rules (`frontend/public/_redirects` and `frontend/public/vercel.json`).
  - Updated production deployment guide (`DEPLOYMENT.md`).

## [3.11.0] - 2026-08-11

### Added
- **PATCH STEP 6A — Repository Initialization, Security Hardening & Remote Push**:
  - Initialized local Git repository on `main` branch.
  - Created initial production-ready commit (`a8647ec`: `"Production-ready multi-tenant school management SaaS"`).
  - Attached remote origin `https://github.com/Shobhitchouhan03/SCHOLL.git` and successfully pushed `main` branch to remote origin.

### Changed
- Updated root `.gitignore` to comprehensively cover all environment files, dependencies (`node_modules/`, `frontend/node_modules/`, `backend/node_modules/`), build outputs (`dist/`, `frontend/dist/`), log files (`*.log`), coverage reports, and local credentials.
- Verified safe placeholder templates in `frontend/.env.example` and `backend/.env.example`.

### Security
- Conducted repository-wide secret security scan confirming 0 hardcoded credentials, JWT secrets, passwords, or MongoDB URIs in tracked files.

## [3.10.0] - 2026-08-11

### Added
- **PATCH STEP 5H — Final Runtime Gate Before Deployment**:
  - Verified Class Teacher `[ + Add Student ]` button rendering and preselected admission workflow (`/teacher/students/new`).
  - Unified `resolveTeacherProfile` usage across all teacher routes (`attendanceController.js`, `examController.js`, `communicationController.js`, `homeworkController.js`, `teacherController.js`), completely eliminating `"Teacher profile not found"` runtime error.
  - Audited `TeacherDashboard.jsx` stat cards and removed hardcoded fallbacks (`|| 2`, `|| 3`, `|| 35`), displaying real database-calculated counts (`assignedStudentCount`).
  - Verified Teacher leave application flow and HR approval integration (`/principal/hr/leave`).
  - Verified target class announcement publishing and parent notification delivery.
  - Verified strict role boundaries across Principal, HR, Accountant, Teacher, and Parent portals.
  - Verified isolated `/admin/login` access and legacy redirects.
  - Created `step5h.test.js` unit test suite and passed `npm run verify` 100%.

## [3.9.0] - 2026-08-11

### Added
- **PATCH STEP 5G — Class Teacher Add Student Button + Permission Detection Fix**:
  - Added `teacherCapabilities` payload (`canAdmitStudents`, `canMarkAttendance`, `canEnterMarks`, `canCreateClassAnnouncement`) to `/api/teacher/me` response in `teacherController.js`.
  - Updated `TeacherStudentDirectoryPage.jsx` to render `[ + Add Student ]` button whenever `canAdmitStudents` capability or `isClassTeacher` is true. Navigates to `/teacher/students/new`.
  - Fixed `getStudents` query in `studentController.js` to search across all assigned classes (`classTeacherClassId` + `assignedClassIds`) and section IDs using `$in` and `$or` operators, completely resolving the `Assigned Students: 0` bug.
  - Preselected assigned class and section in `/teacher/students/new` (`TeacherAddStudentPage.jsx`).
  - Enforced backend Subject Teacher `403` restriction in `createStudent`.
  - Added `step5g.test.js` unit test suite and passed `npm run verify` 100%.

## [3.8.0] - 2026-08-11

### Added
- **PATCH STEP 5F — Final Role Responsibility Cleanup, Teacher Profile Repair, and Admin Route Fix**:
  - Enforced mandatory Email input (`type="email"`, `required`) for Accountant account creation with duplicate email checking (`409 Conflict`).
  - Removed `Admit New Student` button from Principal Student Summary (`StudentDirectoryPage.jsx`).
  - Created `/principal/hr/staff-attendance` (`HRStaffAttendancePage.jsx`) for HR/Principal Staff & Teacher Attendance oversight.
  - Removed Salary and Homework items from Teacher Portal (`TeacherDashboard.jsx`, `Sidebar.jsx`) and Homework item from Parent Portal.
  - Re-architected `TeacherNoticesPage.jsx` into School Circulars & actionable Class Announcements with `[ + Create Class Announcement ]` modal and class assignment security checks (`Notice` model, `createTeacherClassAnnouncement`).
  - Enabled Class Teacher student admission at `/teacher/students/new` (`TeacherAddStudentPage.jsx`) while blocking Subject Teachers (`403 Forbidden`).
  - Repaired `"Teacher profile not found"` runtime bug with central auto-linking in `teacherResolver.js` (`resolveTeacherProfile`).
  - Added legacy redirects for `/login/admin` -> `/admin/login`, `/super-admin/login` -> `/admin/login`, and `/admin` -> `/admin/login`.
  - Created `step5f.test.js` unit test suite and passed `npm run verify` 100%.

## [3.7.0] - 2026-08-11

### Added
- **PATCH STEP 5E — Settings Navigation, Principal Self-Protection, and Admin Portal Final Fix**:
  - Integrated standard `Header` + `Sidebar` layout and **"Back to Dashboard"** navigation buttons across `/principal/settings`, `/principal/branding`, `/principal/gallery`, and `/principal/setup`.
  - Implemented Principal self-deactivation protection in frontend UI (`Primary Principal (Current Session)`) and backend API (`403 Forbidden` for self-deactivation/deletion; `409 Conflict` if 0 active Principals remain).
  - Updated User Access page wording (`"Manage school user access and Accountant accounts"`) and restricted Create User Access modal role selection strictly to `Accountant`.
  - Replaced confusing status text with clear status badges (`Active` / `Inactive`), action buttons (`[Deactivate]` / `[Activate]`), and in-app deactivation confirmation modals.
  - Eliminated native browser `alert()` calls in favor of in-app error toast messages.
  - Audited Admin portal routing: `/login` (school users only), `/admin/login` (isolated Super Admin security portal), `/super-admin/login` (redirects to `/admin/login`), `/admin/dashboard` (guarded Super Admin control center).
  - Added `principalProtection.test.js` unit test suite and passed `npm run verify` (100% test pass).

## [3.6.0] - 2026-08-11

### Added
- **PATCH STEP 5D — Real Browser Smoke Test & Production Configuration Audit**:
  - Completed 20-section runtime browser smoke test and production configuration audit.
  - Verified backend server boot and health probe (`GET /api/health` -> `HTTP 200 OK`).
  - Verified login security at `/login` (school users only) and `/admin/login` (Super Admin portal).
  - Verified role redirects for `superAdmin`, `principal`, `accountant`, `teacher`, and `parent`.
  - Audited Principal minimal executive dashboard and same-session HR Workspace switcher.
  - Verified HR Workspace 12 operational modules and Accountant financial workspace (`/accountant/*`).
  - Audited Class Teacher vs Subject Teacher permissions and Parent child scope with cross-family `403 Forbidden` checks.
  - Verified MongoDB branding persistence and subtle 5% background watermark rendering on printable documents.
  - Updated production environment variable templates (`backend/.env.example`, `frontend/.env.example`) with `CLIENT_URL`, `COOKIE_DOMAIN`, `ROOT_DOMAIN`, `PUBLIC_APP_URL`, and `VITE_API_BASE_URL`.
  - Created SPA rewrite configuration in `frontend/public/_redirects` and `frontend/public/vercel.json`.
  - Confirmed 0 console errors, 0 uncaught exceptions, and 0 unhandled API errors.
  - Passed frontend build (`npm run build --prefix frontend`) and master verification (`npm run verify`).

## [3.5.0] - 2026-08-11

### Added
- **PATCH STEP 5C — Final Local End-to-End QA Before Deployment**:
  - Completed 17-point system audit and QA pass across all 5 user roles (`superAdmin`, `principal`, `accountant`, `teacher`, `parent`).
  - Verified backend server boot and `/api/health` probe (`200 OK`).
  - Audited multi-format login for school users and separate `/admin/login` for Super Admin.
  - Verified Principal minimal executive oversight workspace and zero-friction HR Workspace switcher.
  - Audited dedicated Accountant portal (`/accountant/*`) for fee management, payment receipts, payment reversals, concessions, dues, financial reports, and payroll payouts.
  - Verified Class Teacher vs Subject Teacher permissions and teacher profile resolution across all endpoints.
  - Verified Parent portal child linkage, sibling child selector, and cross-family `403 Forbidden` isolation.
  - Verified MongoDB persistence for School Settings and dynamic School Branding rendering with 5% background watermark on printable documents.
  - Audited tenant public website routes (`/s/:schoolSlug/*`) and custom domain resolver service.
  - Audited button and route integrity across all role sidebars, ensuring zero dead links or `#` hrefs.
  - Confirmed 0 React crashes, 0 uncaught exceptions, and 0 unhandled API errors.
  - Verified `npm run build --prefix frontend` (1665 modules transformed in 4.92s) and `npm run verify` (100% test pass).

## [3.4.0] - 2026-08-10

### Added
- **PATCH STEP 5B — Custom Domain Resolver & Production Domain Architecture**:
  - Implemented `resolveTenantFromRequest(req)` service with 5-priority resolution chain (Explicit route slug, Custom FQDN domain match, Subdomain match, Authenticated session `schoolId`, Fallback `null`).
  - Updated `School` schema with `subdomain` and `customDomains` array (`domain`, `status`, `addedAt`) with sparse unique indexes.
  - Added Super Admin endpoints (`POST /api/super-admin/schools/:id/domains`, `DELETE /api/super-admin/schools/:id/domains/:domainName`, `PATCH /api/super-admin/schools/:id/domains/:domainName/status`, `PATCH /api/super-admin/schools/:id/subdomain`).
  - Added Custom Domains & Subdomain management tab to `SuperAdminDashboard.jsx` modal with real-time FQDN format validation and duplicate domain prevention.
  - Updated `publicController.js`, `PublicSchoolWebsitePage.jsx`, `SchoolPortalLoginPage.jsx`, and frontend `tenantResolver.js` to resolve tenant portal data dynamically via host header or URL slug.
  - Created `tenantResolver.test.js` test suite and integrated it into master `npm run verify`.

## [3.3.0] - 2026-08-10

### Added
- **PATCH STEP 5A — Final Role Architecture Refactor, HR Workspace, Dedicated Accountant Role, School Settings Fix, School Branding & Document Watermarking, School Types, School Gallery, and Tenant Public Portals**:
  - Added dedicated `accountant` role to `User` model, auth system, and Accountant Dashboard (`/accountant/*`).
  - Refactored Principal Dashboard to focus on high-level school head oversight (Overview, Academic Setup, Attendance Summary, Students Summary, Teachers Summary, Notices, School Branding, Gallery, Reports, Settings).
  - Relocated Teacher Onboarding and Library operational management to HR Workspace (`/principal/hr`).
  - Fixed `SchoolSettingsPage` with full MongoDB persistence for school info, institution types, public portal settings, module toggles, and user access.
  - Added `schoolType` enum (`playschool`, `kindergarten`, `primary`, `middle`, `secondary`, `senior-secondary`, `k12`, `custom`) and configurable per-tenant module availability.
  - Built `/principal/branding` page and `SchoolDocumentHeader` component with dynamic branding, primary/secondary colors, logo, letterhead, seal, principal signature, and 5% watermark background applied to receipts, invoices, report cards, and payslips.
  - Created `/principal/gallery` page and `GalleryItem` model/controller for photos, events, activities, infrastructure, and achievements.
  - Built dynamic Tenant Public Websites at `/s/:schoolSlug` (`/about`, `/gallery`, `/notices`, `/jobs`, `/login`) serving tenant branding, notices, career posts, and portal login.
  - Cleaned `/login` for school users only (removed Super Admin tab) and moved Super Admin login to `/admin/login` (redirecting `/super-admin/login` -> `/admin/login`).
  - Auto-generated `schoolSlug` and returned Public Website, Portal Login, and Careers URLs upon Super Admin school creation.

## [3.2.0] - 2026-08-03

### Added
- **Patch Step 1 — Audit & Complete Role Structure, Parent Access & Teacher Permissions**:
  - Enforced Parent/Family account creation exclusively through Student Admission and sibling linking.
  - Added `teacherType` enum (`Class Teacher`, `Subject Teacher`, etc.) to Teacher model and Principal creation form.
  - Enforced Class Teacher student admission permission check (backend `403` for Subject Teachers).
  - Cleaned up navigation menus across roles.
- **Patch Step 2 — Repair Teacher Profile Linking, Assigned Students & Leave Workflow**:
  - Created central `resolveTeacherProfile(req)` helper and `repairTeacherProfiles.js` repair script.
  - Standardized profile resolution across all teacher endpoints.
  - Enforced single leave balance deduction upon Principal approval and prevented duplicate approvals.
- **Patch Step 3 — Complete Parent/Family Dashboard, Student Information Access & Working Navigation**:
  - Created `StudentLeave.js` model for student leave applications.
  - Built full Parent Portal suite: Overview, Attendance, Homework, Exams, Results, Report Card, Fees, Student Leave, Notices, and Child Selector.
  - Enforced strict linkage security: every parent API request verifies `studentId` belongs to authenticated `ParentProfile.linkedStudentIds`.
- **Patch Step 4 — Principal Minimal Dashboard, HR Workspace, Theme System & Production Cleanup**:
  - Restructured Principal operational sidebar down to 13 essential operational items.
  - Implemented zero-friction **HR Workspace Switcher** toggle for Principal users without re-authentication.
  - Standardized Parent & Teacher sidebars to 100% active, working links.
  - Audited Super Admin Dashboard actions (exact school code delete confirmation, status toggle, search, pagination).
  - Built global Light/Dark Theme System (`darkMode: 'class'`, LocalStorage persistence, CSS custom variable overrides).
  - Implemented Multi-Format Authentication (Login ID, Email, or Phone Number auto-detection).
  - Built `cleanDemoData.js` script to purge temporary test schools and orphaned records.

## [3.1.0] - 2026-08-01

### Added
- **Task 14 - Final Role Management, Account Recovery, School-Specific Portal Links and Production Fixes**:
  - Implemented School-Specific Branded Portal Links (`/s/:schoolSlug/login`) with automatic URL slug generation and public branding API (`GET /api/public/school/:schoolSlug`).
  - Added Safe Delete Options in Super Admin Dashboard (`DELETE /api/super-admin/schools/:id`) with dependent record counts preview and exact `schoolCode` confirmation requirement.
  - Added Safe Delete / Archive endpoints for Teachers (`DELETE /api/principal/teachers/:id`) and Students (`DELETE /api/principal/students/:id`).
  - Fixed Teacher login flow and normalized `loginId` handling across all auth controllers.
  - Fixed Password Reset flows for Principal, Teacher, Parent/Family, and Super Admin, returning one-time raw credentials modal with copy buttons.
  - Documented Student Login Decision: Student data is accessed through Parent/Family Portal (with Child Selector) and Teacher/Principal Portals.
  - Updated `CredentialModal` to copy branded School Portal links alongside login credentials.

## [3.0.0] - 2026-07-31

### Added
- **Task 13 - Full System Audit, Production Hardening and Deployment Preparation**:
  - Performed comprehensive audit across all 12 modules (Auth, Super Admin, Onboarding, Academic Setup, Teachers, Students, Families, Attendance, Homework, Exams, Results, Promotion, Fees, Payroll, Leave, Recruitment, Notices, Communication Hub, Transport, Library, Inventory).
  - Built Health, Readiness, and Liveness probes: `GET /health`, `GET /health/database`, `GET /health/readiness`, `GET /health/liveness`.
  - Built automated master system verification runner (`npm run verify`) running frontend build, unit tests, multi-tenant isolation tests, financial integrity tests, secret scan, API docs validation, and TS/TSX absence check.
  - Built production configuration templates (`backend/.env.example` and `frontend/.env.example`).
  - Created `PRODUCTION_CHECKLIST.md` and `SECURITY.md` deployment guides.
  - Verified 100% tenant isolation, integer minor-unit financial calculations, zero secret exposures, and zero TypeScript files.

## [2.3.0] - 2026-07-31

### Added
- **Task 12 - Inventory & Asset Management**:
  - Built 8 Mongoose Models: `AssetCategory`, `Vendor`, `Asset`, `AssetAssignment`, `AssetMaintenance`, `AssetDisposal`, `ConsumableItem`, `StockTransaction`.
  - Built Asset Categories Manager (`/principal/inventory`) supporting code uniqueness per school and annual depreciation rate tracking.
  - Built Vendor Management Directory for supplier profiles with GST numbers and contact details.
  - Built Fixed Assets Directory supporting barcode/asset tag indexing, serial numbers, locations, warranty dates, and purchase cost in minor units.
  - Built Asset Checkouts & Assignments Console for assigning fixed assets to teachers, students, departments, or rooms with expected return tracking.
  - Built Asset Maintenance & Repairs Log and Asset Disposal / Write-Off records.
  - Built Consumable Inventory & Stock Movement Console supporting stock in/out logging, average unit pricing, and low stock alert thresholds.
  - Built `InventoryService.js` engine for asset depreciation calculations and low stock alert triggers.
  - Built Teacher Assigned Assets View (`/teacher/inventory`) for teachers to inspect checked-out items and file damage reports.

## [2.2.0] - 2026-07-31

### Added
- **Task 11 - Library Management**:
  - Built 8 Mongoose Models: `LibraryCategory`, `LibraryBook`, `LibraryBookCopy`, `LibraryMember`, `LibraryIssue`, `LibraryFine`, `LibraryReservation`, `LibraryConfiguration`.
  - Built Master Catalog Management (`/principal/library`) for cataloging books with titles, authors, ISBNs, publisher, edition, and category tags.
  - Built Physical Book Copies Manager with accession number uniqueness, barcode indexing, shelf locations, acquisition details, and status (`available`, `issued`, `reserved`, `lost`, `damaged`, `repair`, `withdrawn`).
  - Built Student and Teacher Library Memberships with borrowing limits, active loan counters, fine balances, and status tracking.
  - Built Circulation Loan & Return Console (`/principal/library/issues`) supporting issue, renewal limit enforcement, return condition logging, and automated overdue fine creation.
  - Built `LibraryFineCalculationService.js` integer minor-unit engine for calculating overdue days, daily rates, lost book penalties, and damaged item charges.
  - Built Library Fine Ledger with payment recording and Principal fine waiver workflow.
  - Built Teacher Library Portal (`/teacher/library`) for catalog searching and copy availability checks.
  - Built Parent Child Library View (`/parent/children/:studentId/library`) displaying active loans, due dates, fine balance, and complete historical borrowing records.

## [2.1.0] - 2026-07-31

### Added
- **Task 10 - Transport Management**:
  - Built 10 Mongoose Models: `TransportVehicle`, `TransportStaff`, `TransportRoute`, `TransportStop`, `TransportAssignment`, `TransportTrip`, `VehicleMaintenance`, `FuelLog`, `VehicleDocument`, `TransportConfiguration`.
  - Built Fleet Vehicles Directory (`/principal/transport/vehicles`) supporting Bus, Van, Mini-Bus with seating capacity, odometer, and compliance document expiry alerts (RC, Insurance, Fitness, Pollution, Permit).
  - Built Transport Staff Directory (`/principal/transport/staff`) for drivers and attendants with licence validation and police verification tracking.
  - Built 4-Step Interactive Route & Stop Builder (`/principal/transport/routes`) with stop ordering and stop-based monthly fee configuration.
  - Built Student Transport Assignment Console (`/principal/transport/assignments`) with route capacity checks and duplicate enrollment prevention.
  - Built Daily Trip Logs (`/principal/transport/trips`) with starting/ending odometer readings.
  - Built Vehicle Maintenance & Repairs Log (`/principal/transport/maintenance`) and Fuel Logs (`/principal/transport/fuel`) using integer minor-unit arithmetic.
  - Built Teacher Route Roster (`/teacher/transport`) for viewing route-wise student lists and stop timings.
  - Built Parent Child Transport Portal (`/parent/children/:studentId/transport`) displaying assigned route, pickup/drop stop, driver contact, and GPS status.
  - Built `GpsService.js` Provider Abstraction returning `integrationConfigured: false` without fake coordinates, displaying a "Live GPS Tracking — Coming Soon" UI banner.

## [2.0.0] - 2026-07-31

### Added
- **Task 9 - Communication Hub (SMS, Email, WhatsApp, Push Notifications & Announcements)**:
  - Built 6 Mongoose Models: `Announcement`, `Notification`, `NotificationTemplate`, `MessageLog`, `EmailQueue`, `SmsQueue`.
  - Built `NotificationDispatcherService.js` central multi-channel engine supporting In-App, Email, SMS, WhatsApp, and Web Push notifications.
  - Built Principal Communication Console (`/principal/communication`) for broadcasting announcements, managing templates, and viewing delivery logs.
  - Built Teacher Class Announcements Console (`/teacher/communication`) restricted strictly to assigned classes.
  - Built Parent and Student Notification Inboxes (`/parent/notifications`, `/student/notifications`).
  - Built Interactive Header Notification Bell dropdown with live unread badge counter.

## [1.9.0] - 2026-07-31

### Added
- **Task 8 - Payroll, Leave, Recruitment and Notice Management**:
  - Built 10 Mongoose HR Models: `SalaryStructure`, `PayrollRun`, `PayrollRecord`, `PayrollAdjustment`, `LeaveType`, `LeaveBalance`, `LeaveRequest`, `JobPost`, `JobApplication`, `Notice`.
  - Built integer minor-unit `PayrollCalculationService` with daily prorated unpaid leave deductions, overtime calculation, bonus pay, and net salary calculation.
  - Built Principal Staff Payroll & Salary Administration (`/principal/payroll`, `/structures`, `/runs`, `/runs/:runId`).
  - Built Monthly Payroll Run workflow (`draft` -> `calculated` -> `approved` -> `paid` -> `locked`).
  - Built Teacher Leave Approvals Console (`/principal/leave`) & Leave Types Manager (`/principal/leave/types`).
  - Built Staff Recruitment Console (`/principal/jobs`) & Candidate Application Pipeline (`/principal/jobs/:jobId/applications`).
  - Built Public Unauthenticated Career Board (`/school/:schoolCode/jobs`) and Candidate Application form (`/school/:schoolCode/jobs/:jobId/apply`).
  - Built School Announcements & Notice Board (`/principal/notices`, `/principal/notices/new`) with role-based target scoping (`teacher`, `parent`, `all`).
  - Built Teacher Workspace views (`/teacher/payroll`, `/teacher/leave`, `/teacher/notices`).
  - Built Parent Portal Notices view (`/parent/notices`).
  - Built Official Printable Teacher Payslip View (`/principal/payroll/records/:recordId/payslip`).

## [1.8.0] - 2026-07-30

### Added
- **Task 7: Fees, Invoices, Receipts and Payment Management**:
  - Implemented 10 Mongoose Models: `FeeCategory`, `FeeStructure`, `StudentFeeAssignment`, `FeeInvoice`, `FeeInvoiceItem`, `FeePayment`, `FeeReceipt`, `FeeConcession`, `FeeAdjustment`, `FeeConfiguration`.
  - Added pure `FeeCalculationService` engine handling decimal-safe monetary arithmetic, balance calculation, late fee rules, and status determination (`issued`, `partial`, `paid`, `overdue`).
  - Added Principal Fee Dashboard (`/principal/fees`) for viewing total billed, total collected, and outstanding amounts.
  - Added Fee Categories (`/principal/fees/categories`) and Fee Structures (`/principal/fees/structures`) directory managers.
  - Added Fee Invoices Console (`/principal/fees/invoices`) for generating student invoices and tracking due dates.
  - Added Fee Payments Register (`/principal/fees/payments`) for recording offline/manual payments (Cash, Bank Transfer, Cheque) with auto-generated receipt snapshots and payment reversal workflow.
  - Added Financial Reports Console (`/principal/fees/reports`) with CSV Export capabilities.
  - Added Official Printable Invoice View (`/principal/fees/invoices/:invoiceId`) and Printable Receipt View (`/principal/fees/receipts/:receiptId`).
  - Upgraded Parent Portal (`/parent/children/:studentId/fees`) for displaying child fee statements and printable invoices.
  - Enforced security rules:
    - Immutability of recorded payments (edits use reversal entries).
    - Draft invoices hidden from parents.
    - Parent-child linkage security check on every request.

## [1.7.0] - 2026-07-30

### Added
- **Task 6: Exams, Results, Report Cards and Student Promotion**:
  - Implemented 6 Mongoose Models: `Exam`, `ExamSchedule`, `StudentMarks`, `GradingScheme`, `Result`, `StudentPromotion`.
  - Added pure `ResultCalculationService` engine calculating subject percentage, grade lookup, pass/fail status, overall percentage, overall grade, and tie-aware student ranking.
  - Added Principal Exam Console (`/principal/exams` & `/principal/exams/new`) for exam creation, schedule setup, and teacher assignments.
  - Added Marks Review Console (`/principal/exams/:examId/marks-review`) with Principal approval & return for correction workflow.
  - Added Results Console (`/principal/exams/:examId/results`) for generating results from approved marks & publishing atomically to parents.
  - Added Printable Official Report Card View (`/parent/children/:studentId/report-card/:resultId`).
  - Added Student Promotion Wizard (`/principal/promotions`) for session-end student promotion, retention, or graduation while preserving complete historical enrollment logs.

## [1.6.0] - 2026-07-30

### Added
- **Task 5: Attendance and Homework Management**:
  - Implemented 3 Mongoose Models: `AttendanceSession`, `StudentAttendance`, `Homework`.
  - Added Interactive Attendance Marking UI (`/teacher/attendance/mark`) for Teachers with Bulk Mark Present, individual status toggles (Present, Absent, Late, Leave), live counts, draft save, and submit modal.
  - Added Principal Attendance Console (`/principal/attendance`) featuring daily school attendance percentage, missing attendance alerts, unlock session capability, record correction, and CSV Export.
  - Added Homework Management (`/teacher/homework` & `/teacher/homework/new`) for creating and publishing homework tasks for assigned classes & subjects.
  - Added Principal Homework Console (`/principal/homework`) for school-wide homework tracking.
  - Upgraded Parent Portal (`/parent/dashboard`) to display real attendance percentage, date-wise history, and published homework assignments for selected linked children.

## [1.5.0] - 2026-07-30

### Added
- **Task 4: Student Management and Parent Family Accounts**:
  - Implemented 5 Mongoose Models: `Student`, `ParentProfile`, `StudentAcademicEnrollment`, `StudentDocument`, `StudentStatusHistory`.
  - Multi-step Student Admission Form (`/principal/students/new`) supporting Create New Family Account or Link Existing Family Account (sibling linking).
  - Student Directory (`/principal/students`) with search, class/section/status filters, pagination, CSV Export, and Print View.
  - Tabbed Student Profile View (`/principal/students/:studentId`).
  - Family Accounts Directory (`/principal/families`) for managing parent family accounts, sibling linking/unlinking, password resets, and account activation toggles.
  - Teacher Student Directory (`/teacher/students`) filtered strictly by assigned classes/sections.
  - Upgraded Parent Portal (`/parent/dashboard`) featuring Family Header Banner, Child Selector for multi-sibling families, and real academic profile display for selected child.

## [1.4.0] - 2026-07-30

### Added
- **Task 3B: Teacher Management**:
  - Implemented 3 Mongoose Models: `Teacher`, `SalaryRecord`, `LeaveRequest`.
  - Added Teacher Management Console, Salary History issuing, Leave approval workflow, and Teacher Portal workspace.

## [1.3.0] - 2026-07-30

### Added
- **Task 3A: School Setup Wizard and Academic Structure Foundation**:
  - Implemented 5 Mongoose Models: `AcademicSession`, `SchoolClass`, `Section`, `Subject`, `SchoolConfiguration`.
  - Added 7-Step Interactive Setup Wizard UI (`/principal/setup`).

## [1.2.0] - 2026-07-30

### Added
- **Task 2B: School Onboarding and Principal Management**:
  - Added Super Admin School CRUD, immediately active Principal onboarding, and real-time platform statistics.

## [1.1.0] - 2026-07-30

### Added
- **Task 2A: Authentication and Database Foundation**:
  - Implemented production models: `School`, `User`, `AuditLog`.
  - Added Super Admin seed script and JWT HttpOnly cookie authentication flow.

## [1.0.0] - 2026-07-30

### Added
- **Module 1: Multi-Tenant Core Architecture**:
  - Shared database multi-tenancy schema with derived `schoolId` session isolation and luxury Tailwind design system.
