import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  FileText,
  Plus,
  ArrowLeft,
  Search,
  DollarSign,
  Printer,
} from 'lucide-react';

const FeeInvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [structures, setStructures] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Generate Invoice Form
  const [sessionId, setSessionId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStructureId, setSelectedStructureId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, stuRes, strRes, sessRes] = await Promise.all([
        api.get('/principal/fees/invoices'),
        api.get('/principal/students'),
        api.get('/principal/fees/structures'),
        api.get('/principal/setup/academic-sessions'),
      ]);

      if (invRes.data.success) setInvoices(invRes.data.invoices || []);
      if (stuRes.data.success && stuRes.data.students?.length > 0) {
        setStudents(stuRes.data.students);
        setSelectedStudentId(stuRes.data.students[0]._id);
      }
      if (strRes.data.success && strRes.data.structures?.length > 0) {
        setStructures(strRes.data.structures);
        setSelectedStructureId(strRes.data.structures[0]._id);
      }
      if (sessRes.data.success && sessRes.data.academicSessions?.length > 0) {
        setSessions(sessRes.data.academicSessions);
        setSessionId(sessRes.data.academicSessions[0]._id);
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/fees/invoices/generate', {
        academicSessionId: sessionId,
        studentId: selectedStudentId,
        feeStructureId: selectedStructureId,
        dueDate: dueDate || new Date(Date.now() + 14 * 86400000),
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      setError(err.customMessage || 'Failed to generate invoice.');
    } finally {
      setSubmitting(false);
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Billing Console</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Fee Invoices Directory
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Generate student invoices, track due dates, view balances, and print official invoice bills.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Student Invoice</span>
            </button>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Generated Invoices ({invoices.length})</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No student invoices generated yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Invoice No & Student</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {invoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-chestnut">{inv.invoiceNumber}</div>
                          <div className="font-bold text-darkBrown">{inv.studentId?.fullName}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold">₹{inv.totalAmount}</td>
                        <td className="py-3 px-4 font-mono font-bold text-success">₹{inv.paidAmount}</td>
                        <td className="py-3 px-4 font-mono font-bold text-danger">₹{inv.balanceAmount}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/principal/fees/invoices/${inv._id}`)}
                            className="px-2.5 py-1 bg-surface border border-almond text-darkBrown rounded-lg text-[10px] font-bold hover:bg-almond/30 transition-colors"
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
        </main>
      </div>

      {/* GENERATE INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Generate Student Invoice</h3>
            {error && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleGenerateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Academic Session</label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                >
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Select Student *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-bold"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Fee Structure *</label>
                <select
                  value={selectedStructureId}
                  onChange={(e) => setSelectedStructureId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                >
                  {structures.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} (Total ₹{st.totalAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Invoice Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeInvoicesPage;
