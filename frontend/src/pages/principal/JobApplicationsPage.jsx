import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ArrowLeft, UserCheck, Mail, Phone, ExternalLink } from 'lucide-react';

const JobApplicationsPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/principal/jobs/${jobId}/applications`);
      if (res.data.success) setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Fetch job applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/principal/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) fetchApplications();
    } catch (err) {
      alert(err.customMessage || 'Update failed.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/jobs')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Openings</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Applicant Pipeline</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Candidate Applications
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Review received resumes, update recruitment status pipeline, and select candidates.
            </p>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Applicant Profiles ({applications.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No candidate applications received for this job opening yet.</div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm">{app.applicantName}</div>
                      <div className="text-textMuted text-[11px] flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-chestnut" />{app.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-chestnut" />{app.phone}</span>
                      </div>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-chestnut hover:underline flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Resume Link</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                        className="px-3 py-1.5 bg-white border border-almond/60 rounded-xl font-bold capitalize text-xs"
                      >
                        <option value="received">Received</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
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

export default JobApplicationsPage;
