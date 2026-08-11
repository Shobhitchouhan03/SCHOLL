import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatCard from '../components/common/StatCard';
import CredentialModal from '../components/common/CredentialModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Power,
  KeyRound,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Settings,
  Clock,
  ExternalLink,
} from 'lucide-react';

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const { user, school } = useAuth();

  const [stats, setStats] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState('teacher'); // 'teacher' | 'parent'
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    loginId: '',
    password: '',
    email: '',
    phone: '',
  });

  const fetchAcademicData = async () => {
    try {
      const res = await api.get('/principal/setup/status');
      if (res.data.success) {
        setAcademicData(res.data);
      }
    } catch (err) {
      console.error('Fetch academic structure error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/users', {
        params: { page, limit: 10, search, role: roleFilter, status: statusFilter },
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/principal/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  useEffect(() => {
    fetchAcademicData();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/principal/users/${userId}/status`);
      if (res.data.success) {
        fetchUsers();
        fetchAcademicData();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to toggle status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/users', {
        ...formData,
        role: newUserRole,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setCreatedCredentials(res.data.credentials);
        setFormData({ name: '', loginId: '', password: '', email: '', phone: '' });
        fetchUsers();
        fetchAcademicData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await api.post(`/principal/users/${resetModalUser._id}/reset-password`, { newPassword });
      if (res.data.success) {
        setResetModalUser(null);
        setNewPassword('');
        setCreatedCredentials(res.data.credentials);
      }
    } catch (err) {
      setResetError(err.customMessage || 'Failed to reset password.');
    }
  };

  const activeSessionName = academicData?.activeSession?.name || '2026-2027';
  const totalClasses = academicData?.classes?.length || 0;
  const totalSections = academicData?.sections?.length || 0;
  const totalSubjects = academicData?.subjects?.length || 0;
  const schoolConfig = academicData?.configuration || {};

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner & Tenant Information */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Principal Console</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    Setup Completed
                  </span>
                </div>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                  Welcome, {user?.name}
                </h1>
                <p className="text-xs text-textMuted mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>School: <strong className="text-darkBrown">{school?.name}</strong></span>
                  <span>•</span>
                  <span>Code: <strong className="font-mono text-chestnut bg-almond/30 px-2 py-0.5 rounded">{school?.schoolCode}</strong></span>
                  <span>•</span>
                  <span>Active Session: <strong className="text-chestnut">{activeSessionName}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="px-3.5 py-1.5 bg-surface text-textMuted border border-almond/50 rounded-xl text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-morning" />
                  <span>Timings: {schoolConfig.schoolStartTime || '08:00'} - {schoolConfig.schoolEndTime || '14:30'}</span>
                </div>

                <button
                  onClick={() => navigate('/principal/setup')}
                  className="px-3 py-1.5 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Settings className="w-3.5 h-3.5 text-chestnut" />
                  <span>Setup Wizard</span>
                </button>
              </div>
            </div>

            {/* Enabled Modules Badges */}
            <div className="pt-3 border-t border-almond/30">
              <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-2">
                Active Tenant Modules
              </span>
              <div className="flex flex-wrap gap-2">
                {(school?.enabledModules || ['Attendance', 'Homework', 'Results', 'Fees', 'Parent Portal', 'Teacher Management', 'Student Management']).map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-chestnut/10 text-chestnut border border-chestnut/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-morning" />
                    <span>{mod}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Academic Management Actions */}
          <div className="bg-white p-5 rounded-2xl border border-almond/40 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-darkBrown uppercase tracking-wider">Academic Structure Management</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/principal/setup')}
                className="p-3 bg-surface hover:bg-almond/20 rounded-xl border border-almond/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-darkBrown flex items-center justify-between">
                  <span>Manage Sessions</span>
                  <Calendar className="w-4 h-4 text-chestnut group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] text-textMuted mt-1 block">{activeSessionName} Active</span>
              </button>

              <button
                onClick={() => navigate('/principal/setup')}
                className="p-3 bg-surface hover:bg-almond/20 rounded-xl border border-almond/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-darkBrown flex items-center justify-between">
                  <span>Manage Classes</span>
                  <BookOpen className="w-4 h-4 text-chestnut group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] text-textMuted mt-1 block">{totalClasses} Classes</span>
              </button>

              <button
                onClick={() => navigate('/principal/setup')}
                className="p-3 bg-surface hover:bg-almond/20 rounded-xl border border-almond/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-darkBrown flex items-center justify-between">
                  <span>Manage Sections</span>
                  <Layers className="w-4 h-4 text-chestnut group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] text-textMuted mt-1 block">{totalSections} Sections</span>
              </button>

              <button
                onClick={() => navigate('/principal/setup')}
                className="p-3 bg-surface hover:bg-almond/20 rounded-xl border border-almond/40 text-left transition-all group"
              >
                <div className="text-xs font-bold text-darkBrown flex items-center justify-between">
                  <span>Manage Subjects</span>
                  <BookOpen className="w-4 h-4 text-chestnut group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[10px] text-textMuted mt-1 block">{totalSubjects} Subjects</span>
              </button>
            </div>
          </div>

          {/* 6 Minimal Principal Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Students"
              value={stats?.totalStudents ?? 0}
              subtitle="Enrolled active students"
              icon={GraduationCap}
              color="chestnut"
            />
            <StatCard
              title="Total Teachers"
              value={stats?.totalTeachers ?? 0}
              subtitle="Active teaching staff"
              icon={Users}
              color="morning"
            />
            <StatCard
              title="Attendance Today"
              value={stats?.attendanceToday ?? '95%'}
              subtitle="Student presence"
              icon={ShieldCheck}
              color="success"
            />
            <StatCard
              title="Pending Fees"
              value={stats?.pendingFees ?? '₹0'}
              subtitle="Outstanding dues"
              icon={BookOpen}
              color="warning"
            />
            <StatCard
              title="Upcoming Exams"
              value={stats?.upcomingExams ?? 0}
              subtitle="Scheduled assessments"
              icon={Calendar}
              color="darkBrown"
            />
            <StatCard
              title="Pending Approvals"
              value={stats?.pendingApprovals ?? 0}
              subtitle="Leave & request queue"
              icon={Clock}
              color="chestnut"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-darkBrown">User Management</h2>
              <p className="text-xs text-textMuted">Teachers, Staff & Parent Accounts</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/principal/teachers')}
                className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-3.5 py-2 rounded-xl font-semibold text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Teacher</span>
              </button>
              <button
                onClick={() => navigate('/principal/students/new')}
                className="inline-flex items-center space-x-2 bg-morning hover:bg-chestnut text-white px-3.5 py-2 rounded-xl font-semibold text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Admit Student</span>
              </button>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">User Directory</h3>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or ID..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-44 sm:w-56"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Roles</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                  <option value="principal">Principals</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">User Name</th>
                      <th className="py-3 px-4">Login ID</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-darkBrown">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-chestnut font-bold">{u.loginId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                              u.role === 'teacher'
                                ? 'bg-morning/15 text-morning'
                                : u.role === 'parent'
                                ? 'bg-success/15 text-success'
                                : 'bg-chestnut/15 text-chestnut'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-textMuted">
                          <div>{u.email || 'N/A'}</div>
                          <div className="text-[10px]">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setResetModalUser(u)}
                              title="Reset Password"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-warning hover:border-warning/30 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(u._id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                u.isActive
                                  ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                  : 'bg-success/10 text-success hover:bg-success/20'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{u.isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-almond/30 text-xs">
                <span className="text-textMuted">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-almond text-textMuted hover:bg-surface disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-almond text-textMuted hover:bg-surface disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 relative">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30 mb-4">
              <h3 className="text-base font-bold text-darkBrown capitalize">
                Create New {newUserRole} Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-textMuted hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Login ID (Unique per school) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TEACHER_SARAH"
                  value={formData.loginId}
                  onChange={(e) => setFormData({ ...formData, loginId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Set Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter initial password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+1 555-0182"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-chestnut hover:bg-darkBrown text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : `Create ${newUserRole} & Show Credentials`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50">
            <h3 className="text-base font-bold text-darkBrown mb-1">Reset Password</h3>
            <p className="text-xs text-textMuted mb-4">
              Setting new password for <span className="font-bold text-chestnut">{resetModalUser.name}</span> ({resetModalUser.loginId}).
            </p>

            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-warning hover:bg-darkBrown text-white text-xs font-bold shadow-sm transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Display Modal */}
      <CredentialModal
        isOpen={Boolean(createdCredentials)}
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
    </div>
  );
};

export default PrincipalDashboard;
