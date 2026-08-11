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
} from 'lucide-react';

const StudentProfilePage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/principal/students/${studentId}`);
      if (res.data.success) {
        setProfileData(res.data);
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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Back Navigation */}
          <button
            onClick={() => navigate('/principal/students')}
            className="flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-darkBrown transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Students Directory</span>
          </button>

          {/* Student Profile Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-chestnut text-white font-bold text-xl flex items-center justify-center shadow-md">
                {student.firstName?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Student Profile</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut">
                    ADM: {student.admissionNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      student.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/15 text-warning'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-0.5">
                  {student.fullName}
                </h1>
                <p className="text-xs text-textMuted mt-0.5">
                  Permanent ID: <strong className="font-mono text-darkBrown">{student.permanentStudentId}</strong> • Enrolled in: <strong className="text-darkBrown">{student.currentClassId?.name} - Section {student.currentSectionId?.name}</strong>
                </p>
              </div>
            </div>

            <div className="px-4 py-2 bg-surface rounded-2xl border border-almond/50 text-xs font-medium text-textMuted flex items-center gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-morning" />
              <span>Session: {student.currentAcademicSessionId?.name || 'Current'}</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-almond/30">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'academic', label: 'Academic History', icon: BookOpen },
              { id: 'family', label: 'Parent & Family', icon: Users },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'statusHistory', label: 'Status History', icon: Clock },
              { id: 'attendance', label: 'Attendance (Coming Soon)', icon: ShieldCheck, disabled: true },
              { id: 'fees', label: 'Fees (Coming Soon)', icon: Award, disabled: true },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : tab.disabled
                      ? 'bg-surface/50 text-textMuted/50 cursor-not-allowed'
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
                    <span className="font-semibold text-darkBrown">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-almond/40">
                    <span className="text-[10px] text-textMuted font-bold uppercase block">Gender</span>
                    <span className="font-semibold capitalize text-darkBrown">{student.gender}</span>
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
                    <span className="font-bold text-darkBrown">{student.currentClassId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Section:</span>
                    <span className="font-bold text-darkBrown">Section {student.currentSectionId?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Roll Number:</span>
                    <span className="font-mono font-bold text-chestnut">{student.rollNumber ? `#${student.rollNumber}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-textMuted">Admission Date:</span>
                    <span className="font-semibold text-darkBrown">{new Date(student.admissionDate).toLocaleDateString()}</span>
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
                        <div className="font-bold text-darkBrown">{e.academicSessionId?.name}</div>
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
                    <div className="font-bold text-darkBrown">{family.primaryGuardian?.name}</div>
                    <div className="text-textMuted">Relationship: {family.primaryGuardian?.relationship}</div>
                    <div className="text-textMuted font-mono">Phone: {family.primaryGuardian?.phone}</div>
                    <div className="text-textMuted">Email: {family.primaryGuardian?.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-almond/40 space-y-2">
                  <span className="font-bold text-darkBrown uppercase text-[10px] block">Family Login Code</span>
                  <div>
                    <div className="font-mono font-bold text-chestnut text-sm">{family.familyCode || 'N/A'}</div>
                    <div className="text-textMuted">Login ID: <strong className="font-mono text-darkBrown">{family.userId?.loginId}</strong></div>
                    <div className="text-textMuted">Account Status: <strong className="capitalize text-success">{family.userId?.isActive ? 'Active' : 'Inactive'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl p-5 border border-almond/40 shadow-card space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Uploaded Student Documents</h3>
              {documents.length === 0 ? (
                <div className="p-4 text-center text-textMuted text-xs">No documents uploaded yet.</div>
              ) : (
                <div className="space-y-2 text-xs">
                  {documents.map((d) => (
                    <div key={d._id} className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-darkBrown">{d.documentName}</div>
                        <div className="text-[11px] text-textMuted">Type: {d.documentType}</div>
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
    </div>
  );
};

export default StudentProfilePage;
