import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { DollarSign, Printer, FileText, CheckCircle2, AlertCircle, Clock, Receipt } from 'lucide-react';

const ParentFeesPage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [feeData, setFeeData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildrenList(kids);
        if (kids.length > 0) setSelectedChildId(kids[0]._id);
      }
    } catch (err) {
      console.error('Fetch children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async (childId) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/fees`);
      if (res.data.success) {
        setFeeData(res.data);
      }
    } catch (err) {
      console.error('Fetch fees error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchFees(selectedChildId);
    }
  }, [selectedChildId]);

  const handlePrint = () => {
    window.print();
  };

  const student = feeData?.student || {};
  const summary = feeData?.summary || { totalAssignedRupees: 0, totalPaidRupees: 0, totalPendingRupees: 0, nextDueDate: null };
  const invoices = feeData?.invoices || [];
  const receipts = feeData?.receipts || [];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="print:hidden">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      </div>

      <div className="flex flex-1">
        <div className="print:hidden">
          <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 print:p-0 print:max-w-none">
          {/* Header Banner - Screen Only */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Fee Ledger, Invoices & Receipts
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                View assigned fee structures, payment status, pending dues, and print official receipts.
              </p>
            </div>
          </div>

          <div className="print:hidden">
            <ChildSelector
              childrenList={childrenList}
              selectedChildId={selectedChildId}
              onSelectChild={(id) => setSelectedChildId(id)}
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
            <StatCard
              title="Total Assigned Fee"
              value={`₹${(summary.totalAssignedRupees || 0).toLocaleString('en-IN')}`}
              subtitle="Annual tuition & activity fees"
              icon={DollarSign}
              color="chestnut"
            />
            <StatCard
              title="Total Paid"
              value={`₹${(summary.totalPaidRupees || 0).toLocaleString('en-IN')}`}
              subtitle="Confirmed payments"
              icon={CheckCircle2}
              color="success"
            />
            <StatCard
              title="Pending Dues"
              value={`₹${(summary.totalPendingRupees || 0).toLocaleString('en-IN')}`}
              subtitle={summary.nextDueDate ? `Due: ${summary.nextDueDate}` : 'All dues settled'}
              icon={AlertCircle}
              color={summary.totalPendingRupees > 0 ? 'danger' : 'success'}
            />
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : (
            <div className="space-y-6">
              {/* Invoices List */}
              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4 print:hidden">
                <h3 className="text-base font-bold text-darkBrown">Assigned Fee Invoices</h3>
                {invoices.length === 0 ? (
                  <div className="p-6 text-center text-xs text-textMuted">No fee invoices issued yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-almond/30 text-textMuted font-semibold">
                          <th className="pb-3 px-3">Invoice No</th>
                          <th className="pb-3 px-3">Category</th>
                          <th className="pb-3 px-3">Amount</th>
                          <th className="pb-3 px-3">Paid</th>
                          <th className="pb-3 px-3">Due Date</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-almond/20 text-darkBrown">
                        {invoices.map((inv) => (
                          <tr key={inv._id} className="hover:bg-surface/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold">{inv.invoiceNumber}</td>
                            <td className="py-3 px-3">{inv.title || 'Tuition Fee'}</td>
                            <td className="py-3 px-3 font-mono font-bold">₹{(inv.finalAmountMinorUnits / 100).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 font-mono text-success">₹{(inv.paidAmountMinorUnits / 100).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-textMuted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                                inv.status === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-darkBrown'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => { setSelectedInvoice(inv); setSelectedReceipt(null); }}
                                className="text-chestnut font-bold hover:underline"
                              >
                                View Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Receipts List */}
              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4 print:hidden">
                <h3 className="text-base font-bold text-darkBrown">Payment Receipts History</h3>
                {receipts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-textMuted">No payment receipts generated yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-almond/30 text-textMuted font-semibold">
                          <th className="pb-3 px-3">Receipt No</th>
                          <th className="pb-3 px-3">Payment Date</th>
                          <th className="pb-3 px-3">Amount Paid</th>
                          <th className="pb-3 px-3">Payment Mode</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-almond/20 text-darkBrown">
                        {receipts.map((rec) => (
                          <tr key={rec._id} className="hover:bg-surface/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold">{rec.receiptNumber}</td>
                            <td className="py-3 px-3 font-mono">{new Date(rec.paymentDate || rec.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-3 font-mono font-bold text-success">₹{(rec.amountPaidMinorUnits / 100).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 capitalize">{rec.paymentMode || 'Online'}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                rec.status === 'valid' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                              }`}>
                                {rec.status || 'valid'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => { setSelectedReceipt(rec); setSelectedInvoice(null); }}
                                className="inline-flex items-center gap-1 text-chestnut font-bold hover:underline"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Printable Modal (Invoice or Receipt) */}
              {(selectedInvoice || selectedReceipt) && (
                <div className="bg-white rounded-3xl p-8 border border-almond/40 shadow-card space-y-6 print:border-none print:shadow-none print:p-4">
                  <div className="flex items-center justify-between border-b border-almond/30 pb-4 print:hidden">
                    <h3 className="text-base font-bold text-darkBrown">
                      {selectedInvoice ? `Invoice #${selectedInvoice.invoiceNumber}` : `Official Receipt #${selectedReceipt.receiptNumber}`}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1 bg-chestnut text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:bg-darkBrown transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={() => { setSelectedInvoice(null); setSelectedReceipt(null); }}
                        className="text-xs font-bold text-textMuted hover:text-darkBrown px-2 py-1"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Print Document Layout */}
                  <div className="space-y-4 text-xs">
                    <div className="text-center pb-4 border-b border-chestnut">
                      <h2 className="text-xl font-black text-darkBrown uppercase tracking-wide">
                        {selectedInvoice ? 'FEE INVOICE' : 'OFFICIAL PAYMENT RECEIPT'}
                      </h2>
                      <p className="text-xs text-textMuted font-bold uppercase">{student.fullName} • Class {student.currentClassId?.name} - {student.currentSectionId?.name}</p>
                    </div>

                    {selectedInvoice ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 bg-surface p-3 rounded-xl">
                          <div><span className="text-textMuted block">Invoice Number:</span> <strong className="font-mono">{selectedInvoice.invoiceNumber}</strong></div>
                          <div><span className="text-textMuted block">Due Date:</span> <strong>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</strong></div>
                        </div>
                        <div className="p-3 bg-surface rounded-xl flex justify-between font-bold">
                          <span>Total Invoice Amount:</span>
                          <span className="font-mono">₹{(selectedInvoice.finalAmountMinorUnits / 100).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 bg-surface p-3 rounded-xl">
                          <div><span className="text-textMuted block">Receipt Number:</span> <strong className="font-mono">{selectedReceipt.receiptNumber}</strong></div>
                          <div><span className="text-textMuted block">Payment Date:</span> <strong>{new Date(selectedReceipt.paymentDate || selectedReceipt.createdAt).toLocaleDateString()}</strong></div>
                        </div>
                        <div className="p-3 bg-success/10 text-success rounded-xl flex justify-between font-bold">
                          <span>Amount Received:</span>
                          <span className="font-mono">₹{(selectedReceipt.amountPaidMinorUnits / 100).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentFeesPage;
