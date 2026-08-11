import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, ArrowLeft, DollarSign, Users } from 'lucide-react';

const SalaryStructuresPage = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [baseSalary, setBaseSalary] = useState('60000');
  const [allowanceName, setAllowanceName] = useState('HRA');
  const [allowanceAmount, setAllowanceAmount] = useState('5000');
  const [deductionName, setDeductionName] = useState('PF');
  const [deductionAmount, setDeductionAmount] = useState('2000');
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [strRes, tchRes, sessRes] = await Promise.all([
        api.get('/principal/payroll/structures'),
        api.get('/principal/teachers'),
        api.get('/principal/setup/academic-sessions'),
      ]);

      if (strRes.data.success) setStructures(strRes.data.structures || []);
      if (tchRes.data.success && tchRes.data.teachers?.length > 0) {
        setTeachers(tchRes.data.teachers);
        setSelectedTeacherId(tchRes.data.teachers[0]._id);
      }
      if (sessRes.data.success && sessRes.data.academicSessions?.length > 0) {
        setSessions(sessRes.data.academicSessions);
        setSessionId(sessRes.data.academicSessions[0]._id);
      }
    } catch (err) {
      console.error('Fetch salary structures error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/payroll/structures', {
        teacherId: selectedTeacherId,
        academicSessionId: sessionId,
        effectiveFrom: effectiveFrom || new Date(),
        baseSalary: Number(baseSalary),
        allowances: [{ name: allowanceName, amount: Number(allowanceAmount) }],
        deductions: [{ name: deductionName, amount: Number(deductionAmount), deductionType: 'pf' }],
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create salary structure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/payroll')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Payroll Dashboard</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Salary Administration</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Teacher Salary Structures
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Configure base pay, allowances, PF/tax deductions, and effective dates for teachers.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Salary Structure</span>
            </button>
          </div>

          {/* Structures List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Active Teacher Salary Structures ({structures.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : structures.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No salary structures configured yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {structures.map((s) => (
                  <div key={s._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-darkBrown">{s.teacherId?.fullName}</h4>
                        <div className="text-xs text-textMuted">{s.teacherId?.designation} • Emp ID: {s.teacherId?.employeeId}</div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-textMuted uppercase block">Base Pay</span>
                        <span className="text-lg font-black text-chestnut font-mono">₹{s.baseSalaryMinor / 100}</span>
                      </div>
                    </div>

                    <div className="text-xs text-textMuted border-t border-almond/30 pt-2 flex items-center justify-between">
                      <span>Effective: {new Date(s.effectiveFrom).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success uppercase">
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE STRUCTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Configure Salary Structure</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleCreateStructure} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Teacher *</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                >
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Academic Session</label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                >
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Monthly Base Salary (₹) *</label>
                <input
                  type="number"
                  required
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Allowance (₹)</label>
                  <input
                    type="number"
                    value={allowanceAmount}
                    onChange={(e) => setAllowanceAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Deduction (PF/Tax ₹)</label>
                  <input
                    type="number"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono text-danger"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Effective Date *</label>
                <input
                  type="date"
                  required
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructuresPage;
