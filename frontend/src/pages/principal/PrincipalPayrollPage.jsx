import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { DollarSign, Plus, CheckCircle2, Clock, Calendar, Users, ArrowRight } from 'lucide-react';

const PrincipalPayrollPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [structures, setStructures] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [runRes, strRes] = await Promise.all([
        api.get('/principal/payroll/runs'),
        api.get('/principal/payroll/structures'),
      ]);

      if (runRes.data.success) setRuns(runRes.data.runs || []);
      if (strRes.data.success) setStructures(strRes.data.structures || []);
    } catch (err) {
      console.error('Fetch payroll dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestRun = runs[0];
  const totalGrossRupees = latestRun ? latestRun.totalGrossMinor / 100 : 0;
  const totalNetRupees = latestRun ? latestRun.totalNetMinor / 100 : 0;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">HR & Finance</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Staff Payroll & Salary Administration
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage teacher salary structures, generate monthly payroll runs, calculate payslips, and approve payouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate('/principal/payroll/structures')}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all"
              >
                Salary Structures
              </button>

              <button
                onClick={() => navigate('/principal/payroll/runs')}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Monthly Payroll Runs</span>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Active Structures" value={structures.length} subtitle="Configured teacher salaries" icon={Users} color="chestnut" />
            <StatCard title="Latest Payroll Gross" value={`₹${totalGrossRupees.toLocaleString()}`} subtitle={latestRun ? `${latestRun.month}/${latestRun.year}` : 'No run generated'} icon={DollarSign} color="success" />
            <StatCard title="Latest Net Payout" value={`₹${totalNetRupees.toLocaleString()}`} subtitle={latestRun ? `Status: ${latestRun.status}` : 'Pending calculation'} icon={CheckCircle2} color="warning" />
          </div>

          {/* Recent Payroll Runs */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-darkBrown">Payroll Runs History</h3>
              <button
                onClick={() => navigate('/principal/payroll/runs')}
                className="text-xs font-bold text-chestnut hover:underline"
              >
                View All Runs →
              </button>
            </div>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : runs.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No payroll runs generated yet.</div>
            ) : (
              <div className="space-y-3">
                {runs.slice(0, 5).map((run) => (
                  <div key={run._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm">
                        Payroll Period: {run.month}/{run.year}
                      </div>
                      <div className="text-textMuted text-[11px]">
                        Gross: ₹{run.totalGrossMinor / 100} • Net Payout: <strong className="text-success">₹{run.totalNetMinor / 100}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${run.status === 'paid' || run.status === 'locked' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                        {run.status}
                      </span>

                      <button
                        onClick={() => navigate(`/principal/payroll/runs/${run._id}`)}
                        className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <span>View Details</span>
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
    </div>
  );
};

export default PrincipalPayrollPage;
