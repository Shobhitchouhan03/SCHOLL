import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import Step1SchoolProfile from '../../components/setup/Step1SchoolProfile';
import Step2AcademicSession from '../../components/setup/Step2AcademicSession';
import Step3Classes from '../../components/setup/Step3Classes';
import Step4Sections from '../../components/setup/Step4Sections';
import Step5Subjects from '../../components/setup/Step5Subjects';
import Step6SchoolRules from '../../components/setup/Step6SchoolRules';
import Step7ReviewComplete from '../../components/setup/Step7ReviewComplete';
import { Building2, Calendar, BookOpen, Layers, Settings, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'School Profile', icon: Building2 },
  { id: 2, title: 'Academic Session', icon: Calendar },
  { id: 3, title: 'Classes', icon: BookOpen },
  { id: 4, title: 'Sections', icon: Layers },
  { id: 5, title: 'Subjects', icon: BookOpen },
  { id: 6, title: 'School Rules', icon: Settings },
  { id: 7, title: 'Review & Complete', icon: ShieldCheck },
];

const SetupWizardPage = () => {
  const navigate = useNavigate();
  const { user, school, refreshSession } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/setup/status');
      if (res.data.success) {
        setStatusData(res.data);
        if (res.data.setupStatus === 'completed') {
          navigate('/principal/dashboard');
          return;
        }
        if (res.data.setupStep) {
          setCurrentStep(Math.min(res.data.setupStep, 7));
        }
      }
    } catch (err) {
      console.error('Fetch setup status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStep1Save = async (profileData) => {
    try {
      setSaving(true);
      setError('');
      const res = await api.patch('/principal/setup/school-profile', profileData);
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(2);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Save = async (sessionData) => {
    try {
      setSaving(true);
      setError('');
      const res = await api.post('/principal/setup/academic-session', sessionData);
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(3);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save academic session.');
    } finally {
      setSaving(false);
    }
  };

  const handleStep3Save = async (classList) => {
    try {
      setSaving(true);
      setError('');
      const sessionId = statusData?.activeSession?._id;
      if (!sessionId) {
        setError('Academic session missing. Please complete Step 2 first.');
        return;
      }
      const res = await api.post('/principal/setup/classes/bulk', {
        academicSessionId: sessionId,
        classes: classList,
      });
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save classes.');
    } finally {
      setSaving(false);
    }
  };

  const handleStep4Save = async (sectionsList) => {
    try {
      setSaving(true);
      setError('');
      const sessionId = statusData?.activeSession?._id;
      const res = await api.post('/principal/setup/sections/bulk', {
        academicSessionId: sessionId,
        sections: sectionsList,
      });
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(5);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save sections.');
    } finally {
      setSaving(false);
    }
  };

  const handleStep5Save = async (subjectsList) => {
    try {
      setSaving(true);
      setError('');
      const sessionId = statusData?.activeSession?._id;
      const res = await api.post('/principal/setup/subjects/bulk', {
        academicSessionId: sessionId,
        subjects: subjectsList,
      });
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(6);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save subjects.');
    } finally {
      setSaving(false);
    }
  };

  const handleStep6Save = async (configData) => {
    try {
      setSaving(true);
      setError('');
      const sessionId = statusData?.activeSession?._id;
      const res = await api.patch('/principal/setup/configuration', {
        academicSessionId: sessionId,
        ...configData,
      });
      if (res.data.success) {
        await fetchStatus();
        setCurrentStep(7);
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to save school rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSetup = async () => {
    try {
      setSaving(true);
      setError('');
      const sessionId = statusData?.activeSession?._id;
      const res = await api.post('/principal/setup/complete', { academicSessionId: sessionId });
      if (res.data.success) {
        await refreshSession();
        navigate('/principal/dashboard');
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to complete setup. Please check all steps.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-chestnut/30 border-t-chestnut rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-textMuted">Loading Setup Wizard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Wizard Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">First-Time School Setup</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Welcome to {school?.name || 'AcademiaPro'}
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Complete this 7-step wizard to configure your academic sessions, classes, subjects, and school policies.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-4 py-2 bg-surface rounded-2xl border border-almond/50 text-xs font-semibold text-chestnut">
              Progress: Step {currentStep} of 7
            </div>

            <button
              onClick={() => navigate('/principal/dashboard')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-almond/40 text-darkBrown font-bold text-xs border border-almond/50 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-chestnut" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="bg-white rounded-2xl p-4 border border-almond/40 shadow-card overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-chestnut text-white shadow-md'
                        : isCompleted
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'text-textMuted hover:bg-surface'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Icon className="w-4 h-4" />}
                    <span>{step.title}</span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${step.id < currentStep ? 'bg-success' : 'bg-almond/40'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-danger/10 text-danger rounded-2xl text-xs font-semibold border border-danger/20">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <Step1SchoolProfile data={statusData?.school} onSave={handleStep1Save} loading={saving} />
        )}
        {currentStep === 2 && (
          <Step2AcademicSession
            data={statusData?.activeSession}
            onSave={handleStep2Save}
            onBack={() => setCurrentStep(1)}
            loading={saving}
          />
        )}
        {currentStep === 3 && (
          <Step3Classes
            data={statusData?.classes}
            onSave={handleStep3Save}
            onBack={() => setCurrentStep(2)}
            loading={saving}
          />
        )}
        {currentStep === 4 && (
          <Step4Sections
            classes={statusData?.classes || []}
            data={statusData?.sections || []}
            onSave={handleStep4Save}
            onBack={() => setCurrentStep(3)}
            loading={saving}
          />
        )}
        {currentStep === 5 && (
          <Step5Subjects
            classes={statusData?.classes || []}
            data={statusData?.subjects || []}
            onSave={handleStep5Save}
            onBack={() => setCurrentStep(4)}
            loading={saving}
          />
        )}
        {currentStep === 6 && (
          <Step6SchoolRules
            data={statusData?.configuration}
            onSave={handleStep6Save}
            onBack={() => setCurrentStep(5)}
            loading={saving}
          />
        )}
        {currentStep === 7 && (
          <Step7ReviewComplete
            statusData={statusData}
            onJumpStep={(s) => setCurrentStep(s)}
            onComplete={handleCompleteSetup}
            onBack={() => setCurrentStep(6)}
            loading={saving}
          />
        )}
      </div>
    </div>
  );
};

export default SetupWizardPage;
