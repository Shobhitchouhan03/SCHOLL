import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, ArrowRight, ArrowLeft, Copy, AlertCircle, CheckCircle2 } from 'lucide-react';

const Step4Sections = ({ classes, data, onSave, onBack, loading }) => {
  // Map of classId -> array of section objects { name, capacity, roomNumber }
  const [sectionsMap, setSectionsMap] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (Array.isArray(classes) && classes.length > 0) {
      const initial = {};
      classes.forEach((cls) => {
        const existingForClass = Array.isArray(data)
          ? data.filter((s) => (s.classId?._id || s.classId) === cls._id)
          : [];

        if (existingForClass.length > 0) {
          initial[cls._id] = existingForClass.map((s) => ({
            name: s.name,
            capacity: s.capacity || 40,
            roomNumber: s.roomNumber || '',
          }));
        } else {
          // Default to Section A and Section B for each class
          initial[cls._id] = [
            { name: 'A', capacity: 40, roomNumber: '' },
            { name: 'B', capacity: 40, roomNumber: '' },
          ];
        }
      });
      setSectionsMap(initial);
    }
  }, [classes, data]);

  const handleAddSection = (classId) => {
    const current = sectionsMap[classId] || [];
    const nextChar = String.fromCharCode(65 + current.length); // A, B, C, D...
    setSectionsMap({
      ...sectionsMap,
      [classId]: [...current, { name: nextChar, capacity: 40, roomNumber: '' }],
    });
  };

  const handleRemoveSection = (classId, index) => {
    const current = sectionsMap[classId] || [];
    const updated = current.filter((_, idx) => idx !== index);
    setSectionsMap({ ...sectionsMap, [classId]: updated });
  };

  const handleSectionChange = (classId, index, field, value) => {
    const current = [...(sectionsMap[classId] || [])];
    current[index][field] = value;
    setSectionsMap({ ...sectionsMap, [classId]: current });
  };

  const handleCopyToAll = (sourceClassId) => {
    const sourceSections = sectionsMap[sourceClassId];
    if (!sourceSections || sourceSections.length === 0) return;

    const newMap = {};
    classes.forEach((cls) => {
      newMap[cls._id] = sourceSections.map((s) => ({ ...s }));
    });
    setSectionsMap(newMap);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const payload = [];
    let hasValidationError = false;

    classes.forEach((cls) => {
      const sections = sectionsMap[cls._id] || [];
      if (sections.length === 0) {
        setError(`Class '${cls.name}' must have at least one section.`);
        hasValidationError = true;
        return;
      }

      // Check duplicates within class
      const names = sections.map((s) => s.name.trim().toUpperCase());
      const duplicates = names.filter((n, idx) => names.indexOf(n) !== idx);
      if (duplicates.length > 0) {
        setError(`Duplicate section '${duplicates[0]}' detected in '${cls.name}'. Section names must be unique per class.`);
        hasValidationError = true;
        return;
      }

      sections.forEach((sec) => {
        payload.push({
          classId: cls._id,
          name: sec.name.trim().toUpperCase(),
          capacity: parseInt(sec.capacity, 10) || 40,
          roomNumber: sec.roomNumber || '',
        });
      });
    });

    if (hasValidationError) return;
    onSave(payload);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 4 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-chestnut" />
          <span>Class Sections & Room Capacity</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Assign sections (e.g. A, B, C), room numbers, and maximum student capacities for each class.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {classes.map((cls) => {
            const sections = sectionsMap[cls._id] || [];
            return (
              <div key={cls._id} className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-darkBrown text-sm">{cls.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-almond/40 text-textMuted font-semibold uppercase">
                      {cls.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyToAll(cls._id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-chestnut bg-chestnut/10 hover:bg-chestnut/20 rounded-lg flex items-center gap-1 transition-all"
                      title="Apply these sections to all other classes"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy to All Classes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddSection(cls._id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-chestnut hover:bg-darkBrown rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-almond/50 shadow-sm"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Sec (A)"
                        value={sec.name}
                        onChange={(e) => handleSectionChange(cls._id, idx, 'name', e.target.value.toUpperCase())}
                        className="w-16 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs font-mono font-bold text-chestnut text-center uppercase focus:outline-none focus:border-chestnut"
                      />

                      <input
                        type="number"
                        placeholder="Cap (40)"
                        value={sec.capacity}
                        onChange={(e) => handleSectionChange(cls._id, idx, 'capacity', e.target.value)}
                        className="w-20 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs text-center focus:outline-none focus:border-chestnut"
                      />

                      <input
                        type="text"
                        placeholder="Room #"
                        value={sec.roomNumber}
                        onChange={(e) => handleSectionChange(cls._id, idx, 'roomNumber', e.target.value)}
                        className="flex-1 px-2 py-1 bg-surface border border-almond/60 rounded-lg text-xs focus:outline-none focus:border-chestnut"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(cls._id, idx)}
                        className="p-1 text-textMuted hover:text-danger rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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

export default Step4Sections;
