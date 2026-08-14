import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  GraduationCap,
  Search,
  Eye,
  Plus,
  BookOpen,
  UserCheck,
} from 'lucide-react';

const TeacherStudentDirectoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [teacherProfile, setTeacherProfile] = useState(null);
  const [teacherCapabilities, setTeacherCapabilities] = useState(null);

  const fetchTeacherStudents = async () => {
    try {
      setLoading(true);
      const [stdRes, profRes] = await Promise.allSettled([
        api.get('/teacher/students', { params: { search } }),
        api.get('/teacher/me'),
      ]);

      if (stdRes.status === 'fulfilled' && stdRes.value.data?.success) {
        setStudents(stdRes.value.data.students || []);
      }
      if (profRes.status === 'fulfilled' && profRes.value.data?.success) {
        setTeacherProfile(profRes.value.data.teacher);
        setTeacherCapabilities(profRes.value.data.teacherCapabilities || null);
      }
    } catch (err) {
      console.error('Fetch teacher students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStudents();
  }, [search]);

  const canAdmitStudents = Boolean(
    teacherCapabilities?.canAdmitStudents ||
    teacherProfile?.isClassTeacher ||
    teacherProfile?.teacherType === 'Class Teacher' ||
    teacherProfile?.teacherType === 'Class & Subject Teacher' ||
    Boolean(teacherProfile?.classTeacherClassId) ||
    user?.teacherType === 'Class Teacher' ||
    user?.teacherType === 'Class & Subject Teacher' ||
    user?.isClassTeacher
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-morning uppercase tracking-wider">Teacher Workspace</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                My Assigned Students Register
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Viewing student roster for your assigned classes and sections.
              </p>
            </div>

            {canAdmitStudents && (
              <button
                onClick={() => navigate('/teacher/students/new')}
                className="inline-flex items-center space-x-2 bg-chestnut hover:bg-darkBrown text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Assigned Students" value={students.length} subtitle="Enrolled in your classes" icon={GraduationCap} color="chestnut" />
            <StatCard title="Active Status" value={students.filter((s) => s.status === 'active').length} subtitle="Attending regular classes" icon={UserCheck} color="success" />
          </div>

          {/* DataTable */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">Class Students</h3>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, admission no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-60"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No students found in your assigned classes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Guardian Phone</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-darkBrown">
                          {s.fullName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-chestnut">
                          {s.admissionNumber}
                        </td>
                        <td className="py-3 px-4">
                          {s.currentClassId?.name} - Section {s.currentSectionId?.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {s.rollNumber ? `#${s.rollNumber}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {s.parentAccountId?.primaryGuardian?.phone || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => navigate(`/principal/students/${s._id}`)}
                            className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-chestnut hover:bg-surface transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
    </div>
  );
};

export default TeacherStudentDirectoryPage;
