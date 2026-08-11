import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import CredentialModal from '../../components/common/CredentialModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Search,
  KeyRound,
  Power,
  X,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  FileText,
  Building2,
} from 'lucide-react';

const FamilyDirectoryPage = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/families', { params: { search } });
      if (res.data.success) {
        setFamilies(res.data.families || []);
      }
    } catch (err) {
      console.error('Fetch families error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [search]);

  const handleToggleStatus = async (familyId) => {
    try {
      const res = await api.patch(`/principal/families/${familyId}/status`);
      if (res.data.success) {
        fetchFamilies();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to toggle status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post(`/principal/families/${selectedFamily._id}/reset-password`, { newPassword });
      if (res.data.success) {
        setIsResetPasswordModalOpen(false);
        setNewPassword('');
        setCreatedCredentials(res.data.credentials);
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Accounts</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Family Accounts & Siblings Register
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage parent family login accounts, view linked sibling students, reset passwords, and control access permissions.
              </p>
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Family Accounts" value={families.length} subtitle="Registered parents" icon={Users} color="chestnut" />
            <StatCard title="Active Accounts" value={families.filter((f) => f.userId?.isActive).length} subtitle="Can log in" icon={ShieldCheck} color="success" />
            <StatCard title="Total Linked Siblings" value={families.reduce((acc, f) => acc + (f.linkedStudentIds || []).length, 0)} subtitle="Students connected" icon={UserCheck} color="morning" />
          </div>

          {/* DataTable */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">Families Directory</h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search family code, guardian name, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-60"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : families.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No family accounts found matching criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Family Code & Primary Guardian</th>
                      <th className="py-3 px-4">Login ID</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">Linked Students / Siblings</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {families.map((f) => (
                      <tr key={f._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{f.primaryGuardian?.name}</div>
                          <div className="text-[10px] font-mono font-bold text-chestnut">{f.familyCode}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">
                          {f.userId?.loginId || 'N/A'}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {f.primaryGuardian?.phone || 'N/A'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(f.linkedStudentIds || []).map((stu) => (
                              <span key={stu._id || stu} className="px-2 py-0.5 bg-chestnut/10 text-chestnut rounded text-[10px] font-bold">
                                {stu.fullName || stu.admissionNumber || 'Student'}
                              </span>
                            ))}
                            {(f.linkedStudentIds || []).length === 0 && <span className="text-[10px] text-textMuted">None linked</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              f.userId?.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {f.userId?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedFamily(f);
                                setIsResetPasswordModalOpen(true);
                              }}
                              title="Reset Parent Password"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-warning hover:bg-surface transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(f._id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                                f.userId?.isActive
                                  ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                  : 'bg-success/10 text-success hover:bg-success/20'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && selectedFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Reset Parent Password ({selectedFamily.familyCode})</h3>
            {formError && <div className="p-2 bg-danger/10 text-danger text-xs rounded-lg">{formError}</div>}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new parent password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-warning text-white text-xs font-bold shadow-sm">
                  Update Password & Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIAL DISPLAY MODAL */}
      <CredentialModal
        isOpen={Boolean(createdCredentials)}
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
    </div>
  );
};

export default FamilyDirectoryPage;
