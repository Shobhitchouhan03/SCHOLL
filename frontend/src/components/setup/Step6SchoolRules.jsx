import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, ArrowRight, ArrowLeft, Clock, CheckSquare, Square, AlertCircle } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const DEFAULT_GRADES = [
  { grade: 'A+', minimumPercentage: 90, maximumPercentage: 100, remark: 'Outstanding' },
  { grade: 'A', minimumPercentage: 80, maximumPercentage: 89.99, remark: 'Excellent' },
  { grade: 'B', minimumPercentage: 70, maximumPercentage: 79.99, remark: 'Very Good' },
  { grade: 'C', minimumPercentage: 60, maximumPercentage: 69.99, remark: 'Good' },
  { grade: 'D', minimumPercentage: 40, maximumPercentage: 59.99, remark: 'Satisfactory' },
  { grade: 'F', minimumPercentage: 0, maximumPercentage: 39.99, remark: 'Needs Improvement' },
];

const Step6SchoolRules = ({ data, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    workingDays: data?.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    schoolStartTime: data?.schoolStartTime || '08:00',
    schoolEndTime: data?.schoolEndTime || '14:30',
    attendanceClosingTime: data?.attendanceClosingTime || '09:00',
    minimumAttendancePercentage: data?.minimumAttendancePercentage ?? 75,
    passingPercentage: data?.passingPercentage ?? 40,
    timezone: data?.timezone || 'Asia/Kolkata',
    dateFormat: data?.dateFormat || 'DD/MM/YYYY',
    gradingSystem: Array.isArray(data?.gradingSystem) && data.gradingSystem.length > 0 ? data.gradingSystem : DEFAULT_GRADES,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      setFormData({
        workingDays: data.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        schoolStartTime: data.schoolStartTime || '08:00',
        schoolEndTime: data.schoolEndTime || '14:30',
        attendanceClosingTime: data.attendanceClosingTime || '09:00',
        minimumAttendancePercentage: data.minimumAttendancePercentage ?? 75,
        passingPercentage: data.passingPercentage ?? 40,
        timezone: data.timezone || 'Asia/Kolkata',
        dateFormat: data.dateFormat || 'DD/MM/YYYY',
        gradingSystem: Array.isArray(data.gradingSystem) && data.gradingSystem.length > 0 ? data.gradingSystem : DEFAULT_GRADES,
      });
    }
  }, [data]);

  const toggleWorkingDay = (dayId) => {
    const current = formData.workingDays || [];
    if (current.includes(dayId)) {
      setFormData({ ...formData, workingDays: current.filter((d) => d !== dayId) });
    } else {
      setFormData({ ...formData, workingDays: [...current, dayId] });
    }
  };

  const handleGradeChange = (index, field, value) => {
    const updated = [...formData.gradingSystem];
    updated[index][field] = field.includes('Percentage') ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, gradingSystem: updated });
  };

  const handleAddGrade = () => {
    setFormData({
      ...formData,
      gradingSystem: [
        ...formData.gradingSystem,
        { grade: 'New', minimumPercentage: 0, maximumPercentage: 10, remark: 'Pass' },
      ],
    });
  };

  const handleRemoveGrade = (index) => {
    setFormData({
      ...formData,
      gradingSystem: formData.gradingSystem.filter((_, idx) => idx !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.workingDays.length === 0) {
      setError('Please select at least one working day.');
      return;
    }

    if (formData.passingPercentage < 0 || formData.passingPercentage > 100) {
      setError('Passing percentage must be between 0 and 100.');
      return;
    }

    if (formData.minimumAttendancePercentage < 0 || formData.minimumAttendancePercentage > 100) {
      setError('Minimum attendance percentage must be between 0 and 100.');
      return;
    }

    // Validate grade range overlaps
    const grades = formData.gradingSystem;
    for (let i = 0; i < grades.length; i++) {
      for (let j = i + 1; j < grades.length; j++) {
        const g1 = grades[i];
        const g2 = grades[j];
        if (
          Math.max(g1.minimumPercentage, g2.minimumPercentage) <=
          Math.min(g1.maximumPercentage, g2.maximumPercentage)
        ) {
          setError(`Grade percentage ranges overlap between '${g1.grade}' (${g1.minimumPercentage}-${g1.maximumPercentage}%) and '${g2.grade}' (${g2.minimumPercentage}-${g2.maximumPercentage}%).`);
          return;
        }
      }
    }

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
      <div className="border-b border-almond/30 pb-4">
        <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Step 6 of 7</span>
        <h2 className="text-xl font-bold text-darkBrown tracking-tight mt-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-chestnut" />
          <span>School Rules & Academic Policy</span>
        </h2>
        <p className="text-xs text-textMuted mt-0.5">
          Set daily working hours, attendance policies, passing criteria, and grade boundaries.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Working Days */}
        <div>
          <label className="block text-xs font-semibold text-textMain mb-2">School Working Days *</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isChecked = formData.workingDays.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWorkingDay(day.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isChecked
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-surface text-textMuted border border-almond/40 hover:text-darkBrown'
                  }`}
                >
                  {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  <span>{day.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timings & Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-almond/30">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">School Start Time *</label>
            <input
              type="time"
              required
              value={formData.schoolStartTime}
              onChange={(e) => setFormData({ ...formData, schoolStartTime: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">School End Time *</label>
            <input
              type="time"
              required
              value={formData.schoolEndTime}
              onChange={(e) => setFormData({ ...formData, schoolEndTime: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Attendance Closing Time *</label>
            <input
              type="time"
              required
              value={formData.attendanceClosingTime}
              onChange={(e) => setFormData({ ...formData, attendanceClosingTime: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Minimum Attendance % Required *</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.minimumAttendancePercentage}
              onChange={(e) => setFormData({ ...formData, minimumAttendancePercentage: parseFloat(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1">Passing Mark % *</label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.passingPercentage}
              onChange={(e) => setFormData({ ...formData, passingPercentage: parseFloat(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
            />
          </div>
        </div>

        {/* Grading Scale Builder */}
        <div className="pt-4 border-t border-almond/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Grading Scale System</span>
              <span className="text-[11px] text-textMuted">Ensure min/max percentages do not overlap.</span>
            </div>
            <button
              type="button"
              onClick={handleAddGrade}
              className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Grade</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.gradingSystem.map((g, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-surface rounded-xl border border-almond/40">
                <input
                  type="text"
                  required
                  placeholder="Grade"
                  value={g.grade}
                  onChange={(e) => handleGradeChange(idx, 'grade', e.target.value)}
                  className="w-20 px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg text-xs font-bold text-chestnut focus:outline-none focus:border-chestnut"
                />

                <div className="flex items-center space-x-1 text-xs text-textMuted">
                  <span>Min:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={g.minimumPercentage}
                    onChange={(e) => handleGradeChange(idx, 'minimumPercentage', e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white border border-almond/60 rounded-lg text-xs text-center focus:outline-none focus:border-chestnut"
                  />
                  <span>%</span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-textMuted">
                  <span>Max:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={g.maximumPercentage}
                    onChange={(e) => handleGradeChange(idx, 'maximumPercentage', e.target.value)}
                    className="w-20 px-2 py-1.5 bg-white border border-almond/60 rounded-lg text-xs text-center focus:outline-none focus:border-chestnut"
                  />
                  <span>%</span>
                </div>

                <input
                  type="text"
                  placeholder="Remark (e.g. Excellent)"
                  value={g.remark}
                  onChange={(e) => handleGradeChange(idx, 'remark', e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg text-xs focus:outline-none focus:border-chestnut"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveGrade(idx)}
                  className="p-1.5 text-textMuted hover:text-danger rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
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
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>Save & Review</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step6SchoolRules;
