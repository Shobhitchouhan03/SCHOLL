import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Send,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  BarChart2,
  Layers,
} from 'lucide-react';

const PrincipalCommunicationPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'announcements' | 'create' | 'templates' | 'reports'
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [classes, setClasses] = useState([]);

  // Create Announcement Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [channels, setChannels] = useState({
    inApp: true,
    email: true,
    sms: false,
    whatsapp: false,
    push: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Template Modal State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, annRes, tmpRes, logRes, clsRes] = await Promise.all([
        api.get('/principal/communication/reports'),
        api.get('/principal/communication/announcements'),
        api.get('/principal/communication/templates'),
        api.get('/principal/communication/logs'),
        api.get('/principal/setup/classes'),
      ]);

      if (repRes.data.success) setAnalytics(repRes.data.analytics);
      if (annRes.data.success) setAnnouncements(annRes.data.announcements || []);
      if (tmpRes.data.success) setTemplates(tmpRes.data.templates || []);
      if (logRes.data.success) setLogs(logRes.data.logs || []);
      if (clsRes.data.success) setClasses(clsRes.data.classes || []);
    } catch (err) {
      console.error('Fetch communication hub data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAnnouncement = async (statusMode = 'published') => {
    setFormError('');
    if (!title || !content) {
      setFormError('Title and content are required.');
      return;
    }

    setSubmitting(true);

    const activeChannels = Object.keys(channels).filter((k) => channels[k]);

    try {
      const res = await api.post('/principal/communication/announcements', {
        title,
        content,
        targetAudience,
        targetClassIds: selectedClassId ? [selectedClassId] : [],
        channels: activeChannels,
        status: statusMode,
      });

      if (res.data.success) {
        setTitle('');
        setContent('');
        setActiveTab('announcements');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to create announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const res = await api.post(`/principal/communication/announcements/${id}/publish`);
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.customMessage || 'Publish failed.');
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await api.post(`/principal/communication/announcements/${id}/archive`);
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.customMessage || 'Archive failed.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await api.patch(`/principal/communication/templates/${selectedTemplate._id}`, {
        subject: templateSubject,
        bodyTemplate: templateBody,
      });
      if (res.data.success) {
        setSelectedTemplate(null);
        fetchData();
      }
    } catch (err) {
      alert(err.customMessage || 'Update template failed.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Multi-Channel Broadcasting</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Communication Hub
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Broadcast announcements across In-App, Email, SMS, WhatsApp, and Web Push notifications with delivery logs.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-almond/40 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart2 },
              { id: 'announcements', label: 'Announcements', icon: Send },
              { id: 'create', label: 'Create Announcement', icon: Plus },
              { id: 'templates', label: 'Notification Templates', icon: FileText },
              { id: 'reports', label: 'Delivery Reports & Logs', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-white text-textMuted hover:bg-surface hover:text-darkBrown border border-almond/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ANALYTICS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="Total Dispatched" value={analytics?.totalSent || 0} subtitle="Across all channels" icon={Send} color="chestnut" />
                <StatCard title="Delivery Rate" value={`${analytics?.deliveryRate || 100}%`} subtitle="Delivered messages" icon={CheckCircle2} color="success" />
                <StatCard title="Read Rate" value={`${analytics?.readRate || 0}%`} subtitle="In-App notifications read" icon={Bell} color="warning" />
                <StatCard title="Failed Messages" value={analytics?.failed || 0} subtitle="Delivery exceptions" icon={XCircle} color="danger" />
              </div>

              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Channel Delivery Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  {['inApp', 'email', 'sms', 'whatsapp', 'push'].map((ch) => {
                    const item = (analytics?.channelBreakdown || []).find((b) => b._id === ch);
                    const count = item ? item.count : 0;
                    return (
                      <div key={ch} className="p-4 bg-surface rounded-xl border border-almond/50 text-center space-y-1">
                        <span className="text-[10px] font-bold text-chestnut uppercase">{ch}</span>
                        <div className="text-xl font-black text-darkBrown font-mono">{count}</div>
                        <div className="text-[10px] text-textMuted">Dispatched</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS DIRECTORY */}
          {activeTab === 'announcements' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Published & Scheduled Announcements ({announcements.length})</h3>

              {loading ? (
                <LoadingSkeleton count={4} />
              ) : announcements.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No announcements created yet.</div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                          }`}>
                            {a.status}
                          </span>
                          <span className="text-xs font-bold text-darkBrown">Audience: <strong className="uppercase">{a.targetAudience}</strong></span>
                        </div>

                        <span className="text-[11px] text-textMuted font-mono">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-darkBrown">{a.title}</h4>
                      <p className="text-xs text-textMuted">{a.content}</p>

                      <div className="pt-2 border-t border-almond/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-textMuted">
                          <span>Channels:</span>
                          {(a.channels || []).map((c) => (
                            <span key={c} className="px-1.5 py-0.5 bg-white border border-almond rounded text-[10px] uppercase font-mono">
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {a.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(a._id)}
                              className="px-3 py-1 bg-success text-white rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Publish Now
                            </button>
                          )}

                          {a.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(a._id)}
                              className="px-2.5 py-1 bg-white border border-almond text-textMuted rounded-lg text-[10px] font-bold hover:text-darkBrown"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CREATE ANNOUNCEMENT */}
          {activeTab === 'create' && (
            <div className="bg-white rounded-3xl p-6 border border-almond/50 shadow-2xl space-y-6 max-w-3xl mx-auto w-full">
              <div>
                <span className="text-xs font-bold text-chestnut uppercase tracking-widest">Broadcasting Studio</span>
                <h2 className="text-2xl font-black text-darkBrown tracking-tight mt-1">Create Announcement</h2>
              </div>

              {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Announcement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Fair 2026 Registration Open"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Target Audience *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl font-bold uppercase"
                  >
                    <option value="all">Everyone (All Users)</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="students">Students Only</option>
                    <option value="class">Specific Class</option>
                  </select>
                </div>

                {targetAudience === 'class' && (
                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Select Target Class *</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl font-bold"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-darkBrown mb-2">Notification Channels *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { key: 'inApp', label: 'In-App', icon: Bell },
                      { key: 'email', label: 'Email', icon: Mail },
                      { key: 'sms', label: 'SMS', icon: Smartphone },
                      { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                      { key: 'push', label: 'Web Push', icon: Send },
                    ].map((ch) => {
                      const Icon = ch.icon;
                      const isChecked = channels[ch.key];
                      return (
                        <button
                          key={ch.key}
                          type="button"
                          onClick={() => setChannels({ ...channels, [ch.key]: !isChecked })}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            isChecked
                              ? 'bg-chestnut text-white border-chestnut shadow-sm'
                              : 'bg-surface text-textMuted border-almond/60 hover:bg-almond/20'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px] font-bold">{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Announcement Body *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write detailed announcement message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleCreateAnnouncement('draft')}
                    disabled={submitting}
                    className="px-4 py-2.5 border border-almond text-textMuted font-bold rounded-xl"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateAnnouncement('published')}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Broadcasting...' : 'Publish Immediately'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATION TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">System Notification Templates ({templates.length})</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div key={t._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                        {t.eventKey}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTemplate(t);
                          setTemplateSubject(t.subject);
                          setTemplateBody(t.bodyTemplate);
                        }}
                        className="text-xs font-bold text-chestnut hover:underline"
                      >
                        Edit Template
                      </button>
                    </div>

                    <h4 className="font-bold text-darkBrown text-sm">{t.name}</h4>
                    <div className="text-xs text-textMuted">Subject: <strong>{t.subject}</strong></div>
                    <p className="text-xs text-textMuted bg-white p-2.5 rounded-xl border border-almond/40 font-mono text-[11px]">
                      {t.bodyTemplate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DELIVERY REPORTS & LOGS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Message Delivery Logs ({logs.length})</h3>

              {logs.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No message logs recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4">Subject / Message</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Sent Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-almond/20">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-surface/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-darkBrown">
                            {log.recipientUserId?.name || log.recipientContact}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                              {log.channel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-textMuted">{log.messageSnippet}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'delivered' || log.status === 'sent' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-textMuted font-mono text-[11px]">
                            {new Date(log.sentAt || log.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* EDIT TEMPLATE MODAL */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Edit Notification Template</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
              {selectedTemplate.eventKey}
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Subject Template *</label>
                <input
                  type="text"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Body Template *</label>
                <textarea
                  rows={4}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateTemplate}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalCommunicationPage;
