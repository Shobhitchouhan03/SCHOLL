import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  DollarSign,
  Plus,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

const PrincipalFeesDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, payRes] = await Promise.all([
        api.get('/principal/fees/invoices'),
        api.get('/principal/fees/payments'),
      ]);

      if (invRes.data.success) {
        setInvoices(invRes.data.invoices || []);
      }
      if (payRes.data.success) {
        setPayments(payRes.data.payments || []);
      }
    } catch (err) {
      console.error('Fetch fees dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBilled = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.balanceAmount || 0), 0);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Principal Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Fee & Payment Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Overview of school billing, fee structures, invoice generation, payment collections, and financial reports.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate('/principal/fees/categories')}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all"
              >
                Categories
              </button>

              <button
                onClick={() => navigate('/principal/fees/structures')}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all"
              >
                Structures
              </button>

              <button
                onClick={() => navigate('/principal/fees/invoices')}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all"
              >
                Invoices
              </button>

              <button
                onClick={() => navigate('/principal/fees/payments')}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Billed" value={`₹${totalBilled.toLocaleString()}`} subtitle="All generated invoices" icon={DollarSign} color="chestnut" />
            <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} subtitle="Received payments" icon={CheckCircle2} color="success" />
            <StatCard title="Outstanding Dues" value={`₹${totalOutstanding.toLocaleString()}`} subtitle="Pending collection" icon={Clock} color="warning" />
          </div>

          {/* Invoices & Payments Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invoices List */}
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Recent Invoices</h3>
                <button
                  onClick={() => navigate('/principal/fees/invoices')}
                  className="text-xs font-bold text-chestnut hover:underline"
                >
                  View All →
                </button>
              </div>

              {loading ? (
                <LoadingSkeleton count={3} />
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-textMuted text-xs">No invoices generated yet.</div>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 5).map((inv) => (
                    <div key={inv._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-darkBrown">{inv.invoiceNumber}</div>
                        <div className="text-[11px] text-textMuted">{inv.studentId?.fullName}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-chestnut">₹{inv.totalAmount}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.status === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Recent Payments</h3>
                <button
                  onClick={() => navigate('/principal/fees/payments')}
                  className="text-xs font-bold text-chestnut hover:underline"
                >
                  View All →
                </button>
              </div>

              {loading ? (
                <LoadingSkeleton count={3} />
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-textMuted text-xs">No payments recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 5).map((pay) => (
                    <div key={pay._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-darkBrown">{pay.paymentNumber}</div>
                        <div className="text-[11px] text-textMuted">{pay.studentId?.fullName} • {pay.paymentMode}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-success">₹{pay.amount}</div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pay.status === 'reversed' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrincipalFeesDashboardPage;
