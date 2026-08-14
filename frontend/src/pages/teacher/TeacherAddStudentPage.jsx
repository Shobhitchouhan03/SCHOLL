import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import {
  GraduationCap,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import api from '../../services/api';

const TeacherAddStudentPage = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [teacherCapabilities, setTeacherCapabilities] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: '',
    rollNumber: '',
    gender: 'male',
    dob: '',
    admissionDate: new Date().toISOString().split('T')[0],
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: 'Father',
  });

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/me');
      if (res.data.success) {
        setTeacherProfile(res.data.teacher);
        setTeacherCapabilities(res.data.teacherCapabilities || null);
      }
    } catch (err) {
      console.error('Fetch teacher error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  const isClassTeacher = Boolean(
    teacherCapabilities?.canAdmitStudents ||
    teacherProfile?.isClassTeacher ||
    teacherProfile?.teacherType === 'Class Teacher' ||
    teacherProfile?.teacherType === 'Class & Subject Teacher' ||
    Boolean(teacherProfile?.classTeacherClassId)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isClassTeacher) {
      setMessage({ type: 'danger', text: 'Forbidden: Only Class Teachers can admit new students.' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const targetClassId = teacherProfile?.classTeacherClassId?._id || teacherProfile?.classTeacherClassId;
      const targetSectionId = teacherProfile?.classTeacherSectionId?._id || teacherProfile?.classTeacherSectionId;

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Student';

      const payload = {
        ...formData,
        firstName,
        lastName,
        dateOfBirth: formData.dob || '2015-01-01',
        currentClassId: targetClassId,
        currentSectionId: targetSectionId,
        familyOption: 'new',
        parentLoginId: `PARENT_${formData.admissionNumber.toUpperCase().trim()}`,
        parentPassword: `Parent@${formData.admissionNumber.toUpperCase().trim()}`,
        primaryGuardian: {
          name: formData.guardianName,
          phone: formData.guardianPhone,
          email: formData.guardianEmail,
          relationship: formData.guardianRelation || 'Father',
        },
      };

      const res = await api.post('/teacher/students', payload);
      if (res.data.success) {
        const creds = res.data.createdCredentials;
        const credText = creds ? ` | Parent Login ID: ${creds.loginId} (Password: ${creds.rawPassword})` : '';
        setMessage({
          type: 'success',
          text: `Student ${res.data.student.fullName} admitted successfully! ${credText}`,
        });
        setTimeout(() => navigate('/teacher/students'), 2500);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || err.customMessage || 'Failed to admit student.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-chestnut border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-almond/40 shadow-sm">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Class Teacher Portal</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Admit Student to Class
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                {isClassTeacher
                  ? `Admitting student into Class ${teacherProfile.classTeacherClassId?.name || ''} - Section ${teacherProfile.classTeacherSectionId?.name || ''}`
                  : 'Student admission access is restricted.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/teacher/students')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface hover:bg-almond/40 text-darkBrown font-bold text-xs border border-almond/50 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-chestnut" />
              <span>Back to Register</span>
            </button>
          </div>

          {!isClassTeacher ? (
            <div className="bg-danger/10 border border-danger/20 p-8 rounded-3xl text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-danger mx-auto" />
              <h3 className="text-base font-bold text-danger">403 Forbidden — Class Teacher Authorization Required</h3>
              <p className="text-xs text-textMuted max-w-md mx-auto">
                Only assigned Class Teachers are authorized to admit new students. Subject Teachers cannot admit students.
              </p>
              <button
                onClick={() => navigate('/teacher/students')}
                className="px-4 py-2 bg-darkBrown text-white font-bold text-xs rounded-xl"
              >
                Return to My Students
              </button>
            </div>
          ) : !teacherProfile?.classTeacherClassId ? (
            <div className="bg-warning/10 border border-warning/30 p-8 rounded-3xl text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-warning mx-auto" />
              <h3 className="text-base font-bold text-darkBrown">No Class or Section Assigned</h3>
              <p className="text-xs text-textMuted max-w-md mx-auto">
                No class/section is assigned to your account yet. Ask the Principal to assign your class in Academic Setup before adding students.
              </p>
              <button
                onClick={() => navigate('/teacher/students')}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl"
              >
                Return to My Students
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {message.text && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center space-x-2 ${
                    message.type === 'success'
                      ? 'bg-sage/20 border border-sage text-darkBrown'
                      : 'bg-danger/10 border border-danger/20 text-danger'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-danger" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Student Personal Info */}
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-darkBrown border-b border-almond/40 pb-3 flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-chestnut" />
                  <span>Student Basic Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Mehta"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Admission Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ADM2026001"
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Roll Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-darkBrown focus:outline-none focus:border-chestnut"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-darkBrown border-b border-almond/40 pb-3">
                  Primary Guardian Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Mehta"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Guardian Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Guardian Email</label>
                    <input
                      type="email"
                      placeholder="e.g. guardian@gmail.com"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Admitting Student...' : 'Admit Student'}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherAddStudentPage;
