import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  Settings,
  X,
  UserCheck,
  ShieldCheck,
  Award,
  DollarSign,
  Briefcase,
  Bell,
  CalendarDays,
  Send,
  Bus,
  Library,
  Package,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user, workspaceMode, setWorkspaceMode } = useAuth();

  const getMenuItems = () => {
    switch (user?.role) {
      case 'superAdmin':
        return [
          { label: 'Overview', path: '/super-admin/dashboard', icon: LayoutDashboard },
          { label: 'Schools', path: '/super-admin/dashboard', icon: Building2 },
        ];
      case 'accountant':
        return [
          { label: 'Overview', path: '/accountant/dashboard', icon: LayoutDashboard },
          { label: 'Fee Payments', path: '/accountant/payments', icon: DollarSign },
          { label: 'Invoices', path: '/accountant/invoices', icon: FileText },
          { label: 'Payroll Payouts', path: '/accountant/payroll', icon: Briefcase },
          { label: 'Financial Reports', path: '/accountant/reports', icon: FileSpreadsheet },
        ];
      case 'principal':
        if (workspaceMode === 'hr') {
          return [
            { label: 'HR Overview', path: '/principal/hr', icon: LayoutDashboard },
            { label: 'Staff Directory & Onboarding', path: '/principal/hr/staff', icon: Users },
            { label: 'Staff & Teacher Attendance', path: '/principal/hr/staff-attendance', icon: ShieldCheck },
            { label: 'Departments & Designations', path: '/principal/hr/departments', icon: UserCheck },
            { label: 'Library Operations', path: '/principal/library', icon: Library },
            { label: 'Payroll', path: '/principal/hr/payroll', icon: DollarSign },
            { label: 'Leave Approvals', path: '/principal/hr/leave', icon: CalendarDays },
            { label: 'Recruitment & Jobs', path: '/principal/hr/recruitment', icon: Briefcase },
            { label: 'Employee Documents', path: '/principal/hr/documents', icon: FileText },
            { label: 'Holiday Calendar', path: '/principal/hr/holidays', icon: CalendarDays },
            { label: 'Staff Notices', path: '/principal/hr/notices', icon: Bell },
            { label: 'Staff Assets', path: '/principal/hr/assets', icon: Package },
            { label: 'Transport Staff', path: '/principal/hr/transport-staff', icon: Bus },
            { label: 'HR Reports', path: '/principal/hr/reports', icon: FileSpreadsheet },
          ];
        }
        return [
          { label: 'Overview', path: '/principal/dashboard', icon: LayoutDashboard },
          { label: 'Academic Setup', path: '/principal/setup', icon: Settings },
          { label: 'Students Summary', path: '/principal/students', icon: GraduationCap },
          { label: 'Teachers Summary', path: '/principal/teachers', icon: Users },
          { label: 'Notices', path: '/principal/notices', icon: Bell },
          { label: 'School Branding', path: '/principal/branding', icon: Award },
          { label: 'Gallery', path: '/principal/gallery', icon: BookOpen },
          { label: 'Reports', path: '/principal/hr/reports', icon: FileSpreadsheet },
          { label: 'School Settings', path: '/principal/settings', icon: Settings },
        ];
      case 'teacher':
        const teacherType = user?.teacherType || 'Class Teacher';
        const isClassTeacher = teacherType === 'Class Teacher' || teacherType === 'Class & Subject Teacher';
        const items = [
          { label: 'Overview', path: '/teacher/dashboard', icon: LayoutDashboard },
          { label: 'My Students', path: '/teacher/students', icon: GraduationCap },
        ];

        if (isClassTeacher) {
          items.push({ label: 'Subject Teachers', path: '/teacher/subject-teachers', icon: Users });
        }

        if (teacherType === 'Librarian') {
          items.push({ label: 'Library Operations', path: '/principal/library/books', icon: Library });
        }

        if (teacherType === 'Transport Staff Viewer') {
          items.push({ label: 'Transport Operations', path: '/principal/transport/vehicles', icon: Bus });
        }

        items.push(
          { label: 'Attendance', path: '/teacher/attendance/mark', icon: ShieldCheck },
          { label: 'Marks', path: '/teacher/exams', icon: Award },
          { label: 'Leave', path: '/teacher/leave', icon: CalendarDays },
          { label: 'Announcements', path: '/teacher/notices', icon: Bell }
        );

        return items;
      case 'hr':
        return [
          { label: 'HR Overview', path: '/principal/hr', icon: LayoutDashboard },
          { label: 'Staff Directory', path: '/principal/teachers', icon: Users },
          { label: 'Staff Attendance', path: '/principal/hr/staff-attendance', icon: ShieldCheck },
          { label: 'Library Operations', path: '/principal/library/books', icon: Library },
          { label: 'Transport Operations', path: '/principal/transport/vehicles', icon: Bus },
          { label: 'Leave Approvals', path: '/principal/hr/leave', icon: CalendarDays },
          { label: 'HR Reports', path: '/principal/hr/reports', icon: FileSpreadsheet },
        ];
      case 'parent':
        return [
          { label: 'Overview', path: '/parent/dashboard', icon: LayoutDashboard },
          { label: 'Attendance', path: '/parent/attendance', icon: ShieldCheck },
          { label: 'Results', path: '/parent/exams', icon: Award },
          { label: 'Report Card', path: '/parent/report-card', icon: FileText },
          { label: 'Fees', path: '/parent/fees', icon: DollarSign },
          { label: 'Transport', path: '/parent/dashboard', icon: Bus },
          { label: 'Library', path: '/parent/dashboard', icon: Library },
          { label: 'Leave', path: '/parent/student-leave', icon: CalendarDays },
          { label: 'Notices', path: '/parent/notices', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white border-r border-almond/40">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-almond/30 md:hidden">
          <div className="font-bold text-darkBrown text-lg">Menu</div>
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg hover:bg-surface text-textMuted"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'text-textMuted hover:bg-surface hover:text-textMain'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-almond/30 space-y-2">
        {user?.role === 'principal' && workspaceMode === 'hr' && (
          <button
            onClick={() => {
              setWorkspaceMode('principal');
              if (onMobileClose) onMobileClose();
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold bg-chestnut text-white hover:bg-darkBrown transition-all shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Switch to Principal Workspace</span>
          </button>
        )}
        <div className="p-3 bg-surface rounded-xl border border-almond/40 text-xs text-textMuted flex flex-col gap-1">
          <span className="font-semibold text-textMain">Multi-Tenant Isolation</span>
          <span>Security Protocol Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-darkBrown/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
