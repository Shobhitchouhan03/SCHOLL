import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Briefcase, ArrowRight } from 'lucide-react';

const PublicSchoolJobsPage = () => {
  const { schoolCode } = useParams();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('School Careers');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/public/schools/${schoolCode}/jobs`);
      if (res.data.success) {
        setSchoolName(res.data.schoolName);
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error('Fetch public jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [schoolCode]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl space-y-2">
          <span className="text-xs font-bold text-chestnut uppercase tracking-widest">Public Career Portal</span>
          <h1 className="text-3xl font-black text-darkBrown tracking-tight">{schoolName}</h1>
          <p className="text-xs text-textMuted">Explore open teaching and staff vacancies. Submit your online application directly.</p>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-3xl border border-almond/40 shadow-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-darkBrown">Open Positions ({jobs.length})</h3>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-textMuted text-xs">No active job openings published at present. Check back later!</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="p-5 bg-surface rounded-2xl border border-almond/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-chestnut/10 text-chestnut uppercase">
                      {job.department} • {job.employmentType}
                    </span>
                    <h4 className="text-lg font-bold text-darkBrown">{job.title}</h4>
                    <p className="text-xs text-textMuted">{job.description}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/school/${schoolCode}/jobs/${job._id}/apply`)}
                    className="px-5 py-2.5 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 self-start md:self-center"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicSchoolJobsPage;
