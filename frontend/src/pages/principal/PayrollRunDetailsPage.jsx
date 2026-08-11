import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  DollarSign,
  Printer,
  Calculator,
} from 'lucide-react';

const PayrollRunDetailsPage = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchRunDetails = async () => {
    try {
      setLoading(true);
      const [runsRes, recRes] = await Promise.all([
        api.get('/principal/payroll/runs'),
        api.get(`/principal/payroll/runs/${runId}/records`),
      ]);

      if (runsRes.data.success && runsRes.data.runs?.length > 0) {
        const target = runsRes.data.runs.find((r) => r._id === runId);
        setRun(target || null);
      }
      if (recRes.data.success) {
        setRecords(recRes.data.records || []);
      }
    } catch (err) {
      console.error('Fetch payroll run details error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunDetails();
  }, [runId]);

  const handleCalculate = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/principal/payroll/runs/${runId}/calculate`);
      if (res.data.success) fetchRunDetails();
    } catch (err) {
      alert(err.customMessage || 'Calculation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/principal/payroll/runs/${runId}/approve`);
      if (res.data.success) fetchRunDetails();
    } catch (err) {
      alert(err.customMessage || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/principal/payroll/runs/${runId}/mark-paid`);
      if (res.data.success) fetchRunDetails();
    } catch (err) {
      alert(err.customMessage || 'Failed to mark paid.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLock = async () => {
    if (!window.confirm('Are you sure you want to lock this payroll run permanently?')) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/principal/payroll/runs/${runId}/lock`);
      if (res.data.success) fetchRunDetails();
    } catch (err) {
      alert(err.customMessage || 'Locking failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-surface p-8 text-center text-textMuted text-xs">
        Payroll run not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/principal/payroll/runs')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Payroll Runs</span>
          </button>

          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Payroll Run</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-warning/15 text-warning">
                  {run.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Payroll Period: {run.month}/{run.year}
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Gross Payout: ₹{run.totalGrossMinor / 100} • Deductions: ₹{run.totalDeductionsMinor / 100} • Net Payout: <strong className="text-success">₹{run.totalNetMinor / 100}</strong>
              </p>
            </div>

            {run.status !== 'locked' && (
              <div className="flex items-center gap-2 flex-wrap">
                {run.status === 'draft' && (
                  <button
                    onClick={handleCalculate}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Calculate Totals</span>
                  </button>
                )}

                {run.status === 'calculated' && (
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Run</span>
                  </button>
                )}

                {run.status === 'approved' && (
                  <button
                    onClick={handleMarkPaid}
                    disabled={actionLoading}
                    className="px-3.5 py-2 bg-success text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Mark All Paid</span>
                  </button>
                )}

                <button
                  onClick={handleLock}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Run</span>
                </button>
              </div>
            )}
          </div>

          {/* Teacher Records Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Teacher Payslip Records ({records.length})</h3>

            {records.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No teacher records generated for this run.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Teacher Name & Emp ID</th>
                      <th className="py-3 px-4">Base Pay</th>
                      <th className="py-3 px-4">Allowances</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4">Gross Salary</th>
                      <th className="py-3 px-4">Net Payout</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{r.snapshot?.teacherName || r.teacherId?.fullName}</div>
                          <div className="font-mono text-[11px] text-textMuted">{r.snapshot?.employeeId} • {r.snapshot?.designation}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">₹{r.baseSalaryMinor / 100}</td>
                        <td className="py-3 px-4 font-mono font-bold text-success">+₹{r.allowancesMinor / 100}</td>
                        <td className="py-3 px-4 font-mono font-bold text-danger">-₹{(r.deductionsMinor + r.leaveDeductionMinor) / 100}</td>
                        <td className="py-3 px-4 font-mono font-bold">₹{r.grossSalaryMinor / 100}</td>
                        <td className="py-3 px-4 font-mono font-bold text-chestnut">₹{r.netSalaryMinor / 100}</td>

                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.paymentStatus === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                            {r.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/principal/payroll/records/${r._id}/payslip`)}
                            className="px-2.5 py-1 bg-surface border border-almond text-darkBrown rounded-lg text-[10px] font-bold hover:bg-almond/30 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Payslip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PayrollRunDetailsPage;
