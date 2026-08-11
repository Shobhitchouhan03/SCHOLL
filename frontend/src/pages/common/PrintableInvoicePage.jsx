import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Printer, ArrowLeft } from 'lucide-react';

const PrintableInvoicePage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/fees/invoices');
      if (res.data.success && res.data.invoices?.length > 0) {
        const target = res.data.invoices.find((i) => i._id === invoiceId) || res.data.invoices[0];
        setInvoice(target);
      }
    } catch (err) {
      console.error('Fetch printable invoice error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-surface p-8 text-center text-textMuted text-xs">
        Invoice record not found.
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
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Printable Official Invoice Document */}
        <div className="bg-white rounded-3xl p-8 border border-almond/50 shadow-2xl space-y-6 print:shadow-none print:border-none print:p-4">
          <div className="text-center pb-6 border-b-2 border-chestnut space-y-1">
            <h1 className="text-3xl font-black text-darkBrown tracking-tight uppercase">
              Official Student Fee Invoice
            </h1>
            <p className="text-xs font-bold text-chestnut tracking-widest uppercase">
              INVOICE NO: {invoice.invoiceNumber}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface rounded-2xl border border-almond/40 text-xs">
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Student Name</span>
              <span className="font-bold text-darkBrown">{invoice.studentId?.fullName || 'Student'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Admission No</span>
              <span className="font-mono font-bold text-chestnut">{invoice.studentId?.admissionNumber || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Invoice Date</span>
              <span className="font-bold text-darkBrown">{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-textMuted font-bold uppercase block">Due Date</span>
              <span className="font-bold text-danger">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-almond/50 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-darkBrown text-sm">
                Total Billed: <span className="text-chestnut">₹{invoice.totalAmount}</span>
              </div>
              <div className="text-textMuted">Paid Amount: <strong className="text-success">₹{invoice.paidAmount}</strong></div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-textMuted uppercase block">Remaining Balance</span>
              <span className="text-2xl font-black text-danger font-mono">₹{invoice.balanceAmount}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrintableInvoicePage;
