import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Send,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';

const CreateHomeworkPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // References
  const [teacher, setTeacher] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);

  // Form State
  const [classId, setClassId] = useState('');
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');
  const [attachmentUrls, setAttachmentUrls] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [optRes, subRes] = await Promise.all([
        api.get('/teacher/attendance/options'),
        api.get('/principal/subjects'),
      ]);

      if (optRes.data.success) {
        setTeacher(optRes.data.teacher);
        setCurrentSession(optRes.data.currentSession);

        const teacherObj = optRes.data.teacher;
        let defaultClass = '';
        if (teacherObj?.assignedClassIds && teacherObj.assignedClassIds.length > 0) {
          defaultClass = teacherObj.assignedClassIds[0]._id || teacherObj.assignedClassIds[0];
        } else if (teacherObj?.isClassTeacher) {
          defaultClass = teacherObj.classTeacherClassId._id || teacherObj.classTeacherClassId;
        }
        setClassId(defaultClass || '');

        const defaultSections = (teacherObj?.assignedSectionIds || []).map((s) => s._id || s);
        setSelectedSectionIds(defaultSections);
      }

      if (subRes.data.success) {
        setSubjectsList(subRes.data.subjects || []);
        if (subRes.data.subjects?.length > 0) {
          setSubjectId(subRes.data.subjects[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch create homework options error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAttachment = () => {
    if (attachmentUrlInput.trim()) {
      setAttachmentUrls((prev) => [...prev, attachmentUrlInput.trim()]);
      setAttachmentUrlInput('');
    }
  };

  const handleSubmitHomework = async (targetStatus) => {
    setError('');
    if (!title || !description || !dueDate || !classId || !subjectId) {
      setError('Please fill in all required fields (Class, Subject, Title, Description, Due Date).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/teacher/homework', {
        academicSessionId: currentSession?._id,
        classId,
        sectionIds: selectedSectionIds,
        subjectId,
        title,
        description,
        instructions,
        assignedDate,
        dueDate,
        priority,
        status: targetStatus,
        attachmentUrls,
      });

      if (res.data.success) {
        navigate('/teacher/homework');
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create homework.');
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
            onClick={() => navigate('/teacher/homework')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Homework List</span>
          </button>

          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">New Homework Assignment</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Create & Assign Homework
              </h1>
            </div>

            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Class *</label>
                    <select
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold focus:outline-none focus:border-chestnut"
                    >
                      {(teacher?.assignedClassIds || []).map((c) => (
                        <option key={c._id || c} value={c._id || c}>
                          {c.name || 'Class'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Subject *</label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold focus:outline-none focus:border-chestnut"
                    >
                      {subjectsList.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Homework Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 4 Newton Laws Exercises"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-semibold focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detailed homework description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Assigned Date *</label>
                    <input
                      type="date"
                      value={assignedDate}
                      onChange={(e) => setAssignedDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-darkBrown mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-almond/30">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitHomework('draft')}
                    className="px-4 py-2 border border-almond rounded-xl text-darkBrown text-xs font-bold hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmitHomework('published')}
                    className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateHomeworkPage;
