import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Plus, ArrowLeft, Calendar, DollarSign, ArrowRight } from 'lucide-react';

const PayrollRunsPage = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Generate Run Form
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/payroll/runs');
      if (res.data.success) setRuns(res.data.runs || []);
    } catch (err) {
      console.error('Fetch payroll runs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleGenerateRun = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/payroll/runs', {
        month: Number(month),
        year: Number(year),
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchRuns();
        if (res.data.payrollRun?._id) {
          navigate(`/principal/payroll/runs/${res.data.payrollRun._id}`);
        }
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to generate payroll run.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Payroll Processing</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Monthly Payroll Runs
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Generate monthly teacher salary payouts, review deductions, approve runs, and print payslips.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Monthly Run</span>
            </button>
          </div>

          {/* Runs Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Payroll Runs Directory ({runs.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : runs.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No monthly payroll runs generated yet.</div>
            ) : (
              <div className="space-y-3">
                {runs.map((r) => (
                  <div key={r._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-chestnut" />
                        <span>Payroll Period: {r.month}/{r.year}</span>
                      </div>
                      <div className="text-textMuted text-[11px] mt-0.5">
                        Gross: ₹{r.totalGrossMinor / 100} • Deductions: ₹{r.totalDeductionsMinor / 100} • Net Payout: <strong className="text-success">₹{r.totalNetMinor / 100}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.status === 'paid' || r.status === 'locked' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                        {r.status}
                      </span>

                      <button
                        onClick={() => navigate(`/principal/payroll/runs/${r._id}`)}
                        className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>Manage Run</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* GENERATE RUN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Generate Payroll Run</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleGenerateRun} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Month (1-12) *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Year *</label>
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
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
                  {submitting ? 'Generating...' : 'Generate Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollRunsPage;
