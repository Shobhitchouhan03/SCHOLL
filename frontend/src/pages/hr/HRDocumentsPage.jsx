import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FileText, Search, CheckCircle2, AlertCircle } from 'lucide-react';

const HRDocumentsPage = () => {
  const [documents, setDocuments] = useState([
    { id: 1, employee: 'Teacher One', docType: 'Employment Contract', status: 'verified', issueDate: '2026-04-01' },
    { id: 2, employee: 'Teacher One', docType: 'Government Photo ID', status: 'verified', issueDate: '2026-04-01' },
    { id: 3, employee: 'Driver Rajesh', docType: 'Commercial Driving License', status: 'verified', issueDate: '2025-01-15' },
    { id: 4, employee: 'Attendant Ramesh', docType: 'Medical Fitness Certificate', status: 'pending', issueDate: '2026-03-10' },
  ]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Employee Records</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Employee Documents & Verification
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage staff employment contracts, ID verifications, licenses, and certificates.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Document Repository ({documents.length})</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-almond/20">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-darkBrown">{doc.employee}</td>
                      <td className="py-3 px-4">{doc.docType}</td>
                      <td className="py-3 px-4 text-textMuted">{doc.issueDate}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          doc.status === 'verified' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                        }`}>
                          {doc.status === 'verified' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span className="capitalize">{doc.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HRDocumentsPage;
