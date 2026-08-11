import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Award,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Search,
} from 'lucide-react';

const PrincipalExamsDirectoryPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/exams');
      if (res.data.success) {
        setExams(res.data.exams || []);
      }
    } catch (err) {
      console.error('Fetch principal exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    if (activeTab === 'published') return e.status === 'published';
    if (activeTab === 'scheduled') return e.status === 'scheduled';
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Principal Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Examinations & Results Directory
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage school exam schedules, review teacher marks submissions, generate results, and publish report cards.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/principal/promotions')}
                className="px-4 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all shrink-0"
              >
                <span>Session Promotions</span>
              </button>

              <button
                onClick={() => navigate('/principal/exams/new')}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Exam</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Exams" value={exams.length} subtitle="Created exams" icon={Award} color="chestnut" />
            <StatCard title="Published Results" value={exams.filter((e) => e.status === 'published').length} subtitle="Visible to parents" icon={CheckCircle2} color="success" />
            <StatCard title="Scheduled Exams" value={exams.filter((e) => e.status === 'scheduled').length} subtitle="Upcoming tests" icon={Clock} color="warning" />
          </div>

          {/* Exams List & Tabs */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-almond/30 pb-3">
              {['all', 'scheduled', 'published'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activeTab === tab ? 'bg-chestnut text-white shadow-sm' : 'bg-surface text-textMuted hover:bg-almond/30'
                  }`}
                >
                  {tab} Exams
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No exams found matching criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Exam Name & Code</th>
                      <th className="py-3 px-4">Exam Type</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {filteredExams.map((e) => (
                      <tr key={e._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{e.name}</div>
                          <div className="text-[10px] font-mono font-bold text-chestnut">{e.code}</div>
                        </td>

                        <td className="py-3 px-4 capitalize font-semibold">
                          {e.examType}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              e.status === 'published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/principal/exams/${e._id}/marks-review`)}
                              className="px-2.5 py-1 rounded-lg border border-almond text-textMuted hover:text-darkBrown hover:bg-surface transition-colors text-[10px] font-bold"
                            >
                              Review Marks
                            </button>

                            <button
                              onClick={() => navigate(`/principal/exams/${e._id}/results`)}
                              className="px-2.5 py-1 rounded-lg bg-chestnut text-white text-[10px] font-bold shadow-sm hover:bg-darkBrown transition-colors"
                            >
                              Results Console
                            </button>
                          </div>
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

export default PrincipalExamsDirectoryPage;
