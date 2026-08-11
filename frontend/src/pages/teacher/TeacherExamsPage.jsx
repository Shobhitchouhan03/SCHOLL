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
} from 'lucide-react';

const TeacherExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/exams');
      if (res.data.success) {
        setExams(res.data.exams || []);
      }
    } catch (err) {
      console.error('Fetch teacher exams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
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
              <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Assigned Exams & Student Marks Entry
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Enter and submit student marks for your assigned examination subjects.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Assigned Exams" value={exams.length} subtitle="Scheduled tests" icon={Award} color="chestnut" />
            <StatCard title="Active Session" value="2026-2027" subtitle="Current academic year" icon={Calendar} color="morning" />
          </div>

          {/* Exams List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Assigned Exams Register</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : exams.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No exams assigned to your classes yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((e) => (
                  <div key={e._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                          {e.code}
                        </span>
                        <h4 className="text-sm font-bold text-darkBrown mt-1">{e.name}</h4>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-warning/15 text-warning">
                        {e.status}
                      </span>
                    </div>

                    <div className="text-xs text-textMuted flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-morning" />
                      <span>{new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}</span>
                    </div>

                    <div className="pt-2 border-t border-almond/30 flex justify-end">
                      <button
                        onClick={() => navigate(`/teacher/exams/${e._id}/marks-entry`)}
                        className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Enter Marks</span>
                      </button>
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

export default TeacherExamsPage;
