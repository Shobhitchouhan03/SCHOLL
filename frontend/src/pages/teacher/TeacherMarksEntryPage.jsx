import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const TeacherMarksEntryPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Schedules & Teacher Info
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Roster & Schedule Details
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [roster, setRoster] = useState([]);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const [schRes, optRes] = await Promise.all([
        api.get(`/principal/exams/${examId}/schedules`),
        api.get('/teacher/attendance/options'),
      ]);

      if (schRes.data.success) {
        setSchedules(schRes.data.schedules || []);
        if (schRes.data.schedules?.length > 0) {
          setSelectedScheduleId(schRes.data.schedules[0]._id);
        }
      }

      if (optRes.data.success) {
        setTeacher(optRes.data.teacher);
        const sec = optRes.data.teacher?.assignedSectionIds?.[0] || optRes.data.teacher?.classTeacherSectionId;
        setSelectedSectionId(sec?._id || sec || '');
      }
    } catch (err) {
      console.error('Fetch teacher marks entry schedules error:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadRoster = async () => {
    if (!selectedScheduleId || !selectedSectionId) return;
    try {
      setLoadingRoster(true);
      const res = await api.get(`/teacher/exams/${examId}/marks-entry`, {
        params: { scheduleId: selectedScheduleId, sectionId: selectedSectionId },
      });
      if (res.data.success) {
        setCurrentSchedule(res.data.schedule);
        setRoster(res.data.roster || []);
      }
    } catch (err) {
      console.error('Load marks entry roster error:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [examId]);

  useEffect(() => {
    if (selectedScheduleId && selectedSectionId) {
      loadRoster();
    }
  }, [selectedScheduleId, selectedSectionId]);

  const updateStudentField = (studentId, field, val) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        const updated = { ...item, [field]: val };
        if (field === 'theoryMarks' || field === 'practicalMarks') {
          const t = field === 'theoryMarks' ? Number(val || 0) : Number(item.theoryMarks || 0);
          const p = field === 'practicalMarks' ? Number(val || 0) : Number(item.practicalMarks || 0);
          updated.totalMarks = t + p;
        }
        return updated;
      })
    );
  };

  const handleSaveMarks = async (targetStatus) => {
    if (!selectedScheduleId || !selectedSectionId) return;
    const maxAllowed = currentSchedule?.maximumMarks || 100;

    // Validation check before submission
    for (const r of roster) {
      if (Number(r.theoryMarks) < 0 || Number(r.practicalMarks) < 0) {
        alert(`Marks cannot be negative for student ${r.fullName}.`);
        return;
      }
      if (Number(r.totalMarks) > maxAllowed) {
        alert(`Total marks for student ${r.fullName} (${r.totalMarks}) exceed maximum marks (${maxAllowed}).`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await api.post(`/teacher/exams/${examId}/marks/submit`, {
        scheduleId: selectedScheduleId,
        sectionId: selectedSectionId,
        targetStatus,
        marksList: roster,
      });

      if (res.data.success) {
        alert(res.data.message);
        loadRoster();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.customMessage || 'Failed to save marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmittedOrApproved = roster.some((r) => r.status === 'submitted' || r.status === 'approved');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/teacher/exams')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assigned Exams</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Marks Entry ({currentSchedule?.subjectId?.name || 'Subject'})
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Max Marks: <strong className="text-chestnut font-mono">{currentSchedule?.maximumMarks || 100}</strong> • Passing Marks: <strong className="text-darkBrown font-mono">{currentSchedule?.passingMarks || 33}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleSaveMarks('draft')}
                disabled={submitting || isSubmittedOrApproved}
                className="px-4 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => handleSaveMarks('submitted')}
                disabled={submitting || isSubmittedOrApproved}
                className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Marks to Principal</span>
              </button>
            </div>
          </div>

          {/* Schedule & Section Selector */}
          <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-darkBrown">Subject Schedule:</label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
              >
                {schedules.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subjectId?.name} ({s.classId?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marks Entry Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Enrolled Student Marks ({roster.length})</h3>

            {loadingRoster ? (
              <LoadingSkeleton count={4} />
            ) : roster.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No active students found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Roll & Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Attendance Status</th>
                      <th className="py-3 px-4">Theory Marks</th>
                      <th className="py-3 px-4">Practical Marks</th>
                      <th className="py-3 px-4">Total / Max</th>
                      <th className="py-3 px-4">Remark</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {roster.map((r) => (
                      <tr key={r.studentId} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">
                            {r.rollNumber ? `#${r.rollNumber}` : '-'} {r.fullName}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-chestnut">
                          {r.admissionNumber}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            disabled={isSubmittedOrApproved}
                            value={r.attendanceStatus}
                            onChange={(e) => updateStudentField(r.studentId, 'attendanceStatus', e.target.value)}
                            className="px-2.5 py-1 bg-surface border border-almond/60 rounded-lg text-xs font-bold"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="exempted">Exempted</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="number"
                            disabled={isSubmittedOrApproved || r.attendanceStatus === 'absent'}
                            value={r.theoryMarks}
                            onChange={(e) => updateStudentField(r.studentId, 'theoryMarks', e.target.value)}
                            className="w-20 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs font-mono font-bold text-darkBrown"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="number"
                            disabled={isSubmittedOrApproved || r.attendanceStatus === 'absent'}
                            value={r.practicalMarks}
                            onChange={(e) => updateStudentField(r.studentId, 'practicalMarks', e.target.value)}
                            className="w-20 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs font-mono font-bold text-darkBrown"
                          />
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-chestnut text-sm">
                          {r.totalMarks} / {currentSchedule?.maximumMarks || 100}
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional remark"
                            disabled={isSubmittedOrApproved}
                            value={r.remark || ''}
                            onChange={(e) => updateStudentField(r.studentId, 'remark', e.target.value)}
                            className="w-32 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs text-darkBrown"
                          />
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              r.status === 'approved'
                                ? 'bg-success/15 text-success'
                                : r.status === 'submitted'
                                ? 'bg-warning/15 text-warning'
                                : r.status === 'returned'
                                ? 'bg-danger/15 text-danger'
                                : 'bg-surface text-textMuted'
                            }`}
                          >
                            {r.status}
                          </span>
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
    </div>
  );
};

export default TeacherMarksEntryPage;
