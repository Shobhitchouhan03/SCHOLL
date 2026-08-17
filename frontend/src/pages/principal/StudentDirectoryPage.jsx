import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  GraduationCap,
  Plus,
  Search,
  Download,
  Printer,
  Eye,
  Edit3,
  FileText,
  UserCheck,
  Power,
  X,
  AlertCircle,
  ShieldCheck,
  Clock,
  Layers,
  BookOpen,
  Trash2,
} from 'lucide-react';

const StudentDirectoryPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Academic References
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Status Modal State
  const [statusTargetStudent, setStatusTargetStudent] = useState(null);
  const [newStatus, setNewStatus] = useState('active');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Document Upload Modal State
  const [docTargetStudent, setDocTargetStudent] = useState(null);
  const [docForm, setDocForm] = useState({ documentType: 'Birth Certificate', documentName: '', documentUrl: '' });
  const [docSubmitting, setDocSubmitting] = useState(false);

  // Delete / Archive Student State
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setDeleteSubmitting(true);
    try {
      const res = await api.delete(`/principal/students/${deletingStudent._id}`);
      if (res.data.success) {
        setDeletingStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to delete student.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const [sessRes, clsRes, secRes] = await Promise.allSettled([
        api.get('/principal/academic-sessions'),
        api.get('/principal/classes'),
        api.get('/principal/sections'),
      ]);
      if (sessRes.status === 'fulfilled' && sessRes.value.data?.success) {
        setSessions(sessRes.value.data.sessions || []);
      }
      if (clsRes.status === 'fulfilled' && clsRes.value.data?.success) {
        setClasses(clsRes.value.data.classes || []);
      }
      if (secRes.status === 'fulfilled' && secRes.value.data?.success) {
        setSections(secRes.value.data.sections || []);
      }
    } catch (err) {
      console.error('Fetch references error:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/students', {
        params: {
          page,
          limit: 10,
          search,
          academicSessionId: sessionFilter,
          classId: classFilter,
          sectionId: sectionFilter,
          status: statusFilter,
        },
      });
      if (res.data.success) {
        setStudents(res.data.students || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, sessionFilter, classFilter, sectionFilter, statusFilter]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusTargetStudent) return;
    setStatusSubmitting(true);
    try {
      const res = await api.patch(`/principal/students/${statusTargetStudent._id}/status`, {
        status: newStatus,
        reason: statusReason,
      });
      if (res.data.success) {
        setStatusTargetStudent(null);
        setStatusReason('');
        fetchStudents();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!docTargetStudent) return;
    setDocSubmitting(true);
    try {
      const res = await api.post(`/principal/students/${docTargetStudent._id}/documents`, docForm);
      if (res.data.success) {
        setDocTargetStudent(null);
        setDocForm({ documentType: 'Birth Certificate', documentName: '', documentUrl: '' });
        alert('Document attached successfully!');
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to attach document');
    } finally {
      setDocSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ['Permanent ID', 'Admission No', 'Full Name', 'Gender', 'Class', 'Section', 'Roll No', 'Primary Guardian', 'Guardian Phone', 'Status'];
    const rows = students.map((s) => [
      s.permanentStudentId,
      s.admissionNumber,
      `"${s.fullName}"`,
      s.gender,
      s.currentClassId?.name || '',
      s.currentSectionId?.name || '',
      s.rollNumber || 'N/A',
      `"${s.parentAccountId?.primaryGuardian?.name || ''}"`,
      s.parentAccountId?.primaryGuardian?.phone || '',
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Student Information System</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Student Directory & Enrolments
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage student admissions, academic placements, parent family accounts, status history, and digital documents.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4 text-chestnut" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-surface hover:bg-almond/30 border border-almond/60 text-darkBrown rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4 text-darkBrown" />
                <span>Print Directory</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Enrolled"
              value={pagination.total}
              subtitle="Registered students"
              icon={GraduationCap}
              color="chestnut"
            />
            <StatCard
              title="Active Students"
              value={students.filter((s) => s.status === 'active').length}
              subtitle="Regular attendance"
              icon={ShieldCheck}
              color="success"
            />
            <StatCard
              title="Classes Represented"
              value={classes.length}
              subtitle="Academic grades"
              icon={BookOpen}
              color="morning"
            />
            <StatCard
              title="Transferred / Suspended"
              value={students.filter((s) => ['suspended', 'transferred', 'archived'].includes(s.status)).length}
              subtitle="Special status"
              icon={Clock}
              color="warning"
            />
          </div>

          {/* Student DataTable */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">Student Register</h3>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, admission no..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-44 sm:w-56"
                  />
                </div>

                <select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="">All Sections</option>
                  {sections
                    .filter((s) => !classFilter || (s.classId?._id || s.classId) === classFilter)
                    .map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.classId?.name} - {sec.name}
                      </option>
                    ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="transferred">Transferred</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={5} />
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No students found matching current filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Student Name</th>
                      <th className="py-3 px-4">Permanent ID / Admission</th>
                      <th className="py-3 px-4">Class & Section</th>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">Parent / Guardian</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {students.map((s) => (
                      <tr key={s._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-chestnut/10 text-chestnut font-bold text-xs flex items-center justify-center">
                              {s.firstName.charAt(0)}
                            </div>
                            <div>
                              <div>{s.fullName}</div>
                              <div className="text-[10px] text-textMuted">DOB: {new Date(s.dateOfBirth).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-chestnut">{s.admissionNumber}</div>
                          <div className="text-[10px] text-textMuted font-mono">{s.permanentStudentId}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown">{s.currentClassId?.name || 'Class'}</div>
                          <div className="text-[10px] text-textMuted">Section {s.currentSectionId?.name || 'A'}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">
                          {s.rollNumber ? `#${s.rollNumber}` : 'N/A'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-darkBrown">
                            {s.parentAccountId?.primaryGuardian?.name || 'N/A'}
                          </div>
                          <div className="text-[10px] text-textMuted font-mono">
                            {s.parentAccountId?.primaryGuardian?.phone || ''}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              s.status === 'active'
                                ? 'bg-success/10 text-success'
                                : s.status === 'suspended'
                                ? 'bg-danger/10 text-danger'
                                : 'bg-warning/15 text-warning'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/principal/students/${s._id}`)}
                              title="View Profile"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-chestnut hover:bg-surface transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setDocTargetStudent(s);
                              }}
                              title="Upload Document"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-darkBrown hover:bg-surface transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setStatusTargetStudent(s);
                                setNewStatus(s.status);
                              }}
                              title="Change Status"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-darkBrown hover:bg-surface transition-colors"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingStudent(s)}
                              title="Delete / Archive Student"
                              className="p-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-almond/30 text-xs">
                <span className="text-textMuted">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total students)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border border-almond text-textMuted hover:bg-surface disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pagination.pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-almond text-textMuted hover:bg-surface disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* STATUS CHANGE MODAL */}
      {statusTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown">Update Student Status</h3>
              <button onClick={() => setStatusTargetStudent(null)} className="p-1 text-textMuted hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Select New Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="active">Active (Enrolled & Regular)</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="transferred">Transferred</option>
                  <option value="archived">Archived</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Reason / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Reason for status transition..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setStatusTargetStudent(null)}
                  className="px-4 py-2 border border-almond rounded-xl text-xs text-textMuted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="px-5 py-2 bg-chestnut text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {statusSubmitting ? 'Updating...' : 'Save Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      {docTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown">Upload Student Document</h3>
              <button onClick={() => setDocTargetStudent(null)} className="p-1 text-textMuted hover:bg-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Document Type *</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                >
                  <option value="Birth Certificate">Birth Certificate</option>
                  <option value="Transfer Certificate">Transfer Certificate</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="Previous Report Card">Previous Report Card</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verified Birth Certificate"
                  value={docForm.documentName}
                  onChange={(e) => setDocForm({ ...docForm, documentName: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Document URL / Storage Reference *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://docs.school.edu/files/birth_cert.pdf"
                  value={docForm.documentUrl}
                  onChange={(e) => setDocForm({ ...docForm, documentUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setDocTargetStudent(null)}
                  className="px-4 py-2 border border-almond rounded-xl text-xs text-textMuted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  className="px-5 py-2 bg-chestnut text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {docSubmitting ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-danger/30 relative">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-darkBrown">Delete / Archive Student</h3>
              <p className="text-xs text-textMuted">
                Are you sure you want to delete or archive student{' '}
                <strong className="text-darkBrown">
                  {deletingStudent.firstName} {deletingStudent.lastName}
                </strong>{' '}
                (Adm: {deletingStudent.admissionNumber})?
              </p>
              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDeletingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-almond text-textMuted font-semibold text-xs hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStudent}
                  disabled={deleteSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-danger text-white font-bold text-xs shadow-md hover:bg-danger/90 disabled:opacity-50"
                >
                  {deleteSubmitting ? 'Processing...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectoryPage;
