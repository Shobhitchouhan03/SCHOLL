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
  BookOpen,
  Filter,
  Users,
  FileText,
  Lock,
} from 'lucide-react';

const TeacherExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, scheduled, draft, completed

  // Options & Context
  const [options, setOptions] = useState({
    teacher: null,
    isClassTeacher: false,
    currentSession: null,
    assignedClasses: [],
    assignedSections: [],
    subjectAssignments: [],
    availableSubjects: [],
  });

  // Assessment Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [createForm, setCreateForm] = useState({
    title: '',
    assessmentType: 'unitTest',
    classId: '',
    sectionId: '',
    subjectId: '',
    examDate: new Date().toISOString().substring(0, 10),
    maximumMarks: 50,
    passingMarks: 18,
    description: '',
    instructions: '',
  });

  const fetchOptionsAndExams = async () => {
    try {
      setLoading(true);
      const [optRes, examsRes] = await Promise.allSettled([
        api.get('/teacher/exams/options'),
        api.get('/teacher/exams'),
      ]);

      if (optRes.status === 'fulfilled' && optRes.value.data.success) {
        const optData = optRes.value.data;
        setOptions(optData);

        // Pre-fill modal defaults if available
        const defaultClassId = optData.assignedClasses?.[0]?._id || optData.ownedClass?.classId || '';
        const relevantSections = (optData.assignedSections || []).filter(
          (s) => !defaultClassId || String(s.classId) === String(defaultClassId)
        );
        const defaultSectionId = relevantSections[0]?._id || optData.ownedClass?.sectionId || '';

        // Determine default subject
        let defaultSubjectId = '';
        if (optData.isClassTeacher) {
          defaultSubjectId = optData.availableSubjects?.[0]?._id || '';
        } else if (optData.subjectAssignments?.length > 0) {
          defaultSubjectId = optData.subjectAssignments[0]?.subjectId || '';
        }

        setCreateForm((prev) => ({
          ...prev,
          classId: defaultClassId,
          sectionId: defaultSectionId,
          subjectId: defaultSubjectId,
        }));
      }

      if (examsRes.status === 'fulfilled' && examsRes.value.data.success) {
        setExams(examsRes.value.data.exams || []);
      }
    } catch (err) {
      console.error('Fetch teacher exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptionsAndExams();
  }, []);

  // Handle Class change in Create Modal
  const handleClassChange = (newClassId) => {
    const relevantSections = (options.assignedSections || []).filter(
      (s) => String(s.classId) === String(newClassId)
    );
    const newSectionId = relevantSections[0]?._id || '';

    // Check if this class is owned or subject-assigned
    const isOwned = options.isClassTeacher && String(options.ownedClass?.classId) === String(newClassId);
    let newSubjectId = createForm.subjectId;

    if (!isOwned) {
      const match = (options.subjectAssignments || []).find(
        (sa) => String(sa.classId) === String(newClassId)
      );
      if (match) {
        newSubjectId = match.subjectId;
      }
    } else if (!newSubjectId && options.availableSubjects?.length > 0) {
      newSubjectId = options.availableSubjects[0]._id;
    }

    setCreateForm((prev) => ({
      ...prev,
      classId: newClassId,
      sectionId: newSectionId,
      subjectId: newSubjectId,
    }));
  };

  // Check if current form selection is owned class
  const isSelectedClassOwned =
    options.isClassTeacher &&
    String(options.ownedClass?.classId) === String(createForm.classId);

  // Available subjects for the currently selected class
  const selectableSubjects = isSelectedClassOwned
    ? options.availableSubjects || []
    : (options.subjectAssignments || [])
        .filter((sa) => String(sa.classId) === String(createForm.classId))
        .map((sa) => ({
          _id: sa.subjectId,
          name: sa.subjectName,
          code: sa.subjectCode,
        }));

  // Handle Create Assessment Form Submit
  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');

    if (!createForm.title.trim()) {
      setErrorMsg('Please enter an assessment title.');
      setActionLoading(false);
      return;
    }
    if (!createForm.classId || !createForm.sectionId) {
      setErrorMsg('Please select both a class and section.');
      setActionLoading(false);
      return;
    }
    if (!createForm.subjectId) {
      setErrorMsg('Please select a subject for this assessment.');
      setActionLoading(false);
      return;
    }

    try {
      const payload = {
        name: createForm.title.trim(),
        title: createForm.title.trim(),
        assessmentType: createForm.assessmentType,
        examType: createForm.assessmentType,
        academicSessionId: options.currentSession?._id,
        classId: createForm.classId,
        sectionId: createForm.sectionId,
        sectionIds: [createForm.sectionId],
        subjectId: createForm.subjectId,
        examDate: createForm.examDate,
        maximumMarks: Number(createForm.maximumMarks),
        passingMarks: Number(createForm.passingMarks),
        description: createForm.description.trim(),
        instructions: createForm.instructions.trim(),
      };

      const res = await api.post('/teacher/exams', payload);
      if (res.data.success) {
        setShowCreateModal(false);
        setSuccessMsg(`Assessment "${createForm.title}" created successfully!`);
        setTimeout(() => setSuccessMsg(''), 4500);

        // Refresh exams list
        fetchOptionsAndExams();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.customMessage || 'Failed to create assessment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter exams according to active tab
  const filteredExams = exams.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') return e.status === 'scheduled' || e.status === 'ongoing';
    if (activeTab === 'draft') return e.status === 'draft';
    if (activeTab === 'completed') return e.status === 'submitted' || e.status === 'published' || e.status === 'completed';
    return true;
  });

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
                Exams, Tests & Marks Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Create class assessments, manage unit tests, and enter student marks.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {successMsg && (
                <div className="px-3.5 py-2 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                id="btn-create-test-exam"
                onClick={() => {
                  setErrorMsg('');
                  setShowCreateModal(true);
                }}
                className="px-4 py-2.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Test / Exam</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Assessments"
              value={exams.length}
              subtitle="Scheduled & active"
              icon={Award}
              color="chestnut"
            />
            <StatCard
              title="Active Academic Session"
              value={options.currentSession?.name || '2026-2027'}
              subtitle="Current session"
              icon={Calendar}
              color="morning"
            />
            <StatCard
              title="Assigned Classes"
              value={options.assignedClasses?.length || 0}
              subtitle={options.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
              icon={Users}
              color="gold"
            />
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-almond/60 rounded-2xl">
              {[
                { id: 'all', label: 'All Exams' },
                { id: 'scheduled', label: 'Scheduled / Upcoming' },
                { id: 'draft', label: 'Draft' },
                { id: 'completed', label: 'Completed / Submitted' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'text-textMuted hover:text-darkBrown hover:bg-almond/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exams List Card */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <FileText className="w-4 h-4 text-chestnut" />
                <span>Assigned Assessments Register</span>
              </h3>
              <span className="text-xs font-bold text-textMuted">
                Showing {filteredExams.length} of {exams.length}
              </span>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : filteredExams.length === 0 ? (
              <div className="p-10 text-center bg-surface/50 rounded-2xl border border-dashed border-almond/60 space-y-3">
                <Award className="w-12 h-12 mx-auto text-textMuted/30" />
                <div>
                  <h4 className="text-sm font-bold text-darkBrown">No assessments found</h4>
                  <p className="text-xs text-textMuted mt-1 max-w-sm mx-auto">
                    No assessments match the selected filter. Create a new class assessment or unit test for your students.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setErrorMsg('');
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Create Test / Exam</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExams.map((e) => {
                  const typeLabel =
                    e.examType === 'unitTest'
                      ? 'Unit Test'
                      : e.examType === 'custom'
                      ? 'Class Test'
                      : e.examType === 'term'
                      ? 'Term Exam'
                      : e.examType === 'halfYearly'
                      ? 'Half Yearly'
                      : e.examType === 'annual'
                      ? 'Annual Exam'
                      : e.examType === 'practical'
                      ? 'Practical'
                      : 'Assessment';

                  const classNames = (e.applicableClassIds || [])
                    .map((c) => c.displayName || c.name)
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <div
                      key={e._id}
                      className="p-4 bg-surface hover:bg-surface/80 rounded-2xl border border-almond/50 shadow-sm transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                                {e.code}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-morning/15 text-morning">
                                {typeLabel}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-darkBrown mt-1.5">{e.name}</h4>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                              e.status === 'published'
                                ? 'bg-success/15 text-success'
                                : e.status === 'submitted'
                                ? 'bg-info/15 text-info'
                                : e.status === 'draft'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-morning/15 text-morning'
                            }`}
                          >
                            {e.status}
                          </span>
                        </div>

                        {classNames && (
                          <div className="text-xs text-textMuted flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-textMuted/70 shrink-0" />
                            <span>Classes: <strong className="text-darkBrown">{classNames}</strong></span>
                          </div>
                        )}

                        <div className="text-xs text-textMuted flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-morning shrink-0" />
                          <span>
                            {new Date(e.startDate).toLocaleDateString()}
                            {e.endDate && e.endDate !== e.startDate && ` - ${new Date(e.endDate).toLocaleDateString()}`}
                          </span>
                        </div>

                        {e.description && (
                          <p className="text-[11px] text-textMuted line-clamp-2 italic">
                            "{e.description}"
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-almond/30 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-textMuted font-medium">
                          Session: {e.academicSessionId?.name || options.currentSession?.name || 'Current'}
                        </span>

                        <button
                          onClick={() => navigate(`/teacher/exams/${e._id}/marks-entry`)}
                          className="px-3.5 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Enter Marks</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE ASSESSMENT / TEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <div>
                <h3 className="text-lg font-black text-darkBrown">Create Assessment / Test</h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Schedule a new test or exam and configure grading parameters.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-textMuted hover:text-darkBrown p-1 rounded-lg hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssessment} className="space-y-3.5 text-xs">
              {/* Assessment Type */}
              <div>
                <label className="font-bold text-darkBrown block mb-1">Assessment Type *</label>
                <select
                  value={createForm.assessmentType}
                  onChange={(e) => setCreateForm({ ...createForm, assessmentType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold"
                >
                  <option value="unitTest">Unit Test</option>
                  <option value="custom">Class Test / Quiz</option>
                  <option value="term">Term Exam</option>
                  <option value="halfYearly">Half Yearly Exam</option>
                  <option value="annual">Annual Exam</option>
                  <option value="practical">Practical Assessment</option>
                </select>
              </div>

              {/* Title / Name */}
              <div>
                <label className="font-bold text-darkBrown block mb-1">Assessment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit Test 1 - Mathematics"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              {/* Academic Session (Read-Only) */}
              <div>
                <label className="font-bold text-darkBrown block mb-1 flex items-center gap-1">
                  <span>Academic Session *</span>
                  <Lock className="w-3 h-3 text-textMuted/60" />
                </label>
                <input
                  type="text"
                  disabled
                  value={options.currentSession?.name || 'Active Academic Session (2026-2027)'}
                  className="w-full px-3 py-2 bg-surface/70 border border-almond/40 rounded-xl text-textMuted font-medium cursor-not-allowed"
                />
              </div>

              {/* Class & Section (Locked/Scoped) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Class *</label>
                  <select
                    required
                    value={createForm.classId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold"
                  >
                    {options.assignedClasses?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.displayName || c.name} {c.isOwned ? '(Class Teacher)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-darkBrown block mb-1">Section *</label>
                  <select
                    required
                    value={createForm.sectionId}
                    onChange={(e) => setCreateForm({ ...createForm, sectionId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold"
                  >
                    {(options.assignedSections || [])
                      .filter((s) => !createForm.classId || String(s.classId) === String(createForm.classId))
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          Section {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="font-bold text-darkBrown block mb-1 flex items-center justify-between">
                  <span>Subject *</span>
                  {!isSelectedClassOwned && (
                    <span className="text-[10px] text-morning font-normal">
                      (Locked to assigned teaching subject)
                    </span>
                  )}
                </label>
                <select
                  required
                  value={createForm.subjectId}
                  disabled={!isSelectedClassOwned && selectableSubjects.length === 1}
                  onChange={(e) => setCreateForm({ ...createForm, subjectId: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold ${
                    !isSelectedClassOwned && selectableSubjects.length === 1 ? 'opacity-85 cursor-not-allowed' : ''
                  }`}
                >
                  {selectableSubjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Marks */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.examDate}
                    onChange={(e) => setCreateForm({ ...createForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="font-bold text-darkBrown block mb-1">Max Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={createForm.maximumMarks}
                    onChange={(e) => {
                      const max = Number(e.target.value);
                      setCreateForm({
                        ...createForm,
                        maximumMarks: max,
                        passingMarks: Math.round(max * 0.35),
                      });
                    }}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-darkBrown block mb-1">Passing Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={createForm.maximumMarks}
                    value={createForm.passingMarks}
                    onChange={(e) => setCreateForm({ ...createForm, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-bold"
                  />
                </div>
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="font-bold text-darkBrown block mb-1">Instructions / Description (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Chapters 1 to 4 included. Calculator not allowed."
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-almond/30 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{actionLoading ? 'Creating Assessment...' : 'Create Assessment'}</span>
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
