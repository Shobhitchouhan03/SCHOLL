import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import api from '../../services/api';

const DeleteSchoolModal = ({ isOpen, school, onClose, onSuccess }) => {
  if (!isOpen || !school) return null;

  const [dependentCounts, setDependentCounts] = useState(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [confirmInput, setConfirmInput] = useState('');
  const [isHardDelete, setIsHardDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const res = await api.get(`/super-admin/schools/${school._id}/dependent-counts`);
        if (res.data.success) {
          setDependentCounts(res.data.dependentCounts);
        }
      } catch (err) {
        console.error('Fetch dependent counts error:', err);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, [school]);

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmInput.trim().toUpperCase() !== school.schoolCode.toUpperCase()) {
      setError(`Confirmation failed. You must type '${school.schoolCode}' exactly.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.delete(`/super-admin/schools/${school._id}`, {
        data: {
          confirmSchoolCode: confirmInput.trim(),
          isHardDelete,
        },
      });

      if (res.data.success) {
        onSuccess(res.data.message);
        onClose();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to delete/archive school.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-danger/30 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-textMain hover:bg-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-darkBrown">Delete / Archive School</h3>
            <p className="text-xs text-textMuted">{school.name} ({school.schoolCode})</p>
          </div>
        </div>

        {loadingCounts ? (
          <div className="py-6 text-center text-xs text-textMuted">Loading dependent records...</div>
        ) : dependentCounts ? (
          <div className="bg-surface p-3.5 rounded-xl border border-almond/50 mb-4 font-mono text-xs space-y-1.5 text-textMain">
            <div className="font-sans font-bold text-darkBrown mb-1">Dependent Linked Records:</div>
            <div className="flex justify-between">
              <span>Users:</span> <span className="font-bold">{dependentCounts.users}</span>
            </div>
            <div className="flex justify-between">
              <span>Teachers:</span> <span className="font-bold">{dependentCounts.teachers}</span>
            </div>
            <div className="flex justify-between">
              <span>Students:</span> <span className="font-bold">{dependentCounts.students}</span>
            </div>
            <div className="flex justify-between">
              <span>Families:</span> <span className="font-bold">{dependentCounts.families}</span>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 text-danger text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              To confirm, type <span className="font-mono font-bold text-danger select-all">{school.schoolCode}</span> below:
            </label>
            <input
              type="text"
              required
              placeholder={school.schoolCode}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface border border-danger/40 rounded-xl text-sm font-mono focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger transition-all uppercase"
            />
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="flex items-center space-x-2 text-xs text-textMuted bg-surface p-2.5 rounded-lg border border-almond/40">
              <input
                type="checkbox"
                id="isHardDelete"
                checked={isHardDelete}
                onChange={(e) => setIsHardDelete(e.target.checked)}
                className="rounded text-danger focus:ring-danger"
              />
              <label htmlFor="isHardDelete" className="cursor-pointer">
                [Dev Mode Only] Hard delete school & all linked test records permanently
              </label>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-almond text-textMuted hover:bg-surface font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || confirmInput.trim().toUpperCase() !== school.schoolCode.toUpperCase()}
              className="flex-1 py-2.5 rounded-xl bg-danger text-white hover:bg-danger/90 font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteSchoolModal;
