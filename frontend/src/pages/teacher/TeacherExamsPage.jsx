import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  AlertCircle,
  X,
} from 'lucide-react';

const TeacherExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Assessment Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    examType: 'unit_test',
    description: 'Class Assessment',
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/exams');
      if (res.data.success) {
        setExams(res.data.exams || []);
      }
    } catch (err) {
      console.error('Fetch teacher exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      // Get current active session
      const sessionsRes = await api.get('/teacher/attendance/options');
      const activeSessionId = sessionsRes.data?.activeAcademicSessionId || sessionsRes.data?.teacher?.schoolId;

      const payload = {
        academicSessionId: activeSessionId,
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        examType: createForm.examType,
        description: createForm.description,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
      };

      const res = await api.post('/teacher/exams', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          code: '',
          startDate: new Date().toISOString().substring(0, 10),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          examType: 'unit_test',
          description: 'Class Assessment',
        });
        setSuccessMsg('Assessment created successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchExams();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create assessment.');
    } finally {
      setActionLoading(false);
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
              <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Assigned Exams & Student Marks Entry
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Enter and submit student marks for your assigned examination subjects.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {successMsg && (
                <div className="px-3 py-1.5 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Assessment</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Assigned Exams" value={exams.length} subtitle="Scheduled tests" icon={Award} color="chestnut" />
            <StatCard title="Active Session" value="2026-2027" subtitle="Current academic year" icon={Calendar} color="morning" />
          </div>

          {/* Exams List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-darkBrown">Assigned Exams Register</h3>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : exams.length === 0 ? (
              <div className="p-8 text-center bg-surface/50 rounded-2xl border border-dashed border-almond/60 space-y-3">
                <Award className="w-10 h-10 mx-auto text-textMuted/40" />
                <div>
                  <h4 className="text-sm font-bold text-darkBrown">No exams scheduled yet</h4>
                  <p className="text-xs text-textMuted mt-0.5">
                    Create a new class assessment or enter subject marks for your assigned classes.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Class Assessment</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((e) => (
                  <div key={e._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                          {e.code}
                        </span>
                        <h4 className="text-sm font-bold text-darkBrown mt-1">{e.name}</h4>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-warning/15 text-warning">
                        {e.status}
                      </span>
                    </div>

                    <div className="text-xs text-textMuted flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-morning" />
                      <span>{new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}</span>
                    </div>

                    <div className="pt-2 border-t border-almond/30 flex justify-end">
                      <button
                        onClick={() => navigate(`/teacher/exams/${e._id}/marks-entry`)}
                        className="px-3.5 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Enter Subject Marks</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE ASSESSMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-lg font-black text-darkBrown">Create Class Assessment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-textMuted hover:text-darkBrown">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssessment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-darkBrown block mb-1">Assessment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Assessment Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UT1"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="font-bold text-darkBrown block mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Assessment Type</label>
                <select
                  value={createForm.examType}
                  onChange={(e) => setCreateForm({ ...createForm, examType: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold"
                >
                  <option value="unit_test">Unit Test / Class Test</option>
                  <option value="term">Term Exam</option>
                  <option value="practical">Practical Assessment</option>
                  <option value="custom">Custom Evaluation</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{actionLoading ? 'Creating...' : 'Create Assessment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExamsPage;
