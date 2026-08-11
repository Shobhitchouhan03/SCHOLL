import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign,
  Receipt,
  FileText,
  CreditCard,
  PieChart,
  RefreshCw,
  Search,
  Plus,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Building,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import FeeCategoriesPage from './principal/FeeCategoriesPage';
import FeeStructuresPage from './principal/FeeStructuresPage';
import FeeInvoicesPage from './principal/FeeInvoicesPage';
import FeePaymentsPage from './principal/FeePaymentsPage';
import FeeReportsPage from './principal/FeeReportsPage';
import PayrollRunsPage from './principal/PayrollRunsPage';

const AccountantDashboard = () => {
  const { user, school, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'categories' | 'structures' | 'invoices' | 'payments' | 'payroll' | 'reports'

  const [stats, setStats] = useState({
    totalCollected: '₹0',
    pendingFees: '₹0',
    recentPaymentsCount: 0,
    payrollDisbursed: '₹0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialStats();
  }, []);

  const fetchFinancialStats = async () => {
    try {
      setLoading(true);
      const [paymentsRes, invoicesRes, payrollRes] = await Promise.all([
        api.get('/principal/fees/payments').catch(() => ({ data: { payments: [] } })),
        api.get('/principal/fees/invoices').catch(() => ({ data: { invoices: [] } })),
        api.get('/principal/payroll/runs').catch(() => ({ data: { runs: [] } })),
      ]);

      const payments = paymentsRes.data?.payments || [];
      const invoices = invoicesRes.data?.invoices || [];
      const payrollRuns = payrollRes.data?.runs || [];

      const totalCollectedMinor = payments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
      const pendingInvoices = invoices.filter((i) => ['pending', 'partially_paid'].includes(i.status));
      const pendingAmountMinor = pendingInvoices.reduce((acc, i) => acc + (i.balanceAmount || i.totalAmount || 0), 0);

      const paidPayroll = payrollRuns.filter((r) => r.status === 'paid');
      const payrollAmountMinor = paidPayroll.reduce((acc, r) => acc + (r.totalNetSalary || 0), 0);

      setStats({
        totalCollected: `₹${(totalCollectedMinor / 100).toLocaleString('en-IN')}`,
        pendingFees: `₹${(pendingAmountMinor / 100).toLocaleString('en-IN')}`,
        recentPaymentsCount: payments.length,
        payrollDisbursed: `₹${(payrollAmountMinor / 100).toLocaleString('en-IN')}`,
      });
    } catch (err) {
      console.error('Failed to load financial stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Accountant Navigation Header */}
      <header className="bg-white border-b border-almond/60 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-chestnut text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-darkBrown tracking-tight">
                  {school?.name || 'School'} — Accountant Portal
                </h1>
                <p className="text-xs text-textMuted">Finance, Fee Collections & Payroll Console</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-morning/10 text-darkBrown rounded-lg border border-morning/20">
                Role: Accountant ({user?.name || user?.loginId})
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-medium bg-surface text-danger hover:bg-danger/10 border border-danger/20 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 border-t border-almond/40 overflow-x-auto py-2">
            {[
              { id: 'overview', label: 'Financial Overview', icon: PieChart },
              { id: 'payments', label: 'Payment Entry & Receipts', icon: CreditCard },
              { id: 'invoices', label: 'Fee Invoices', icon: Receipt },
              { id: 'categories', label: 'Fee Categories', icon: FileText },
              { id: 'structures', label: 'Fee Structures', icon: Building },
              { id: 'payroll', label: 'Payroll Payouts', icon: DollarSign },
              { id: 'reports', label: 'Financial Reports', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'text-textMuted hover:text-darkBrown hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-darkBrown">Financial Executive Dashboard</h2>
                <p className="text-xs text-textMuted">Real-time fee collection and payroll summary</p>
              </div>
              <button
                onClick={fetchFinancialStats}
                className="px-3 py-1.5 bg-white border border-almond/60 text-xs font-semibold text-textMain rounded-xl shadow-sm hover:bg-surface flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-almond/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textMuted">Total Fee Collected</span>
                  <div className="p-2 bg-morning/10 text-darkBrown rounded-xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-darkBrown">{stats.totalCollected}</div>
                <div className="text-[11px] text-textMuted mt-1">Total recorded fee payments</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-almond/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textMuted">Outstanding Dues</span>
                  <div className="p-2 bg-danger/10 text-danger rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-danger">{stats.pendingFees}</div>
                <div className="text-[11px] text-textMuted mt-1">Pending and partial invoices</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-almond/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textMuted">Recent Transactions</span>
                  <div className="p-2 bg-chestnut/10 text-chestnut rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-darkBrown">{stats.recentPaymentsCount}</div>
                <div className="text-[11px] text-textMuted mt-1">Total payments processed</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-almond/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textMuted">Payroll Disbursed</span>
                  <div className="p-2 bg-sage/20 text-darkBrown rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-black text-darkBrown">{stats.payrollDisbursed}</div>
                <div className="text-[11px] text-textMuted mt-1">Total salary runs executed</div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm">
              <h3 className="text-sm font-bold text-darkBrown mb-4">Financial Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-4 bg-surface hover:bg-almond/30 border border-almond/60 rounded-xl text-left transition-all group"
                >
                  <CreditCard className="w-5 h-5 text-chestnut mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-darkBrown">Record Fee Payment</div>
                  <div className="text-[10px] text-textMuted mt-0.5">Collect fees & issue receipt</div>
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  className="p-4 bg-surface hover:bg-almond/30 border border-almond/60 rounded-xl text-left transition-all group"
                >
                  <Receipt className="w-5 h-5 text-chestnut mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-darkBrown">Generate Invoices</div>
                  <div className="text-[10px] text-textMuted mt-0.5">Assign student fee bills</div>
                </button>

                <button
                  onClick={() => setActiveTab('payroll')}
                  className="p-4 bg-surface hover:bg-almond/30 border border-almond/60 rounded-xl text-left transition-all group"
                >
                  <DollarSign className="w-5 h-5 text-chestnut mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-darkBrown">Payroll Payouts</div>
                  <div className="text-[10px] text-textMuted mt-0.5">Process teacher salaries</div>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 bg-surface hover:bg-almond/30 border border-almond/60 rounded-xl text-left transition-all group"
                >
                  <TrendingUp className="w-5 h-5 text-chestnut mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-darkBrown">Financial Reports</div>
                  <div className="text-[10px] text-textMuted mt-0.5">Audit collection ledgers</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && <FeeCategoriesPage />}
        {activeTab === 'structures' && <FeeStructuresPage />}
        {activeTab === 'invoices' && <FeeInvoicesPage />}
        {activeTab === 'payments' && <FeePaymentsPage />}
        {activeTab === 'payroll' && <PayrollRunsPage />}
        {activeTab === 'reports' && <FeeReportsPage />}
      </main>
    </div>
  );
};

export default AccountantDashboard;
