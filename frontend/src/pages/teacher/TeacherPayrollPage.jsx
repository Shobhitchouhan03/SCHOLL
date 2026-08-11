import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { DollarSign, Printer, Calendar } from 'lucide-react';

const TeacherPayrollPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState(null);
  const [records, setRecords] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const [strRes, recRes] = await Promise.all([
        api.get('/teacher/salary-structure'),
        api.get('/teacher/payroll'),
      ]);

      if (strRes.data.success) setStructure(strRes.data.structure);
      if (recRes.data.success) setRecords(recRes.data.records || []);
    } catch (err) {
      console.error('Fetch teacher payroll error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              My Salary Structure & Payslips
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              View your active base salary, allowances, deductions, and download monthly payslips.
            </p>
          </div>

          {/* Active Structure Summary */}
          {structure && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-textMuted uppercase block">Active Base Pay</span>
                <span className="text-2xl font-black text-chestnut font-mono">₹{structure.baseSalaryMinor / 100}</span>
                <div className="text-xs text-textMuted mt-1">Effective From: {new Date(structure.effectiveFrom).toLocaleDateString()}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-success/15 text-success rounded-xl text-xs font-bold uppercase">
                  {structure.status}
                </span>
              </div>
            </div>
          )}

          {/* Payslips Directory */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Monthly Payslip History ({records.length})</h3>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No payslips generated for your account yet.</div>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-darkBrown text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-chestnut" />
                        <span>{r.snapshot?.monthName} {r.snapshot?.year}</span>
                      </div>
                      <div className="text-textMuted text-[11px] mt-0.5">
                        Gross: ₹{r.grossSalaryMinor / 100} • Net Payout: <strong className="text-success">₹{r.netSalaryMinor / 100}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/teacher/payroll/${r._id}/payslip`)}
                        className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Payslip</span>
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

export default TeacherPayrollPage;
