import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Send, Bell, Plus } from 'lucide-react';

const TeacherCommunicationPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, tchRes] = await Promise.all([
        api.get('/teacher/communication/announcements'),
        api.get('/teacher/students'),
      ]);

      if (annRes.data.success) setAnnouncements(annRes.data.announcements || []);
      if (tchRes.data.success && tchRes.data.assignedClasses?.length > 0) {
        setClasses(tchRes.data.assignedClasses);
        setSelectedClassId(tchRes.data.assignedClasses[0]._id);
      }
    } catch (err) {
      console.error('Fetch teacher communication error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedClassId) {
      setError('Please select an assigned class.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/teacher/communication/announcements', {
        title,
        content,
        targetClassIds: [selectedClassId],
      });

      if (res.data.success) {
        setTitle('');
        setContent('');
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to send class announcement.');
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
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Class Announcements & Broadcasts
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Send targeted class announcements to students and parents of your assigned classes.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-6 border border-almond/50 shadow-2xl space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-darkBrown">Send Class Announcement</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Assigned Class *</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics Chapter 5 Practice Assignment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Announcement Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write message for students and parents..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Broadcast to Class'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">My Class Announcements ({announcements.length})</h3>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No class announcements sent yet.</div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-darkBrown">
                      <span>{a.title}</span>
                      <span className="text-[11px] text-textMuted font-mono font-normal">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-textMuted">{a.content}</p>
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

export default TeacherCommunicationPage;
