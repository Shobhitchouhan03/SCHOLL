import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import SetupWizardPage from './pages/principal/SetupWizardPage';
import TeacherManagementPage from './pages/principal/TeacherManagementPage';

// Student & Family Pages
import StudentDirectoryPage from './pages/principal/StudentDirectoryPage';
import AddStudentPage from './pages/principal/AddStudentPage';
import StudentProfilePage from './pages/principal/StudentProfilePage';
import FamilyDirectoryPage from './pages/principal/FamilyDirectoryPage';
import TeacherStudentDirectoryPage from './pages/teacher/TeacherStudentDirectoryPage';

// Attendance & Homework Pages
import TeacherAttendanceMarkingPage from './pages/teacher/TeacherAttendanceMarkingPage';
import TeacherHomeworkPage from './pages/teacher/TeacherHomeworkPage';
import CreateHomeworkPage from './pages/teacher/CreateHomeworkPage';
import PrincipalAttendanceOverviewPage from './pages/principal/PrincipalAttendanceOverviewPage';
import PrincipalHomeworkConsolePage from './pages/principal/PrincipalHomeworkConsolePage';

// Exam & Result Pages
import PrincipalExamsDirectoryPage from './pages/principal/PrincipalExamsDirectoryPage';
import CreateExamPage from './pages/principal/CreateExamPage';
import PrincipalMarksReviewPage from './pages/principal/PrincipalMarksReviewPage';
import PrincipalResultsConsolePage from './pages/principal/PrincipalResultsConsolePage';
import StudentPromotionPage from './pages/principal/StudentPromotionPage';
import TeacherExamsPage from './pages/teacher/TeacherExamsPage';
import TeacherMarksEntryPage from './pages/teacher/TeacherMarksEntryPage';
import ParentResultsPage from './pages/parent/ParentResultsPage';
import ReportCardPage from './pages/common/ReportCardPage';

// Fee & Payment Pages
import PrincipalFeesDashboardPage from './pages/principal/PrincipalFeesDashboardPage';
import FeeCategoriesPage from './pages/principal/FeeCategoriesPage';
import FeeStructuresPage from './pages/principal/FeeStructuresPage';
import FeeInvoicesPage from './pages/principal/FeeInvoicesPage';
import FeePaymentsPage from './pages/principal/FeePaymentsPage';
import FeeReportsPage from './pages/principal/FeeReportsPage';
import PrintableInvoicePage from './pages/common/PrintableInvoicePage';
import PrintableReceiptPage from './pages/common/PrintableReceiptPage';
import ParentFeesPage from './pages/parent/ParentFeesPage';

// Task 8 HR & Payroll Pages
import PrincipalPayrollPage from './pages/principal/PrincipalPayrollPage';
import SalaryStructuresPage from './pages/principal/SalaryStructuresPage';
import PayrollRunsPage from './pages/principal/PayrollRunsPage';
import PayrollRunDetailsPage from './pages/principal/PayrollRunDetailsPage';
import PrincipalLeavePage from './pages/principal/PrincipalLeavePage';
import LeaveTypesPage from './pages/principal/LeaveTypesPage';
import PrincipalJobsPage from './pages/principal/PrincipalJobsPage';
import JobApplicationsPage from './pages/principal/JobApplicationsPage';
import PrincipalNoticesPage from './pages/principal/PrincipalNoticesPage';
import CreateNoticePage from './pages/principal/CreateNoticePage';
import TeacherPayrollPage from './pages/teacher/TeacherPayrollPage';
import TeacherLeavePage from './pages/teacher/TeacherLeavePage';
import TeacherNoticesPage from './pages/teacher/TeacherNoticesPage';
import ParentNoticesPage from './pages/parent/ParentNoticesPage';
import ParentAttendancePage from './pages/parent/ParentAttendancePage';
import ParentHomeworkPage from './pages/parent/ParentHomeworkPage';
import ParentExamsPage from './pages/parent/ParentExamsPage';
import ParentReportCardPage from './pages/parent/ParentReportCardPage';
import ParentStudentLeavePage from './pages/parent/ParentStudentLeavePage';
import PayslipPage from './pages/common/PayslipPage';
import PublicSchoolJobsPage from './pages/public/PublicSchoolJobsPage';
import PublicApplyJobPage from './pages/public/PublicApplyJobPage';
import SchoolPortalLoginPage from './pages/public/SchoolPortalLoginPage';

// HR Workspace Pages
import HROverviewPage from './pages/hr/HROverviewPage';
import HRDepartmentsPage from './pages/hr/HRDepartmentsPage';
import HRStaffAttendancePage from './pages/hr/HRStaffAttendancePage';
import HRDocumentsPage from './pages/hr/HRDocumentsPage';
import HRHolidaysPage from './pages/hr/HRHolidaysPage';
import HRAssetsPage from './pages/hr/HRAssetsPage';
import HRTransportStaffPage from './pages/hr/HRTransportStaffPage';
import HRReportsPage from './pages/hr/HRReportsPage';
import TeacherAddStudentPage from './pages/teacher/TeacherAddStudentPage';

