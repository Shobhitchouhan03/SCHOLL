import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Briefcase,
  DollarSign,
  CalendarDays,
  FileText,
  UserCheck,
  Bell,
  Package,
  Bus,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Award,
  Library,
} from 'lucide-react';

const HROverviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingLeaves: 0,
    openJobs: 0,
    totalAssets: 0,
    transportStaffCount: 0,
  });

  const fetchHRStats = async () => {
    try {
      setLoading(true);
      const [tRes, lRes, jRes, aRes, sRes] = await Promise.all([
        api.get('/principal/teachers').catch(() => ({ data: {} })),
        api.get('/principal/leave/requests').catch(() => ({ data: {} })),
        api.get('/principal/jobs').catch(() => ({ data: {} })),
        api.get('/principal/inventory/assignments').catch(() => ({ data: {} })),
        api.get('/principal/transport/staff').catch(() => ({ data: {} })),
      ]);

      setStats({
        totalTeachers: tRes.data?.teachers?.length || 0,
        pendingLeaves: (lRes.data?.leaves || lRes.data?.requests || []).filter((r) => r.status === 'pending')?.length || 0,
        openJobs: jRes.data?.jobs?.filter((j) => j.status === 'active')?.length || 0,
        totalAssets: aRes.data?.assignments?.length || 0,
        transportStaffCount: sRes.data?.staff?.length || 0,
      });
    } catch (err) {
      console.error('Fetch HR stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRStats();
  }, []);

  const hrModules = [
    { title: 'Staff Directory & Onboarding', path: '/principal/hr/staff', desc: 'Onboard & manage teaching and non-teaching staff.', icon: Users, color: 'chestnut' },
    { title: 'Departments & Designations', path: '/principal/hr/departments', desc: 'Configure school departments and employee designations.', icon: UserCheck, color: 'morning' },
    { title: 'Library Operations', path: '/principal/library', desc: 'Catalog books, member access, issuance, and overdue fines.', icon: Library, color: 'chestnut' },
    { title: 'Payroll Workspace', path: '/principal/hr/payroll', desc: 'Manage salary structures, pay runs, and generate payslips.', icon: DollarSign, color: 'success' },
    { title: 'Leave Approvals', path: '/principal/hr/leave', desc: 'Review staff leave applications and configure leave policies.', icon: CalendarDays, color: 'warning' },
    { title: 'Recruitment & Jobs', path: '/principal/hr/recruitment', desc: 'Post vacancies, review applications, and manage hiring.', icon: Briefcase, color: 'darkBrown' },
    { title: 'Employee Documents', path: '/principal/hr/documents', desc: 'Store and verify staff contracts, IDs, and certificates.', icon: FileText, color: 'chestnut' },
    { title: 'Holiday Calendar', path: '/principal/hr/holidays', desc: 'Manage official school holidays and academic breaks.', icon: CalendarDays, color: 'morning' },
    { title: 'Staff Notices', path: '/principal/hr/notices', desc: 'Broadcast HR circulars, announcements, and notices to staff.', icon: Bell, color: 'success' },
    { title: 'Staff Assets', path: '/principal/hr/assets', desc: 'Track employee-issued assets, laptops, equipment, and returns.', icon: Package, color: 'warning' },
    { title: 'Transport Staff', path: '/principal/hr/transport-staff', desc: 'Manage drivers, attendants, licensing, and route assignments.', icon: Bus, color: 'darkBrown' },
    { title: 'HR Reports', path: '/principal/hr/reports', desc: 'Generate payroll, leave, attendance, and recruitment reports.', icon: FileSpreadsheet, color: 'chestnut' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-morning uppercase tracking-wider">HR & Staff Workspace</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-morning/15 text-morning flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated Principal Session
                </span>
              </div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Human Resources Control Center
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Centralized workspace for staff management, payroll, recruitment, leaves, documents, and HR operations.
              </p>
            </div>
          </div>

          {/* HR Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Staff" value={stats.totalTeachers} subtitle="Teaching & Admin staff" icon={Users} color="chestnut" />
            <StatCard title="Pending Leaves" value={stats.pendingLeaves} subtitle="Applications queue" icon={CalendarDays} color="warning" />
            <StatCard title="Open Positions" value={stats.openJobs} subtitle="Active recruitment" icon={Briefcase} color="darkBrown" />
            <StatCard title="Issued Assets" value={stats.totalAssets} subtitle="Assigned staff equipment" icon={Package} color="success" />
          </div>

          {/* HR Workspace Modules Directory Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-darkBrown uppercase tracking-wider">HR Operational Modules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.title}
                    onClick={() => navigate(mod.path)}
                    className="bg-white p-5 rounded-2xl border border-almond/40 shadow-card hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-chestnut/10 text-chestnut flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut group-hover:translate-x-1 transition-all" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-darkBrown group-hover:text-chestnut transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-textMuted mt-1 leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HROverviewPage;
