import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Bell, Plus, Calendar, CheckCircle2, AlertCircle, Megaphone, Send } from 'lucide-react';

const TeacherNoticesPage = () => {
  const [activeTab, setActiveTab] = useState('school'); // 'school' | 'myClass'
  const [schoolNotices, setSchoolNotices] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    title: '',
    content: '',
    targetClassId: '',
    targetSectionId: '',
    priority: 'normal',
    expiryDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schoolRes, myRes, profRes] = await Promise.all([
        api.get('/teacher/notices'),
        api.get('/teacher/announcements/my'),
        api.get('/teacher/me'),
      ]);

      if (schoolRes.data.success) setSchoolNotices(schoolRes.data.notices || []);
      if (myRes.data.success) setMyAnnouncements(myRes.data.announcements || []);
      if (profRes.data.success) {
        const teacher = profRes.data.teacher;
        setTeacherProfile(teacher);
        const primaryClassId = teacher?.classTeacherClassId?._id || teacher?.classTeacherClassId || teacher?.assignedClassIds?.[0]?._id || teacher?.assignedClassIds?.[0];
        const primarySectionId = teacher?.classTeacherSectionId?._id || teacher?.classTeacherSectionId || teacher?.assignedSectionIds?.[0]?._id || teacher?.assignedSectionIds?.[0];
        if (primaryClassId) {
          setModalForm((prev) => ({
            ...prev,
            targetClassId: primaryClassId,
            targetSectionId: primarySectionId || '',
          }));
        }
      }
    } catch (err) {
      console.error('Fetch notices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!modalForm.title || !modalForm.content || !modalForm.targetClassId) {
      setMessage({ type: 'danger', text: 'Title, content, and target class are required.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const res = await api.post('/teacher/announcements', modalForm);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Class announcement published successfully!' });
        setModalForm({
          title: '',
          content: '',
          targetClassId: teacherProfile?.assignedClassIds?.[0]?._id || '',
          targetSectionId: '',
          priority: 'normal',
          expiryDate: '',
        });
        setTimeout(() => {
          setShowModal(false);
          setMessage({ type: '', text: '' });
          fetchData();
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || err.customMessage || 'Failed to publish announcement.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const assignedClasses = [];
  if (teacherProfile?.classTeacherClassId) {
    assignedClasses.push(teacherProfile.classTeacherClassId);
  }
  if (Array.isArray(teacherProfile?.assignedClassIds)) {
    teacherProfile.assignedClassIds.forEach((cls) => {
      const clsId = cls._id || cls;
      if (!assignedClasses.some((c) => (c._id || c) === clsId)) {
        assignedClasses.push(cls);
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Announcements & Notice Center
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Read Principal/HR circulars or broadcast class notices to assigned students & parents.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Class Announcement</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-almond/40 space-x-4">
            <button
              onClick={() => setActiveTab('school')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                activeTab === 'school' ? 'text-chestnut border-b-2 border-chestnut' : 'text-textMuted hover:text-darkBrown'
              }`}
            >
              School Circulars ({schoolNotices.length})
            </button>
            <button
              onClick={() => setActiveTab('myClass')}
              className={`pb-3 text-xs font-bold transition-all relative ${
                activeTab === 'myClass' ? 'text-chestnut border-b-2 border-chestnut' : 'text-textMuted hover:text-darkBrown'
              }`}
            >
              My Class Announcements ({myAnnouncements.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'school' ? (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <Bell className="w-5 h-5 text-chestnut" />
                <span>School Notices & Staff Circulars</span>
              </h3>

              {loading ? (
                <LoadingSkeleton count={3} />
              ) : schoolNotices.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No active notices for staff at present.</div>
              ) : (
                <div className="space-y-4">
                  {schoolNotices.map((n) => (
                    <div key={n._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            n.priority === 'urgent' ? 'bg-danger/15 text-danger' : 'bg-chestnut/15 text-chestnut'
                          }`}
                        >
                          {n.priority} • {n.noticeType}
                        </span>
                        <span className="text-[11px] text-textMuted font-mono">
                          {new Date(n.publishDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-darkBrown">{n.title}</h4>
                      <p className="text-xs text-textMuted leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-morning" />
                <span>My Published Class Announcements</span>
              </h3>

              {loading ? (
                <LoadingSkeleton count={3} />
              ) : myAnnouncements.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">
                  You haven't published any class announcements yet. Click "+ Create Class Announcement" to broadcast to your students and parents.
                </div>
              ) : (
                <div className="space-y-4">
                  {myAnnouncements.map((a) => (
                    <div key={a._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sage/20 text-darkBrown">
                            Target Class: {a.targetClassIds?.[0]?.name || 'Assigned Class'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              a.priority === 'urgent' ? 'bg-danger/15 text-danger' : 'bg-chestnut/15 text-chestnut'
                            }`}
                          >
                            {a.priority}
                          </span>
                        </div>
                        <span className="text-[11px] text-textMuted font-mono">
                          {new Date(a.publishDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-darkBrown">{a.title}</h4>
                      <p className="text-xs text-textMuted leading-relaxed">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Class Announcement Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-darkBrown/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4">
                <div className="flex justify-between items-center border-b border-almond/40 pb-3">
                  <h3 className="text-base font-bold text-darkBrown flex items-center space-x-2">
                    <Send className="w-4 h-4 text-chestnut" />
                    <span>Create Class Announcement</span>
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-textMuted hover:text-darkBrown font-bold text-sm">
                    ✕
                  </button>
                </div>

                {message.text && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                      message.type === 'success'
                        ? 'bg-sage/20 text-darkBrown'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-danger" />}
                    <span>{message.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Target Class *</label>
                    <select
                      required
                      value={modalForm.targetClassId}
                      onChange={(e) => setModalForm({ ...modalForm, targetClassId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none"
                    >
                      {assignedClasses.length === 0 ? (
                        <option value="">No assigned classes found</option>
                      ) : (
                        assignedClasses.map((cls) => (
                          <option key={cls._id || cls} value={cls._id || cls}>
                            {cls.name || 'Class'}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Announcement Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Science Project Submission Deadline"
                      value={modalForm.title}
                      onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Priority</label>
                    <select
                      value={modalForm.priority}
                      onChange={(e) => setModalForm({ ...modalForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none"
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Message Content *</label>
                    <textarea
                      required
                      rows="4"
                      placeholder="Write detailed class announcement for students and parents..."
                      value={modalForm.content}
                      onChange={(e) => setModalForm({ ...modalForm, content: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-almond/40">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-surface text-textMuted text-xs font-bold rounded-xl border border-almond/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Publishing...' : 'Publish Announcement'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherNoticesPage;
