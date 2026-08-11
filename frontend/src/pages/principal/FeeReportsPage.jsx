import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Download, ArrowLeft, BarChart3, FileSpreadsheet } from 'lucide-react';

const FeeReportsPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/fees/invoices');
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.error('Fetch fee reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Student Name', 'Admission No', 'Due Date', 'Total Amount', 'Paid Amount', 'Balance', 'Status'];
    const rows = invoices.map((i) => [
      i.invoiceNumber,
      `"${i.studentId?.fullName || ''}"`,
      i.studentId?.admissionNumber || '',
      new Date(i.dueDate).toLocaleDateString(),
      i.totalAmount,
      i.paidAmount,
      i.balanceAmount,
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Collection_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Financial Reporting</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Fee Collection & Outstanding Reports
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                School fee collection metrics, overdue ledger breakdowns, and CSV exports.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Report Data Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Collection Ledger ({invoices.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No invoice records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Invoice No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-chestnut">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 font-bold text-darkBrown">{inv.studentId?.fullName}</td>
                        <td className="py-3 px-4 font-mono">{inv.studentId?.admissionNumber}</td>
                        <td className="py-3 px-4 font-mono">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-mono font-bold">₹{inv.totalAmount}</td>
                        <td className="py-3 px-4 font-mono font-bold text-success">₹{inv.paidAmount}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-danger">₹{inv.balanceAmount}</td>
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

export default FeeReportsPage;
