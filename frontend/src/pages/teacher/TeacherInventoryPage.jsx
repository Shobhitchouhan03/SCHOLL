import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Package, AlertCircle } from 'lucide-react';

const TeacherInventoryPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchAssignedAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/inventory/assigned-assets');
      if (res.data.success) setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error('Fetch teacher assets error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedAssets();
  }, []);

  const handleReportDamage = async (assetId) => {
    const notes = prompt('Describe damage / issue with asset:');
    if (!notes) return;
    try {
      const res = await api.post('/teacher/inventory/damage-reports', { assetId, notes });
      if (res.data.success) {
        alert('Damage report submitted.');
        fetchAssignedAssets();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to file damage report.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              My Assigned School Assets
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              View fixed assets checked out to you (laptops, lab kits, projectors) and file damage/repair reports.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4 text-xs">
            <h3 className="text-base font-bold text-darkBrown">Assigned Assets ({assignments.length})</h3>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : assignments.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No school assets currently assigned to you.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {assignments.map((asg) => {
                  const asset = asg.assetId;
                  return (
                    <div key={asg._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                        {asset?.assetTag}
                      </span>
                      <h4 className="font-bold text-darkBrown text-sm">{asset?.name}</h4>
                      <div className="text-textMuted font-mono text-[11px]">Location: {asset?.location || 'N/A'}</div>
                      <div className="text-textMuted text-[10px]">Assigned Date: {new Date(asg.assignedDate).toLocaleDateString()}</div>

                      <div className="pt-2 border-t border-almond/30 flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-success/15 text-success rounded text-[10px] font-bold uppercase">
                          {asg.status}
                        </span>
                        <button
                          onClick={() => handleReportDamage(asset?._id)}
                          className="px-2.5 py-1 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Report Damage
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherInventoryPage;
