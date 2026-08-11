import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, Bell, Calendar, Archive, AlertTriangle } from 'lucide-react';

const PrincipalNoticesPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/notices');
      if (res.data.success) setNotices(res.data.notices || []);
    } catch (err) {
      console.error('Fetch notices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleArchive = async (noticeId) => {
    try {
      const res = await api.post(`/principal/notices/${noticeId}/archive`);
      if (res.data.success) fetchNotices();
    } catch (err) {
      alert(err.customMessage || 'Archive failed.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">School Announcements</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Notice Board Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Publish targeted announcements, circulars, exam alerts, and holidays for teachers and parents.
              </p>
            </div>

            <button
              onClick={() => navigate('/principal/notices/new')}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Notice</span>
            </button>
          </div>

          {/* Notices Directory */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Published Notices ({notices.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No notices published yet.</div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          n.priority === 'urgent' ? 'bg-danger/15 text-danger' : 'bg-chestnut/15 text-chestnut'
                        }`}>
                          {n.priority}
                        </span>
                        <span className="text-xs font-bold text-darkBrown capitalize">Type: {n.noticeType}</span>
                      </div>

                      <span className="text-[11px] text-textMuted font-mono">
                        Published: {new Date(n.publishDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-darkBrown">{n.title}</h4>
                    <p className="text-xs text-textMuted">{n.content}</p>

                    <div className="pt-2 border-t border-almond/30 flex items-center justify-between text-xs">
                      <span className="text-textMuted">Targets: <strong>{(n.targetRoles || []).join(', ')}</strong></span>

                      {n.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(n._id)}
                          className="px-2.5 py-1 bg-white border border-almond text-textMuted rounded-lg text-[10px] font-bold hover:text-darkBrown transition-colors flex items-center gap-1"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
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

export default PrincipalNoticesPage;
