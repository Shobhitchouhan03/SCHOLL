import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  Plus,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';

const TeacherHomeworkPage = () => {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchHomeworks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/homework');
      if (res.data.success) {
        setHomeworks(res.data.homeworks || []);
      }
    } catch (err) {
      console.error('Fetch teacher homework error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const handlePublish = async (homeworkId) => {
    try {
      const res = await api.post(`/teacher/homework/${homeworkId}/publish`);
      if (res.data.success) {
        fetchHomeworks();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to publish homework.');
    }
  };

  const filteredHomeworks = homeworks.filter((h) => {
    if (activeTab === 'draft') return h.status === 'draft';
    if (activeTab === 'published') return h.status === 'published';
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
                Homework & Assignments Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Create and publish homework for your assigned classes and subjects.
              </p>
            </div>

            <button
              onClick={() => navigate('/teacher/homework/new')}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Homework</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Homework" value={homeworks.length} subtitle="Created tasks" icon={BookOpen} color="chestnut" />
            <StatCard title="Published" value={homeworks.filter((h) => h.status === 'published').length} subtitle="Visible to parents" icon={CheckCircle2} color="success" />
            <StatCard title="Drafts" value={homeworks.filter((h) => h.status === 'draft').length} subtitle="Unpublished drafts" icon={Clock} color="warning" />
          </div>

          {/* List & Tabs */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-almond/30 pb-3">
              {['all', 'published', 'draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activeTab === tab ? 'bg-chestnut text-white shadow-sm' : 'bg-surface text-textMuted hover:bg-almond/30'
                  }`}
                >
                  {tab} Tasks
                </button>
              ))}
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : filteredHomeworks.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No homework assignments found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHomeworks.map((h) => (
                  <div key={h._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chestnut/10 text-chestnut">
                          {h.subjectId?.name} ({h.classId?.name})
                        </span>
                        <h4 className="text-sm font-bold text-darkBrown mt-1">{h.title}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          h.status === 'published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>

                    <p className="text-xs text-textMuted line-clamp-2">{h.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-textMuted pt-2 border-t border-almond/30">
                      <span>Due: <strong className="text-darkBrown">{new Date(h.dueDate).toLocaleDateString()}</strong></span>

                      {h.status === 'draft' && (
                        <button
                          onClick={() => handlePublish(h._id)}
                          className="px-3 py-1 bg-success text-white rounded-lg text-[10px] font-bold hover:bg-success/90 transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish Now</span>
                        </button>
                      )}
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

export default TeacherHomeworkPage;
