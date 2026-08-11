import React, { useState, useEffect } from 'react';
import { Calendar, Save, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const Step2AcademicSession = ({ data, onSave, onBack, loading }) => {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: data?.name || `${currentYear}-${currentYear + 1}`,
    startDate: data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : `${currentYear}-04-01`,
    endDate: data?.endDate ? new Date(data.endDate).toISOString().split('T')[0] : `${currentYear + 1}-03-31`,
    isCurrent: data?.isCurrent !== undefined ? data.isCurrent : true,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (data && data.name) {
      setFormData({
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : `${currentYear}-04-01`,
        endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : `${currentYear + 1}-03-31`,
        isCurrent: data.isCurrent !== undefined ? data.isCurrent : true,
      });
    }
  }, [data]);

  const handleDateChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    if (updated.startDate && updated.endDate) {
      const startYr = new Date(updated.startDate).getFullYear();
      const endYr = new Date(updated.endDate).getFullYear();
      if (!isNaN(startYr) && !isNaN(endYr)) {
        updated.name = startYr === endYr ? `${startYr}` : `${startYr}-${endYr}`;
      }
    }
    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End Date must be after Start Date.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 2 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-chestnut" />
          <span>Academic Session Configuration</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Define the active school year/term dates. All student records, classes, and exams will be scoped under this session.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">End Date *</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Session Name / Label *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2026-2027"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs font-mono font-bold text-chestnut focus:outline-none focus:border-chestnut"
            />
          </div>
        </div>

        <div className="p-4 bg-surface rounded-2xl border border-almond/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-darkBrown block">Set as Current Active Session</span>
            <span className="text-[11px] text-textMuted">Mark this academic session as the default active year for the school.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-almond/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chestnut"></div>
          </label>
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
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2AcademicSession;
