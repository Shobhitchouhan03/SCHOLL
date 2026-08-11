import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';

const PrincipalHomeworkConsolePage = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/homework');
      if (res.data.success) {
        setHomeworks(res.data.homeworks || []);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Fetch principal homework error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

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
                School Homework & Assignments Console
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Overview of all homework published across teachers and classes in the school.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Published" value={summary?.totalPublished || 0} subtitle="Visible to parents" icon={CheckCircle2} color="success" />
            <StatCard title="Draft Tasks" value={summary?.totalDrafts || 0} subtitle="Unpublished teacher drafts" icon={Clock} color="warning" />
            <StatCard title="Total Assigned" value={summary?.totalCount || 0} subtitle="All homework tasks" icon={BookOpen} color="chestnut" />
          </div>

          {/* Homework Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Homework Register</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : homeworks.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No homework assignments found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Homework Title & Class</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Teacher</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {homeworks.map((h) => (
                      <tr key={h._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{h.title}</div>
                          <div className="text-[10px] text-textMuted">{h.classId?.name}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-chestnut">
                          {h.subjectId?.name} ({h.subjectId?.code})
                        </td>
                        <td className="py-3 px-4 text-textMuted">
                          {h.teacherId?.name || 'Teacher'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {new Date(h.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              h.status === 'published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {h.status}
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

export default PrincipalHomeworkConsolePage;
