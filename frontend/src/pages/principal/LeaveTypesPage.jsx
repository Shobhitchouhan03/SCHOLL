import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, ArrowLeft } from 'lucide-react';

const LeaveTypesPage = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [allowance, setAllowance] = useState('12');
  const [paid, setPaid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/leave/types');
      if (res.data.success) setTypes(res.data.leaveTypes || []);
    } catch (err) {
      console.error('Fetch leave types error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleCreateType = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/leave/types', {
        name,
        code,
        annualAllowance: Number(allowance),
        paid,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setName('');
        setCode('');
        fetchTypes();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create leave type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/leave')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leave Console</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Leave Setup</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Leave Types & Allocations
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Define annual leave quotas (Casual, Medical, Earned, Unpaid) for school staff.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Leave Type</span>
            </button>
          </div>

          {/* Types List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Active Leave Types ({types.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : types.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No leave types defined yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map((t) => (
                  <div key={t._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                        {t.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.paid ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                        {t.paid ? 'Paid Leave' : 'Unpaid Leave'}
                      </span>
                    </div>

                    <h4 className="font-bold text-darkBrown text-sm">{t.name}</h4>
                    <p className="text-xs text-textMuted">Annual Allowance: <strong>{t.annualAllowance} days</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE LEAVE TYPE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Create Leave Type</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Leave Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casual Leave"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Leave Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CL"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Annual Allowance (Days) *</label>
                <input
                  type="number"
                  required
                  value={allowance}
                  onChange={(e) => setAllowance(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={paid}
                  onChange={(e) => setPaid(e.target.checked)}
                  className="rounded text-chestnut focus:ring-chestnut"
                />
                <label htmlFor="paidCheck" className="font-bold text-darkBrown cursor-pointer">
                  Paid Leave (No salary deduction)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypesPage;