// Task 9 Communication Hub Pages
import PrincipalCommunicationPage from './pages/principal/PrincipalCommunicationPage';
import TeacherCommunicationPage from './pages/teacher/TeacherCommunicationPage';
import ParentNotificationsPage from './pages/parent/ParentNotificationsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';

// Task 10 Transport Management Pages
import PrincipalTransportPage from './pages/principal/PrincipalTransportPage';
import TeacherTransportPage from './pages/teacher/TeacherTransportPage';
import ParentTransportPage from './pages/parent/ParentTransportPage';

// Task 11 Library Management Pages
import PrincipalLibraryPage from './pages/principal/PrincipalLibraryPage';
import TeacherLibraryPage from './pages/teacher/TeacherLibraryPage';
import ParentLibraryPage from './pages/parent/ParentLibraryPage';

// Task 12 Inventory & Asset Management Pages
import PrincipalInventoryPage from './pages/principal/PrincipalInventoryPage';
import TeacherInventoryPage from './pages/teacher/TeacherInventoryPage';

import GuestRoute from './components/routes/GuestRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';
import RoleRoute from './components/routes/RoleRoute';

// New Patch 5A Pages
import AccountantDashboard from './pages/AccountantDashboard';
import PrincipalBrandingPage from './pages/principal/PrincipalBrandingPage';
import PrincipalGalleryPage from './pages/principal/PrincipalGalleryPage';
import SchoolSettingsPage from './pages/principal/SchoolSettingsPage';
import PublicSchoolWebsitePage from './pages/public/PublicSchoolWebsitePage';

