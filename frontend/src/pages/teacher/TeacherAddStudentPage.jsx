import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import CredentialModal from '../../components/common/CredentialModal';
import {
  GraduationCap,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
  Eye,
  EyeOff,
  Users,
  KeyRound,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

const TeacherAddStudentPage = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [teacherCapabilities, setTeacherCapabilities] = useState(null);
  const [existingFamilies, setExistingFamilies] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoginIdCustomized, setIsLoginIdCustomized] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: `ADM${Math.floor(10000 + Math.random() * 90000)}`,
    rollNumber: '',
    gender: 'male',
    dob: '2015-05-15',
    admissionDate: new Date().toISOString().split('T')[0],
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianRelation: 'Father',
    familyOption: 'new',
    existingFamilyId: '',
    parentLoginId: '',
    parentPassword: '',
    confirmPassword: '',
  });

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/me');
      if (res.data.success) {
        setTeacherProfile(res.data.teacher);
        setTeacherCapabilities(res.data.teacherCapabilities || null);
      }

      // Fetch existing families for sibling linking
      const famRes = await api.get('/teacher/families').catch(() => api.get('/principal/families'));
      if (famRes?.data?.success) {
        setExistingFamilies(famRes.data.families || []);
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

  // Auto-populate parentLoginId if not manually customized
  useEffect(() => {
    if (formData.familyOption === 'new' && !isLoginIdCustomized) {
      if (formData.guardianEmail && formData.guardianEmail.trim()) {
        setFormData((prev) => ({ ...prev, parentLoginId: formData.guardianEmail.trim() }));
      } else if (formData.guardianPhone && formData.guardianPhone.trim()) {
        setFormData((prev) => ({ ...prev, parentLoginId: formData.guardianPhone.trim() }));
      } else if (formData.admissionNumber && formData.admissionNumber.trim()) {
        setFormData((prev) => ({ ...prev, parentLoginId: `PARENT_${formData.admissionNumber.toUpperCase().trim()}` }));
      }
    }
  }, [formData.guardianEmail, formData.guardianPhone, formData.admissionNumber, formData.familyOption, isLoginIdCustomized]);

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

    if (formData.familyOption === 'new') {
      if (!formData.parentLoginId.trim()) {
        setMessage({ type: 'danger', text: 'Parent Login ID is required for a new family account.' });
        return;
      }
      if (!formData.parentPassword) {
        setMessage({ type: 'danger', text: 'Parent Password is required for a new family account.' });
        return;
      }
      if (formData.parentPassword.length < 6) {
        setMessage({ type: 'danger', text: 'Parent Password must be at least 6 characters long.' });
        return;
      }
      if (formData.parentPassword !== formData.confirmPassword) {
        setMessage({ type: 'danger', text: 'Passwords do not match. Please verify Set Parent Password and Confirm Password.' });
        return;
      }
    } else if (formData.familyOption === 'link') {
      if (!formData.existingFamilyId) {
        setMessage({ type: 'danger', text: 'Please select an existing family account to link this student.' });
        return;
      }
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
        fullName: formData.fullName.trim(),
        firstName,
        lastName,
        admissionNumber: formData.admissionNumber.toUpperCase().trim(),
        rollNumber: formData.rollNumber,
        gender: formData.gender,
        dateOfBirth: formData.dob || '2015-01-01',
        admissionDate: formData.admissionDate,
        currentClassId: targetClassId,
        currentSectionId: targetSectionId,
        familyOption: formData.familyOption,
        existingFamilyId: formData.familyOption === 'link' ? formData.existingFamilyId : undefined,
        parentLoginId: formData.familyOption === 'new' ? formData.parentLoginId.toUpperCase().trim() : undefined,
        parentPassword: formData.familyOption === 'new' ? formData.parentPassword : undefined,
        primaryGuardian: {
          name: formData.guardianName.trim(),
          phone: formData.guardianPhone.trim(),
          email: formData.guardianEmail.trim(),
          relationship: formData.guardianRelation || 'Father',
        },
      };

      const res = await api.post('/teacher/students', payload);
      if (res.data.success) {
        const creds = res.data.credentials || res.data.createdCredentials;
        if (creds) {
          setCreatedCredentials(creds);
        } else {
          setMessage({
            type: 'success',
            text: `Student ${res.data.student.fullName} admitted successfully! Student linked to existing family account.`,
          });
          setTimeout(() => navigate('/teacher/students'), 2500);
        }
      }
    } catch (err) {
      console.error('Admit student error:', err);
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
                  {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-success shrink-0" /> : <AlertCircle className="w-4 h-4 text-danger shrink-0" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Student Basic Information */}
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

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Assigned Class & Section (Locked)</label>
                    <input
                      type="text"
                      disabled
                      value={`Class ${teacherProfile.classTeacherClassId?.name || ''} - Section ${teacherProfile.classTeacherSectionId?.name || ''}`}
                      className="w-full px-3.5 py-2 bg-almond/20 border border-almond/60 rounded-xl text-xs font-bold text-darkBrown cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Family Account Mode Selection */}
              <div className="bg-white p-6 rounded-2xl border border-almond/60 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-darkBrown border-b border-almond/40 pb-3 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-chestnut" />
                  <span>Family Account & Guardian Setup</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                      formData.familyOption === 'new'
                        ? 'border-chestnut bg-chestnut/5 shadow-sm'
                        : 'border-almond/60 bg-surface hover:bg-almond/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="familyOption"
                      value="new"
                      checked={formData.familyOption === 'new'}
                      onChange={() => setFormData({ ...formData, familyOption: 'new' })}
                      className="text-chestnut focus:ring-chestnut"
                    />
                    <div>
                      <span className="text-xs font-bold text-darkBrown block">Create New Family Account</span>
                      <span className="text-[11px] text-textMuted">Set up new Parent User credentials</span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
                      formData.familyOption === 'link'
                        ? 'border-chestnut bg-chestnut/5 shadow-sm'
                        : 'border-almond/60 bg-surface hover:bg-almond/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="familyOption"
                      value="link"
                      checked={formData.familyOption === 'link'}
                      onChange={() => setFormData({ ...formData, familyOption: 'link' })}
                      className="text-chestnut focus:ring-chestnut"
                    />
                    <div>
                      <span className="text-xs font-bold text-darkBrown block">Link to Existing Family</span>
                      <span className="text-[11px] text-textMuted">Reuse existing sibling/family account</span>
                    </div>
                  </label>
                </div>

                {formData.familyOption === 'link' ? (
                  <div className="space-y-3 bg-surface p-4 rounded-xl border border-almond/50">
                    <label className="block text-xs font-semibold text-textMain">Select Existing Family Account *</label>
                    <select
                      value={formData.existingFamilyId}
                      onChange={(e) => setFormData({ ...formData, existingFamilyId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-almond/60 rounded-xl text-xs font-medium text-darkBrown focus:outline-none focus:border-chestnut"
                    >
                      <option value="">-- Choose Existing Family --</option>
                      {existingFamilies.map((fam) => (
                        <option key={fam._id} value={fam._id}>
                          {fam.primaryGuardian?.name || 'Family'} ({fam.familyCode || fam._id}) - Phone: {fam.primaryGuardian?.phone || 'N/A'}
                        </option>
                      ))}
                    </select>
                    <div className="p-3 bg-chestnut/10 border border-chestnut/20 rounded-xl text-xs text-darkBrown flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-chestnut shrink-0" />
                      <span>Existing Parent Account — existing login credentials will be reused.</span>
                    </div>
                  </div>
                ) : (
                  <>
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

                      <div>
                        <label className="block text-xs font-semibold text-textMain mb-1">Relationship</label>
                        <select
                          value={formData.guardianRelation}
                          onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                          className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-semibold text-darkBrown focus:outline-none focus:border-chestnut"
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Parent Login Credentials Setup */}
                    <div className="pt-4 border-t border-almond/40 space-y-4">
                      <h3 className="text-xs font-bold text-darkBrown uppercase tracking-wider flex items-center space-x-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-chestnut" />
                        <span>Parent Login Credentials Setup</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Parent Login ID *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. guardian@gmail.com or 9876543210"
                            value={formData.parentLoginId}
                            onChange={(e) => {
                              setIsLoginIdCustomized(true);
                              setFormData({ ...formData, parentLoginId: e.target.value });
                            }}
                            className="w-full px-3.5 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Set Parent Password *</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="At least 6 chars"
                              value={formData.parentPassword}
                              onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                              className="w-full px-3.5 py-2 pr-9 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-2.5 text-textMuted hover:text-darkBrown"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-textMain mb-1">Confirm Parent Password *</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              placeholder="Re-enter password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              className="w-full px-3.5 py-2 pr-9 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 top-2.5 text-textMuted hover:text-darkBrown"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/students')}
                  className="px-5 py-2.5 rounded-xl border border-almond/60 bg-white text-textMuted font-bold text-xs hover:bg-surface transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-chestnut hover:bg-darkBrown text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Admitting Student...' : 'Admit Student'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Credentials Success Modal */}
          {createdCredentials && (
            <CredentialModal
              isOpen={Boolean(createdCredentials)}
              credentials={createdCredentials}
              onClose={() => {
                setCreatedCredentials(null);
                navigate('/teacher/students');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherAddStudentPage;
