import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { FileSpreadsheet, Download, DollarSign, CalendarDays, Briefcase, Users } from 'lucide-react';

const HRReportsPage = () => {
  const [activeReportTab, setActiveReportTab] = useState('payroll'); // 'payroll' | 'leave' | 'recruitment' | 'attendance'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const reportsList = {
    payroll: [
      { name: 'Monthly Payroll Disbursement Summary', period: '2026-04', totalAmount: '₹4,50,000', records: 12 },
      { name: 'Salary Tax & Deduction Statement', period: '2026-04', totalAmount: '₹45,000', records: 12 },
      { name: 'Bank Transfer Export (NEFT / RTGS)', period: '2026-04', totalAmount: '₹4,05,000', records: 12 },
    ],
    leave: [
      { name: 'Teacher & Staff Leave Utilization Report', period: 'Session 2026-2027', totalLeaves: 18, pending: 2 },
      { name: 'Casual vs Sick Leave Breakdown', period: 'Session 2026-2027', totalLeaves: 18, approved: 16 },
    ],
    recruitment: [
      { name: 'Job Vacancy & Applicant Pipeline Summary', period: 'Q1 2026', openPositions: 3, totalApplicants: 24 },
      { name: 'Interview & Onboarding Audit Log', period: 'Q1 2026', hired: 2, rejected: 14 },
    ],
    attendance: [
      { name: 'Staff Monthly Attendance Log', period: 'April 2026', totalStaff: 14, avgAttendance: '96.5%' },
      { name: 'Late Arrival & Overtime Report', period: 'April 2026', totalStaff: 14, lateInstances: 3 },
    ],
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">HR Analytics</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                HR Reports & Compliance Statements
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Generate and export payroll reports, leave statements, recruitment pipelines, and staff attendance logs.
              </p>
            </div>
          </div>

          {/* Report Categories Tabs */}
          <div className="flex items-center gap-2 border-b border-almond/40 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'payroll', label: 'Payroll Reports', icon: DollarSign },
              { id: 'leave', label: 'Leave Utilization', icon: CalendarDays },
              { id: 'recruitment', label: 'Recruitment Pipeline', icon: Briefcase },
              { id: 'attendance', label: 'Staff Attendance', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveReportTab(tab.id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeReportTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-white text-textMuted hover:bg-surface hover:text-darkBrown border border-almond/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Report Statements Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown capitalize">
              {activeReportTab} Reports & Statements ({reportsList[activeReportTab].length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                    <th className="py-3 px-4">Report Name</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-almond/20">
                  {reportsList[activeReportTab].map((rep, idx) => (
                    <tr key={idx} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-darkBrown flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-chestnut shrink-0" />
                        <span>{rep.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-chestnut font-bold">{rep.period}</td>
                      <td className="py-3 px-4 text-textMuted">
                        {rep.totalAmount && <span>Total: <strong>{rep.totalAmount}</strong> ({rep.records} Records)</span>}
                        {rep.totalLeaves && <span>Total Leaves: <strong>{rep.totalLeaves}</strong></span>}
                        {rep.openPositions && <span>Open Positions: <strong>{rep.openPositions}</strong> ({rep.totalApplicants} Applicants)</span>}
                        {rep.totalStaff && <span>Staff: <strong>{rep.totalStaff}</strong> (Avg: {rep.avgAttendance})</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Exporting ${rep.name}...`)}
                          className="px-3 py-1.5 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-[11px] font-bold inline-flex items-center gap-1 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-chestnut" />
                          <span>Export CSV</span>
                        </button>
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

export default HRReportsPage;
