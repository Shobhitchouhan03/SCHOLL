import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  GraduationCap,
  ArrowLeft,
  Send,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react';

const StudentPromotionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // References
  const [sessions, setSessions] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  // Selections
  const [fromSessionId, setFromSessionId] = useState('');
  const [toSessionId, setToSessionId] = useState('');
  const [fromClassId, setFromClassId] = useState('');
  const [fromSectionId, setFromSectionId] = useState('');

  // Roster
  const [students, setStudents] = useState([]);
  const [promotionDecisions, setPromotionDecisions] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, classRes, secRes] = await Promise.allSettled([
        api.get('/principal/academic-sessions'),
        api.get('/principal/classes'),
        api.get('/principal/sections'),
      ]);

      if (sessRes.status === 'fulfilled' && sessRes.value.data?.success) {
        const sessList = sessRes.value.data.sessions || sessRes.value.data.academicSessions || [];
        setSessions(sessList);
        if (sessList.length > 1) {
          setFromSessionId(sessList[0]._id);
          setToSessionId(sessList[1]._id);
        } else if (sessList.length === 1) {
          setFromSessionId(sessList[0]._id);
        }
      }
      if (classRes.status === 'fulfilled' && classRes.value.data?.success && classRes.value.data.classes?.length > 0) {
        setClassesList(classRes.value.data.classes);
        setFromClassId(classRes.value.data.classes[0]._id);
      }
      if (secRes.status === 'fulfilled' && secRes.value.data?.success && secRes.value.data.sections?.length > 0) {
        setSectionsList(secRes.value.data.sections);
        setFromSectionId(secRes.value.data.sections[0]._id);
      }
    } catch (err) {
      console.error('Fetch promotion options error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!fromClassId || !fromSectionId) return;
    try {
      const res = await api.get('/principal/students', {
        params: { classId: fromClassId, sectionId: fromSectionId },
      });
      if (res.data.success) {
        const list = res.data.students || [];
        setStudents(list);

        const initialDecisions = {};
        list.forEach((s) => {
          initialDecisions[s._id] = { decision: 'promoted', newRollNumber: s.rollNumber || 1 };
        });
        setPromotionDecisions(initialDecisions);
      }
    } catch (err) {
      console.error('Load students error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fromClassId && fromSectionId) {
      loadStudents();
    }
  }, [fromClassId, fromSectionId]);

  const handleDecisionChange = (studentId, field, val) => {
    setPromotionDecisions((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val,
      },
    }));
  };

  const handleExecutePromotions = async () => {
    setSubmitting(true);
    try {
      const promotions = students.map((s) => ({
        studentId: s._id,
        toClassId: fromClassId, // Simplified for demo selection
        toSectionId: fromSectionId,
        decision: promotionDecisions[s._id]?.decision || 'promoted',
        newRollNumber: Number(promotionDecisions[s._id]?.newRollNumber || 1),
      }));

      const res = await api.post('/principal/promotions', {
        fromAcademicSessionId: fromSessionId,
        toAcademicSessionId: toSessionId,
        fromClassId,
        promotions,
      });

      if (res.data.success) {
        alert(`Successfully executed promotion for ${res.data.count} students!`);
        navigate('/principal/students');
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to execute promotions.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Session-End Wizard</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Promotion & Graduation Console
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Bulk promote passed students to next session, retain students, or mark final-class graduation.
              </p>
            </div>

            <button
              onClick={handleExecutePromotions}
              disabled={submitting || students.length === 0}
              className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{submitting ? 'Executing...' : 'Execute Session Promotion'}</span>
            </button>
          </div>

          {/* Scope Selector */}
          <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-textMuted mb-1">From Session</label>
              <select
                value={fromSessionId}
                onChange={(e) => setFromSessionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-almond/60 rounded-xl font-bold"
              >
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-textMuted mb-1">To Destination Session</label>
              <select
                value={toSessionId}
                onChange={(e) => setToSessionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-almond/60 rounded-xl font-bold"
              >
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-textMuted mb-1">Current Class</label>
              <select
                value={fromClassId}
                onChange={(e) => setFromClassId(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-almond/60 rounded-xl font-bold"
              >
                {classesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-textMuted mb-1">Current Section</label>
              <select
                value={fromSectionId}
                onChange={(e) => setFromSectionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-almond/60 rounded-xl font-bold"
              >
                {sectionsList.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    Section {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Students Promotion Roster ({students.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No active students found in selected class/section.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Current Roll</th>
                      <th className="py-3 px-4">Promotion Decision</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">New Roll No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-darkBrown">{s.fullName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-chestnut">{s.admissionNumber}</td>
                        <td className="py-3 px-4 font-mono">{s.rollNumber ? `#${s.rollNumber}` : '-'}</td>
                        <td className="py-3 px-4">
                          <select
                            value={promotionDecisions[s._id]?.decision || 'promoted'}
                            onChange={(e) => handleDecisionChange(s._id, 'decision', e.target.value)}
                            className="px-2.5 py-1 bg-surface border border-almond/60 rounded-lg text-xs font-bold"
                          >
                            <option value="promoted">Promote to Next Class</option>
                            <option value="retained">Retain in Same Class</option>
                            <option value="graduated">Graduate Student</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            value={promotionDecisions[s._id]?.newRollNumber || 1}
                            onChange={(e) => handleDecisionChange(s._id, 'newRollNumber', e.target.value)}
                            className="w-16 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs text-right font-mono font-bold"
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
    </div>
  );
};

export default StudentPromotionPage;
