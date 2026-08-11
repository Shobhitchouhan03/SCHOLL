import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatCard from '../components/common/StatCard';
import ChildSelector from '../components/parent/ChildSelector';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Award,
  ShieldCheck,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  ArrowRight,
} from 'lucide-react';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent/me');
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildrenList(kids);
        if (kids.length > 0) {
          setSelectedChildId(kids[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch parent data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDashboard = async (childId) => {
    if (!childId) return;
    try {
      const res = await api.get(`/parent/children/${childId}/dashboard`);
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Fetch child dashboard overview error:', err);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildDashboard(selectedChildId);
    }
  }, [selectedChildId]);

  const student = dashboardData?.student || childrenList.find((c) => String(c._id) === String(selectedChildId)) || {};
  const metrics = dashboardData?.metrics || {};

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-chestnut text-white font-bold text-xl flex items-center justify-center shadow-md">
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Parent Portal</span>
                  <span className="px-2.5 py-0.5 bg-success/15 text-success rounded-full text-[10px] font-bold">
                    Active Account
                  </span>
                </div>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-0.5">
                  Welcome, {user?.name || 'Parent'}!
                </h1>
                <p className="text-xs text-textMuted mt-0.5">
                  {school?.name || 'School SaaS'} • Family Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Child Selector */}
          <ChildSelector
            childrenList={childrenList}
            selectedChildId={selectedChildId}
            onSelectChild={(id) => setSelectedChildId(id)}
          />

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <>
              {/* Student Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-almond/30">
                  <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-chestnut" />
                    <span>Student Profile</span>
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    student.status === 'active' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  }`}>
                    {student.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-textMuted font-medium block">Full Name</span>
                    <span className="font-bold text-darkBrown">{student.fullName || `${student.firstName || ''} ${student.lastName || ''}`}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Admission No</span>
                    <span className="font-bold text-darkBrown font-mono">{student.admissionNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Permanent ID</span>
                    <span className="font-bold text-darkBrown font-mono">{student.permanentStudentId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Roll Number</span>
                    <span className="font-bold text-darkBrown">{student.rollNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Current Class & Section</span>
                    <span className="font-bold text-darkBrown">{student.currentClassId?.name || 'Class'} - {student.currentSectionId?.name || 'Sec'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Academic Session</span>
                    <span className="font-bold text-darkBrown">{student.currentAcademicSessionId?.name || '2026-2027'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Gender</span>
                    <span className="font-bold text-darkBrown capitalize">{student.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-textMuted font-medium block">Date of Birth</span>
                    <span className="font-bold text-darkBrown">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Attendance %"
                  value={`${metrics.attendance?.percentage ?? 100}%`}
                  subtitle={`${metrics.attendance?.presentDays || 0} Present / ${metrics.attendance?.absentDays || 0} Absent`}
                  icon={ShieldCheck}
                  color="chestnut"
                />
                <StatCard
                  title="Pending Fee"
                  value={`₹${(metrics.fees?.pendingAmountRupees || 0).toLocaleString('en-IN')}`}
                  subtitle={metrics.fees?.nextDueDate ? `Due: ${metrics.fees.nextDueDate}` : 'No pending dues'}
                  icon={DollarSign}
                  color={metrics.fees?.pendingAmountRupees > 0 ? 'danger' : 'success'}
                />
                <StatCard
                  title="Pending Homework"
                  value={metrics.homework?.pendingCount || 0}
                  subtitle={`${metrics.homework?.totalAssigned || 0} Total Published`}
                  icon={BookOpen}
                  color="morning"
                />
                <StatCard
                  title="Upcoming Exams"
                  value={metrics.exams?.upcomingCount || 0}
                  subtitle="Scheduled assessments"
                  icon={Award}
                  color="success"
                />
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  onClick={() => navigate('/parent/attendance')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-chestnut/10 text-chestnut flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Attendance Register</h4>
                    <p className="text-xs text-textMuted mt-0.5">View date-wise attendance history and monthly breakdown.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/parent/homework')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-morning/10 text-darkBrown flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Class Homework</h4>
                    <p className="text-xs text-textMuted mt-0.5">Check assigned homework, due dates, and descriptions.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/parent/exams')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Exams & Results</h4>
                    <p className="text-xs text-textMuted mt-0.5">View upcoming exam schedules and published report cards.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/parent/report-card')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-chestnut/10 text-chestnut flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Academic Report Card</h4>
                    <p className="text-xs text-textMuted mt-0.5">Printable report card layout with subject marks and grades.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/parent/fees')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 text-darkBrown flex items-center justify-center font-bold">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Fees & Receipts</h4>
                    <p className="text-xs text-textMuted mt-0.5">View fee structure, payment history, and print receipts.</p>
                  </div>
                </div>

                <div
                  onClick={() => navigate('/parent/student-leave')}
                  className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card hover:border-chestnut transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-chestnut/10 text-chestnut flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-chestnut transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darkBrown">Student Leave Application</h4>
                    <p className="text-xs text-textMuted mt-0.5">Apply for child leave and track approval status.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
