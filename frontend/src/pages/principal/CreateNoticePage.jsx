import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ArrowLeft } from 'lucide-react';

const CreateNoticePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noticeType, setNoticeType] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [targetRole, setTargetRole] = useState('all');
  const [expiryDate, setExpiryDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/notices', {
        title,
        content,
        noticeType,
        priority,
        targetRoles: [targetRole],
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      if (res.data.success) {
        navigate('/principal/notices');
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/notices')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Notice Board</span>
          </button>

          <div className="bg-white rounded-3xl p-6 border border-almond/50 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-widest">Notice Publishing</span>
              <h2 className="text-2xl font-black text-darkBrown tracking-tight mt-1">Create & Broadcast Notice</h2>
            </div>

            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026 Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Notice Type</label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl capitalize"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="exam">Exam Alert</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Target Roles</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl capitalize font-bold"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="teacher">Teachers Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Notice Content *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detailed announcement text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/principal/notices')}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateNoticePage;
