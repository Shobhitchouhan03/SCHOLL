import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Save,
  Send,
  Users,
  AlertCircle,
  BookOpen,
  X,
  Check,
  Briefcase,
} from 'lucide-react';

const TeacherAttendanceMarkingPage = () => {
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // References
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignedSections, setAssignedSections] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Session & Roster Data
  const [sessionData, setSessionData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [remarks, setRemarks] = useState('');

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      setFetchError(null);
      const res = await api.get('/teacher/attendance/options');
      if (res.data.success) {
        setTeacherProfile(res.data.teacher);
        setCurrentSession(res.data.currentSession);

        const classes = res.data.assignedClasses || res.data.teacher?.assignedClasses || [];
        const sections = res.data.assignedSections || res.data.teacher?.assignedSections || [];
        setAssignedClasses(classes);
        setAssignedSections(sections);

        // Auto-select class & section
        let defaultClass = '';
        let defaultSection = '';

        if (classes.length > 0) {
          defaultClass = classes[0]._id || classes[0];
          const relevantSections = sections.filter((sec) => {
            const cId = sec.classId?._id || sec.classId;
            return !cId || String(cId) === String(defaultClass);
          });
          if (relevantSections.length > 0) {
            defaultSection = relevantSections[0]._id || relevantSections[0];
          } else if (sections.length > 0) {
            defaultSection = sections[0]._id || sections[0];
          }
        }

        setSelectedClassId((prev) => prev || (defaultClass ? String(defaultClass) : ''));
        setSelectedSectionId((prev) => prev || (defaultSection ? String(defaultSection) : ''));
      }
    } catch (err) {
      console.error('Fetch attendance options error:', err);
      setFetchError('Unable to load class and section data. Please retry.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadStudentRoster = async () => {
    if (!currentSession?._id || !selectedClassId || !selectedSectionId) return;
    try {
      setLoadingRoster(true);
      const res = await api.get('/teacher/attendance/session', {
        params: {
          academicSessionId: currentSession._id,
          classId: selectedClassId,
          sectionId: selectedSectionId,
          date: attendanceDate,
        },
      });
      if (res.data.success) {
        setSessionData(res.data.session);
        setRoster(res.data.studentRoster || []);
        setRemarks(res.data.session?.remarks || '');
      }
    } catch (err) {
      console.error('Load student roster error:', err);
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Update selectedSectionId when selectedClassId changes
  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    const relevantSections = assignedSections.filter((sec) => {
      const cId = sec.classId?._id || sec.classId;
      return !cId || String(cId) === String(newClassId);
    });
    if (relevantSections.length > 0) {
      setSelectedSectionId(relevantSections[0]._id || relevantSections[0]);
    } else {
      setSelectedSectionId('');
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedSectionId && currentSession?._id) {
      loadStudentRoster();
    } else {
      setRoster([]);
    }
  }, [selectedClassId, selectedSectionId, attendanceDate, currentSession]);

  const updateIndividualStatus = (studentId, status) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const updateIndividualRemark = (studentId, remark) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remark } : item))
    );
  };

  const bulkMarkPresent = () => {
    setRoster((prev) => prev.map((item) => ({ ...item, status: 'present' })));
  };

  const handleSaveAttendance = async (targetStatus) => {
    if (!currentSession?._id || !selectedClassId || !selectedSectionId) return;
    setSubmitting(true);

    try {
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remark: r.remark,
      }));

      const res = await api.post('/teacher/attendance/session', {
        academicSessionId: currentSession._id,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        date: attendanceDate,
        status: targetStatus,
        remarks,
        records,
      });

      if (res.data.success) {
        setShowSubmitModal(false);
        setSessionData(res.data.session);
        alert(`Attendance ${targetStatus === 'submitted' ? 'submitted' : 'draft saved'} successfully!`);
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to save attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = roster.filter((r) => r.status === 'present').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const lateCount = roster.filter((r) => r.status === 'late').length;
  const leaveCount = roster.filter((r) => r.status === 'leave').length;

  const isLocked = sessionData?.status === 'locked';
  const isSubmitted = sessionData?.status === 'submitted';

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
                Daily Student Attendance Marking
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Mark daily attendance for your assigned class and section. Save draft or submit to lock.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={bulkMarkPresent}
                disabled={isSubmitted || isLocked || roster.length === 0}
                className="px-3.5 py-2 bg-success/15 hover:bg-success/25 border border-success/30 text-success rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => handleSaveAttendance('draft')}
                disabled={submitting || isSubmitted || isLocked || roster.length === 0}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-chestnut" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting || isSubmitted || isLocked || roster.length === 0}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Attendance</span>
              </button>
            </div>
          </div>

          {/* Fetch Error Warning */}
          {fetchError && (
            <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-danger font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                <span>{fetchError}</span>
              </div>
              <button
                onClick={fetchOptions}
                className="px-3 py-1.5 bg-danger text-white rounded-xl text-xs font-bold hover:bg-danger/90 transition-all shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* No Assigned Class Notice */}
          {!loadingOptions && !fetchError && assignedClasses.length === 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-darkBrown">
              <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
              <span>No class or section has been assigned to your teacher profile for daily attendance. Please contact your school administrator.</span>
            </div>
          )}

          {/* Missing Session Notice */}
          {!loadingOptions && !fetchError && !currentSession && (
            <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-darkBrown">
              <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
              <span>No active academic session found for this school. Please ask your administrator to configure an academic session in Principal Setup.</span>
            </div>
          )}

          {/* Scope Selector Bar */}
          <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
                >
                  {assignedClasses.length === 0 ? (
                    <option value="">No class assigned</option>
                  ) : (
                    assignedClasses.map((c) => (
                      <option key={c._id || c} value={c._id || c}>
                        {c.name || c.displayName || 'Class'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Section</label>
                {(() => {
                  const relevantSections = assignedSections.filter((sec) => {
                    const cId = sec.classId?._id || sec.classId;
                    return !cId || String(cId) === String(selectedClassId);
                  });
                  return (
                    <select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
                    >
                      {relevantSections.length === 0 ? (
                        <option value="">No section assigned</option>
                      ) : (
                        relevantSections.map((sec) => (
                          <option key={sec._id || sec} value={sec._id || sec}>
                            Section {sec.name}
                          </option>
                        ))
                      )}
                    </select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-textMuted">Session Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  isSubmitted
                    ? 'bg-success/15 text-success'
                    : isLocked
                    ? 'bg-danger/15 text-danger'
                    : 'bg-warning/15 text-warning'
                }`}
              >
                {sessionData?.status || 'Draft'}
              </span>
            </div>
          </div>

          {/* Quick Counts Metric */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-almond/40 shadow-card text-center">
              <span className="text-[10px] font-bold text-textMuted uppercase block">Total</span>
              <span className="text-xl font-black text-darkBrown">{roster.length}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-almond/40 shadow-card text-center">
              <span className="text-[10px] font-bold text-success uppercase block">Present</span>
              <span className="text-xl font-black text-success">{presentCount}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-almond/40 shadow-card text-center">
              <span className="text-[10px] font-bold text-danger uppercase block">Absent</span>
              <span className="text-xl font-black text-danger">{absentCount}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-almond/40 shadow-card text-center">
              <span className="text-[10px] font-bold text-warning uppercase block">Late</span>
              <span className="text-xl font-black text-warning">{lateCount}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-almond/40 shadow-card text-center">
              <span className="text-[10px] font-bold text-morning uppercase block">Leave</span>
              <span className="text-xl font-black text-morning">{leaveCount}</span>
            </div>
          </div>

          {/* Student Attendance Marking Roster */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Student Roster</h3>

            {loadingRoster ? (
              <LoadingSkeleton count={5} />
            ) : roster.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <Users className="w-8 h-8 mx-auto text-textMuted/60" />
                <div className="text-darkBrown font-bold text-xs">No active students enrolled</div>
                <div className="text-textMuted text-[11px]">No active students are enrolled in this class section.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Roll & Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4 text-center">Attendance Status</th>
                      <th className="py-3 px-4 rounded-r-xl">Teacher Remark</th>
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

                        <td className="py-3 px-4 font-mono text-chestnut font-bold">
                          {r.admissionNumber}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {[
                              { id: 'present', label: 'P', color: 'bg-success text-white' },
                              { id: 'absent', label: 'A', color: 'bg-danger text-white' },
                              { id: 'late', label: 'L', color: 'bg-warning text-white' },
                              { id: 'leave', label: 'LV', color: 'bg-morning text-white' },
                            ].map((btn) => (
                              <button
                                key={btn.id}
                                disabled={isSubmitted || isLocked}
                                onClick={() => updateIndividualStatus(r.studentId, btn.id)}
                                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                                  r.status === btn.id
                                    ? `${btn.color} shadow-sm scale-105`
                                    : 'bg-surface text-textMuted border border-almond/40 hover:bg-almond/20'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <input
                            type="text"
                            disabled={isSubmitted || isLocked}
                            placeholder="Optional remark..."
                            value={r.remark || ''}
                            onChange={(e) => updateIndividualRemark(r.studentId, e.target.value)}
                            className="w-full px-2.5 py-1 bg-surface border border-almond/60 rounded-lg text-xs focus:outline-none focus:border-chestnut disabled:opacity-50"
                          />
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

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Confirm Attendance Submission</h3>
            <p className="text-xs text-textMuted">
              Submitting will lock attendance for date <strong className="text-darkBrown">{attendanceDate}</strong>. Submitting locks direct editing by teachers unless unlocked by Principal.
            </p>

            <div className="p-3 bg-surface rounded-xl border border-almond/40 text-xs space-y-1">
              <div>Present: <strong className="text-success">{presentCount}</strong></div>
              <div>Absent: <strong className="text-danger">{absentCount}</strong></div>
              <div>Late: <strong className="text-warning">{lateCount}</strong></div>
              <div>Leave: <strong className="text-morning">{leaveCount}</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-almond rounded-xl text-xs text-textMuted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveAttendance('submitted')}
                className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceMarkingPage;
