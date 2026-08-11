import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bell, Calendar, Paperclip, AlertCircle } from 'lucide-react';

const ParentNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/notices');
      if (res.data.success) {
        setNotices(res.data.notices || []);
      }
    } catch (err) {
      console.error('Fetch parent notices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                School Circulars & Targeted Notices
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Stay updated with official school announcements, holiday circulars, and class notices.
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-almond/40 shadow-card text-center text-xs text-textMuted font-medium">
              No active school circulars or class notices published at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((n) => (
                <div key={n._id} className="bg-white rounded-2xl p-6 border border-almond/40 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                      n.priority === 'urgent'
                        ? 'bg-danger/15 text-danger'
                        : n.priority === 'high'
                        ? 'bg-warning/15 text-darkBrown'
                        : 'bg-chestnut/10 text-chestnut'
                    }`}>
                      {n.priority || 'General'} Notice
                    </span>

                    <span className="text-xs text-textMuted font-mono">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-darkBrown">{n.title}</h3>
                    <p className="text-xs text-textMuted mt-1 leading-relaxed whitespace-pre-line">{n.message || n.content}</p>
                  </div>

                  {n.attachmentUrl && (
                    <div className="pt-2 border-t border-almond/20 flex items-center justify-between text-xs">
                      <a
                        href={n.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-chestnut font-bold hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>Download Circular Attachment</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentNoticesPage;
