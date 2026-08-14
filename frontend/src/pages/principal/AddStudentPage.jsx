import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import CredentialModal from '../../components/common/CredentialModal';
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Search,
  UserCheck,
  Building2,
  FileText,
} from 'lucide-react';

const AddStudentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [teacherForbidden, setTeacherForbidden] = useState(false);

  // References
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [existingFamilies, setExistingFamilies] = useState([]);
  const [familySearch, setFamilySearch] = useState('');

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Student Details
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '2015-05-15',
    gender: 'male',
    bloodGroup: 'O+',
    photoUrl: '',
    aadhaarNumber: '',
    category: 'General',
    religion: '',
    medicalNotes: '',
    emergencyContact: '',
    // Step 2: Academic Placement
    currentAcademicSessionId: '',
    currentClassId: '',
    currentSectionId: '',
    rollNumber: '',
    admissionNumber: `ADM${Math.floor(10000 + Math.random() * 90000)}`,
    admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    // Step 3: Guardian Details
    primaryGuardian: {
      name: '',
      relationship: 'Father',
      phone: '',
      whatsapp: '',
      email: '',
      occupation: '',
      qualification: '',
    },
    secondaryGuardian: {
      name: '',
      relationship: 'Mother',
      phone: '',
      email: '',
      occupation: '',
    },
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    // Step 4: Family Account Option ('new' or 'link')
    familyOption: 'new',
    existingFamilyId: '',
    parentLoginId: `PARENT_${Math.floor(1000 + Math.random() * 9000)}`,
    parentPassword: Math.random().toString(36).slice(-8) + '!',
  });

  const fetchReferences = async () => {
    try {
      if (user?.role === 'principal' || user?.role === 'accountant' || user?.role === 'hr') {
        setTeacherForbidden(true);
        return;
      }

      if (user?.role === 'teacher') {
        const profileRes = await api.get('/teacher/me');
        if (profileRes.data.success) {
          const tch = profileRes.data.teacher;
          if (!tch || !tch.isClassTeacher || !tch.classTeacherSectionId) {
            setTeacherForbidden(true);
            return;
          }
          const targetClassId = tch.classTeacherClassId?._id || tch.classTeacherClassId;
          const targetSectionId = tch.classTeacherSectionId?._id || tch.classTeacherSectionId;
          setFormData((prev) => ({
            ...prev,
            currentClassId: targetClassId || '',
            currentSectionId: targetSectionId || '',
          }));
        }
      }

      const [sessRes, clsRes, secRes, famRes] = await Promise.all([
        api.get('/principal/setup/academic-sessions'),
        api.get('/principal/classes'),
        api.get('/principal/sections'),
        api.get('/principal/families'),
      ]);

      if (sessRes.data.success) {
        const list = sessRes.data.sessions || [];
        setSessions(list);
        const curr = list.find((s) => s.isCurrent) || list[0];
        if (curr) setFormData((prev) => ({ ...prev, currentAcademicSessionId: curr._id }));
      }
      if (clsRes.data.success) setClasses(clsRes.data.classes || []);
      if (secRes.data.success) setSections(secRes.data.sections || []);
      if (famRes.data.success) setExistingFamilies(famRes.data.families || []);
    } catch (err) {
      console.error('Fetch references error:', err);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, [user]);

  const handleNextStep = () => {
    setFormError('');
    if (currentStep === 1) {
      if (!formData.firstName || !formData.dateOfBirth) {
        setFormError('First name and Date of Birth are required.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.currentAcademicSessionId || !formData.currentClassId || !formData.currentSectionId || !formData.admissionNumber) {
        setFormError('Academic Session, Class, Section, and Admission Number are required.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.primaryGuardian.name || !formData.primaryGuardian.phone) {
        setFormError('Primary Guardian Name and Phone are required.');
        return;
      }
    } else if (currentStep === 4) {
      if (formData.familyOption === 'link' && !formData.existingFamilyId) {
        setFormError('Please select an existing Family Account to link.');
        return;
      }
      if (formData.familyOption === 'new' && (!formData.parentLoginId || !formData.parentPassword)) {
        setFormError('Parent Login ID and Password are required.');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setFormError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitAdmission = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const endpoint = user?.role === 'teacher' ? '/teacher/students' : '/principal/students';
    const redirectPath = user?.role === 'teacher' ? '/teacher/students' : '/principal/students';

    try {
      const res = await api.post(endpoint, formData);
      if (res.data.success) {
        if (res.data.credentials) {
          setCreatedCredentials(res.data.credentials);
        } else {
          alert(`Student ${res.data.student.fullName} admitted and linked successfully!`);
          navigate(redirectPath);
        }
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to complete student admission.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFamilies = existingFamilies.filter(
    (f) =>
      !familySearch ||
      f.familyCode?.toLowerCase().includes(familySearch.toLowerCase()) ||
      f.primaryGuardian?.name?.toLowerCase().includes(familySearch.toLowerCase()) ||
      f.primaryGuardian?.phone?.includes(familySearch)
  );

  if (teacherForbidden) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="flex flex-1">
          <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-xl mx-auto w-full flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 border border-danger/30 shadow-card text-center space-y-4 w-full">
              <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-darkBrown">Access Restricted</h2>
              <p className="text-xs text-textMuted font-semibold">
                Principals and non-class staff cannot directly admit students. Student admission is managed exclusively by assigned Class Teachers.
              </p>
              <button
                onClick={() => navigate(user?.role === 'teacher' ? '/teacher/students' : '/principal/students')}
                className="px-5 py-2.5 bg-chestnut text-white font-bold text-xs rounded-xl hover:bg-darkBrown transition-colors"
              >
                Back to Students Directory
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(user?.role === 'teacher' ? '/teacher/students' : '/principal/students')}
              className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Students Directory</span>
            </button>

            <span className="text-xs font-bold text-chestnut">
              Admission Step {currentStep} of 5
            </span>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card space-y-6">
            <div>
              <h2 className="text-xl font-black text-darkBrown tracking-tight">New Student Admission</h2>
              <p className="text-xs text-textMuted mt-0.5">
                Complete student records and configure or link family account credentials.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5 pb-2 border-b border-almond/30">
              {['1. Student Info', '2. Academic', '3. Guardian', '4. Family Login', '5. Review'].map((label, idx) => (
                <div
                  key={idx}
                  className={`py-1.5 text-center text-[10px] font-bold rounded-lg ${
                    currentStep === idx + 1
                      ? 'bg-chestnut text-white shadow-sm'
                      : currentStep > idx + 1
                      ? 'bg-success/15 text-success'
                      : 'bg-surface text-textMuted'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {formError && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: STUDENT INFORMATION */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Step 1: Student Personal Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Middle Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kumar"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Aadhaar / National ID</label>
                    <input
                      type="text"
                      placeholder="12 digit ID"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Religion</label>
                    <input
                      type="text"
                      placeholder="e.g. Hindu, Sikh, Muslim"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMIC PLACEMENT */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Step 2: Academic Placement</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Academic Session *</label>
                    <select
                      value={formData.currentAcademicSessionId}
                      onChange={(e) => setFormData({ ...formData, currentAcademicSessionId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="">Select Session</option>
                      {sessions.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.isCurrent ? '(Current)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Enrolling Class *</label>
                    <select
                      value={formData.currentClassId}
                      onChange={(e) => setFormData({ ...formData, currentClassId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Section *</label>
                    <select
                      value={formData.currentSectionId}
                      onChange={(e) => setFormData({ ...formData, currentSectionId: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    >
                      <option value="">Select Section</option>
                      {sections
                        .filter((sec) => !formData.currentClassId || (sec.classId?._id || sec.classId) === formData.currentClassId)
                        .map((sec) => (
                          <option key={sec._id} value={sec._id}>
                            Section {sec.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Admission Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ADM2026001"
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Roll Number</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-textMain mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: GUARDIAN INFORMATION */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Step 3: Primary & Secondary Guardian</h3>

                <div className="p-3 bg-surface rounded-2xl border border-almond/40 space-y-3">
                  <span className="text-xs font-bold text-darkBrown block">Primary Guardian Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Father / Guardian Name"
                        value={formData.primaryGuardian.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryGuardian: { ...formData.primaryGuardian, name: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 9876543210"
                        value={formData.primaryGuardian.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryGuardian: { ...formData.primaryGuardian, phone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Relationship</label>
                      <select
                        value={formData.primaryGuardian.relationship}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryGuardian: { ...formData.primaryGuardian, relationship: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-2xl border border-almond/40 space-y-3">
                  <span className="text-xs font-bold text-darkBrown block">Secondary Guardian (Optional)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="Mother Name"
                        value={formData.secondaryGuardian.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryGuardian: { ...formData.secondaryGuardian, name: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="Phone"
                        value={formData.secondaryGuardian.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryGuardian: { ...formData.secondaryGuardian, phone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: FAMILY LOGIN & LINK OPTION */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Step 4: Family Account & Login Option</h3>

                <div className="flex gap-4">
                  <label
                    onClick={() => setFormData({ ...formData, familyOption: 'new' })}
                    className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      formData.familyOption === 'new'
                        ? 'bg-chestnut/10 border-chestnut'
                        : 'bg-surface border-almond/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="familyOption"
                      checked={formData.familyOption === 'new'}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-bold text-darkBrown text-xs block">Create New Family Account</span>
                      <span className="text-[11px] text-textMuted">Generate a brand new family login for this student.</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, familyOption: 'link' })}
                    className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      formData.familyOption === 'link'
                        ? 'bg-chestnut/10 border-chestnut'
                        : 'bg-surface border-almond/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="familyOption"
                      checked={formData.familyOption === 'link'}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-bold text-darkBrown text-xs block">Link Existing Family Account</span>
                      <span className="text-[11px] text-textMuted">Link student as a sibling to an existing parent account.</span>
                    </div>
                  </label>
                </div>

                {formData.familyOption === 'new' ? (
                  <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-3">
                    <span className="text-xs font-bold text-darkBrown block">Configure Family Credentials</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Parent Login ID *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. PARENT_RAHUL"
                          value={formData.parentLoginId}
                          onChange={(e) => setFormData({ ...formData, parentLoginId: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 bg-white border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-textMuted uppercase mb-1">Password *</label>
                        <input
                          type="text"
                          required
                          value={formData.parentPassword}
                          onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-3">
                    <span className="text-xs font-bold text-darkBrown block">Select Existing Family Account</span>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search by Family Code, Parent Name, or Phone..."
                        value={familySearch}
                        onChange={(e) => setFamilySearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {filteredFamilies.map((f) => (
                        <div
                          key={f._id}
                          onClick={() => setFormData({ ...formData, existingFamilyId: f._id })}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            formData.existingFamilyId === f._id
                              ? 'bg-chestnut text-white font-bold border-chestnut'
                              : 'bg-white border-almond/40 hover:bg-surface text-darkBrown'
                          }`}
                        >
                          <div>
                            <div>{f.primaryGuardian?.name} ({f.familyCode})</div>
                            <div className="text-[10px] opacity-80">Phone: {f.primaryGuardian?.phone} • Siblings Linked: {(f.linkedStudentIds || []).length}</div>
                          </div>
                          {formData.existingFamilyId === f._id && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & SUBMIT */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-darkBrown uppercase tracking-wider">Step 5: Review Admission Summary</h3>

                <div className="p-4 bg-surface rounded-2xl border border-almond/40 space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Student Name</span>
                      <span className="font-bold text-darkBrown">{formData.firstName} {formData.middleName} {formData.lastName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Admission No</span>
                      <span className="font-mono font-bold text-chestnut">{formData.admissionNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Date of Birth</span>
                      <span className="font-semibold text-darkBrown">{formData.dateOfBirth}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Gender</span>
                      <span className="font-semibold capitalize text-darkBrown">{formData.gender}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-almond/30">
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Primary Guardian</span>
                      <span className="font-bold text-darkBrown">{formData.primaryGuardian.name} ({formData.primaryGuardian.phone})</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase block">Family Account</span>
                      <span className="font-semibold text-darkBrown">
                        {formData.familyOption === 'new' ? `New Account (${formData.parentLoginId})` : 'Linked Existing Family'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-almond/30">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-almond rounded-xl text-xs font-semibold text-textMuted flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAdmission}
                  disabled={submitting}
                  className="px-6 py-2 bg-chestnut hover:bg-darkBrown text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Admitting Student...' : 'Submit Admission & Generate Credentials'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CREDENTIAL DISPLAY MODAL */}
      <CredentialModal
        isOpen={Boolean(createdCredentials)}
        credentials={createdCredentials}
        onClose={() => {
          setCreatedCredentials(null);
          navigate('/principal/students');
        }}
      />
    </div>
  );
};

export default AddStudentPage;
