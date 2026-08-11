import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';

const CreateExamPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Reference Data
  const [currentSession, setCurrentSession] = useState(null);
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // Step 1: Exam Info
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [examType, setExamType] = useState('term');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState([]);

  // Step 2: Created Exam Object & Schedule Items
  const [createdExam, setCreatedExam] = useState(null);
  const [schedules, setSchedules] = useState([]);

  // New Schedule Input State
  const [schedClassId, setSchedClassId] = useState('');
  const [schedSubjectId, setSchedSubjectId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(33);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, classRes, subRes] = await Promise.all([
        api.get('/principal/setup/academic-sessions'),
        api.get('/principal/classes'),
        api.get('/principal/subjects'),
      ]);

      if (sessRes.data.success) {
        const curr = sessRes.data.academicSessions.find((s) => s.isCurrent) || sessRes.data.academicSessions[0];
        setCurrentSession(curr);
      }
      if (classRes.data.success) {
        setClassesList(classRes.data.classes || []);
        if (classRes.data.classes?.length > 0) {
          setSelectedClassIds([classRes.data.classes[0]._id]);
          setSchedClassId(classRes.data.classes[0]._id);
        }
      }
      if (subRes.data.success) {
        setSubjectsList(subRes.data.subjects || []);
        if (subRes.data.subjects?.length > 0) {
          setSchedSubjectId(subRes.data.subjects[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch create exam data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/exams', {
        academicSessionId: currentSession?._id,
        name,
        code,
        examType,
        description,
        applicableClassIds: selectedClassIds,
        startDate,
        endDate,
      });

      if (res.data.success) {
        setCreatedExam(res.data.exam);
        setStep(2);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create exam header.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/principal/exams/${createdExam._id}/schedules`, {
        classId: schedClassId,
        subjectId: schedSubjectId,
        examDate: schedDate,
        maximumMarks: maxMarks,
        passingMarks: passMarks,
      });

      if (res.data.success) {
        setSchedules((prev) => [...prev, res.data.schedule]);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to add exam schedule.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/exams')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exams Directory</span>
          </button>

          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Exam Creation Wizard</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                {step === 1 ? '1. Exam Header Details' : '2. Subject Exam Schedules'}
              </h1>
            </div>

            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Exam Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual Final Examinations 2026"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Exam Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ANNUAL2026"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono font-bold focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    >
                      <option value="unitTest">Unit Test</option>
                      <option value="monthly">Monthly</option>
                      <option value="halfYearly">Half Yearly</option>
                      <option value="annual">Annual Final</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-almond/30">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Creating Exam...' : 'Next: Add Subject Schedules →'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Form to Add Schedule */}
                <form onSubmit={handleAddSchedule} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-3">
                  <h4 className="font-bold text-darkBrown">Add Subject Exam Schedule</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Class</label>
                      <select
                        value={schedClassId}
                        onChange={(e) => setSchedClassId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg"
                      >
                        {classesList.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Subject</label>
                      <select
                        value={schedSubjectId}
                        onChange={(e) => setSchedSubjectId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg"
                      >
                        {subjectsList.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Exam Date</label>
                      <input
                        type="date"
                        required
                        value={schedDate}
                        onChange={(e) => setSchedDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Maximum Marks</label>
                      <input
                        type="number"
                        required
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Passing Marks</label>
                      <input
                        type="number"
                        required
                        value={passMarks}
                        onChange={(e) => setPassMarks(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg font-mono font-bold"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Schedule</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Schedules List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-darkBrown">Configured Schedules ({schedules.length})</h4>
                  {schedules.length === 0 ? (
                    <div className="p-4 text-center text-textMuted">No subject schedules added yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {schedules.map((s) => (
                        <div key={s._id} className="p-3 bg-white rounded-xl border border-almond/40 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-darkBrown">{s.subjectId?.name}</div>
                            <div className="text-[11px] text-textMuted">
                              Class: {s.classId?.name} • Date: {new Date(s.examDate).toLocaleDateString()} • Max: {s.maximumMarks} • Pass: {s.passingMarks}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-success/15 text-success text-[10px] font-bold rounded">Configured</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-almond/30">
                  <button
                    type="button"
                    onClick={() => navigate('/principal/exams')}
                    className="px-5 py-2 bg-success text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Exam Schedule Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateExamPage;
