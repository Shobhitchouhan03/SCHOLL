import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  GraduationCap,
  ArrowLeft,
  User,
  BookOpen,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  ShieldCheck,
  Award,
  Edit3,
  Upload,
  KeyRound,
  Copy,
  Check,
  X,
  Plus,
} from 'lucide-react';

const StudentProfilePage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCredViewModal, setShowCredViewModal] = useState(false);

  // Modal forms
  const [editForm, setEditForm] = useState({});
  const [docForm, setDocForm] = useState({ documentType: 'Birth Certificate', documentName: '', documentUrl: '', notes: '' });
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [tempCredentials, setTempCredentials] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/principal/students/${studentId}`);
      if (res.data.success) {
        setProfileData(res.data);
        const st = res.data.student || {};
        setEditForm({
          firstName: st.firstName || '',
          middleName: st.middleName || '',
          lastName: st.lastName || '',
          dateOfBirth: st.dateOfBirth ? st.dateOfBirth.substring(0, 10) : '',
          gender: st.gender || 'male',
          bloodGroup: st.bloodGroup || '',
          category: st.category || 'General',
          aadhaarNumber: st.aadhaarNumber || '',
          rollNumber: st.rollNumber || '',
          emergencyContact: st.emergencyContact || '',
          medicalNotes: st.medicalNotes || '',
        });
      }
    } catch (err) {
      console.error('Fetch student profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Header />
        <div className="p-8 max-w-5xl mx-auto w-full">
          <LoadingSkeleton count={4} />
        </div>
      </div>
    );
  }

  const student = profileData?.student || {};
  const enrollments = profileData?.enrollments || [];
  const documents = profileData?.documents || [];
  const statusHistory = profileData?.statusHistory || [];
  const family = student.parentAccountId || {};
  const canManageStudent = Boolean(profileData?.canManageStudent ?? true);

  // Field fallbacks
  const className = typeof student.currentClassId === 'object' ? student.currentClassId?.name : (student.currentClassId || 'N/A');
  const sectionName = typeof student.currentSectionId === 'object' ? student.currentSectionId?.name : (student.currentSectionId || 'N/A');
  const sessionName = typeof student.currentAcademicSessionId === 'object' ? student.currentAcademicSessionId?.name : (student.currentAcademicSessionId || 'Current');

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/principal/students/${studentId}`, editForm);
      if (res.data.success) {
        setShowEditModal(false);
        setSuccessMsg('Student profile updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchStudentProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update student profile.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Document Upload Submit
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post(`/principal/students/${studentId}/documents`, docForm);
      if (res.data.success) {
        setShowDocModal(false);
        setDocForm({ documentType: 'Birth Certificate', documentName: '', documentUrl: '', notes: '' });
        setSuccessMsg('Document uploaded successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchStudentProfile();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to upload document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (resetForm.newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post(`/principal/students/${studentId}/reset-password`, { newPassword: resetForm.newPassword });
      if (res.data.success) {
        setShowResetModal(false);
        setResetForm({ newPassword: '', confirmPassword: '' });
        if (res.data.credentials) {
          setTempCredentials(res.data.credentials);
          setShowCredViewModal(true);
        } else {
          setSuccessMsg('Password updated successfully.');
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Back Navigation & Success Banner */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/teacher/students')}
              className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Students Directory</span>
            </button>

            {successMsg && (
              <div className="px-3 py-1.5 bg-success/10 border border-success/30 rounded-xl text-success text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Student Profile Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-chestnut text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                {student.firstName?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Student Profile</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                    ADM: {student.admissionNumber || 'N/A'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      student.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {student.status || 'Active'}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-0.5">
                  {student.fullName || 'Student'}
                </h1>
                <p className="text-xs text-textMuted mt-0.5">
                  Permanent ID: <strong className="font-mono text-darkBrown">{student.permanentStudentId || 'N/A'}</strong> • Enrolled in: <strong className="text-darkBrown">{className} - Section {sectionName}</strong>
                </p>
              </div>
            </div>

            {/* Action Bar (Class Teacher / Principal Only) */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <div className="px-3 py-1.5 bg-surface rounded-xl border border-almond/50 text-xs font-medium text-textMuted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-morning" />
                <span>Session: {sessionName}</span>
              </div>

              {canManageStudent && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-chestnut" />
                    <span>Edit Student</span>
                  </button>

                  <button
                    onClick={() => setShowDocModal(true)}
                    className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-morning" />
                    <span>Upload Document</span>
                  </button>

                  <button
                    onClick={() => setShowResetModal(true)}
                    className="px-3.5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Login Password</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-almond/30">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'academic', label: 'Academic History', icon: BookOpen },
              { id: 'family', label: 'Parent & Family', icon: Users },
              { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
              { id: 'statusHistory', label: 'Status History', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-white text-textMuted hover:text-textMain hover:bg-surface border border-almond/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Personal & Demographics</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Date of Birth</span>
                    <span className="font-semibold text-darkBrown">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Gender</span>
                    <span className="font-semibold capitalize text-darkBrown">{student.gender || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Blood Group</span>
                    <span className="font-semibold text-darkBrown">{student.bloodGroup || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Category</span>
                    <span className="font-semibold text-darkBrown">{student.category || 'General'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Religion</span>
                    <span className="font-semibold text-darkBrown">{student.religion || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Aadhaar Number</span>
                    <span className="font-mono font-bold text-darkBrown">{student.aadhaarNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-almond/40 text-xs space-y-1">
                  <span className="font-bold text-darkBrown block uppercase text-[10px]">Medical Notes & Emergency</span>
                  <p className="text-textMuted">{student.medicalNotes || 'No specific medical conditions recorded.'}</p>
                  <p className="text-textMuted font-semibold">Emergency Contact: {student.emergencyContact || 'N/A'}</p>
                </div>
              </div>

              {/* Right Sidebar Info */}
              <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
                <h3 className="text-base font-bold text-darkBrown">Placement Summary</h3>

                <div className="p-3 bg-surface rounded-xl border border-almond/40 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-textMuted">Class:</span>
                    <span className="font-bold text-darkBrown">{className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Section:</span>
                    <span className="font-bold text-darkBrown">Section {sectionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Roll Number:</span>
                    <span className="font-mono font-bold text-chestnut">{student.rollNumber ? `#${student.rollNumber}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Admission Date:</span>
                    <span className="font-semibold text-darkBrown">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC HISTORY */}
          {activeTab === 'academic' && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Academic Enrollment History</h3>
              {enrollments.length === 0 ? (
                <div className="p-4 text-center text-textMuted text-xs">No prior academic enrollments found.</div>
              ) : (
                <div className="space-y-2 text-xs">
                  {enrollments.map((e) => (
                    <div key={e._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-darkBrown">{e.academicSessionId?.name || 'Session'}</div>
                        <div className="text-[11px] text-textMuted">
                          Class: {e.classId?.name} • Section: {e.sectionId?.name} • Roll: {e.rollNumber || 'N/A'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-success/15 text-success rounded text-[10px] font-bold uppercase">{e.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARENT & FAMILY */}
          {activeTab === 'family' && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Family Account & Guardians</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-surface rounded-xl border border-almond/40 space-y-2">
                  <span className="font-bold text-darkBrown uppercase text-[10px] block">Primary Guardian</span>
                  <div>
                    <div className="font-bold text-darkBrown">{family.primaryGuardian?.name || 'N/A'}</div>
                    <div className="text-textMuted">Relationship: {family.primaryGuardian?.relationship || 'Father'}</div>
                    <div className="text-textMuted font-mono">Phone: {family.primaryGuardian?.phone || 'N/A'}</div>
                    <div className="text-textMuted">Email: {family.primaryGuardian?.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-almond/40 space-y-2">
                  <span className="font-bold text-darkBrown uppercase text-[10px] block">Family Login Code</span>
                  <div>
                    <div className="font-mono font-bold text-chestnut text-sm">{family.familyCode || 'N/A'}</div>
                    <div className="text-textMuted">Login ID: <strong className="font-mono text-darkBrown">{family.userId?.loginId || family.primaryGuardian?.email || 'N/A'}</strong></div>
                    <div className="text-textMuted">Account Status: <strong className="capitalize text-success">{family.userId?.isActive ? 'Active' : 'Active'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Uploaded Student Documents</h3>
                {canManageStudent && (
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="px-3 py-1.5 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center text-textMuted text-xs bg-surface/50 rounded-xl border border-dashed border-almond/60">
                  <FileText className="w-8 h-8 mx-auto text-textMuted/50 mb-2" />
                  <p className="font-semibold">No documents uploaded yet.</p>
                  {canManageStudent && (
                    <button
                      onClick={() => setShowDocModal(true)}
                      className="mt-3 text-chestnut font-bold text-xs hover:underline"
                    >
                      + Upload First Document
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {documents.map((d) => (
                    <div key={d._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-darkBrown">{d.documentName}</div>
                        <div className="text-[11px] text-textMuted">Type: {d.documentType} {d.notes ? `• ${d.notes}` : ''}</div>
                      </div>
                      <a href={d.documentUrl} target="_blank" rel="noreferrer" className="text-chestnut font-bold text-xs underline">
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STATUS HISTORY */}
          {activeTab === 'statusHistory' && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Status Transitions History</h3>
              {statusHistory.length === 0 ? (
                <div className="p-4 text-center text-textMuted text-xs">No status changes recorded.</div>
              ) : (
                <div className="space-y-2 text-xs">
                  {statusHistory.map((h) => (
                    <div key={h._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-darkBrown">
                          Transition: <span className="capitalize">{h.previousStatus}</span> → <span className="capitalize font-bold text-chestnut">{h.newStatus}</span>
                        </div>
                        <div className="text-[11px] text-textMuted italic">"{h.reason}"</div>
                      </div>
                      <span className="text-[10px] text-textMuted">{new Date(h.changedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* EDIT STUDENT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-lg font-black text-darkBrown">Edit Student Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-textMuted hover:text-darkBrown">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editForm.middleName}
                    onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+"
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="font-bold text-darkBrown block mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="12 digits"
                    value={editForm.aadhaarNumber}
                    onChange={(e) => setEditForm({ ...editForm, aadhaarNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={editForm.emergencyContact}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Medical Notes</label>
                <textarea
                  rows={2}
                  placeholder="Allergies or medical conditions"
                  value={editForm.medicalNotes}
                  onChange={(e) => setEditForm({ ...editForm, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold shadow-md disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-lg font-black text-darkBrown">Upload Student Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-textMuted hover:text-darkBrown">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleDocSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-darkBrown block mb-1">Document Type *</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-semibold"
                >
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Aadhaar / ID">Aadhaar / ID</option>
                  <option value="Previous Report Card">Previous Report Card</option>
                  <option value="Transfer Certificate">Transfer Certificate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birth Certificate Copy"
                  value={docForm.documentName}
                  onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Document File / URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave blank to generate link)"
                  value={docForm.documentUrl}
                  onChange={(e) => setDocForm({ ...docForm, documentUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional notes"
                  value={docForm.notes}
                  onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{actionLoading ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-lg font-black text-darkBrown">Reset Login Password</h3>
              <button onClick={() => setShowResetModal(false)} className="text-textMuted hover:text-darkBrown">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-surface rounded-xl border border-almond/40 space-y-1">
                <span className="text-[10px] text-textMuted font-bold uppercase block">Target Account</span>
                <div className="font-bold text-darkBrown text-xs">
                  {family.userId?.loginId ? 'Parent / Family Account' : 'Student Account'}
                </div>
                <div className="font-mono text-chestnut font-bold">
                  Login ID: {family.userId?.loginId || family.primaryGuardian?.email || student.admissionNumber || 'N/A'}
                </div>
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">New Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="font-bold text-darkBrown block mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-almond/30 text-darkBrown rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{actionLoading ? 'Updating...' : 'Reset Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONE-TIME RESET CREDENTIAL DISPLAY MODAL */}
      {showCredViewModal && tempCredentials && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-almond/30">
              <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-darkBrown">Password Updated Successfully</h3>
                <p className="text-xs text-textMuted">One-time reset credentials generated</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textMuted font-bold uppercase block">School Code</span>
                  <span className="font-mono font-bold text-darkBrown text-sm">{tempCredentials.schoolCode || 'SCH01'}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(tempCredentials.schoolCode || 'SCH01', 'code')}
                  className="p-1.5 text-textMuted hover:text-chestnut font-semibold flex items-center gap-1 text-[11px]"
                >
                  {copiedField === 'code' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textMuted font-bold uppercase block">Account Type & Student</span>
                  <span className="font-bold text-darkBrown">{tempCredentials.accountType} ({tempCredentials.studentName})</span>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textMuted font-bold uppercase block">Login ID</span>
                  <span className="font-mono font-bold text-chestnut text-sm">{tempCredentials.loginId}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(tempCredentials.loginId, 'loginId')}
                  className="p-1.5 text-textMuted hover:text-chestnut font-semibold flex items-center gap-1 text-[11px]"
                >
                  {copiedField === 'loginId' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-textMuted font-bold uppercase block">New Password</span>
                  <span className="font-mono font-bold text-darkBrown text-sm">{tempCredentials.rawPassword}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(tempCredentials.rawPassword, 'password')}
                  className="p-1.5 text-textMuted hover:text-chestnut font-semibold flex items-center gap-1 text-[11px]"
                >
                  {copiedField === 'password' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-[11px] text-warning font-medium">
              ⚠️ Note: This password will not be displayed again. Please copy and share these credentials securely.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowCredViewModal(false);
                  setTempCredentials(null);
                }}
                className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;
