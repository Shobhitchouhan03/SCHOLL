import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, ArrowRight, ArrowLeft, CheckSquare, Square, AlertCircle } from 'lucide-react';

const SUGGESTED_SUBJECTS = [
  { name: 'English', code: 'ENG', subjectType: 'language' },
  { name: 'Hindi', code: 'HIN', subjectType: 'language' },
  { name: 'Mathematics', code: 'MATH', subjectType: 'core' },
  { name: 'Science', code: 'SCI', subjectType: 'core' },
  { name: 'Social Science', code: 'SST', subjectType: 'core' },
  { name: 'Computer Science', code: 'CS', subjectType: 'core' },
  { name: 'General Knowledge', code: 'GK', subjectType: 'activity' },
  { name: 'Art & Craft', code: 'ART', subjectType: 'activity' },
  { name: 'Physical Education', code: 'PED', subjectType: 'activity' },
];

const Step5Subjects = ({ classes, data, onSave, onBack, loading }) => {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setSubjects(
        data.map((s) => ({
          name: s.name,
          code: s.code,
          subjectType: s.subjectType || 'core',
          applicableClassIds: (s.applicableClassIds || []).map((c) => c._id || c),
          description: s.description || '',
        }))
      );
    } else if (Array.isArray(classes) && classes.length > 0) {
      // Default initial prefilled subjects assigned to all classes
      const allClassIds = classes.map((c) => c._id);
      setSubjects(
        SUGGESTED_SUBJECTS.map((s) => ({
          name: s.name,
          code: s.code,
          subjectType: s.subjectType,
          applicableClassIds: allClassIds,
          description: '',
        }))
      );
    }
  }, [classes, data]);

  const handleAddSubject = () => {
    const allClassIds = classes.map((c) => c._id);
    setSubjects([
      ...subjects,
      {
        name: 'New Subject',
        code: `SUB${subjects.length + 1}`,
        subjectType: 'core',
        applicableClassIds: allClassIds,
        description: '',
      },
    ]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, idx) => idx !== index));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const toggleClassForSubject = (subjectIndex, classId) => {
    const updated = [...subjects];
    const current = updated[subjectIndex].applicableClassIds || [];
    if (current.includes(classId)) {
      updated[subjectIndex].applicableClassIds = current.filter((id) => id !== classId);
    } else {
      updated[subjectIndex].applicableClassIds = [...current, classId];
    }
    setSubjects(updated);
  };

  const toggleAllClassesForSubject = (subjectIndex) => {
    const updated = [...subjects];
    const allClassIds = classes.map((c) => c._id);
    const current = updated[subjectIndex].applicableClassIds || [];
    if (current.length === allClassIds.length) {
      updated[subjectIndex].applicableClassIds = [];
    } else {
      updated[subjectIndex].applicableClassIds = allClassIds;
    }
    setSubjects(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (subjects.length === 0) {
      setError('Please add at least one Subject.');
      return;
    }

    // Check duplicate codes & names
    const codes = subjects.map((s) => s.code.trim().toUpperCase());
    const dupCodes = codes.filter((c, idx) => codes.indexOf(c) !== idx);
    if (dupCodes.length > 0) {
      setError(`Duplicate Subject Code detected: "${dupCodes[0]}". Codes must be unique.`);
      return;
    }

    // Validate applicable classes
    for (const sub of subjects) {
      if (!sub.applicableClassIds || sub.applicableClassIds.length === 0) {
        setError(`Subject '${sub.name}' must be assigned to at least one class.`);
        return;
      }
    }

    onSave(subjects);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 5 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-chestnut" />
          <span>Subject Catalog & Class Mapping</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Configure subjects taught in your school and map them to their corresponding classes.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {subjects.map((sub, sIdx) => {
            const allSelected = (sub.applicableClassIds || []).length === classes.length;
            return (
              <div key={sIdx} className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Subject Name *</label>
                      <input
                        type="text"
                        required
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(sIdx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Code (Unique) *</label>
                      <input
                        type="text"
                        required
                        value={sub.code}
                        onChange={(e) => handleSubjectChange(sIdx, 'code', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs font-mono font-bold text-chestnut uppercase focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Subject Type</label>
                      <select
                        value={sub.subjectType}
                        onChange={(e) => handleSubjectChange(sIdx, 'subjectType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      >
                        <option value="core">Core Subject</option>
                        <option value="elective">Elective</option>
                        <option value="language">Language</option>
                        <option value="activity">Co-Curricular / Activity</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sIdx)}
                    className="p-2 text-textMuted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors self-end sm:self-center"
                    title="Remove Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Class Assignment Checkboxes */}
                <div className="pt-2 border-t border-almond/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-darkBrown">Applicable Classes:</span>
                    <button
                      type="button"
                      onClick={() => toggleAllClassesForSubject(sIdx)}
                      className="text-[10px] font-bold text-chestnut hover:underline"
                    >
                      {allSelected ? 'Deselect All' : 'Select All Classes'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {classes.map((cls) => {
                      const isChecked = (sub.applicableClassIds || []).includes(cls._id);
                      return (
                        <button
                          key={cls._id}
                          type="button"
                          onClick={() => toggleClassForSubject(sIdx, cls._id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                            isChecked
                              ? 'bg-chestnut text-white font-semibold'
                              : 'bg-white text-textMuted border border-almond/40 hover:text-darkBrown'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          <span>{cls.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAddSubject}
          className="w-full py-2.5 border-2 border-dashed border-almond hover:border-chestnut text-chestnut rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all bg-surface/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subject</span>
        </button>

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

export default Step5Subjects;
