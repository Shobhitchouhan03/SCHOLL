import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

const TeacherLeavePage = () => {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, reqRes] = await Promise.all([
        api.get('/teacher/leave/balance'),
        api.get('/teacher/leave/requests'),
      ]);

      if (balRes.data.success) {
        setBalances(balRes.data.balances || []);
        if (balRes.data.balances?.length > 0) {
          setSelectedLeaveTypeId(balRes.data.balances[0].leaveType._id);
        }
      }
      if (reqRes.data.success) setRequests(reqRes.data.requests || []);
    } catch (err) {
      console.error('Fetch teacher leave error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/teacher/leave/requests', {
        leaveTypeId: selectedLeaveTypeId,
        startDate,
        endDate,
        reason,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setReason('');
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const res = await api.post(`/teacher/leave/requests/${requestId}/cancel`);
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.customMessage || 'Cancel failed.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                My Leave Balance & Applications
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Check annual leave quotas, apply for leave, and view request status history.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map((b, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-almond/40 shadow-card space-y-1">
                <span className="text-[10px] font-bold text-chestnut uppercase">{b.leaveType.code} • {b.leaveType.name}</span>
                <div className="text-2xl font-black text-darkBrown font-mono">{b.balance.available} Days</div>
                <div className="text-[11px] text-textMuted">Used: {b.balance.used} / {b.leaveType.annualAllowance} Days</div>
              </div>
            ))}
          </div>

          {/* Requests History */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">My Leave Applications ({requests.length})</h3>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No leave applications submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm">
                        {r.leaveTypeId?.name || r.leaveType} ({r.totalDays} Day{r.totalDays > 1 ? 's' : ''})
                      </div>
                      <div className="text-textMuted text-[11px] mt-0.5">
                        {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-textMain mt-1 italic">"{r.reason}"</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'approved' ? 'bg-success/15 text-success' : r.status === 'rejected' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'
                      }`}>
                        {r.status}
                      </span>

                      {r.status === 'pending' && (
                        <button
                          onClick={() => handleCancelRequest(r._id)}
                          className="px-2.5 py-1 bg-surface border border-almond text-textMuted rounded-lg text-[10px] font-bold hover:text-danger"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* APPLY FOR LEAVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Apply for Leave</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmitLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Leave Type *</label>
                <select
                  value={selectedLeaveTypeId}
                  onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                >
                  {balances.map((b) => (
                    <option key={b.leaveType._id} value={b.leaveType._id}>
                      {b.leaveType.name} (Available: {b.balance.available} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
                />
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
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeavePage;
