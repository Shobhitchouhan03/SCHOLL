import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  BookOpen,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Users,
} from 'lucide-react';

const ParentResultsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success && res.data.children?.length > 0) {
        setChildrenList(res.data.children);
        setSelectedChildId(res.data.children[0]._id);
      }
    } catch (err) {
      console.error('Fetch parent data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (childId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/results`);
      if (res.data.success) {
        setResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Fetch parent results error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchResults(selectedChildId);
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
                Child Academic Results & Report Cards
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                View published examination results and download official report cards.
              </p>
            </div>
          </div>

          {/* Child Selector Banner */}
          {childrenList.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-chestnut shrink-0" />
                <span className="text-xs font-bold text-darkBrown">
                  Select Child Profile:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {childrenList.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChildId(child._id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedChildId === child._id
                        ? 'bg-chestnut text-white shadow-sm'
                        : 'bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown'
                    }`}
                  >
                    {child.fullName || child.firstName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Published Examination Results ({results.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No published exam results found for this student.</div>
            ) : (
              <div className="space-y-4">
                {results.map((resObj) => (
                  <div key={resObj._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-almond/30 pb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chestnut/10 text-chestnut">
                          {resObj.examId?.name || 'Exam'}
                        </span>
                        <h4 className="text-base font-black text-darkBrown mt-1">
                          Overall Score: <span className="text-chestnut">{resObj.totalObtainedMarks}</span> / {resObj.totalMaximumMarks} ({resObj.percentage}%)
                        </h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${resObj.resultStatus === 'pass' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                          Result: {resObj.resultStatus}
                        </span>

                        <button
                          onClick={() => navigate(`/parent/children/${selectedChildId}/report-card/${resObj._id}`)}
                          className="px-3.5 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Report Card</span>
                        </button>
                      </div>
                    </div>

                    {/* Subject Results Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {(resObj.subjectResults || []).map((sub, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-almond/40">
                          <span className="text-[10px] text-textMuted font-bold uppercase block">{sub.subjectName}</span>
                          <div className="font-bold text-darkBrown">{sub.obtainedMarks} / {sub.maximumMarks}</div>
                          <div className="text-[10px] text-chestnut font-semibold">Grade: {sub.grade}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentResultsPage;
