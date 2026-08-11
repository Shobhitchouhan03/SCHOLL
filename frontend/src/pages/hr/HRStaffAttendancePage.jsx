import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import api from '../../services/api';

const HRStaffAttendancePage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchStaffAttendance = async () => {
    try {
      setLoading(true);
      const [attRes, deptRes] = await Promise.all([
        api.get(`/principal/hr/staff-attendance?date=${dateFilter}`),
        api.get('/principal/hr/departments'),
      ]);

      if (attRes.data.success) {
        setAttendanceData(attRes.data.staffAttendance || []);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments || []);
      }
    } catch (err) {
      console.error('Fetch staff attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAttendance();
  }, [dateFilter]);

  const filteredStaff = attendanceData.filter((item) => {
    const matchesDept = selectedDept === 'all' || item.department === selectedDept;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.employeeId && item.employeeId.toLowerCase().includes(search.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const totalStaff = attendanceData.length;
  const presentCount = attendanceData.filter((s) => s.status === 'present').length;
  const absentCount = attendanceData.filter((s) => s.status === 'absent').length;
  const leaveCount = attendanceData.filter((s) => s.status === 'on_leave').length;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Human Resources & Staffing</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Staff & Teacher Attendance Oversight
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Monitor daily employee attendance, teacher presence, leaves, and department-wise monthly summaries.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center space-x-2 bg-surface px-3.5 py-2 rounded-xl border border-almond/60">
                <Calendar className="w-4 h-4 text-chestnut" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-darkBrown focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Staff"
              value={totalStaff}
              subtitle="Teachers & Employees"
              icon={Users}
              color="chestnut"
            />
            <StatCard
              title="Present Today"
              value={presentCount}
              subtitle="On campus"
              icon={UserCheck}
              color="sage"
            />
            <StatCard
              title="Absent Today"
              value={absentCount}
              subtitle="Unaccounted staff"
              icon={UserX}
              color="terracotta"
            />
            <StatCard
              title="On Leave"
              value={leaveCount}
              subtitle="Approved leave requests"
              icon={Clock}
              color="morning"
            />
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-almond/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-textMuted" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-surface border border-almond/60 rounded-xl px-3 py-2 text-xs font-bold text-darkBrown focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Staff Attendance Table */}
          <div className="bg-white rounded-3xl border border-almond/40 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-textMuted flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-chestnut border-t-transparent rounded-full animate-spin" />
                <span>Loading staff attendance records...</span>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-12 text-center text-xs text-textMuted">
                No staff attendance logs found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface/50 text-[11px] font-bold text-textMuted uppercase border-b border-almond/40">
                      <th className="py-3.5 px-6">Employee</th>
                      <th className="py-3.5 px-6">Role / Dept</th>
                      <th className="py-3.5 px-6">Shift / Clock-In</th>
                      <th className="py-3.5 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/30 text-xs">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-surface/40 transition-all">
                        <td className="py-3.5 px-6">
                          <div className="font-bold text-darkBrown">{staff.name}</div>
                          <div className="text-[11px] text-textMuted font-mono">{staff.employeeId || 'EMP-N/A'}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 bg-surface text-chestnut text-[10px] font-bold rounded-md uppercase border border-almond/40">
                            {staff.role}
                          </span>
                          <div className="text-[11px] text-textMuted mt-0.5">{staff.department || 'General'}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-medium text-darkBrown">{staff.clockInTime || '08:30 AM'}</div>
                          <div className="text-[11px] text-textMuted">Shift: Morning</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                              staff.status === 'present'
                                ? 'bg-success/15 text-success border-success/30'
                                : staff.status === 'on_leave'
                                ? 'bg-warning/15 text-warning border-warning/30'
                                : 'bg-danger/15 text-danger border-danger/30'
                            }`}
                          >
                            {staff.status === 'present'
                              ? 'Present'
                              : staff.status === 'on_leave'
                              ? 'On Leave'
                              : 'Absent'}
                          </span>
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

export default HRStaffAttendancePage;
