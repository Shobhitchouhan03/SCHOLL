import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Users,
  ClipboardCheck,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, school } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState('');
  const [leaveError, setLeaveError] = useState('');

  const [errorState, setErrorState] = useState(null);

  const fetchSelfProfile = async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const res = await api.get('/teacher/me');
      if (res.data.success) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.error('Fetch teacher self profile error:', err);
      const status = err.response?.status || err.httpStatus || 500;
      const message = err.customMessage || err.response?.data?.message || 'Failed to fetch teacher profile.';
      setErrorState({ status, message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelfProfile();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLeaveMessage('');
    setLeaveError('');
    setLeaveSubmitting(true);

    try {
      const res = await api.post('/teacher/leaves', leaveForm);
      if (res.data.success) {
        setLeaveMessage('Leave application submitted successfully for Principal approval.');
        setLeaveForm({
          leaveType: 'casual',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
        });
        fetchSelfProfile();
      }
    } catch (err) {
      setLeaveError(err.customMessage || 'Failed to submit leave application.');
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const teacher = profileData?.teacher || {};
  const salaryHistory = profileData?.salaryHistory || [];
  const leaveRequests = profileData?.leaveRequests || [];
  const leaveBal = teacher.leaveBalance || { casual: 12, sick: 10, earned: 15 };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {errorState && (
            <div className="bg-danger/10 border border-danger/20 p-4 rounded-2xl flex items-center space-x-3 text-xs text-danger font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider block">
                  HTTP {errorState.status} Error
                </span>
                <span>{errorState.message}</span>
              </div>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-chestnut text-white font-bold text-xl flex items-center justify-center shadow-md">
                {user?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Portal</span>
                  {teacher.employeeId && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                      EMP: {teacher.employeeId}
                    </span>
                  )}
                  {teacher.isClassTeacher && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Class Teacher
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-0.5">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-xs text-textMuted mt-0.5">
                  Department: <strong className="text-darkBrown">{teacher.department || 'General'}</strong> • Designation: <strong className="text-darkBrown">{teacher.designation || 'Teacher'}</strong> • School: <strong className="text-chestnut">{school?.name}</strong>
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-surface rounded-2xl border border-almond/50 text-xs font-medium text-textMuted flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-morning" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Assigned Classes"
              value={teacher.classTeacherClassId ? (teacher.assignedClassIds || []).length + 1 : (teacher.assignedClassIds || []).length}
              subtitle="Active teaching grades"
              icon={BookOpen}
              color="chestnut"
            />
            <StatCard
              title="Assigned Subjects"
              value={(teacher.assignedSubjectIds || []).length}
              subtitle="Curriculum subjects"
              icon={Layers}
              color="morning"
            />
            <StatCard
              title="Student Count"
              value={profileData?.assignedStudentCount ?? 0}
              subtitle="Students under supervision"
              icon={Users}
              color="sage"
            />
            <StatCard
              title="Leave Balance"
              value={`${leaveBal.casual} Days`}
              subtitle="Casual leave remaining"
              icon={Clock}
              color="warning"
            />
          </div>

          {/* Main Grid: Assignments & Salary History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Assigned Classes & Subjects */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assigned Subjects & Classes */}
              <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-chestnut" />
                  <span>My Academic Assignments</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classes */}
                  <div className="p-4 bg-surface rounded-xl border border-almond/40 space-y-2">
                    <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Assigned Classes</span>
                    {(teacher.assignedClassIds || []).length === 0 ? (
                      <span className="text-xs text-textMuted italic">No classes assigned yet by Principal.</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(teacher.assignedClassIds || []).map((cls) => (
                          <span key={cls._id || cls} className="px-2.5 py-1 bg-white border border-almond/60 rounded-lg text-xs font-bold text-darkBrown">
                            {cls.name || 'Class'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subjects */}
                  <div className="p-4 bg-surface rounded-xl border border-almond/40 space-y-2">
                    <span className="text-xs font-bold text-darkBrown uppercase tracking-wider block">Assigned Subjects</span>
                    {(teacher.assignedSubjectIds || []).length === 0 ? (
                      <span className="text-xs text-textMuted italic">No subjects assigned yet by Principal.</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(teacher.assignedSubjectIds || []).map((sub) => (
                          <span key={sub._id || sub} className="px-2.5 py-1 bg-chestnut/10 border border-chestnut/20 text-chestnut rounded-lg text-xs font-bold">
                            {sub.name} ({sub.code})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Leave Section */}
              <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <Clock className="w-5 h-5 text-chestnut" />
                  <span>Apply for Leave</span>
                </h3>

                {leaveMessage && (
                  <div className="p-3 bg-success/10 text-success rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{leaveMessage}</span>
                  </div>
                )}
                {leaveError && (
                  <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{leaveError}</span>
                  </div>
                )}

                <form onSubmit={handleApplyLeave} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-textMain mb-1">Leave Type</label>
                      <select
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      >
                        <option value="casual">Casual Leave (Bal: {leaveBal.casual})</option>
                        <option value="sick">Sick Leave (Bal: {leaveBal.sick})</option>
                        <option value="earned">Earned Leave (Bal: {leaveBal.earned})</option>
                        <option value="unpaid">Unpaid Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-textMain mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-textMain mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Reason for Leave *</label>
                    <textarea
                      required
                      rows="2"
                      placeholder="Specify reason..."
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={leaveSubmitting}
                      className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {leaveSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Recent Leave Applications List */}
              <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-3">
                <h3 className="text-base font-bold text-darkBrown">My Leave Applications History</h3>
                {leaveRequests.length === 0 ? (
                  <div className="p-4 text-center text-textMuted text-xs">No leave requests submitted yet.</div>
                ) : (
                  <div className="space-y-2">
                    {leaveRequests.map((l) => (
                      <div key={l._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-darkBrown capitalize">{l.leaveType} Leave ({l.totalDays} Days)</div>
                          <div className="text-[11px] text-textMuted">
                            {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-textMuted italic">"{l.reason}"</div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                            l.status === 'approved'
                              ? 'bg-success/10 text-success'
                              : l.status === 'rejected'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-warning/15 text-warning'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Announcements & Quick Links */}
            <div className="space-y-6">
              {/* Class Announcements Noticeboard */}
              <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-3">
                <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                  <Award className="w-5 h-5 text-chestnut" />
                  <span>Faculty & Class Noticeboard</span>
                </h3>
                <div className="p-4 bg-surface rounded-xl border border-almond/40 text-xs space-y-2">
                  <span className="font-bold text-darkBrown block">Academic Session Active</span>
                  <p className="text-textMuted text-[11px] leading-relaxed">
                    Welcome to the academic dashboard at {school?.name}. Attendance marking, exam results, student list, and class announcements are synchronized for your assigned classes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
