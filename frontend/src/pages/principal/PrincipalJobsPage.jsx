import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, Briefcase, Users, Eye, Globe } from 'lucide-react';

const PrincipalJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Academics');
  const [designation, setDesignation] = useState('Senior Teacher');
  const [description, setDescription] = useState('');
  const [openings, setOpenings] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/jobs');
      if (res.data.success) setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/jobs', {
        title,
        department,
        designation,
        description,
        openings: Number(openings),
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        fetchJobs();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create job post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      const res = await api.patch(`/principal/jobs/${jobId}/status`, { status: nextStatus });
      if (res.data.success) fetchJobs();
    } catch (err) {
      alert(err.customMessage || 'Failed to update job status.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Staff Recruitment</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Job Openings & Applicant Pipeline
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Post teacher job vacancies, publish to the public career board, and review candidate applications.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Job Opening</span>
            </button>
          </div>

          {/* Jobs List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Job Openings ({jobs.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No job openings created yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((j) => (
                  <div key={j._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-chestnut/10 text-chestnut uppercase">
                          {j.department}
                        </span>
                        <h4 className="text-base font-bold text-darkBrown mt-1">{j.title}</h4>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        j.status === 'published' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                      }`}>
                        {j.status}
                      </span>
                    </div>

                    <p className="text-xs text-textMuted line-clamp-2">{j.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-almond/30 text-xs">
                      <span className="text-textMuted font-bold">{j.openings} Openings</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(j._id, j.status)}
                          className="px-2.5 py-1 bg-white border border-almond text-darkBrown rounded-lg text-[10px] font-bold hover:bg-almond/30"
                        >
                          {j.status === 'published' ? 'Close Job' : 'Publish Job'}
                        </button>

                        <button
                          onClick={() => navigate(`/principal/jobs/${j._id}/applications`)}
                          className="px-3 py-1 bg-chestnut text-white rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          <span>Applicants</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Create Job Opening</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Physics Teacher"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Openings</label>
                  <input
                    type="number"
                    value={openings}
                    onChange={(e) => setOpenings(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe roles and responsibilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalJobsPage;