// Root Redirect handler
const RootRedirect = () => {
  const { user, school, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'superAdmin') return <Navigate to="/super-admin/dashboard" replace />;
  if (user.role === 'principal') {
    return school?.setupStatus === 'completed'
      ? <Navigate to="/principal/dashboard" replace />
      : <Navigate to="/principal/setup" replace />;
  }
  if (user.role === 'accountant') return <Navigate to="/accountant/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student/notifications" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Guest Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <GuestRoute>
                <SuperAdminLoginPage />
              </GuestRoute>
            }
          />
          <Route path="/super-admin/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/super-admin/dashboard" replace />} />

          {/* Public Website & School Portal Routes */}
          <Route path="/s/:schoolSlug" element={<PublicSchoolWebsitePage />} />
          <Route path="/s/:schoolSlug/about" element={<PublicSchoolWebsitePage />} />
          <Route path="/s/:schoolSlug/gallery" element={<PublicSchoolWebsitePage />} />
          <Route path="/s/:schoolSlug/notices" element={<PublicSchoolWebsitePage />} />
          <Route path="/s/:schoolSlug/login" element={<SchoolPortalLoginPage />} />
          <Route path="/s/:schoolSlug/jobs" element={<PublicSchoolJobsPage />} />
          <Route path="/school/:schoolCode/jobs" element={<PublicSchoolJobsPage />} />
          <Route path="/school/:schoolCode/jobs/:jobId/apply" element={<PublicApplyJobPage />} />

          {/* Accountant Routes */}
          <Route
            path="/accountant/dashboard"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <AccountantDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/accountant/fees"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <PrincipalFeesDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/accountant/invoices"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <FeeInvoicesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/accountant/payments"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <FeePaymentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/accountant/payroll"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <PayrollRunsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/accountant/reports"
            element={
              <RoleRoute allowedRoles={['accountant', 'principal']}>
                <FeeReportsPage />
              </RoleRoute>
            }
          />

          {/* Principal Settings, Branding & Gallery Routes */}
          <Route
            path="/principal/branding"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalBrandingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/gallery"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalGalleryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/settings"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <SchoolSettingsPage />
              </RoleRoute>
            }
          />

          {/* Super Admin Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <RoleRoute allowedRoles={['superAdmin']}>
                <SuperAdminDashboard />
              </RoleRoute>
            }
          />

          {/* Principal Setup Routes */}
          <Route
            path="/principal/setup"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <SetupWizardPage />
              </RoleRoute>
            }
          />

          {/* Principal Dashboard */}
          <Route
            path="/principal/dashboard"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalDashboard />
              </RoleRoute>
            }
          />

          {/* Task 12 Inventory Management Routes */}
          <Route
            path="/principal/inventory"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalInventoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/inventory"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherInventoryPage />
              </RoleRoute>
            }
          />

          {/* Task 11 Library Management Routes */}
          <Route
            path="/principal/library"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalLibraryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/library"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherLibraryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/children/:studentId/library"
            element={
              <RoleRoute allowedRoles={['parent', 'principal']}>
                <ParentLibraryPage />
              </RoleRoute>
            }
          />

          {/* Task 10 Transport Management Routes */}
          <Route
            path="/principal/transport"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalTransportPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/transport"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherTransportPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/children/:studentId/transport"
            element={
              <RoleRoute allowedRoles={['parent', 'principal']}>
                <ParentTransportPage />
              </RoleRoute>
            }
          />

          {/* Task 9 Communication Hub Routes */}
          <Route
            path="/principal/communication"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalCommunicationPage />
              </RoleRoute>
            }
          />

          {/* HR Workspace Dedicated Routes */}
          <Route
            path="/principal/hr"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HROverviewPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/staff"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <TeacherManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/departments"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRDepartmentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/staff-attendance"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRStaffAttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/payroll"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalPayrollPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/payroll/structures"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <SalaryStructuresPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/payroll/runs"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PayrollRunsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/payroll/runs/:runId"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PayrollRunDetailsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/leave"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalLeavePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/leave/types"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <LeaveTypesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/recruitment"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalJobsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/recruitment/:jobId/applications"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <JobApplicationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/documents"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRDocumentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/holidays"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRHolidaysPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/notices"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalNoticesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/notices/new"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <CreateNoticePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/assets"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRAssetsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/transport-staff"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRTransportStaffPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/hr/reports"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <HRReportsPage />
              </RoleRoute>
            }
          />

          {/* Legacy & Direct Alias Principal HR Routes */}
          <Route
            path="/principal/payroll"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalPayrollPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/payroll/structures"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <SalaryStructuresPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/payroll/runs"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PayrollRunsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/payroll/runs/:runId"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PayrollRunDetailsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/payroll/records/:recordId/payslip"
            element={
              <RoleRoute allowedRoles={['principal', 'teacher']}>
                <PayslipPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/leave"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalLeavePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/leave/types"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <LeaveTypesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/jobs"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalJobsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/jobs/:jobId/applications"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <JobApplicationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/notices"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalNoticesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/notices/new"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <CreateNoticePage />
              </RoleRoute>
            }
          />

          {/* Fee Routes */}
          <Route
            path="/principal/fees"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalFeesDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/categories"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FeeCategoriesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/structures"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FeeStructuresPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/invoices"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FeeInvoicesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/invoices/:invoiceId"
            element={
              <RoleRoute allowedRoles={['principal', 'parent']}>
                <PrintableInvoicePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/payments"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FeePaymentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/receipts/:receiptId"
            element={
              <RoleRoute allowedRoles={['principal', 'parent']}>
                <PrintableReceiptPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/fees/reports"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FeeReportsPage />
              </RoleRoute>
            }
          />

          {/* Exam Routes */}
          <Route
            path="/principal/exams"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalExamsDirectoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/exams/new"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <CreateExamPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/exams/:examId/marks-review"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalMarksReviewPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/exams/:examId/results"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalResultsConsolePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/promotions"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <StudentPromotionPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/attendance"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalAttendanceOverviewPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/homework"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <PrincipalHomeworkConsolePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/teachers"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <TeacherManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/students"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <StudentDirectoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/students/new"
            element={<Navigate to="/principal/students" replace />}
          />
          <Route
            path="/principal/students/:studentId"
            element={
              <RoleRoute allowedRoles={['principal', 'teacher']}>
                <StudentProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/principal/families"
            element={
              <RoleRoute allowedRoles={['principal']}>
                <FamilyDirectoryPage />
              </RoleRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/students/new"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherAddStudentPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/communication"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherCommunicationPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/payroll"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherPayrollPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/payroll/:recordId/payslip"
            element={
              <RoleRoute allowedRoles={['teacher', 'principal']}>
                <PayslipPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/leave"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherLeavePage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/notices"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherNoticesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherExamsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:examId/marks-entry"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherMarksEntryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/attendance/mark"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherAttendanceMarkingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/homework"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherHomeworkPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/homework/new"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <CreateHomeworkPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/students"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <TeacherStudentDirectoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/students/new"
            element={
              <RoleRoute allowedRoles={['teacher']}>
                <AddStudentPage />
              </RoleRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent/dashboard"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/attendance"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentAttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/homework"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentHomeworkPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/exams"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentExamsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/report-card"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentReportCardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/fees"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentFeesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/student-leave"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentStudentLeavePage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent/notices"
            element={
              <RoleRoute allowedRoles={['parent']}>
                <ParentNoticesPage />
              </RoleRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/notifications"
            element={
              <RoleRoute allowedRoles={['student']}>
                <StudentNotificationsPage />
              </RoleRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
