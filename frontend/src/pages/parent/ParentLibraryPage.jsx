import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ParentLibraryPage = () => {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/parent/children/${studentId}/library`);
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error('Fetch parent library error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Library & Borrowing History
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              View current active book loans, due dates, fine balance, and complete borrowing history for {data?.studentName || 'your child'}.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : !data || !data.hasMembership ? (
            <div className="bg-white rounded-2xl border border-almond/40 p-12 text-center space-y-2">
              <BookOpen className="w-12 h-12 text-almond mx-auto" />
              <h3 className="text-base font-bold text-darkBrown">No Library Membership</h3>
              <p className="text-xs text-textMuted">No active library membership card has been issued to {data?.studentName || 'your child'}.</p>
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Active Loans */}
              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-darkBrown">Currently Issued Books ({data.activeIssues.length})</h3>
                  {data.member?.fineBalanceMinor > 0 && (
                    <span className="px-3 py-1 bg-danger/10 text-danger rounded-xl font-bold font-mono">
                      Fine Balance: ₹{(data.member.fineBalanceMinor / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                {data.activeIssues.length === 0 ? (
                  <div className="text-center py-8 text-textMuted text-xs">No active book loans. All books returned on time!</div>
                ) : (
                  <div className="space-y-3">
                    {data.activeIssues.map((i) => (
                      <div key={i._id} className="p-4 bg-surface rounded-2xl border border-almond/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-darkBrown text-sm">{i.bookId?.title}</h4>
                          <div className="text-textMuted font-mono text-[11px]">
                            Accession: {i.bookCopyId?.accessionNumber} | Barcode: {i.bookCopyId?.barcode || 'N/A'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-textMuted uppercase">Due Date</span>
                            <div className="font-bold font-mono text-darkBrown">{new Date(i.dueDate).toLocaleDateString()}</div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            i.status === 'overdue' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'
                          }`}>
                            {i.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Borrowing History ({data.history.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                        <th className="py-3 px-4">Book Title</th>
                        <th className="py-3 px-4">Issued Date</th>
                        <th className="py-3 px-4">Returned Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-almond/20">
                      {data.history.map((h) => (
                        <tr key={h._id} className="hover:bg-surface/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-darkBrown">{h.bookId?.title}</td>
                          <td className="py-3 px-4 font-mono text-textMuted">{new Date(h.issuedAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono text-textMuted">{h.returnedAt ? new Date(h.returnedAt).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              h.status === 'returned' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentLibraryPage;
