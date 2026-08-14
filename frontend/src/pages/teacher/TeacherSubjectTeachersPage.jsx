import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { Users, BookOpen, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

const TeacherSubjectTeachersPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacherContext, setTeacherContext] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [schoolTeachers, setSchoolTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacherId: '', subjectId: '' });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contextRes, asgRes] = await Promise.allSettled([
        api.get('/teacher/me'),
        api.get('/teacher/subject-teachers'),
      ]);

      if (contextRes.status === 'fulfilled' && contextRes.value.data?.success) {
        setTeacherContext(contextRes.value.data);
      }
      if (asgRes.status === 'fulfilled' && asgRes.value.data?.success) {
        const data = asgRes.value.data;
        setAssignments(data.assignments || data.subjectAssignments || []);
        setSchoolTeachers(data.availableTeachers || []);
        setSubjects(data.availableSubjects || []);
      }
    } catch (err) {
      console.error('Fetch subject teachers data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError('');
    setAssignSuccess('');

    if (!assignForm.teacherId || !assignForm.subjectId) {
      setAssignError('Please select both a Teacher and a Subject.');
      return;
    }

    setAssignSubmitting(true);
    try {
      const res = await api.post('/teacher/subject-teachers', assignForm);
      if (res.data.success) {
        setAssignSuccess('Subject Teacher assigned successfully!');
        setAssignForm({ teacherId: '', subjectId: '' });
        setShowAssignModal(false);
        fetchData();
      }
    } catch (err) {
      setAssignError(err.customMessage || err.response?.data?.message || 'Failed to assign Subject Teacher.');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this Subject Teacher assignment?')) return;
    setDeletingId(assignmentId);
    try {
      const res = await api.delete(`/teacher/subject-teachers/${assignmentId}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to remove assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  const ownedClass = teacherContext?.primaryClassTeacherAssignment?.class;
  const ownedSection = teacherContext?.primaryClassTeacherAssignment?.section;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Class Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Subject Teacher Assignments
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage subject teachers assigned to teach subjects in your owned class (
                <strong className="text-darkBrown">{ownedClass?.name || 'Assigned Class'}</strong> - Section{' '}
                <strong className="text-darkBrown">{ownedSection?.name || 'A'}</strong>).
              </p>
            </div>

            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Subject Teacher</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Active Assignments" value={assignments.length} subtitle="Subject teachers assigned to your class" icon={BookOpen} color="chestnut" />
            <StatCard title="Available Teachers" value={schoolTeachers.length} subtitle="Active teachers in school" icon={Users} color="morning" />
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Current Class Subject Teachers</h3>
              <span className="text-xs text-textMuted">{assignments.length} total active</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-textMuted">Loading subject teacher assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-xl border border-almond/40 space-y-2">
                <BookOpen className="w-8 h-8 text-morning mx-auto" />
                <p className="text-xs font-bold text-darkBrown">No Subject Teachers assigned yet.</p>
                <p className="text-xs text-textMuted">Click "Assign Subject Teacher" to assign teachers to your class subjects.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/40 bg-surface/50 text-[11px] font-bold text-textMuted uppercase tracking-wider">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Teacher</th>
                      <th className="p-3">Class & Section</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/30 text-xs">
                    {assignments.map((asg) => (
                      <tr key={asg._id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3 font-bold text-darkBrown">
                          {asg.subjectId?.name} <span className="text-textMuted font-normal">({asg.subjectId?.code})</span>
                        </td>
                        <td className="p-3 font-semibold text-chestnut">
                          {asg.teacherId?.name || 'Assigned Teacher'}
                        </td>
                        <td className="p-3 text-textMain">
                          {asg.classId?.name || ownedClass?.name} - {asg.sectionId?.name || ownedSection?.name}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success">
                            Active
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteAssignment(asg._id)}
                            disabled={deletingId === asg._id}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title="Remove Subject Teacher Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assign Subject Teacher Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-card space-y-4 border border-almond/40">
                <div className="flex items-center justify-between border-b border-almond/40 pb-3">
                  <h3 className="text-base font-bold text-darkBrown">Assign Subject Teacher</h3>
                  <button onClick={() => setShowAssignModal(false)} className="text-textMuted hover:text-darkBrown text-sm font-bold">
                    ✕
                  </button>
                </div>

                {assignError && (
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger font-semibold">
                    {assignError}
                  </div>
                )}

                <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-textMain mb-1">Select Subject *</label>
                    <select
                      value={assignForm.subjectId}
                      onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-medium focus:outline-none focus:border-chestnut"
                    >
                      <option value="">-- Choose Subject --</option>
                      {subjects.length === 0 ? (
                        <option value="" disabled>No subjects configured for this class</option>
                      ) : (
                        subjects.map((sub) => (
                          <option key={sub._id} value={sub._id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))
                      )}
                    </select>
                    {subjects.length === 0 && (
                      <p className="text-[11px] text-warning font-semibold mt-1">
                        No subjects configured for this class. Ask Principal to configure subjects in Academic Setup.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-textMain mb-1">Select Teacher *</label>
                    <select
                      value={assignForm.teacherId}
                      onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-medium focus:outline-none focus:border-chestnut"
                    >
                      <option value="">-- Choose Active Teacher --</option>
                      {schoolTeachers.length === 0 ? (
                        <option value="" disabled>No active Subject Teachers available</option>
                      ) : (
                        schoolTeachers.map((tch) => (
                          <option key={tch._id} value={tch._id}>
                            {tch.name} ({tch.employeeId || 'EMP'}) — {tch.teacherType || 'Teacher'}
                          </option>
                        ))
                      )}
                    </select>
                    {schoolTeachers.length === 0 && (
                      <p className="text-[11px] text-warning font-semibold mt-1">
                        No active Subject Teachers are available in the school.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2 bg-surface hover:bg-almond/30 border border-almond/60 rounded-xl font-semibold text-darkBrown"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={assignSubmitting}
                      className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold transition-colors"
                    >
                      {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
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

export default TeacherSubjectTeachersPage;
