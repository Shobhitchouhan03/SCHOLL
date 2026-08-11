import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  ShieldCheck,
  Calendar,
  Download,
  Unlock,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';

const PrincipalAttendanceOverviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summaryData, setSummaryData] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Correction Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [correctionStatus, setCorrectionStatus] = useState('present');
  const [correctionRemark, setCorrectionRemark] = useState('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/attendance/summary', { params: { date: selectedDate } });
      if (res.data.success) {
        setSummaryData(res.data.summary);
      }
    } catch (err) {
      console.error('Fetch principal attendance summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

  const handleUnlockSession = async (sessionId) => {
    try {
      const res = await api.patch(`/principal/attendance/session/${sessionId}/unlock`);
      if (res.data.success) {
        fetchSummary();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to unlock session.');
    }
  };

  const handleExportCSV = () => {
    window.open(`http://localhost:5000/api/principal/attendance/export?startDate=${selectedDate}&endDate=${selectedDate}`, '_blank');
  };

  const overallPercentage = summaryData?.overallPercentage || 0;
  const todaySessions = summaryData?.todaySessions || [];
  const missingSections = summaryData?.missingSections || [];

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
                School-Wide Attendance Overview
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Monitor daily attendance rates, track missing class submissions, unlock sessions, and export reports.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
              />

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance CSV</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Daily Attendance Rate"
              value={`${overallPercentage}%`}
              subtitle={`For date: ${selectedDate}`}
              icon={ShieldCheck}
              color="chestnut"
            />
            <StatCard
              title="Submitted Sessions"
              value={todaySessions.length}
              subtitle="Classes marked today"
              icon={CheckCircle2}
              color="success"
            />
            <StatCard
              title="Missing Submissions"
              value={missingSections.length}
              subtitle="Classes pending attendance"
              icon={AlertTriangle}
              color="warning"
            />
          </div>

          {/* Missing Attendance Alert Banner */}
          {missingSections.length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-darkBrown">Missing Attendance Alerts ({missingSections.length} Sections)</h4>
                <p className="text-[11px] text-textMuted mt-0.5">
                  The following sections have not submitted attendance for {selectedDate}:{' '}
                  <strong className="text-darkBrown">
                    {missingSections.map((sec) => `${sec.classId?.name} - ${sec.name}`).join(', ')}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Marked Sessions Register */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Marked Attendance Sessions</h3>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : todaySessions.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No attendance sessions submitted for this date.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Class & Section</th>
                      <th className="py-3 px-4">Marked By</th>
                      <th className="py-3 px-4">Present / Total</th>
                      <th className="py-3 px-4">Absent / Late</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {todaySessions.map((s) => (
                      <tr key={s._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-darkBrown">
                          {s.classId?.name} - Section {s.sectionId?.name}
                        </td>
                        <td className="py-3 px-4 text-textMuted">
                          {s.markedBy?.name || 'Teacher'}
                        </td>
                        <td className="py-3 px-4 font-bold text-success">
                          {s.presentCount} / {s.totalStudents}
                        </td>
                        <td className="py-3 px-4 font-semibold text-danger">
                          {s.absentCount} Absent • {s.lateCount} Late
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              s.status === 'submitted' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.status === 'submitted' && (
                            <button
                              onClick={() => handleUnlockSession(s._id)}
                              className="px-2.5 py-1 rounded-lg border border-almond text-textMuted hover:text-warning hover:bg-surface transition-colors flex items-center gap-1 ml-auto text-[10px] font-semibold"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Unlock Session</span>
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
    </div>
  );
};

export default PrincipalAttendanceOverviewPage;
