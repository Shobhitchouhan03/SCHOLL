import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const PrincipalMarksReviewPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Return Modal
  const [selectedMark, setSelectedMark] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/principal/exams/${examId}/marks-review`);
      if (res.data.success) {
        setSubmissions(res.data.marksSubmissions || []);
      }
    } catch (err) {
      console.error('Fetch marks review error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  const handleAction = async (marksId, action, reason) => {
    try {
      const res = await api.post(`/principal/marks/${marksId}/approve`, { action, returnReason: reason });
      if (res.data.success) {
        setSelectedMark(null);
        setReturnReason('');
        fetchSubmissions();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to process action.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/exams')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exams Directory</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Principal Review Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Teacher Marks Submission Review
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Review student marks submitted by teachers. Approve valid marks or return for correction.
              </p>
            </div>

            <button
              onClick={() => navigate(`/principal/exams/${examId}/results`)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
            >
              <span>Go to Results Console →</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Submitted Student Marks ({submissions.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No student marks submitted for review yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Obtained / Max</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {submissions.map((m) => (
                      <tr key={m._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{m.studentId?.fullName}</div>
                          <div className="text-[10px] font-mono font-bold text-chestnut">{m.studentId?.admissionNumber}</div>
                        </td>

                        <td className="py-3 px-4 font-semibold">
                          {m.classId?.name} - {m.sectionId?.name}
                        </td>

                        <td className="py-3 px-4 font-semibold text-chestnut">
                          {m.subjectId?.name}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">
                          {m.totalMarks} / {m.maximumMarks}
                        </td>

                        <td className="py-3 px-4 text-textMuted">
                          {m.enteredBy?.name || 'Teacher'}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              m.status === 'approved'
                                ? 'bg-success/15 text-success'
                                : m.status === 'returned'
                                ? 'bg-danger/15 text-danger'
                                : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {m.status !== 'approved' && (
                              <button
                                onClick={() => handleAction(m._id, 'approve')}
                                className="px-2.5 py-1 bg-success text-white rounded-lg text-[10px] font-bold hover:bg-success/90 transition-colors"
                              >
                                Approve
                              </button>
                            )}

                            {m.status !== 'returned' && (
                              <button
                                onClick={() => setSelectedMark(m)}
                                className="px-2.5 py-1 bg-danger/15 text-danger rounded-lg text-[10px] font-bold hover:bg-danger/25 transition-colors"
                              >
                                Return
                              </button>
                            )}
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

      {/* RETURN MARKS MODAL */}
      {selectedMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Return Marks for Correction</h3>
            <p className="text-xs text-textMuted">
              Returning marks reopens editing for the assigned teacher. Please specify reason for correction.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Return Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Verify practical marks calculation..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedMark(null)}
                className="px-4 py-2 border border-almond text-textMuted text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction(selectedMark._id, 'return', returnReason)}
                className="px-5 py-2 bg-danger text-white text-xs font-bold rounded-xl shadow-md"
              >
                Return to Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalMarksReviewPage;
