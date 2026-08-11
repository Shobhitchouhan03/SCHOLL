import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Package, Plus, CheckCircle2, XCircle, Users, RefreshCw } from 'lucide-react';

const HRAssetsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [asgRes, astRes, tchRes] = await Promise.all([
        api.get('/principal/inventory/assignments').catch(() => ({ data: {} })),
        api.get('/principal/inventory/assets').catch(() => ({ data: {} })),
        api.get('/principal/teachers').catch(() => ({ data: {} })),
      ]);

      if (asgRes.data?.success) setAssignments(asgRes.data.assignments || []);
      if (astRes.data?.success) setAssets(astRes.data.assets || []);
      if (tchRes.data?.success) setTeachers(tchRes.data.teachers || []);
    } catch (err) {
      console.error('Fetch HR assets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/inventory/assignments', {
        assetId: selectedAssetId,
        assignedToUser: selectedUserId,
      });
      if (res.data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to assign asset.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">HR Asset Management</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Staff Asset Assignments & Issued Equipment
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Issue laptops, devices, keys, and equipment to staff, and manage returns and transfers.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Asset to Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Issued Assets" value={assignments.length} subtitle="Assigned to staff" icon={Package} color="chestnut" />
            <StatCard title="Available Assets" value={assets.filter(a => a.status === 'available').length} subtitle="Ready for assignment" icon={CheckCircle2} color="success" />
            <StatCard title="Assigned Teachers & Staff" value={new Set(assignments.map(a => a.assignedToUser?._id)).size} subtitle="Asset holders" icon={Users} color="morning" />
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Employee Issued Assets ({assignments.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No assets currently issued to staff.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Asset Tag / Name</th>
                      <th className="py-3 px-4">Assigned Employee</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {assignments.map((asg) => (
                      <tr key={asg._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-darkBrown">
                          <div>{asg.assetId?.name || 'Asset'}</div>
                          <span className="font-mono text-[10px] text-chestnut">{asg.assetId?.assetTag}</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-textMain">
                          {asg.assignedToUser?.name || 'Staff Member'}
                        </td>
                        <td className="py-3 px-4 text-textMuted">
                          {asg.assignedDate ? new Date(asg.assignedDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                            {asg.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Issue Asset Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-darkBrown/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-almond/50 shadow-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Issue Equipment / Asset to Staff</h3>

                {formError && <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs">{formError}</div>}

                <form onSubmit={handleAssignAsset} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-textMain mb-1">Select Asset</label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full p-2 bg-surface border border-almond rounded-xl"
                      required
                    >
                      <option value="">Select Asset...</option>
                      {assets.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name} ({a.assetTag})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-textMain mb-1">Assign to Employee / Staff</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full p-2 bg-surface border border-almond rounded-xl"
                      required
                    >
                      <option value="">Select Staff Member...</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.employeeId || 'Teacher'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-almond rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-chestnut text-white rounded-xl font-bold hover:bg-darkBrown"
                    >
                      Assign Asset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HRAssetsPage;
