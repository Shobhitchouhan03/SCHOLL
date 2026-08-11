import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  Settings,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Lock,
  KeyRound,
  Shield,
  Layers,
  ToggleLeft,
  ToggleRight,
  User,
  Users,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

const ALL_MODULES = [
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
  'Transport',
  'Library',
  'Inventory',
];

const SchoolSettingsPage = () => {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'modules' | 'users'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmToggleUser, setConfirmToggleUser] = useState(null);

  // General Settings State
  const [generalData, setGeneralData] = useState({
    name: '',
    shortName: '',
    schoolCode: '',
    schoolSlug: '',
    schoolType: 'k12',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    publicPortalEnabled: true,
    portalTitle: '',
  });

  // Enabled Modules State
  const [enabledModules, setEnabledModules] = useState([]);

  // User Access State
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    loginId: '',
    password: '',
    role: 'accountant',
    email: '',
    phone: '',
  });
  const [newUserCredentials, setNewUserCredentials] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/settings');
      if (res.data.success && res.data.settings) {
        const s = res.data.settings;
        setGeneralData({
          name: s.name || '',
          shortName: s.shortName || '',
          schoolCode: s.schoolCode || '',
          schoolSlug: s.schoolSlug || '',
          schoolType: s.schoolType || 'k12',
          email: s.email || '',
          phone: s.phone || '',
          alternatePhone: s.alternatePhone || '',
          website: s.website || '',
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          postalCode: s.postalCode || '',
          country: s.country || 'India',
          publicPortalEnabled: s.publicPortalEnabled !== false,
          portalTitle: s.portalTitle || '',
        });
        setEnabledModules(s.enabledModules || ALL_MODULES);
      }
    } catch (err) {
      console.error('Failed to load school settings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUserLoading(true);
      const res = await api.get('/principal/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const payload = {
        ...generalData,
        enabledModules,
      };

      const res = await api.put('/principal/settings', payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'School settings saved successfully to database!' });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save school settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleModule = (modName) => {
    if (enabledModules.includes(modName)) {
      setEnabledModules(enabledModules.filter((m) => m !== modName));
    } else {
      setEnabledModules([...enabledModules, modName]);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      setNewUserCredentials(null);

      const res = await api.post('/principal/users', newUserData);
      if (res.data.success) {
        setNewUserCredentials(res.data.credentials);
        fetchUsers();
        setNewUserData({
          name: '',
          loginId: '',
          password: '',
          role: 'accountant',
          email: '',
          phone: '',
        });
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to create user account.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    if (!targetUser) return;
    try {
      setMessage({ type: '', text: '' });
      const res = await api.patch(`/principal/users/${targetUser._id}/status`);
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message || `Account status updated for ${targetUser.name}.` });
        fetchUsers();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update account status.',
      });
    } finally {
      setConfirmToggleUser(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-chestnut border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-almond/40 shadow-sm">
            <div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight flex items-center space-x-2">
                <Settings className="w-6 h-6 text-chestnut" />
                <span>School Settings & Tenant Configuration</span>
              </h1>
              <p className="text-xs text-textMuted mt-1">
                Manage school details, institutional classification, module visibility, and user access.
              </p>
            </div>

            <button
              onClick={() => navigate('/principal/dashboard')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-almond/40 text-darkBrown font-bold text-xs border border-almond/50 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-chestnut" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {message.text && (
            <div
              className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                message.type === 'success'
                  ? 'bg-sage/20 border border-sage text-darkBrown'
                  : 'bg-danger/10 border border-danger/20 text-danger'
              }`}
            >
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-success" /> : <AlertCircle className="w-4 h-4 shrink-0 text-danger" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-almond/40 pb-2">
            {[
              { id: 'general', label: 'General & Contact Settings', icon: Building },
              { id: 'modules', label: 'Module Configuration', icon: Layers },
              { id: 'users', label: 'User Access & Accountants', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage({ type: '', text: '' });
                  }}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'text-textMuted hover:text-darkBrown hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: General & Contact Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-darkBrown border-b border-almond/40 pb-3">
                  Institution Info & Type Configuration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">School Name</label>
                    <input
                      type="text"
                      required
                      value={generalData.name}
                      onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Institution Type (School Type)</label>
                    <select
                      value={generalData.schoolType}
                      onChange={(e) => setGeneralData({ ...generalData, schoolType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    >
                      <option value="playschool">Play School</option>
                      <option value="kindergarten">Kindergarten / Nursery</option>
                      <option value="primary">Primary School (Grades 1-5)</option>
                      <option value="middle">Middle School (Grades 6-8)</option>
                      <option value="secondary">Secondary School (Grades 9-10)</option>
                      <option value="senior-secondary">Senior Secondary (Grades 11-12)</option>
                      <option value="k12">K-12 Complete School (K to Grade 12)</option>
                      <option value="custom">Custom Institution</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Short Name / Abbreviation</label>
                    <input
                      type="text"
                      placeholder="e.g. DPS"
                      value={generalData.shortName}
                      onChange={(e) => setGeneralData({ ...generalData, shortName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Official Portal Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Delhi Public School Portal"
                      value={generalData.portalTitle}
                      onChange={(e) => setGeneralData({ ...generalData, portalTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-almond/40 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-darkBrown text-xs block">Public Tenant Website Portal</span>
                    <span className="text-[11px] text-textMuted block">Allow public visitors to view school website at /s/{generalData.schoolSlug || 'slug'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralData({ ...generalData, publicPortalEnabled: !generalData.publicPortalEnabled })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      generalData.publicPortalEnabled
                        ? 'bg-success/15 text-success border border-success/30'
                        : 'bg-danger/15 text-danger border border-danger/30'
                    }`}
                  >
                    {generalData.publicPortalEnabled ? 'Public Portal Enabled' : 'Public Portal Disabled'}
                  </button>
                </div>
              </div>

              {/* Contact & Location Settings */}
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-darkBrown border-b border-almond/40 pb-3">
                  Contact & Location Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Official Email</label>
                    <input
                      type="email"
                      value={generalData.email}
                      onChange={(e) => setGeneralData({ ...generalData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={generalData.phone}
                      onChange={(e) => setGeneralData({ ...generalData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Website URL</label>
                    <input
                      type="text"
                      placeholder="https://myschool.edu.in"
                      value={generalData.website}
                      onChange={(e) => setGeneralData({ ...generalData, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Street Address</label>
                    <input
                      type="text"
                      value={generalData.address}
                      onChange={(e) => setGeneralData({ ...generalData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">City</label>
                    <input
                      type="text"
                      value={generalData.city}
                      onChange={(e) => setGeneralData({ ...generalData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">State</label>
                    <input
                      type="text"
                      value={generalData.state}
                      onChange={(e) => setGeneralData({ ...generalData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={generalData.postalCode}
                      onChange={(e) => setGeneralData({ ...generalData, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Country</label>
                    <input
                      type="text"
                      value={generalData.country}
                      onChange={(e) => setGeneralData({ ...generalData, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-sm focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Settings...' : 'Save General Settings'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Module Configuration */}
          {activeTab === 'modules' && (
            <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-darkBrown">Module Visibility & Tenant Features</h2>
                <p className="text-xs text-textMuted mt-1">Enable or disable specific operational modules for your school.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {ALL_MODULES.map((mod) => {
                  const isEnabled = enabledModules.includes(mod);
                  return (
                    <div
                      key={mod}
                      onClick={() => handleToggleModule(mod)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEnabled
                          ? 'bg-chestnut/5 border-chestnut text-darkBrown font-bold'
                          : 'bg-surface border-almond/40 text-textMuted hover:bg-white'
                      }`}
                    >
                      <span className="text-xs">{mod}</span>
                      {isEnabled ? (
                        <ToggleRight className="w-6 h-6 text-chestnut shrink-0" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-textMuted shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-almond/40">
                <button
                  onClick={handleSaveGeneral}
                  disabled={saving}
                  className="px-6 py-3 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Module Configuration'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: User Access & Accountant Creation */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-almond/40 pb-3 gap-3">
                  <div>
                    <h2 className="text-base font-bold text-darkBrown">Manage school user access and Accountant accounts</h2>
                    <p className="text-xs text-textMuted mt-0.5">
                      Create and manage dedicated Accountant accounts for financial operations. (Teacher onboarding is managed in HR Workspace, Parent accounts via Student Admission).
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Accountant Access</span>
                  </button>
                </div>

                {/* Users List */}
                {userLoading ? (
                  <div className="py-8 text-center text-xs text-textMuted">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="py-8 text-center text-xs text-textMuted">No user accounts found.</div>
                ) : (
                  <div className="divide-y divide-almond/40">
                    {users.map((u) => {
                      const isSelfOrPrimaryPrincipal = u._id === user?._id || u.role === 'principal';
                      return (
                        <div key={u._id} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-bold text-darkBrown flex items-center space-x-2">
                              <span>{u.name}</span>
                              <span className="px-2 py-0.5 bg-surface text-chestnut text-[10px] font-bold rounded-md uppercase border border-almond/40">
                                {u.role}
                              </span>
                            </div>
                            <div className="text-xs text-textMuted mt-0.5">
                              ID: <span className="font-mono text-darkBrown font-bold">{u.loginId}</span> | Email: {u.email || 'N/A'}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {isSelfOrPrimaryPrincipal ? (
                              <span className="px-3 py-1 bg-morning/15 text-darkBrown font-bold text-xs rounded-xl border border-morning/30 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-chestnut" />
                                <span>Primary Principal (Protected)</span>
                              </span>
                            ) : (
                              <>
                                <span
                                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                                    u.isActive
                                      ? 'bg-success/15 text-success border-success/30'
                                      : 'bg-danger/15 text-danger border-danger/30'
                                  }`}
                                >
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => setConfirmToggleUser(u)}
                                  className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all ${
                                    u.isActive
                                      ? 'bg-surface hover:bg-danger/10 hover:border-danger/30 text-danger border-almond/60'
                                      : 'bg-chestnut hover:bg-darkBrown text-white border-transparent shadow-sm'
                                  }`}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Deactivation Confirmation Modal */}
              {confirmToggleUser && (
                <div className="fixed inset-0 z-50 bg-darkBrown/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-darkBrown">
                          Confirm Account {confirmToggleUser.isActive ? 'Deactivation' : 'Activation'}
                        </h3>
                        <p className="text-xs text-textMuted">
                          Are you sure you want to {confirmToggleUser.isActive ? 'deactivate' : 'activate'} the account for{' '}
                          <strong className="text-darkBrown">{confirmToggleUser.name}</strong> ({confirmToggleUser.loginId})?
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-almond/40">
                      <button
                        type="button"
                        onClick={() => setConfirmToggleUser(null)}
                        className="px-4 py-2 bg-surface hover:bg-almond/40 text-textMuted text-xs font-bold rounded-xl border border-almond/50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(confirmToggleUser)}
                        className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all ${
                          confirmToggleUser.isActive ? 'bg-danger hover:bg-darkBrown' : 'bg-success hover:bg-darkBrown'
                        }`}
                      >
                        Yes, {confirmToggleUser.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-50 bg-darkBrown/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-almond/40 pb-3">
                      <h3 className="text-base font-bold text-darkBrown">Create Accountant Account</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-textMuted hover:text-darkBrown font-bold text-sm">
                        ✕
                      </button>
                    </div>

                    {newUserCredentials ? (
                      <div className="space-y-4 p-4 bg-morning/10 rounded-2xl border border-morning/30 text-center">
                        <CheckCircle className="w-8 h-8 text-darkBrown mx-auto" />
                        <h4 className="text-sm font-bold text-darkBrown">Account Created Successfully!</h4>
                        <div className="p-3 bg-white rounded-xl border border-almond/60 text-xs text-left space-y-1 font-mono">
                          <div>Name: {newUserCredentials.name}</div>
                          <div>Role: {newUserCredentials.role}</div>
                          <div>Login ID: {newUserCredentials.loginId}</div>
                          <div>Password: {newUserCredentials.rawPassword}</div>
                        </div>
                        <button
                          onClick={() => {
                            setNewUserCredentials(null);
                            setShowAddUserModal(false);
                          }}
                          className="w-full py-2 bg-chestnut text-white font-bold text-xs rounded-xl"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateUser} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Account Role</label>
                          <select
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown"
                          >
                            <option value="accountant">Accountant (Financial Operations)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. accountant@school.edu.in"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Phone Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. +91 9876543210"
                            value={newUserData.phone}
                            onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Login ID (Unique) *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. ACC01"
                            value={newUserData.loginId}
                            onChange={(e) => setNewUserData({ ...newUserData, loginId: e.target.value.toUpperCase() })}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Password *</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-2 border-t border-almond/30">
                          <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="px-4 py-2 bg-surface text-xs font-semibold rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                          >
                            {saving ? 'Creating Account...' : 'Create Account'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SchoolSettingsPage;
