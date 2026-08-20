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
  Users,
  Calendar,
  BookOpen,
  HelpCircle,
  Lock,
  X,
} from 'lucide-react';

const TeacherMarksEntryPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Schedules & Options
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [assignedSections, setAssignedSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Roster & Schedule Details
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [roster, setRoster] = useState([]);

  // Toast / Alert State
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const fetchSchedulesAndTeacher = async () => {
    try {
      setLoadingSchedules(true);
      const [schRes, optRes] = await Promise.allSettled([
        api.get(`/teacher/exams/${examId}/schedules`),
        api.get('/teacher/exams/options'),
      ]);

      let loadedSchedules = [];
      if (schRes.status === 'fulfilled' && schRes.value.data.success) {
        loadedSchedules = schRes.value.data.schedules || [];
      } else {
        // Fallback to principal schedule endpoint if teacher schedule endpoint fails
        const pSchRes = await api.get(`/principal/exams/${examId}/schedules`).catch(() => ({ data: {} }));
        if (pSchRes.data?.success) {
          loadedSchedules = pSchRes.data.schedules || [];
        }
      }

      setSchedules(loadedSchedules);

      if (optRes.status === 'fulfilled' && optRes.value.data.success) {
        const optData = optRes.value.data;
        setTeacher(optData.teacher);
        setAssignedSections(optData.assignedSections || []);

        // Choose initial schedule
        if (loadedSchedules.length > 0) {
          const firstSch = loadedSchedules[0];
          setSelectedScheduleId(firstSch._id);

          // Resolve section
          const scheduleSecIds = (firstSch.sectionIds || []).map((s) => s._id || s);
          const matchedSection = (optData.assignedSections || []).find((sec) =>
            scheduleSecIds.length === 0 || scheduleSecIds.includes(sec._id)
          );
          setSelectedSectionId(matchedSection?._id || firstSch.sectionIds?.[0]?._id || optData.ownedClass?.sectionId || '');
        }
      }
    } catch (err) {
      console.error('Fetch teacher marks entry schedules error:', err);
      setFeedback({ type: 'error', message: 'Failed to load examination schedules.' });
    } finally {
      setLoadingSchedules(false);
    }
  };

  const loadRoster = async () => {
    if (!selectedScheduleId || !selectedSectionId) return;
    try {
      setLoadingRoster(true);
      setFeedback({ type: '', message: '' });
      const res = await api.get(`/teacher/exams/${examId}/marks-entry`, {
        params: { scheduleId: selectedScheduleId, sectionId: selectedSectionId },
      });
      if (res.data.success) {
        setCurrentSchedule(res.data.schedule);
        setRoster(res.data.roster || []);
      }
    } catch (err) {
      console.error('Load marks entry roster error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.customMessage || 'Failed to load marks entry roster.',
      });
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchSchedulesAndTeacher();
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
        if (field === 'attendanceStatus' && val === 'absent') {
          updated.theoryMarks = 0;
          updated.practicalMarks = 0;
          updated.totalMarks = 0;
        }
        return updated;
      })
    );
  };

  const handleScheduleChange = (schId) => {
    setSelectedScheduleId(schId);
    const targetSch = schedules.find((s) => s._id === schId);
    if (targetSch) {
      const scheduleSecIds = (targetSch.sectionIds || []).map((s) => s._id || s);
      const matched = assignedSections.find((sec) =>
        scheduleSecIds.length === 0 || scheduleSecIds.includes(sec._id)
      );
      if (matched) {
        setSelectedSectionId(matched._id);
      } else if (targetSch.sectionIds?.length > 0) {
        setSelectedSectionId(targetSch.sectionIds[0]._id || targetSch.sectionIds[0]);
      }
    }
  };

  const handleSaveMarks = async (targetStatus) => {
    if (!selectedScheduleId || !selectedSectionId) return;
    const maxAllowed = currentSchedule?.maximumMarks || 100;

    // Validation check before submission
    for (const r of roster) {
      if (r.attendanceStatus !== 'absent') {
        if (Number(r.theoryMarks) < 0 || Number(r.practicalMarks || 0) < 0) {
          setFeedback({ type: 'error', message: `Marks cannot be negative for student ${r.fullName}.` });
          return;
        }
        if (Number(r.totalMarks) > maxAllowed) {
          setFeedback({
            type: 'error',
            message: `Total marks for ${r.fullName} (${r.totalMarks}) exceed maximum marks (${maxAllowed}).`,
          });
          return;
        }
      }
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post(`/teacher/exams/${examId}/marks/submit`, {
        scheduleId: selectedScheduleId,
        sectionId: selectedSectionId,
        targetStatus,
        marksList: roster,
      });

      if (res.data.success) {
        setShowSubmitConfirm(false);
        setFeedback({
          type: 'success',
          message: targetStatus === 'submitted' ? 'Marks submitted successfully!' : 'Marks saved as draft.',
        });
        loadRoster();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.customMessage || 'Failed to save marks.',
      });
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
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/teacher/exams')}
                className="p-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl border border-almond/60 transition-all cursor-pointer"
                title="Back to Exams"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Marks Entry</span>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-0.5">
                  Student Assessment Marks Register
                </h1>
                <p className="text-xs text-textMuted">
                  Record theory marks, practical marks, and attendance status for your assigned class roster.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                disabled={submitting || roster.length === 0}
                onClick={() => handleSaveMarks('draft')}
                className="px-4 py-2.5 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-chestnut" />
                <span>Save Draft</span>
              </button>

              <button
                disabled={submitting || roster.length === 0}
                onClick={() => setShowSubmitConfirm(true)}
                className="px-5 py-2.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Results</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback.message && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-success/10 border-success/30 text-success'
                  : 'bg-danger/10 border-danger/30 text-danger'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Selection Controls Card */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Schedule / Subject Selector */}
              <div>
                <label className="font-bold text-xs text-darkBrown block mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-chestnut" />
                  <span>Subject Assessment Schedule *</span>
                </label>
                <select
                  disabled={loadingSchedules || schedules.length === 0}
                  value={selectedScheduleId}
                  onChange={(e) => handleScheduleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold text-xs text-darkBrown"
                >
                  {schedules.length === 0 ? (
                    <option value="">No exam schedules configured</option>
                  ) : (
                    schedules.map((sch) => (
                      <option key={sch._id} value={sch._id}>
                        {sch.subjectId?.name || 'Subject'} - {sch.classId?.displayName || sch.classId?.name || 'Class'} (Max: {sch.maximumMarks} Marks)
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Section Selector */}
              <div>
                <label className="font-bold text-xs text-darkBrown block mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-morning" />
                  <span>Class Section *</span>
                </label>
                <select
                  disabled={!selectedScheduleId}
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold text-xs text-darkBrown"
                >
                  {assignedSections.map((sec) => (
                    <option key={sec._id} value={sec._id}>
                      Section {sec.name} {sec.isOwned ? '(Class Teacher)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assessment Details Bar */}
            {currentSchedule && (
              <div className="p-3.5 bg-surface/60 rounded-xl border border-almond/40 flex items-center justify-between gap-3 text-xs flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-textMuted font-medium">
                    Subject: <strong className="text-darkBrown">{currentSchedule.subjectId?.name}</strong>
                  </span>
                  <span className="text-textMuted font-medium">
                    Maximum Marks: <strong className="text-chestnut font-bold">{currentSchedule.maximumMarks}</strong>
                  </span>
                  <span className="text-textMuted font-medium">
                    Passing Marks: <strong className="text-success font-bold">{currentSchedule.passingMarks}</strong>
                  </span>
                  <span className="text-textMuted font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-morning" />
                    <span>{new Date(currentSchedule.examDate).toLocaleDateString()}</span>
                  </span>
                </div>

                {isSubmittedOrApproved && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-info/15 text-info flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Submitted / Locked</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Student Roster Table Card */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <Users className="w-4 h-4 text-morning" />
                <span>Enrolled Student Roster</span>
              </h3>
              <span className="text-xs font-bold text-textMuted">
                {roster.length} Student{roster.length !== 1 ? 's' : ''} Listed
              </span>
            </div>

            {loadingRoster ? (
              <LoadingSkeleton count={5} />
            ) : roster.length === 0 ? (
              <div className="p-10 text-center bg-surface/40 rounded-2xl border border-dashed border-almond/60 space-y-2">
                <Users className="w-10 h-10 mx-auto text-textMuted/40" />
                <h4 className="text-sm font-bold text-darkBrown">No active students enrolled</h4>
                <p className="text-xs text-textMuted">
                  There are no active students in this class section for marks entry.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-almond/40 text-textMuted uppercase font-bold text-[10px] tracking-wider bg-surface/30">
                      <th className="py-3 px-3 w-16">Roll No</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3 w-36">Status</th>
                      <th className="py-3 px-3 w-32 text-center">Theory Marks</th>
                      <th className="py-3 px-3 w-28 text-center">Total Marks</th>
                      <th className="py-3 px-3">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/30 font-medium">
                    {roster.map((s) => {
                      const isAbsent = s.attendanceStatus === 'absent';
                      return (
                        <tr key={s.studentId} className="hover:bg-surface/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-chestnut">
                            #{s.rollNumber || '-'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-darkBrown">{s.fullName}</div>
                            <div className="text-[10px] text-textMuted font-mono">{s.admissionNumber}</div>
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={s.attendanceStatus}
                              onChange={(e) => updateStudentField(s.studentId, 'attendanceStatus', e.target.value)}
                              className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold focus:outline-none ${
                                s.attendanceStatus === 'present'
                                  ? 'bg-success/10 border-success/30 text-success'
                                  : s.attendanceStatus === 'absent'
                                  ? 'bg-danger/10 border-danger/30 text-danger'
                                  : 'bg-warning/10 border-warning/30 text-warning'
                              }`}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="exempted">Exempted</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={currentSchedule?.maximumMarks || 100}
                              disabled={isAbsent}
                              value={isAbsent ? 0 : s.theoryMarks}
                              onChange={(e) => updateStudentField(s.studentId, 'theoryMarks', e.target.value)}
                              className="w-20 px-2 py-1 text-center bg-surface border border-almond/60 rounded-lg font-bold text-darkBrown focus:outline-none focus:border-chestnut disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-1 rounded font-bold font-mono text-xs ${
                                isAbsent
                                  ? 'text-danger bg-danger/10'
                                  : s.totalMarks >= (currentSchedule?.passingMarks || 0)
                                  ? 'text-success bg-success/10'
                                  : 'text-warning bg-warning/10'
                              }`}
                            >
                              {isAbsent ? 'ABS' : s.totalMarks}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              placeholder="e.g. Excellent conceptual clarity"
                              value={s.remark}
                              onChange={(e) => updateStudentField(s.studentId, 'remark', e.target.value)}
                              className="w-full px-2 py-1 bg-surface border border-almond/50 rounded-lg text-xs focus:outline-none focus:border-chestnut"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center gap-3 text-chestnut">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-darkBrown">Confirm Final Marks Submission</h3>
            </div>

            <p className="text-xs text-textMuted leading-relaxed">
              Are you sure you want to submit the marks for{' '}
              <strong className="text-darkBrown">{currentSchedule?.subjectId?.name}</strong>? Once submitted,
              the marks will be finalized and submitted to the school administration for review and result generation.
            </p>

            <div className="pt-3 border-t border-almond/30 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveMarks('submitted')}
                className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Marks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMarksEntryPage;
