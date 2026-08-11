import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CreditCard,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  RotateCcw,
  Printer,
} from 'lucide-react';

const FeePaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReversePayment, setSelectedReversePayment] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, invRes] = await Promise.all([
        api.get('/principal/fees/payments'),
        api.get('/principal/fees/invoices'),
      ]);

      if (payRes.data.success) setPayments(payRes.data.payments || []);
      if (invRes.data.success && invRes.data.invoices?.length > 0) {
        const pending = invRes.data.invoices.filter((i) => i.balanceAmount > 0);
        setInvoices(pending);
        if (pending.length > 0) {
          setSelectedInvoiceId(pending[0]._id);
          setAmount(pending[0].balanceAmount);
        }
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvoiceChange = (invId) => {
    setSelectedInvoiceId(invId);
    const target = invoices.find((i) => i._id === invId);
    if (target) {
      setAmount(target.balanceAmount);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/fees/payments', {
        invoiceId: selectedInvoiceId,
        amount: Number(amount),
        paymentMode,
        referenceNumber,
      });

      if (res.data.success) {
        setIsRecordModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReversePayment = async () => {
    if (!selectedReversePayment) return;
    try {
      const res = await api.post(`/principal/fees/payments/${selectedReversePayment._id}/reverse`, {
        reversalReason,
      });

      if (res.data.success) {
        setSelectedReversePayment(null);
        setReversalReason('');
        fetchData();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to reverse payment.');
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Payment Collections</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Fee Payment Collections Register
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Record fee payments (Cash, Bank Transfer, Cheque), generate receipts, and manage payment reversals.
              </p>
            </div>

            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Fee Payment</span>
            </button>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Recorded Payments ({payments.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No fee payments recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Payment No & Student</th>
                      <th className="py-3 px-4">Invoice No</th>
                      <th className="py-3 px-4">Date & Mode</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-chestnut">{p.paymentNumber}</div>
                          <div className="font-bold text-darkBrown">{p.studentId?.fullName}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {p.invoiceId?.invoiceNumber}
                        </td>

                        <td className="py-3 px-4 capitalize">
                          {new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMode}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-success">
                          ₹{p.amount}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'reversed' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {p.status !== 'reversed' && (
                            <button
                              onClick={() => setSelectedReversePayment(p)}
                              className="px-2.5 py-1 bg-danger/15 text-danger rounded-lg text-[10px] font-bold hover:bg-danger/25 transition-colors"
                            >
                              Reverse Payment
                            </button>
                          )}
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

      {/* RECORD PAYMENT MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Record Fee Payment</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Target Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                >
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.studentId?.fullName} (Balance: ₹{inv.balanceAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-semibold"
                >
                  <option value="cash">Cash</option>
                  <option value="bankTransfer">Bank Transfer / NEFT / UPI</option>
                  <option value="cheque">Cheque</option>
                  <option value="cardReference">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Reference / UTR Number</label>
                <input
                  type="text"
                  placeholder="e.g. UTR123456789"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Payment & Print Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVERSE PAYMENT MODAL */}
      {selectedReversePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Reverse Payment Transaction</h3>
            <p className="text-xs text-textMuted">
              Reversing payment {selectedReversePayment.paymentNumber} will restore the invoice balance by ₹{selectedReversePayment.amount}.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Reversal Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Cheque bounced / incorrect entry..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedReversePayment(null)}
                className="px-4 py-2 border border-almond text-textMuted text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReversePayment}
                className="px-5 py-2 bg-danger text-white text-xs font-bold rounded-xl shadow-md"
              >
                Execute Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePaymentsPage;
