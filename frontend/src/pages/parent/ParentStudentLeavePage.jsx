import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const ParentStudentLeavePage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildrenList(kids);
        if (kids.length > 0) setSelectedChildId(kids[0]._id);
      }
    } catch (err) {
      console.error('Fetch children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async (childId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/leave`);
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Fetch student leave error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchLeaves(selectedChildId);
    }
  }, [selectedChildId]);

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post(`/parent/children/${selectedChildId}/leave`, {
        startDate,
        endDate,
        reason,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setReason('');
        fetchLeaves(selectedChildId);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to submit leave application.');
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
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Leave Applications
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Apply for child leave, specify dates and reasons, and view Class Teacher / Principal responses.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Student Leave</span>
            </button>
          </div>

          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
          />

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : leaves.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-almond/40 shadow-card text-center text-xs text-textMuted font-medium">
              No leave applications submitted for this student yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Leave Application History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-textMuted font-semibold">
                      <th className="pb-3 px-3">Start Date</th>
                      <th className="pb-3 px-3">End Date</th>
                      <th className="pb-3 px-3">Days</th>
                      <th className="pb-3 px-3">Reason</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">School Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-darkBrown">
                    {leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3 px-3 font-mono">{new Date(l.startDate).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-mono">{new Date(l.endDate).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-bold font-mono">{l.totalDays}</td>
                        <td className="py-3 px-3">{l.reason}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                            l.status === 'approved'
                              ? 'bg-success/15 text-success'
                              : l.status === 'rejected'
                              ? 'bg-danger/15 text-danger'
                              : 'bg-warning/15 text-darkBrown'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-textMuted">{l.reviewRemark || 'Pending review'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Apply Leave Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-darkBrown/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-2xl max-w-md w-full space-y-4">
                <div className="flex items-center justify-between border-b border-almond/30 pb-3">
                  <h3 className="text-base font-bold text-darkBrown">Apply for Student Leave</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-xs font-bold text-textMuted hover:text-darkBrown">
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-danger/10 text-danger text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-textMain mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-textMain mb-1">End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-textMain mb-1">Reason for Absence *</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Medical reasons / family event"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-textMuted hover:text-darkBrown font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md transition-all"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
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

export default ParentStudentLeavePage;
