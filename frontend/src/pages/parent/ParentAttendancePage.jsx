import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import ChildSelector from '../../components/parent/ChildSelector';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ShieldCheck, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const ParentAttendancePage = () => {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
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

  const fetchAttendance = async (childId, month) => {
    if (!childId) return;
    try {
      setLoading(true);
      const res = await api.get(`/parent/children/${childId}/attendance`, {
        params: { month },
      });
      if (res.data.success) {
        setAttendanceData(res.data);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchAttendance(selectedChildId, monthFilter);
    }
  }, [selectedChildId, monthFilter]);

  const summary = attendanceData?.summary || { totalMarked: 0, present: 0, absent: 0, late: 0, leave: 0, percentage: 100 };
  const records = attendanceData?.records || [];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Attendance Register
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Monitor daily marked attendance, present percentages, and leave days.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-darkBrown">Month:</label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut cursor-pointer"
              />
            </div>
          </div>

          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
          />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Attendance Rate" value={`${summary.percentage}%`} subtitle={`${summary.totalMarked} Days Marked`} icon={ShieldCheck} color="chestnut" />
            <StatCard title="Present Days" value={summary.present} subtitle="Attended On-Time" icon={CheckCircle2} color="success" />
            <StatCard title="Absent Days" value={summary.absent} subtitle="Unexcused Absence" icon={XCircle} color="danger" />
            <StatCard title="Leave / Late" value={summary.leave + summary.late} subtitle={`${summary.leave} Leave, ${summary.late} Late`} icon={Clock} color="morning" />
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Daily Attendance Roster</h3>

            {loading ? (
              <LoadingSkeleton count={3} />
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-xs text-textMuted font-medium">
                No attendance records marked for the selected month.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-textMuted font-semibold">
                      <th className="pb-3 px-3">Date</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Remarks / Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-darkBrown">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold">
                          {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                            r.status === 'present'
                              ? 'bg-success/15 text-success'
                              : r.status === 'absent'
                              ? 'bg-danger/15 text-danger'
                              : 'bg-warning/15 text-darkBrown'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-textMuted">{r.remarks || r.markedTime || '—'}</td>
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

export default ParentAttendancePage;
