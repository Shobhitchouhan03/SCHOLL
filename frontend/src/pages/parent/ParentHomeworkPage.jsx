import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BookOpen, Calendar, Clock, UserCheck, Paperclip } from 'lucide-react';

const ParentHomeworkPage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildrenList(kids);
        if (kids.length > 0) setSelectedChildId(kids[0]._id);
      }
    } catch (err) {
      console.error('Fetch children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomework = async (childId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/homework`);
      if (res.data.success) {
        setHomeworkList(res.data.homework || []);
      }
    } catch (err) {
      console.error('Fetch homework error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchHomework(selectedChildId);
    }
  }, [selectedChildId]);

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
                Published Homework & Assignments
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Track assigned homework tasks, due dates, descriptions, and teacher attachments.
              </p>
            </div>
          </div>

          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
          />

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : homeworkList.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-almond/40 shadow-card text-center text-xs text-textMuted font-medium">
              No published homework assigned for this class and section yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkList.map((h) => {
                const isOverdue = new Date(h.dueDate) < new Date();
                return (
                  <div key={h._id} className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-chestnut/10 text-chestnut rounded-lg text-xs font-extrabold">
                        {h.subjectId?.name || 'General Subject'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOverdue ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                      }`}>
                        {isOverdue ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-darkBrown">{h.title}</h3>
                      <p className="text-xs text-textMuted mt-1 leading-relaxed">{h.description}</p>
                    </div>

                    <div className="pt-3 border-t border-almond/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-textMuted font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-chestnut" />
                        <span>Due: {new Date(h.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      {h.createdBy?.name && (
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-morning" />
                          <span>{h.createdBy.name}</span>
                        </div>
                      )}

                      {h.attachmentUrl && (
                        <a
                          href={h.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-chestnut font-bold hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Attachment</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentHomeworkPage;
