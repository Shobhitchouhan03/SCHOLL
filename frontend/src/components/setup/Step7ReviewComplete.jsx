import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Edit3, ArrowLeft, Building2, Calendar, BookOpen, Layers, Settings, AlertCircle, X } from 'lucide-react';

const Step7ReviewComplete = ({ statusData, onJumpStep, onComplete, onBack, loading }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  const school = statusData?.school || {};
  const session = statusData?.activeSession || {};
  const classes = statusData?.classes || [];
  const sections = statusData?.sections || [];
  const subjects = statusData?.subjects || [];
  const config = statusData?.configuration || {};

  const handleConfirmComplete = async () => {
    setError('');
    try {
      await onComplete();
    } catch (err) {
      setError(err.customMessage || 'Failed to complete setup. Ensure all steps are filled.');
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 7 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" />
          <span>Review & Complete School Setup</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Verify all configured details before finalizing setup. You can modify any step at any time later from Settings.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: School Profile */}
        <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-2 relative">
          <div className="flex items-center justify-between border-b border-almond/30 pb-2">
            <span className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-chestnut" />
              <span>School Profile</span>
            </span>
            <button
              onClick={() => onJumpStep(1)}
              className="text-[11px] font-semibold text-chestnut hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-xs space-y-1 text-textMain">
            <div><strong>Name:</strong> {school.name}</div>
            <div><strong>School Code:</strong> <span className="font-mono text-chestnut font-bold">{school.schoolCode}</span></div>
            <div><strong>Contact Email:</strong> {school.email || 'N/A'}</div>
            <div><strong>Phone:</strong> {school.phone || 'N/A'}</div>
            <div><strong>Address:</strong> {school.addressLine1 || school.address || 'N/A'}</div>
          </div>
        </div>

        {/* Card 2: Academic Session */}
        <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-2 relative">
          <div className="flex items-center justify-between border-b border-almond/30 pb-2">
            <span className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-chestnut" />
              <span>Academic Session</span>
            </span>
            <button
              onClick={() => onJumpStep(2)}
              className="text-[11px] font-semibold text-chestnut hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
          <div className="text-xs space-y-1 text-textMain">
            <div><strong>Session Label:</strong> <span className="font-bold text-chestnut">{session.name || 'Not set'}</span></div>
            <div><strong>Start Date:</strong> {session.startDate ? new Date(session.startDate).toLocaleDateString() : 'N/A'}</div>
            <div><strong>End Date:</strong> {session.endDate ? new Date(session.endDate).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Status:</strong> <span className="capitalize font-semibold text-success">{session.status || 'Active'}</span></div>
          </div>
        </div>

        {/* Card 3: Classes & Sections */}
        <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-2 relative">
          <div className="flex items-center justify-between border-b border-almond/30 pb-2">
            <span className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-chestnut" />
              <span>Classes & Sections</span>
            </span>
            <div className="flex gap-2">
              <button onClick={() => onJumpStep(3)} className="text-[11px] font-semibold text-chestnut hover:underline">
                Classes
              </button>
              <span>•</span>
              <button onClick={() => onJumpStep(4)} className="text-[11px] font-semibold text-chestnut hover:underline">
                Sections
              </button>
            </div>
          </div>
          <div className="text-xs space-y-1 text-textMain">
            <div><strong>Total Configured Classes:</strong> <span className="font-bold text-darkBrown">{classes.length}</span></div>
            <div><strong>Total Configured Sections:</strong> <span className="font-bold text-darkBrown">{sections.length}</span></div>
            <div className="flex flex-wrap gap-1 mt-1">
              {classes.slice(0, 8).map((c) => (
                <span key={c._id} className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold border border-almond/40">
                  {c.name}
                </span>
              ))}
              {classes.length > 8 && <span className="text-[10px] text-textMuted">+{classes.length - 8} more</span>}
            </div>
          </div>
        </div>

        {/* Card 4: Subjects & Rules */}
        <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-2 relative">
          <div className="flex items-center justify-between border-b border-almond/30 pb-2">
            <span className="text-xs font-bold text-darkBrown flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-chestnut" />
              <span>Subjects & School Rules</span>
            </span>
            <div className="flex gap-2">
              <button onClick={() => onJumpStep(5)} className="text-[11px] font-semibold text-chestnut hover:underline">
                Subjects
              </button>
              <span>•</span>
              <button onClick={() => onJumpStep(6)} className="text-[11px] font-semibold text-chestnut hover:underline">
                Rules
              </button>
            </div>
          </div>
          <div className="text-xs space-y-1 text-textMain">
            <div><strong>Total Subjects:</strong> <span className="font-bold text-darkBrown">{subjects.length}</span></div>
            <div><strong>School Timings:</strong> {config.schoolStartTime || '08:00'} - {config.schoolEndTime || '14:30'}</div>
            <div><strong>Min Attendance %:</strong> {config.minimumAttendancePercentage ?? 75}%</div>
            <div><strong>Passing %:</strong> {config.passingPercentage ?? 40}%</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-almond/30">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 border border-almond text-textMuted hover:bg-surface px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-success hover:bg-darkBrown text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Complete Setup & Launch Console</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 relative">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30 mb-4">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>Confirm Complete Setup</span>
              </h3>
              <button onClick={() => setIsConfirmOpen(false)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-textMuted mb-5">
              You are about to finalize the setup wizard for <strong className="text-darkBrown">{school.name}</strong>. This will activate your Principal Dashboard. You can modify any configuration later from School Settings.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-success hover:bg-darkBrown text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Finalizing...' : 'Yes, Complete Setup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step7ReviewComplete;
