import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, ArrowRight, ArrowLeft, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const BOARD_TEMPLATES = {
  cbse: [
    { name: 'Nursery', category: 'prePrimary' },
    { name: 'LKG', category: 'prePrimary' },
    { name: 'UKG', category: 'prePrimary' },
    { name: 'Class 1', category: 'primary' },
    { name: 'Class 2', category: 'primary' },
    { name: 'Class 3', category: 'primary' },
    { name: 'Class 4', category: 'primary' },
    { name: 'Class 5', category: 'primary' },
    { name: 'Class 6', category: 'middle' },
    { name: 'Class 7', category: 'middle' },
    { name: 'Class 8', category: 'middle' },
    { name: 'Class 9', category: 'secondary' },
    { name: 'Class 10', category: 'secondary' },
    { name: 'Class 11', category: 'seniorSecondary' },
    { name: 'Class 12', category: 'seniorSecondary' },
  ],
  icse: [
    { name: 'Lower Nursery', category: 'prePrimary' },
    { name: 'Upper Nursery', category: 'prePrimary' },
    { name: 'KG', category: 'prePrimary' },
    { name: 'Grade 1', category: 'primary' },
    { name: 'Grade 2', category: 'primary' },
    { name: 'Grade 3', category: 'primary' },
    { name: 'Grade 4', category: 'primary' },
    { name: 'Grade 5', category: 'primary' },
    { name: 'Grade 6', category: 'middle' },
    { name: 'Grade 7', category: 'middle' },
    { name: 'Grade 8', category: 'middle' },
    { name: 'Grade 9', category: 'secondary' },
    { name: 'Grade 10', category: 'secondary' },
    { name: 'Grade 11', category: 'seniorSecondary' },
    { name: 'Grade 12', category: 'seniorSecondary' },
  ],
  state: [
    { name: 'Class 1', category: 'primary' },
    { name: 'Class 2', category: 'primary' },
    { name: 'Class 3', category: 'primary' },
    { name: 'Class 4', category: 'primary' },
    { name: 'Class 5', category: 'primary' },
    { name: 'Class 6', category: 'middle' },
    { name: 'Class 7', category: 'middle' },
    { name: 'Class 8', category: 'middle' },
    { name: 'Class 9', category: 'secondary' },
    { name: 'Class 10', category: 'secondary' },
  ],
};

const Step3Classes = ({ data, onSave, onBack, loading }) => {
  const [classList, setClassList] = useState([]);
  const [error, setError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setClassList(data);
    } else {
      // Default to CBSE template
      applyTemplate('cbse');
    }
  }, [data]);

  const applyTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey === 'custom') return;
    const template = BOARD_TEMPLATES[templateKey];
    if (template) {
      setClassList(
        template.map((item, idx) => ({
          name: item.name,
          displayName: item.name,
          category: item.category,
          numericOrder: idx + 1,
        }))
      );
    }
  };

  const handleAddClass = () => {
    const nextOrder = classList.length + 1;
    setClassList([
      ...classList,
      {
        name: `Class ${nextOrder}`,
        displayName: `Class ${nextOrder}`,
        category: 'primary',
        numericOrder: nextOrder,
      },
    ]);
  };

  const handleRemoveClass = (index) => {
    const updated = classList.filter((_, idx) => idx !== index);
    // Re-index numericOrder
    setClassList(updated.map((item, idx) => ({ ...item, numericOrder: idx + 1 })));
  };

  const handleClassChange = (index, field, value) => {
    const updated = [...classList];
    updated[index][field] = value;
    if (field === 'name') updated[index].displayName = value;
    setClassList(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (classList.length === 0) {
      setError('Please add at least one Class.');
      return;
    }

    // Check duplicate names
    const names = classList.map((c) => c.name.trim().toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError(`Duplicate class names detected: "${duplicates[0]}". Class names must be unique.`);
      return;
    }

    onSave(classList);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 3 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-chestnut" />
          <span>Classes & Academic Grades Setup</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Configure the grades and classes taught in your school. Choose a standard board template or customize freely.
        </p>
      </div>

      {/* Board Preset Templates */}
      <div className="bg-surface p-4 rounded-2xl border border-almond/40 space-y-2">
        <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Quick-Fill Board Templates</span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'cbse', label: 'CBSE Standard (Nursery - 12)' },
            { id: 'icse', label: 'ICSE Standard (Nursery - 12)' },
            { id: 'state', label: 'State Board Basic (Class 1 - 10)' },
            { id: 'custom', label: 'Clear & Build Custom' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTemplate === t.id
                  ? 'bg-chestnut text-white shadow-sm'
                  : 'bg-white text-textMuted border border-almond/40 hover:text-darkBrown'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {classList.map((cls, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-almond/40 hover:border-chestnut/30 transition-all"
            >
              <span className="w-6 h-6 rounded-lg bg-almond/30 text-chestnut font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {index + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Class Name (e.g. Class 1)"
                  value={cls.name}
                  onChange={(e) => handleClassChange(index, 'name', e.target.value)}
                  className="px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-chestnut"
                />

                <select
                  value={cls.category}
                  onChange={(e) => handleClassChange(index, 'category', e.target.value)}
                  className="px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="prePrimary">Pre-Primary</option>
                  <option value="primary">Primary</option>
                  <option value="middle">Middle School</option>
                  <option value="secondary">Secondary</option>
                  <option value="seniorSecondary">Senior Secondary</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveClass(index)}
                className="p-1.5 text-textMuted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"
                title="Remove Class"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddClass}
          className="w-full py-2.5 border-2 border-dashed border-almond hover:border-chestnut text-chestnut rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all bg-surface/50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Class</span>
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

export default Step3Classes;
