import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

import SchoolDocumentHeader from '../../components/common/SchoolDocumentHeader';

const PrintableReceiptPage = () => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/fees/payments');
      if (res.data.success && res.data.payments?.length > 0) {
        const target = res.data.payments.find((p) => p._id === receiptId) || res.data.payments[0];
        setPayment(target);
      }
    } catch (err) {
      console.error('Fetch printable receipt error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [receiptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-surface p-8 text-center text-textMuted text-xs">
        Receipt record not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col print:bg-white print:p-0">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 print:p-0 print:m-0 print:max-w-none">
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Printable Official Receipt Document */}
        <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl space-y-6 print:shadow-none print:border-none print:p-4 relative">
          <SchoolDocumentHeader
            title="Official Payment Receipt"
            documentNo={payment.paymentNumber}
            date={new Date(payment.paymentDate).toLocaleDateString()}
          />

          {payment.status === 'reversed' && (
            <div className="p-3 bg-danger/15 text-danger font-bold text-center text-xs rounded-xl uppercase tracking-wider border border-danger/30">
              ⚠️ TRANSACTION REVERSED — RECEIPT INVALIDATED
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface rounded-2xl border border-almond/40 text-xs">
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Student Name</span>
              <span className="font-bold text-darkBrown">{payment.studentId?.fullName || 'Student'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Admission No</span>
              <span className="font-mono font-bold text-chestnut">{payment.studentId?.admissionNumber || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Payment Date</span>
              <span className="font-bold text-darkBrown">{new Date(payment.paymentDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Payment Mode</span>
              <span className="font-bold text-darkBrown capitalize">{payment.paymentMode}</span>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-almond/50 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-darkBrown text-sm">
                Invoice Reference: <span className="text-chestnut">{payment.invoiceId?.invoiceNumber}</span>
              </div>
              <div className="text-textMuted">Remaining Invoice Balance: <strong className="text-danger">₹{payment.invoiceId?.balanceAmount}</strong></div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-textMuted uppercase block">Amount Paid</span>
              <span className="text-2xl font-black text-success font-mono">₹{payment.amount}</span>
            </div>
          </div>

          <div className="pt-8 flex justify-between items-end text-xs text-textMuted">
            <div className="text-center">
              <div className="w-32 border-b border-darkBrown mb-1"></div>
              <span>Cashier / Accountant</span>
            </div>

            <div className="text-center">
              <div className="w-32 border-b border-darkBrown mb-1"></div>
              <span>Authorized Principal Signature</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrintableReceiptPage;
