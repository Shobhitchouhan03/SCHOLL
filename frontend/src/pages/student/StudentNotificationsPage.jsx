import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bell } from 'lucide-react';

const StudentNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Fetch student notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data.success) fetchNotifications();
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Student Portal</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              My Notifications
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Read-only notification inbox for homework announcements, exam schedules, and circulars.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Notifications ({notifications.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No notifications in your inbox.</div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      n.status === 'read' ? 'bg-surface/50 border-almond/30' : 'bg-white border-chestnut/30 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                          {n.category}
                        </span>
                        <span className="font-bold text-darkBrown">{n.title}</span>
                      </div>
                      <p className="text-textMuted">{n.content}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-textMuted font-mono">
                        {new Date(n.sentAt || n.createdAt).toLocaleTimeString()}
                      </span>

                      {n.status !== 'read' && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="px-2.5 py-1 bg-chestnut/10 text-chestnut rounded-lg text-[10px] font-bold hover:bg-chestnut hover:text-white transition-colors"
                        >
                          Mark Read
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

export default StudentNotificationsPage;
