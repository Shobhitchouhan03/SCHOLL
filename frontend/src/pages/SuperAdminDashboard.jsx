import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatCard from '../components/common/StatCard';
import CredentialModal from '../components/common/CredentialModal';
import DeleteSchoolModal from '../components/common/DeleteSchoolModal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Users,
  Shield,
  Plus,
  Search,
  Power,
  AlertCircle,
  X,
  Database,
  Activity,
  Clock,
  Server,
  Settings,
  KeyRound,
  CheckSquare,
  Square,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  Calendar,
  Trash2,
} from 'lucide-react';

const SUPPORTED_MODULES = [
  'Attendance',
  'Homework',
  'Results',
  'Fees',
  'Salary',
  'Recruitment',
  'Leave',
  'Parent Portal',
  'Teacher Management',
  'Student Management',
];

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  // System Telemetry State
  const [dbStatus, setDbStatus] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [deletingSchool, setDeletingSchool] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Manage / Edit School Modal State
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [editTab, setEditTab] = useState('details'); // 'details' | 'modules' | 'subscription' | 'resetPassword'
  const [editFormData, setEditFormData] = useState({});
  const [editModules, setEditModules] = useState([]);
  const [editSubscription, setEditSubscription] = useState({});
  const [newPrincipalPass, setNewPrincipalPass] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [subdomainInput, setSubdomainInput] = useState('');
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomainInput.trim() || !selectedSchool) return;
    try {
      const res = await api.post(`/super-admin/schools/${selectedSchool._id}/domains`, {
        domain: newDomainInput,
      });
      if (res.data.success) {
        setEditMessage({ type: 'success', text: res.data.message });
        setNewDomainInput('');
        setSelectedSchool({ ...selectedSchool, customDomains: res.data.customDomains });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to add custom domain.' });
    }
  };

  const handleRemoveDomain = async (domainName) => {
    if (!selectedSchool) return;
    try {
      const res = await api.delete(`/super-admin/schools/${selectedSchool._id}/domains/${encodeURIComponent(domainName)}`);
      if (res.data.success) {
        setEditMessage({ type: 'success', text: res.data.message });
        setSelectedSchool({ ...selectedSchool, customDomains: res.data.customDomains });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to remove custom domain.' });
    }
  };

  const handleUpdateDomainStatus = async (domainName, status) => {
    if (!selectedSchool) return;
    try {
      const res = await api.patch(`/super-admin/schools/${selectedSchool._id}/domains/${encodeURIComponent(domainName)}/status`, { status });
      if (res.data.success) {
        setEditMessage({ type: 'success', text: res.data.message });
        setSelectedSchool({ ...selectedSchool, customDomains: res.data.customDomains });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update domain status.' });
    }
  };

  const handleSaveSubdomain = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;
    try {
      const res = await api.patch(`/super-admin/schools/${selectedSchool._id}/subdomain`, { subdomain: subdomainInput });
      if (res.data.success) {
        setEditMessage({ type: 'success', text: res.data.message });
        setSelectedSchool({ ...selectedSchool, subdomain: res.data.subdomain });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update subdomain.' });
    }
  };

  // New School Form State
  const [formData, setFormData] = useState({
    name: '',
    schoolCode: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logoUrl: '',
    subscriptionPlan: 'Standard',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabledModules: [
      'Attendance',
      'Homework',
      'Results',
      'Fees',
      'Parent Portal',
      'Teacher Management',
      'Student Management',
    ],
    principalName: '',
    principalLoginId: '',
    principalPassword: '',
    confirmPassword: '',
    principalEmail: '',
    principalPhone: '',
  });

  const fetchTelemetry = async () => {
    try {
      const dbRes = await api.get('/health/database');
      if (dbRes.data.success) setDbStatus(dbRes.data.database);

      const healthRes = await api.get('/health');
      setApiHealth(healthRes.data);
    } catch (err) {
      console.error('Telemetry fetch error', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/super-admin/stats');
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/schools', {
        params: { page, limit: 10, search, status: statusFilter },
      });
      if (res.data?.success) {
        const resData = res.data || {};
        const list = Array.isArray(resData.schools) ? resData.schools : [];
        const totalPages = Number(resData.pages || resData.pagination?.pages || 1);
        const currentPage = Number(resData.page || resData.pagination?.page || page || 1);
        const totalCount = Number(resData.total || resData.pagination?.total || list.length || 0);

        setSchools(list);
        setPagination({ page: currentPage, pages: totalPages, total: totalCount });
      }
    } catch (err) {
      console.error('Fetch schools error:', err);
      setSchools([]);
      setPagination({ total: 0, pages: 1, page: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [page, search, statusFilter]);

  const handleToggleStatus = async (schoolId) => {
    try {
      const res = await api.patch(`/super-admin/schools/${schoolId}/status`);
      if (res.data.success) {
        fetchSchools();
        fetchStats();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to toggle school status');
    }
  };

  const initialFormState = {
    name: '',
    schoolCode: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logoUrl: '',
    subscriptionPlan: 'Standard',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    enabledModules: [
      'Attendance',
      'Homework',
      'Results',
      'Fees',
      'Parent Portal',
      'Teacher Management',
      'Student Management',
    ],
    principalName: '',
    principalLoginId: '',
    principalPassword: '',
    confirmPassword: '',
    principalEmail: '',
    principalPhone: '',
  };

  const [toastMessage, setToastMessage] = useState(null);

  const resetCreateForm = () => {
    setFormData(initialFormState);
    setFormError('');
  };

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submissions

    setFormError('');

    if (formData.principalPassword !== formData.confirmPassword) {
      setFormError('Password and Confirm Password do not match.');
      return;
    }

    if (formData.principalPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/super-admin/schools', formData);
      if (res.data.success) {
        // 1. Immediately close Create School Modal
        setIsCreateModalOpen(false);

        // 2. Open Credential Modal with created credentials
        setCreatedCredentials(res.data.credentials);

        // 3. Reset form data for next use
        resetCreateForm();

        // 4. Refresh schools table & stats
        fetchSchools();
        fetchStats();

        // 5. Show success toast
        showToast('success', `School '${res.data.school?.name || formData.name}' created successfully!`);
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to create school.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenManageModal = (school) => {
    setSelectedSchool(school);
    setEditTab('details');
    setEditFormData({
      name: school.name || '',
      email: school.email || '',
      phone: school.phone || '',
      address: school.address || '',
      website: school.website || '',
      logoUrl: school.logoUrl || '',
    });
    setEditModules(school.enabledModules || []);
    setEditSubscription({
      status: school.subscription?.status || 'active',
      plan: school.subscription?.plan || 'Standard',
      expiresAt: school.subscription?.expiresAt
        ? new Date(school.subscription.expiresAt).toISOString().split('T')[0]
        : '',
    });
    setNewPrincipalPass('');
    setEditMessage({ type: '', text: '' });
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });
    try {
      const res = await api.put(`/super-admin/schools/${selectedSchool._id}`, editFormData);
      if (res.data.success) {
        setEditMessage({ type: 'success', text: 'School details updated successfully.' });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: err.customMessage || 'Failed to update details.' });
    }
  };

  const handleSaveModules = async () => {
    setEditMessage({ type: '', text: '' });
    try {
      const res = await api.patch(`/super-admin/schools/${selectedSchool._id}/modules`, { enabledModules: editModules });
      if (res.data.success) {
        setEditMessage({ type: 'success', text: 'Enabled modules updated successfully.' });
        fetchSchools();
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: err.customMessage || 'Failed to update modules.' });
    }
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });
    try {
      const res = await api.patch(`/super-admin/schools/${selectedSchool._id}/subscription`, editSubscription);
      if (res.data.success) {
        setEditMessage({ type: 'success', text: 'Subscription updated successfully.' });
        fetchSchools();
        fetchStats();
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: err.customMessage || 'Failed to update subscription.' });
    }
  };

  const handleResetPrincipalPass = async (e) => {
    e.preventDefault();
    setEditMessage({ type: '', text: '' });

    if (!newPrincipalPass || newPrincipalPass.length < 6) {
      setEditMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      const res = await api.post(`/super-admin/schools/${selectedSchool._id}/reset-principal-password`, {
        newPassword: newPrincipalPass,
      });
      if (res.data.success) {
        setSelectedSchool(null);
        setCreatedCredentials(res.data.credentials);
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: err.customMessage || 'Failed to reset principal password.' });
    }
  };

  const toggleModuleSelection = (modName, isCreate = false) => {
    if (isCreate) {
      setFormData((prev) => {
        const exists = prev.enabledModules.includes(modName);
        return {
          ...prev,
          enabledModules: exists
            ? prev.enabledModules.filter((m) => m !== modName)
            : [...prev.enabledModules, modName],
        };
      });
    } else {
      setEditModules((prev) =>
        prev.includes(modName) ? prev.filter((m) => m !== modName) : [...prev, modName]
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Welcome Banner & System Telemetry */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-darkBrown uppercase tracking-wider">Super Admin Console</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-morning/15 text-morning">
                  Live System
                </span>
              </div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Welcome, {user?.name || 'Super Admin'}
              </h1>
              <p className="text-xs text-textMuted mt-0.5 flex items-center gap-2">
                <span>Login ID: <strong className="text-chestnut">{user?.loginId}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-morning" />
                  Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
                </span>
              </p>
            </div>

            {/* Live Infrastructure Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
              <div className="p-2.5 bg-surface rounded-xl border border-almond/40 text-xs">
                <div className="flex items-center space-x-1.5 text-textMuted text-[10px] font-semibold uppercase">
                  <Database className="w-3 h-3 text-morning" />
                  <span>MongoDB Atlas</span>
                </div>
                <div className="mt-1 font-bold flex items-center space-x-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dbStatus?.connectionState === 'connected' ? 'bg-success' : 'bg-warning animate-pulse'
                    }`}
                  />
                  <span className="capitalize text-xs text-darkBrown">
                    {dbStatus?.connectionState || 'Connected'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-surface rounded-xl border border-almond/40 text-xs">
                <div className="flex items-center space-x-1.5 text-textMuted text-[10px] font-semibold uppercase">
                  <Activity className="w-3 h-3 text-success" />
                  <span>API Health</span>
                </div>
                <div className="mt-1 font-bold text-xs text-darkBrown">
                  {apiHealth?.status === 'OK' ? 'Operational' : 'Operational'}
                </div>
              </div>

              <div className="p-2.5 bg-surface rounded-xl border border-almond/40 text-xs col-span-2 sm:col-span-1">
                <div className="flex items-center space-x-1.5 text-textMuted text-[10px] font-semibold uppercase">
                  <Server className="w-3 h-3 text-chestnut" />
                  <span>Environment</span>
                </div>
                <div className="mt-1 font-bold text-xs text-chestnut uppercase">
                  {import.meta.env.MODE || 'Development'}
                </div>
              </div>
            </div>
          </div>

          {toastMessage && (
            <div className="p-4 rounded-2xl bg-success/15 border border-success/30 text-success text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-success" />
                <span>{toastMessage.text}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-success hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-darkBrown">Tenant Overview</h2>
              <p className="text-xs text-textMuted">Active school subscriptions & platform metrics</p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New School</span>
            </button>
          </div>

          {/* 5 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Schools"
              value={stats?.totalSchools ?? '...'}
              subtitle="Registered tenants"
              icon={Building2}
              color="chestnut"
            />
            <StatCard
              title="Active Schools"
              value={stats?.activeSchools ?? '...'}
              subtitle="Live operational tenants"
              icon={Shield}
              color="morning"
            />
            <StatCard
              title="Suspended"
              value={stats?.suspendedSchools ?? '...'}
              subtitle="Blocked access"
              icon={AlertTriangle}
              color="danger"
            />
            <StatCard
              title="Total Principals"
              value={stats?.totalPrincipals ?? '...'}
              subtitle="School administrators"
              icon={Users}
              color="darkBrown"
            />
            <StatCard
              title="Expiring Soon"
              value={stats?.expiringSubscriptions ?? '...'}
              subtitle="Expires in 30 days"
              icon={Clock}
              color="warning"
            />
          </div>

          {/* School Directory Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">School Directory</h3>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or code..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : schools.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No schools found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">School Name</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Principal</th>
                      <th className="py-3 px-4">Subscription</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {schools.map((school) => (
                      <tr key={school._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{school.name}</div>
                          <div className="text-[10px] text-textMuted">{school.email || school.phone || 'No contact email'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-chestnut">
                          <span className="bg-almond/30 px-2 py-0.5 rounded">{school.schoolCode}</span>
                        </td>
                        <td className="py-3 px-4">
                          {school.principal ? (
                            <div>
                              <div className="font-semibold">{school.principal.name}</div>
                              <div className="text-[10px] text-textMuted font-mono">{school.principal.loginId}</div>
                            </div>
                          ) : (
                            <span className="text-textMuted italic">No Principal</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-chestnut">{school.subscription?.plan || 'Standard'}</div>
                          <div className="text-[10px] text-textMuted">
                            Expires: {school.subscription?.expiresAt ? new Date(school.subscription.expiresAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              school.isActive && school.subscription?.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {school.isActive && school.subscription?.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <a
                              href={`/s/${school.schoolSlug || school.schoolCode.toLowerCase()}/login`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Branded School Portal"
                              className="px-2 py-1 rounded-lg border border-almond text-chestnut hover:bg-chestnut/10 font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Portal</span>
                            </a>

                            <button
                              onClick={() => handleOpenManageModal(school)}
                              title="Manage & Edit School"
                              className="px-2 py-1 rounded-lg border border-almond text-textMuted hover:text-darkBrown hover:bg-surface font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Settings className="w-3 h-3" />
                              <span>Manage</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(school._id)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                school.isActive && school.subscription?.status === 'active'
                                  ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                  : 'bg-success/10 text-success hover:bg-success/20'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{school.isActive && school.subscription?.status === 'active' ? 'Suspend' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => setDeletingSchool(school)}
                              title="Delete / Archive School"
                              className="px-2 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 font-medium text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
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
            {Number(pagination?.pages || 1) > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-almond/30 text-xs">
                <span className="text-textMuted">
                  Page {Number(pagination?.page || page || 1)} of {Number(pagination?.pages || 1)} ({Number(pagination?.total || 0)} total)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-almond text-textMuted hover:bg-surface disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= Number(pagination?.pages || 1)}
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

      {/* Create School Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-almond/50 relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-almond/30 mb-4">
              <div>
                <h3 className="text-lg font-bold text-darkBrown">Create New School & Principal Account</h3>
                <p className="text-xs text-textMuted">Provision school details, subscription, enabled modules, and principal credentials.</p>
              </div>
              <button
                onClick={() => {
                  resetCreateForm();
                  setIsCreateModalOpen(false);
                }}
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

            <form onSubmit={handleCreateSchool} className="space-y-5">
              {/* School Details */}
              <div>
                <span className="text-xs font-bold text-chestnut uppercase tracking-wider block mb-2">1. School Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">School Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oakridge International School"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">School Code (Unique) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OAK01"
                      value={formData.schoolCode}
                      onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">School Email</label>
                    <input
                      type="email"
                      placeholder="contact@oakridge.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">School Phone</label>
                    <input
                      type="text"
                      placeholder="+1 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="123 Education Blvd"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Website URL</label>
                    <input
                      type="text"
                      placeholder="https://oakridge.edu"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription & Module Selection */}
              <div className="pt-3 border-t border-almond/30">
                <span className="text-xs font-bold text-chestnut uppercase tracking-wider block mb-2">2. Subscription & Modules</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Subscription Plan</label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="Standard">Standard Plan</option>
                      <option value="Premium">Premium Plan</option>
                      <option value="Enterprise">Enterprise Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.subscriptionStartDate}
                      onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.subscriptionExpiryDate}
                      onChange={(e) => setFormData({ ...formData, subscriptionExpiryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <label className="block text-xs font-semibold text-textMain mb-1.5">Enabled Modules</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-surface p-3 rounded-xl border border-almond/40">
                  {SUPPORTED_MODULES.map((mod) => {
                    const isChecked = formData.enabledModules.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => toggleModuleSelection(mod, true)}
                        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left ${
                          isChecked ? 'bg-chestnut text-white font-semibold' : 'bg-white text-textMuted border border-almond/40 hover:text-textMain'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        <span>{mod}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Principal Setup */}
              <div className="pt-3 border-t border-almond/30">
                <span className="text-xs font-bold text-chestnut uppercase tracking-wider block mb-2">3. Principal Setup</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Principal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Robert Vance"
                      value={formData.principalName}
                      onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Principal Login ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PRINCIPAL_VANCE"
                      value={formData.principalLoginId}
                      onChange={(e) => setFormData({ ...formData, principalLoginId: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.principalPassword}
                      onChange={(e) => setFormData({ ...formData, principalPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => {
                    resetCreateForm();
                    setIsCreateModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-chestnut hover:bg-darkBrown text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating School...' : 'Create School & Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage / Edit School Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-almond/50 relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30 mb-4">
              <div>
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <span>Manage School:</span>
                  <span className="text-chestnut">{selectedSchool.name}</span>
                  <span className="text-xs font-mono bg-almond/30 px-2 py-0.5 rounded">({selectedSchool.schoolCode})</span>
                </h3>
              </div>
              <button onClick={() => setSelectedSchool(null)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-surface rounded-xl border border-almond/40 mb-4 gap-1">
              {['details', 'modules', 'subscription', 'resetPassword', 'domains'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setEditTab(tab);
                    setEditMessage({ type: '', text: '' });
                    if (tab === 'domains' && selectedSchool) {
                      setSubdomainInput(selectedSchool.subdomain || '');
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    editTab === tab ? 'bg-white text-darkBrown shadow-sm border border-almond/40' : 'text-textMuted hover:text-textMain'
                  }`}
                >
                  {tab === 'resetPassword' ? 'Reset Pass' : tab === 'domains' ? 'Domains & Subdomain' : tab}
                </button>
              ))}
            </div>

            {editMessage.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  editMessage.type === 'success'
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-danger/10 text-danger border border-danger/20'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editMessage.text}</span>
              </div>
            )}

            {/* Tab 1: Edit Details */}
            {editTab === 'details' && (
              <form onSubmit={handleSaveDetails} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">School Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-almond/30">
                  <button type="submit" className="px-5 py-2 rounded-xl bg-chestnut text-white text-xs font-bold">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Module Management */}
            {editTab === 'modules' && (
              <div className="space-y-4">
                <p className="text-xs text-textMuted">Enable or disable specific features dynamically for this tenant.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORTED_MODULES.map((mod) => {
                    const isChecked = editModules.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => toggleModuleSelection(mod, false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                          isChecked ? 'bg-chestnut text-white font-semibold' : 'bg-surface text-textMuted border border-almond/40'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        <span>{mod}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-3 border-t border-almond/30">
                  <button onClick={handleSaveModules} className="px-5 py-2 rounded-xl bg-chestnut text-white text-xs font-bold">
                    Update Modules
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Subscription Management */}
            {editTab === 'subscription' && (
              <form onSubmit={handleSaveSubscription} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Status</label>
                    <select
                      value={editSubscription.status}
                      onChange={(e) => setEditSubscription({ ...editSubscription, status: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended (Blocked Access)</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Plan</label>
                    <select
                      value={editSubscription.plan}
                      onChange={(e) => setEditSubscription({ ...editSubscription, plan: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editSubscription.expiresAt}
                    onChange={(e) => setEditSubscription({ ...editSubscription, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div className="flex justify-end pt-3 border-t border-almond/30">
                  <button type="submit" className="px-5 py-2 rounded-xl bg-chestnut text-white text-xs font-bold">
                    Update Subscription
                  </button>
                </div>
              </form>
            )}

            {/* Tab 4: Reset Principal Password */}
            {editTab === 'resetPassword' && (
              <form onSubmit={handleResetPrincipalPass} className="space-y-3">
                <p className="text-xs text-textMuted">
                  Directly override Principal password for <strong className="text-chestnut">{selectedSchool.principal?.name || selectedSchool.name}</strong>.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">New Principal Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter new password"
                    value={newPrincipalPass}
                    onChange={(e) => setNewPrincipalPass(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div className="flex justify-end pt-3 border-t border-almond/30">
                  <button type="submit" className="px-5 py-2 rounded-xl bg-warning hover:bg-darkBrown text-white text-xs font-bold">
                    Reset & Show Credentials
                  </button>
                </div>
              </form>
            )}

            {/* Tab 5: Custom Domains & Subdomain */}
            {editTab === 'domains' && (
              <div className="space-y-5 text-xs">
                {/* Subdomain Settings */}
                <form onSubmit={handleSaveSubdomain} className="p-3 bg-surface rounded-2xl border border-almond/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-darkBrown uppercase tracking-wider text-[11px]">Tenant Subdomain</span>
                    <span className="text-[10px] text-textMuted font-mono">e.g. {subdomainInput || 'school'}.yourdomain.com</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. little-stars"
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3 py-2 bg-white border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                    <button type="submit" className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl transition-all">
                      Save Subdomain
                    </button>
                  </div>
                </form>

                {/* Add Custom Domain Form */}
                <form onSubmit={handleAddDomain} className="p-3 bg-surface rounded-2xl border border-almond/50 space-y-2">
                  <span className="font-bold text-darkBrown uppercase tracking-wider text-[11px] block">Add Custom FQDN Domain</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. littlestarsschool.com"
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                    <button type="submit" className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl transition-all flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Domain</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-textMuted">School admins must configure a CNAME / A record pointing their domain to the SaaS server IP.</p>
                </form>

                {/* Existing Custom Domains List */}
                <div>
                  <span className="font-bold text-darkBrown uppercase tracking-wider text-[11px] block mb-2">Mapped Custom Domains</span>
                  {selectedSchool.customDomains?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedSchool.customDomains.map((d) => (
                        <div key={d.domain} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-almond/50">
                          <div>
                            <div className="font-mono font-bold text-darkBrown flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-chestnut" />
                              <span>{d.domain}</span>
                            </div>
                            <span className="text-[10px] text-textMuted block">Added: {new Date(d.addedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={d.status}
                              onChange={(e) => handleUpdateDomainStatus(d.domain, e.target.value)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                                d.status === 'verified'
                                  ? 'bg-success/15 text-success border-success/30'
                                  : d.status === 'disabled'
                                  ? 'bg-danger/15 text-danger border-danger/30'
                                  : 'bg-warning/15 text-warning border-warning/30'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="verified">Verified</option>
                              <option value="disabled">Disabled</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveDomain(d.domain)}
                              className="p-1 text-danger hover:bg-danger/10 rounded-lg transition-all"
                              title="Remove domain"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-surface rounded-xl text-center text-textMuted text-xs border border-dashed border-almond">
                      No custom FQDN domains mapped for this school yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Credential Display Modal */}
      <CredentialModal
        isOpen={Boolean(createdCredentials)}
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />

      {/* Delete School Modal */}
      <DeleteSchoolModal
        isOpen={Boolean(deletingSchool)}
        school={deletingSchool}
        onClose={() => setDeletingSchool(null)}
        onSuccess={(msg) => {
          showToast('success', msg);
          fetchSchools();
          fetchStats();
        }}
      />
    </div>
  );
};

export default SuperAdminDashboard;
