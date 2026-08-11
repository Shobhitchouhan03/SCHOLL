import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { CheckCircle2, XCircle, Clock, Calendar, ArrowLeft } from 'lucide-react';

const PrincipalLeavePage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [remark, setRemark] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/leave/requests');
      if (res.data.success) setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Fetch leave requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessAction = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      const endpoint = actionType === 'approve'
        ? `/principal/leave/requests/${selectedRequest._id}/approve`
        : `/principal/leave/requests/${selectedRequest._id}/reject`;

      const res = await api.post(endpoint, { reviewRemark: remark });
      if (res.data.success) {
        setSelectedRequest(null);
        setActionType(null);
        setRemark('');
        fetchRequests();
      }
    } catch (err) {
      alert(err.customMessage || 'Action failed.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Leave Approvals</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Teacher Leave Applications & Approvals
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Review teacher leave requests, check leave types, approve/reject applications, and monitor balances.
              </p>
            </div>

            <button
              onClick={() => navigate('/principal/leave/types')}
              className="px-4 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Configure Leave Types
            </button>
          </div>

          {/* Requests Directory */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Teacher Leave Applications ({requests.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No leave requests submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm">{r.teacherId?.fullName}</div>
                      <div className="text-textMuted text-[11px] mt-0.5">
                        Type: <strong className="uppercase">{r.leaveTypeId?.code || r.leaveType}</strong> • Days: <strong>{r.totalDays}</strong> ({new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()})
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedRequest(r); setActionType('approve'); }}
                            className="px-3 py-1.5 bg-success text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedRequest(r); setActionType('reject'); }}
                            className="px-3 py-1.5 bg-danger text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* APPROVE / REJECT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown capitalize">{actionType} Leave Request</h3>
            <p className="text-xs text-textMuted">
              {selectedRequest.teacherId?.fullName} — {selectedRequest.totalDays} day(s) ({selectedRequest.leaveType})
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Review Remarks / Reason</label>
              <textarea
                rows={3}
                placeholder="Optional review remark..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-almond text-textMuted text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessAction}
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md ${
                  actionType === 'approve' ? 'bg-success' : 'bg-danger'
                }`}
              >
                Confirm {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalLeavePage;
