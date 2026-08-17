import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Users, GraduationCap, FileText, Layers } from 'lucide-react';
import api from '../../services/api';

const BulkDeleteSchoolModal = ({ isOpen, selectedSchools = [], onClose, onSuccess }) => {
  if (!isOpen || selectedSchools.length === 0) return null;

  const [dependentCounts, setDependentCounts] = useState(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [confirmInput, setConfirmInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const requiredConfirmationText = `DELETE ${selectedSchools.length} SCHOOLS`;

  useEffect(() => {
    let isMounted = true;
    const fetchBulkCounts = async () => {
      try {
        setLoadingCounts(true);
        setError('');
        const schoolIds = selectedSchools.map((s) => s._id);
        const res = await api.post('/super-admin/schools/bulk-dependent-counts', { schoolIds });
        if (isMounted && res.data.success) {
          setDependentCounts(res.data.dependentCounts);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Fetch bulk dependent counts error:', err);
          setError(err.customMessage || 'Failed to load aggregated dependent counts.');
        }
      } finally {
        if (isMounted) setLoadingCounts(false);
      }
    };

    fetchBulkCounts();
    return () => {
      isMounted = false;
    };
  }, [selectedSchools]);

  const handleBulkDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmInput.trim().toUpperCase() !== requiredConfirmationText.toUpperCase()) {
      setError(`Confirmation failed. You must type '${requiredConfirmationText}' exactly.`);
      return;
    }

    setSubmitting(true);

    try {
      const schoolIds = selectedSchools.map((s) => s._id);
      const res = await api.post('/super-admin/schools/bulk-delete', { schoolIds });

      if (res.data.success) {
        onSuccess(
          res.data.message ||
            `${selectedSchools.length} schools and their associated tenant data were permanently deleted.`
        );
        onClose();
      }
    } catch (err) {
      setError(err.customMessage || err.response?.data?.message || 'Failed to bulk delete schools.');
    } finally {
      setSubmitting(false);
    }
  };

  const isMatch = confirmInput.trim().toUpperCase() === requiredConfirmationText.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-danger/30 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-danger uppercase tracking-wider block">Bulk Irreversible Action</span>
            <h3 className="text-lg font-black text-darkBrown tracking-tight">Bulk Permanent Delete ({selectedSchools.length} Schools)</h3>
            <p className="text-xs text-textMuted">Permanently purging {selectedSchools.length} selected school tenants and all data</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3 bg-danger/10 border border-danger/25 rounded-2xl text-danger text-xs space-y-1 mb-4">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Mass Database Purge</span>
          </div>
          <p className="text-[11px] leading-relaxed text-danger/90">
            This permanently deletes <strong>{selectedSchools.length} schools</strong> and all associated tenant records across 79 database collections. This action <strong>cannot be undone</strong>.
          </p>
        </div>

        {/* Selected Schools List Preview */}
        <div className="mb-4">
          <div className="text-[11px] font-bold text-darkBrown uppercase tracking-wider mb-1.5">
            Selected Schools ({selectedSchools.length}):
          </div>
          <div className="max-h-28 overflow-y-auto bg-surface p-2.5 rounded-xl border border-almond/40 space-y-1 text-xs">
            {selectedSchools.map((s) => (
              <div key={s._id} className="flex justify-between items-center bg-white p-1.5 px-2.5 rounded-lg border border-almond/30">
                <span className="font-semibold text-darkBrown truncate max-w-[280px]">{s.name}</span>
                <span className="font-mono font-bold text-chestnut text-[11px] bg-almond/30 px-1.5 py-0.5 rounded">{s.schoolCode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregated Dependent Records Breakdown */}
        {loadingCounts ? (
          <div className="py-6 text-center text-xs text-textMuted flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-chestnut border-t-transparent rounded-full animate-spin" />
            <span>Calculating aggregated dependent records across {selectedSchools.length} schools...</span>
          </div>
        ) : dependentCounts ? (
          <div className="bg-surface p-3.5 rounded-2xl border border-almond/50 mb-4 space-y-2 text-xs">
            <div className="font-bold text-darkBrown flex items-center justify-between text-[11px] uppercase tracking-wider">
              <span>Total Linked Records to be Purged</span>
              <Layers className="w-3.5 h-3.5 text-textMuted" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted flex items-center gap-1"><Users className="w-3 h-3 text-chestnut" /> Users:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.users}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">Teachers:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.teachers}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted flex items-center gap-1"><GraduationCap className="w-3 h-3 text-morning" /> Students:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.students}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">Families:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.families}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted"><FileText className="w-3 h-3 text-morning" /> Docs:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.documents}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">Attendance:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.attendance}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">Results:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.results}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">Fees/Inv:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.fees}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-almond/40 flex justify-between items-center">
                <span className="text-textMuted">HR/Staff:</span>
                <span className="font-bold text-darkBrown">{dependentCounts.hrStaff}</span>
              </div>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBulkDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              To confirm bulk permanent deletion, type <span className="font-mono font-bold text-danger select-all bg-danger/10 px-1.5 py-0.5 rounded">{requiredConfirmationText}</span> below:
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={`Type ${requiredConfirmationText} to confirm`}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-danger/40 rounded-xl text-sm font-mono focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all uppercase"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-almond text-textMuted hover:bg-surface font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isMatch}
              className="flex-1 py-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Permanently Delete {selectedSchools.length} Schools</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkDeleteSchoolModal;
