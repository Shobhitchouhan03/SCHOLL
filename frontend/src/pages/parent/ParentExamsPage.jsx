import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Award, Calendar, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

const ParentExamsPage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'results'
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const fetchExamsAndResults = async (childId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const [exRes, resRes] = await Promise.all([
        api.get(`/parent/children/${childId}/exams`),
        api.get(`/parent/children/${childId}/results`),
      ]);

      if (exRes.data.success) setExams(exRes.data.exams || []);
      if (resRes.data.success) setResults(resRes.data.results || []);
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchExamsAndResults(selectedChildId);
    }
  }, [selectedChildId]);

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
                Exams & Published Results
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Check upcoming exam dates, maximum marks, subject marks, and grades.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center bg-surface p-1 rounded-xl border border-almond/40">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'upcoming' ? 'bg-chestnut text-white shadow-sm' : 'text-textMuted hover:text-darkBrown'
                }`}
              >
                Upcoming Exams ({exams.length})
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'results' ? 'bg-chestnut text-white shadow-sm' : 'text-textMuted hover:text-darkBrown'
                }`}
              >
                Published Results ({results.length})
              </button>
            </div>
          </div>

          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
          />

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : activeTab === 'upcoming' ? (
            /* Upcoming Exams Tab */
            exams.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-almond/40 shadow-card text-center text-xs text-textMuted font-medium">
                No upcoming exams published at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((ex) => (
                  <div key={ex._id} className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-chestnut/10 text-chestnut rounded-lg text-xs font-extrabold">
                        {ex.subjectId?.name || 'Subject'}
                      </span>
                      <span className="text-xs font-bold text-darkBrown">{ex.term || 'Term Exam'}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-darkBrown">{ex.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-textMuted mt-1">
                        <span>Max Marks: <strong className="text-darkBrown">{ex.maxMarks || 100}</strong></span>
                        <span>Passing Marks: <strong className="text-darkBrown">{ex.passingMarks || 40}</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-almond/20 flex items-center justify-between text-xs text-darkBrown font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-chestnut" />
                        <span>{new Date(ex.examDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {ex.startTime && (
                        <div className="flex items-center gap-1 text-textMuted">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{ex.startTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Published Results Tab */
            results.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-almond/40 shadow-card text-center text-xs text-textMuted font-medium">
                No published exam results available for this child yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Subject Marks Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-almond/30 text-textMuted font-semibold">
                        <th className="pb-3 px-3">Subject</th>
                        <th className="pb-3 px-3">Exam / Term</th>
                        <th className="pb-3 px-3">Marks Obtained</th>
                        <th className="pb-3 px-3">Max Marks</th>
                        <th className="pb-3 px-3">Grade</th>
                        <th className="pb-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-almond/20 text-darkBrown">
                      {results.map((r) => {
                        const isPassed = r.marksObtained >= (r.passingMarks || 40);
                        return (
                          <tr key={r._id} className="hover:bg-surface/50 transition-colors">
                            <td className="py-3 px-3 font-bold">{r.subjectId?.name || 'Subject'}</td>
                            <td className="py-3 px-3 text-textMuted">{r.examId?.name || 'Exam'}</td>
                            <td className="py-3 px-3 font-mono font-bold text-chestnut">{r.marksObtained}</td>
                            <td className="py-3 px-3 font-mono text-textMuted">{r.maxMarks || 100}</td>
                            <td className="py-3 px-3 font-extrabold">{r.grade || 'A'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isPassed ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                              }`}>
                                {isPassed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentExamsPage;
