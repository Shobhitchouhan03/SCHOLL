import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const PublicApplyJobPage = () => {
  const { schoolCode, jobId } = useParams();
  const navigate = useNavigate();

  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post(`/public/schools/${schoolCode}/jobs/${jobId}/apply`, {
        applicantName,
        email,
        phone,
        resumeUrl,
        coverLetter,
      });

      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        <button
          onClick={() => navigate(`/school/${schoolCode}/jobs`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Job Openings</span>
        </button>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <h2 className="text-2xl font-black text-darkBrown">Application Submitted!</h2>
            <p className="text-xs text-textMuted max-w-md mx-auto">
              Thank you for applying. The school administration team will review your application and contact you if shortlisted.
            </p>
            <button
              onClick={() => navigate(`/school/${schoolCode}/jobs`)}
              className="px-6 py-2.5 bg-chestnut text-white text-xs font-bold rounded-xl shadow-md"
            >
              Return to Career Board
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-widest">Online Job Application</span>
              <h2 className="text-2xl font-black text-darkBrown tracking-tight mt-1">Submit Candidate Profile</h2>
              <p className="text-xs text-textMuted mt-0.5">Fill out your contact details and resume link to apply for this vacancy.</p>
            </div>

            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Resume / CV Document URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume-link"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Cover Letter / Note</label>
                <textarea
                  rows={4}
                  placeholder="Tell us why you are a great fit for this position..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-chestnut hover:bg-darkBrown text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicApplyJobPage;
