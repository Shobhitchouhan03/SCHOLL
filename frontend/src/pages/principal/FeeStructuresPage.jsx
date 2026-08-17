import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, ArrowLeft, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

const FeeStructuresPage = () => {
  const navigate = useNavigate();
  const [structures, setStructures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [itemAmount, setItemAmount] = useState(5000);
  const [dueDate, setDueDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [strRes, catRes, classRes, sessRes] = await Promise.allSettled([
        api.get('/principal/fees/structures'),
        api.get('/principal/fees/categories'),
        api.get('/principal/classes'),
        api.get('/principal/academic-sessions'),
      ]);

      if (strRes.status === 'fulfilled' && strRes.value.data?.success) {
        setStructures(strRes.value.data.structures || []);
      }
      if (catRes.status === 'fulfilled' && catRes.value.data?.success && catRes.value.data.categories?.length > 0) {
        setCategories(catRes.value.data.categories);
        setSelectedCategoryId(catRes.value.data.categories[0]._id);
      }
      if (classRes.status === 'fulfilled' && classRes.value.data?.success && classRes.value.data.classes?.length > 0) {
        setClassesList(classRes.value.data.classes);
        setSelectedClassId(classRes.value.data.classes[0]._id);
      }
      if (sessRes.status === 'fulfilled' && sessRes.value.data?.success) {
        const sessList = sessRes.value.data.sessions || sessRes.value.data.academicSessions || [];
        if (sessList.length > 0) {
          setSessions(sessList);
          const activeSess = sessList.find((s) => s.isCurrent) || sessList[0];
          setSessionId(activeSess._id);
        }
      }
    } catch (err) {
      console.error('Fetch structures data error:', err);
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
      const installments = [
        {
          title: 'Annual Installment 1',
          dueDate: dueDate || new Date(),
          feeItems: [{ feeCategoryId: selectedCategoryId, amount: Number(itemAmount) }],
        },
      ];

      const res = await api.post('/principal/fees/structures', {
        academicSessionId: sessionId,
        name,
        code,
        applicableClassIds: [selectedClassId],
        installments,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setName('');
        setCode('');
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to create fee structure.');
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
            onClick={() => navigate('/principal/fees')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fee Dashboard</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Fee Setup</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Class-Wise Fee Structures
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Configure annual/installment fee schedules and total billing amounts for classes.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Fee Structure</span>
            </button>
          </div>

          {/* Structures List */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Active Fee Structures ({structures.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : structures.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No fee structures configured yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {structures.map((s) => (
                  <div key={s._id} className="p-5 bg-surface rounded-2xl border border-almond/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                          {s.code}
                        </span>
                        <h4 className="text-base font-bold text-darkBrown mt-1">{s.name}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-textMuted uppercase block">Total Fee</span>
                        <span className="text-lg font-black text-chestnut font-mono">₹{s.totalAmount}</span>
                      </div>
                    </div>

                    <div className="text-xs text-textMuted flex items-center gap-2 border-t border-almond/30 pt-2">
                      <Calendar className="w-3.5 h-3.5 text-chestnut" />
                      <span>Session: {s.academicSessionId?.name} • Frequency: {s.billingFrequency}</span>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Create Fee Structure</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleCreateStructure} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-bold text-darkBrown mb-1">Applicable Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  >
                    {classesList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-darkBrown mb-1">Structure Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 Annual Fee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkBrown mb-1">Structure Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FEE10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface rounded-2xl border border-almond/40 space-y-2">
                <h4 className="font-bold text-darkBrown">Fee Item Details</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={itemAmount}
                      onChange={(e) => setItemAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-almond/60 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
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
                  {submitting ? 'Creating...' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructuresPage;
