import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import CredentialModal from '../../components/common/CredentialModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Power,
  KeyRound,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Download,
  Printer,
  Edit3,
  Trash2,
  Eye,
  DollarSign,
  Briefcase,
  UserCheck,
  FileText,
  User,
  Clock,
} from 'lucide-react';

const DEPARTMENTS = ['General', 'Science', 'Mathematics', 'Languages', 'Humanities', 'Sports', 'Arts & Music', 'Computer Science'];

const TeacherManagementPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classTeacherFilter, setClassTeacherFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Academic Structure references for drop-downs
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [leavesList, setLeavesList] = useState([]);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isChangeLoginModalOpen, setIsChangeLoginModalOpen] = useState(false);
  const [deleteTargetTeacher, setDeleteTargetTeacher] = useState(null);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetailData, setTeacherDetailData] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password reset / login ID states
  const [newPassword, setNewPassword] = useState('');
  const [newLoginId, setNewLoginId] = useState('');

  // Salary Form state
  const [salaryForm, setSalaryForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    remarks: 'Monthly salary payout',
    status: 'paid',
  });

  const TEACHER_TYPES = [
    'Class Teacher',
    'Subject Teacher',
    'Class & Subject Teacher',
    'Coordinator',
    'Librarian',
    'Transport Staff Viewer',
  ];

  // Create / Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    loginId: '',
    password: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: '',
    experienceYears: 0,
    address: '',
    photoUrl: '',
    salary: 0,
    department: 'General',
    designation: 'Teacher',
    teacherType: 'Class Teacher',
    isClassTeacher: true,
    classTeacherClassId: '',
    classTeacherSectionId: '',
    assignedClassIds: [],
    assignedSectionIds: [],
    assignedSubjectIds: [],
    bloodGroup: '',
    emergencyContact: '',
  });

  const [loadingAcademic, setLoadingAcademic] = useState(false);

  // Fetch academic structure & teachers
  const fetchAcademicReferences = async () => {
    try {
      setLoadingAcademic(true);
      const [clsRes, secRes, subRes] = await Promise.allSettled([
        api.get('/principal/classes'),
        api.get('/principal/sections'),
        api.get('/principal/subjects'),
      ]);

      if (clsRes.status === 'fulfilled' && clsRes.value.data?.success) {
        setAvailableClasses(clsRes.value.data.classes || []);
      }
      if (secRes.status === 'fulfilled' && secRes.value.data?.success) {
        setAvailableSections(secRes.value.data.sections || []);
      }
      if (subRes.status === 'fulfilled' && subRes.value.data?.success) {
        setAvailableSubjects(subRes.value.data.subjects || []);
      }

      try {
        const leaveRes = await api.get('/principal/teachers/leaves');
        if (leaveRes.data?.success) setLeavesList(leaveRes.data.leaves || []);
      } catch (lErr) {
        console.warn('Leaves fetch non-critical warning:', lErr);
      }
    } catch (err) {
      console.error('Fetch references error:', err);
    } finally {
      setLoadingAcademic(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/principal/teachers', {
        params: {
          page,
          limit: 10,
          search,
          department: departmentFilter,
          status: statusFilter,
          isClassTeacher: classTeacherFilter,
        },
      });
      if (res.data.success) {
        setTeachers(res.data.teachers || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Fetch teachers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicReferences();
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [page, search, departmentFilter, statusFilter, classTeacherFilter]);

  // Open Create Teacher Modal
  const openCreateModal = () => {
    setFormError('');
    setFormData({
      name: '',
      employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      loginId: `TEACHER_${Math.floor(100 + Math.random() * 900)}`,
      password: Math.random().toString(36).slice(-8) + '!',
      email: '',
      phone: '',
      gender: 'male',
      dob: '',
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: 'B.Ed, M.Sc',
      experienceYears: 2,
      address: '',
      photoUrl: '',
      salary: 35000,
      department: 'General',
      designation: 'Teacher',
      isClassTeacher: false,
      classTeacherClassId: '',
      classTeacherSectionId: '',
      assignedClassIds: [],
      assignedSectionIds: [],
      assignedSubjectIds: [],
      bloodGroup: 'O+',
      emergencyContact: '',
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Teacher Modal
  const openEditModal = (t) => {
    setFormError('');
    setSelectedTeacher(t);
    setFormData({
      name: t.name || '',
      employeeId: t.employeeId || '',
      loginId: t.userId?.loginId || '',
      password: '',
      email: t.userId?.email || t.email || '',
      phone: t.userId?.phone || t.phone || '',
      gender: t.gender || 'male',
      dob: t.dob ? new Date(t.dob).toISOString().split('T')[0] : '',
      joiningDate: t.joiningDate ? new Date(t.joiningDate).toISOString().split('T')[0] : '',
      qualification: t.qualification || '',
      experienceYears: t.experienceYears || 0,
      address: t.address || '',
      photoUrl: t.photoUrl || '',
      salary: t.monthlySalary || 0,
      department: t.department || 'General',
      designation: t.designation || 'Teacher',
      isClassTeacher: t.isClassTeacher || false,
      classTeacherClassId: t.classTeacherClassId?._id || t.classTeacherClassId || '',
      classTeacherSectionId: t.classTeacherSectionId?._id || t.classTeacherSectionId || '',
      assignedClassIds: (t.assignedClassIds || []).map((c) => c._id || c),
      assignedSectionIds: (t.assignedSectionIds || []).map((s) => s._id || s),
      assignedSubjectIds: (t.assignedSubjectIds || []).map((sub) => sub._id || sub),
      bloodGroup: t.bloodGroup || '',
      emergencyContact: t.emergencyContact || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Detailed Profile Modal
  const openDetailModal = async (t) => {
    setSelectedTeacher(t);
    try {
      const res = await api.get(`/principal/teachers/${t._id}`);
      if (res.data.success) {
        setTeacherDetailData(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to fetch details');
    }
  };

  // Submit Create Teacher
  const handleCreateTeacherSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.post('/principal/teachers', formData);
      if (res.data.success) {
        setIsCreateModalOpen(false);
        setCreatedCredentials(res.data.credentials);
        fetchTeachers();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Teacher
  const handleEditTeacherSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.put(`/principal/teachers/${selectedTeacher._id}`, formData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to update teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (teacherId) => {
    try {
      const res = await api.patch(`/principal/teachers/${teacherId}/status`);
      if (res.data.success) {
        fetchTeachers();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to toggle status');
    }
  };

  // Delete Teacher
  const handleDeleteTeacher = async () => {
    if (!deleteTargetTeacher) return;
    try {
      const res = await api.delete(`/principal/teachers/${deleteTargetTeacher._id}`);
      if (res.data.success) {
        setDeleteTargetTeacher(null);
        fetchTeachers();
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to delete teacher');
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post(`/principal/teachers/${selectedTeacher._id}/reset-password`, { newPassword });
      if (res.data.success) {
        setIsResetPasswordModalOpen(false);
        setNewPassword('');
        setCreatedCredentials(res.data.credentials);
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to reset password.');
    }
  };

  // Change Login ID
  const handleChangeLoginId = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.patch(`/principal/teachers/${selectedTeacher._id}/login-id`, { newLoginId });
      if (res.data.success) {
        setIsChangeLoginModalOpen(false);
        setNewLoginId('');
        fetchTeachers();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to change login ID.');
    }
  };

  // Issue Salary Record
  const handleSalarySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post(`/principal/teachers/${selectedTeacher._id}/salary`, salaryForm);
      if (res.data.success) {
        setIsSalaryModalOpen(false);
        alert('Salary record saved successfully!');
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to record salary.');
    }
  };

  // Approve / Reject Leave Request
  const handleLeaveAction = async (leaveId, status) => {
    try {
      const res = await api.patch(`/principal/teachers/leave/${leaveId}`, { status });
      if (res.data.success) {
        fetchAcademicReferences();
        if (teacherDetailData) {
          openDetailModal(selectedTeacher);
        }
      }
    } catch (err) {
      alert(err.customMessage || 'Failed to update leave request');
    }
  };

  // Export Teachers to CSV
  const handleExportCSV = () => {
    if (teachers.length === 0) return;
    const headers = ['Employee ID', 'Name', 'Login ID', 'Department', 'Designation', 'Class Teacher', 'Salary', 'Status'];
    const rows = teachers.map((t) => [
      t.employeeId,
      `"${t.name}"`,
      t.userId?.loginId || '',
      t.department || '',
      t.designation || '',
      t.isClassTeacher ? 'Yes' : 'No',
      t.monthlySalary || 0,
      t.userId?.isActive ? 'Active' : 'Inactive',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Teachers_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary Window
  const handlePrint = () => {
    window.print();
  };

  const toggleArraySelection = (field, id) => {
    const current = formData[field] || [];
    if (current.includes(id)) {
      setFormData({ ...formData, [field]: current.filter((item) => item !== id) });
    } else {
      setFormData({ ...formData, [field]: [...current, id] });
    }
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
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Faculty & Human Resources</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Teacher Management & Staff Directory
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Onboard teachers, assign classes and subjects, manage class teachers, issue monthly salaries, and approve leave applications.
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

              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Teacher</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Teachers"
              value={pagination.total}
              subtitle="Registered faculty"
              icon={Users}
              color="chestnut"
            />
            <StatCard
              title="Class Teachers"
              value={teachers.filter((t) => t.isClassTeacher).length}
              subtitle="Assigned section heads"
              icon={UserCheck}
              color="morning"
            />
            <StatCard
              title="Pending Leaves"
              value={leavesList.filter((l) => l.status === 'pending').length}
              subtitle="Requires approval"
              icon={Clock}
              color="warning"
            />
            <StatCard
              title="Active Staff"
              value={teachers.filter((t) => t.userId?.isActive).length}
              subtitle="Operational status"
              icon={ShieldCheck}
              color="success"
            />
          </div>

          {/* Pending Leave Requests Section (if any) */}
          {leavesList.filter((l) => l.status === 'pending').length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Pending Leave Applications Requiring Approval</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  {leavesList.filter((l) => l.status === 'pending').length} Pending
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leavesList.filter((l) => l.status === 'pending').map((leave) => (
                  <div key={leave._id} className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-sm flex items-center justify-between">
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-darkBrown">{leave.teacherId?.name} ({leave.teacherId?.employeeId})</div>
                      <div className="text-textMuted text-[11px]">
                        <strong className="capitalize">{leave.leaveType} Leave:</strong> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} days)
                      </div>
                      <div className="text-textMuted italic text-[11px]">"{leave.reason}"</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'approved')}
                        className="px-2.5 py-1 bg-success text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-darkBrown transition-all"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave._id, 'rejected')}
                        className="px-2.5 py-1 bg-danger text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-darkBrown transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Teachers DataTable */}
          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-darkBrown">Teachers Directory</h3>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-textMuted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, ID, department..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9 pr-3 py-1.5 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all w-48 sm:w-60"
                  />
                </div>

                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={classTeacherFilter}
                  onChange={(e) => {
                    setClassTeacherFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Staff Roles</option>
                  <option value="true">Class Teachers Only</option>
                  <option value="false">Subject Teachers Only</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1.5 px-3 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={5} />
            ) : teachers.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No teachers found matching criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase tracking-wider bg-surface/50">
                      <th className="py-3 px-4 rounded-l-xl">Teacher & Employee ID</th>
                      <th className="py-3 px-4">Login ID</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Class Teacher</th>
                      <th className="py-3 px-4">Assigned Subjects</th>
                      <th className="py-3 px-4">Monthly Salary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20 text-xs text-textMain">
                    {teachers.map((t) => (
                      <tr key={t._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-darkBrown flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-chestnut/10 text-chestnut font-bold text-xs flex items-center justify-center">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <div>{t.name}</div>
                              <div className="text-[10px] font-mono text-chestnut font-bold">{t.employeeId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-chestnut">
                          {t.userId?.loginId || 'N/A'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-darkBrown">{t.department}</div>
                          <div className="text-[10px] text-textMuted">{t.designation}</div>
                        </td>

                        <td className="py-3 px-4">
                          {t.isClassTeacher ? (
                            <span className="px-2 py-0.5 rounded bg-morning/15 text-morning text-[10px] font-bold flex items-center gap-1 w-fit">
                              <UserCheck className="w-3 h-3" />
                              <span>{t.classTeacherClassId?.name} ({t.classTeacherSectionId?.name})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-textMuted">No</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(t.assignedSubjectIds || []).map((sub) => (
                              <span key={sub._id || sub} className="px-1.5 py-0.5 bg-surface border border-almond/50 rounded text-[10px] font-medium">
                                {sub.name || sub.code || 'Subject'}
                              </span>
                            ))}
                            {(t.assignedSubjectIds || []).length === 0 && <span className="text-[10px] text-textMuted">None</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">
                          ₹{(t.monthlySalary || 0).toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.userId?.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}
                          >
                            {t.userId?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDetailModal(t)}
                              title="View Details & History"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-chestnut hover:bg-surface transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openEditModal(t)}
                              title="Edit Profile & Assignments"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-darkBrown hover:bg-surface transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTeacher(t);
                                setSalaryForm({
                                  month: new Date().toISOString().slice(0, 7),
                                  baseSalary: t.monthlySalary || 35000,
                                  allowances: 2000,
                                  deductions: 1000,
                                  remarks: 'Monthly salary payout',
                                  status: 'paid',
                                });
                                setIsSalaryModalOpen(true);
                              }}
                              title="Issue / Record Salary"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-success hover:bg-surface transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedTeacher(t);
                                setIsResetPasswordModalOpen(true);
                              }}
                              title="Reset Password"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-warning hover:bg-surface transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(t._id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                                t.userId?.isActive
                                  ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                  : 'bg-success/10 text-success hover:bg-success/20'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => setDeleteTargetTeacher(t)}
                              title="Delete Teacher"
                              className="p-1.5 rounded-lg border border-almond text-textMuted hover:text-danger hover:bg-danger/10 transition-colors"
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
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total teachers)
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

      {/* CREATE TEACHER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-almond/50 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <Plus className="w-5 h-5 text-chestnut" />
                <span>Onboard New Teacher</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeacherSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP102"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEACHER_VAN"
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Set Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="Initial password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Teacher Type *</label>
                  <select
                    value={formData.teacherType}
                    onChange={(e) => {
                      const type = e.target.value;
                      const isClass = type === 'Class Teacher' || type === 'Class & Subject Teacher';
                      setFormData({
                        ...formData,
                        teacherType: type,
                        isClassTeacher: isClass,
                      });
                    }}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-bold text-chestnut focus:outline-none focus:border-chestnut"
                  >
                    {TEACHER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior PGT Teacher"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="teacher@school.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              {/* Class Teacher Check & Selection */}
              <div className="p-3 bg-surface rounded-xl border border-almond/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-darkBrown">Assign as Class Teacher</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isClassTeacher}
                      onChange={(e) => setFormData({ ...formData, isClassTeacher: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-almond/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-chestnut"></div>
                  </label>
                </div>

                {formData.isClassTeacher && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Class *</label>
                      <select
                        value={formData.classTeacherClassId}
                        onChange={(e) => setFormData({ ...formData, classTeacherClassId: e.target.value, classTeacherSectionId: '' })}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      >
                        <option value="">Select Class</option>
                        {loadingAcademic && <option value="" disabled>Loading classes...</option>}
                        {!loadingAcademic && availableClasses.length === 0 && (
                          <option value="" disabled>No classes configured. Add classes in Academic Setup first.</option>
                        )}
                        {availableClasses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.displayName || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Section (Must be Unique) *</label>
                      <select
                        value={formData.classTeacherSectionId}
                        onChange={(e) => setFormData({ ...formData, classTeacherSectionId: e.target.value })}
                        disabled={!formData.classTeacherClassId}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {!formData.classTeacherClassId ? (
                          <option value="">Select Class First</option>
                        ) : (
                          <option value="">Select Section</option>
                        )}
                        {formData.classTeacherClassId &&
                          availableSections
                            .filter((s) => (s.classId?._id || s.classId) === formData.classTeacherClassId)
                            .map((sec) => {
                              const existingCT = teachers.find(
                                (t) => t.isClassTeacher && (t.classTeacherSectionId?._id || t.classTeacherSectionId) === sec._id
                              );
                              const isOccupied = Boolean(existingCT);
                              return (
                                <option key={sec._id} value={sec._id} disabled={isOccupied}>
                                  Section {sec.name} {isOccupied ? `(Already Assigned to ${existingCT.name})` : ''}
                                </option>
                              );
                            })}
                        {formData.classTeacherClassId &&
                          availableSections.filter((s) => (s.classId?._id || s.classId) === formData.classTeacherClassId).length === 0 && (
                            <option value="" disabled>No sections configured for this class</option>
                          )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Subjects Mapping */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-textMain">Assigned Teaching Subjects</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded-xl border border-almond/40 max-h-28 overflow-y-auto">
                  {availableSubjects.map((sub) => {
                    const isChecked = formData.assignedSubjectIds.includes(sub._id);
                    return (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => toggleArraySelection('assignedSubjectIds', sub._id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isChecked ? 'bg-chestnut text-white' : 'bg-white border border-almond/40 text-textMuted'
                        }`}
                      >
                        {sub.name} ({sub.code})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-chestnut hover:bg-darkBrown text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Teacher & Show Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-almond/50 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-chestnut" />
                <span>Edit Teacher Profile ({selectedTeacher?.employeeId})</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditTeacherSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              {/* Class Teacher Check & Selection */}
              <div className="p-3 bg-surface rounded-xl border border-almond/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-darkBrown">Assign as Class Teacher</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isClassTeacher}
                      onChange={(e) => setFormData({ ...formData, isClassTeacher: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-almond/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-chestnut"></div>
                  </label>
                </div>

                {formData.isClassTeacher && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Class *</label>
                      <select
                        value={formData.classTeacherClassId}
                        onChange={(e) => setFormData({ ...formData, classTeacherClassId: e.target.value, classTeacherSectionId: '' })}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                      >
                        <option value="">Select Class</option>
                        {loadingAcademic && <option value="" disabled>Loading classes...</option>}
                        {!loadingAcademic && availableClasses.length === 0 && (
                          <option value="" disabled>No classes configured. Add classes in Academic Setup first.</option>
                        )}
                        {availableClasses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.displayName || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-textMuted uppercase">Section (Must be Unique) *</label>
                      <select
                        value={formData.classTeacherSectionId}
                        onChange={(e) => setFormData({ ...formData, classTeacherSectionId: e.target.value })}
                        disabled={!formData.classTeacherClassId}
                        className="w-full px-3 py-1.5 bg-white border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        {!formData.classTeacherClassId ? (
                          <option value="">Select Class First</option>
                        ) : (
                          <option value="">Select Section</option>
                        )}
                        {formData.classTeacherClassId &&
                          availableSections
                            .filter((s) => (s.classId?._id || s.classId) === formData.classTeacherClassId)
                            .map((sec) => {
                              const existingCT = teachers.find(
                                (t) => t.isClassTeacher && (t.classTeacherSectionId?._id || t.classTeacherSectionId) === sec._id && t._id !== selectedTeacher?._id
                              );
                              const isOccupied = Boolean(existingCT);
                              return (
                                <option key={sec._id} value={sec._id} disabled={isOccupied}>
                                  Section {sec.name} {isOccupied ? `(Already Assigned to ${existingCT.name})` : ''}
                                </option>
                              );
                            })}
                        {formData.classTeacherClassId &&
                          availableSections.filter((s) => (s.classId?._id || s.classId) === formData.classTeacherClassId).length === 0 && (
                            <option value="" disabled>No sections configured for this class</option>
                          )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Subjects Mapping */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-textMain">Assigned Teaching Subjects</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface rounded-xl border border-almond/40 max-h-28 overflow-y-auto">
                  {availableSubjects.map((sub) => {
                    const isChecked = formData.assignedSubjectIds.includes(sub._id);
                    return (
                      <button
                        key={sub._id}
                        type="button"
                        onClick={() => toggleArraySelection('assignedSubjectIds', sub._id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isChecked ? 'bg-chestnut text-white' : 'bg-white border border-almond/40 text-textMuted'
                        }`}
                      >
                        {sub.name} ({sub.code})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-chestnut hover:bg-darkBrown text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TEACHER DETAILS MODAL */}
      {isDetailModalOpen && teacherDetailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-almond/50 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-almond/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-chestnut text-white font-bold text-base flex items-center justify-center">
                  {teacherDetailData.teacher.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-darkBrown">{teacherDetailData.teacher.name}</h3>
                  <span className="text-xs font-mono text-chestnut font-bold">EMP ID: {teacherDetailData.teacher.employeeId}</span>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface rounded-2xl border border-almond/40">
                <div>
                  <span className="text-[10px] text-textMuted uppercase font-bold block">Department</span>
                  <span className="font-semibold text-darkBrown">{teacherDetailData.teacher.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-textMuted uppercase font-bold block">Designation</span>
                  <span className="font-semibold text-darkBrown">{teacherDetailData.teacher.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] text-textMuted uppercase font-bold block">Monthly Salary</span>
                  <span className="font-mono font-bold text-chestnut">₹{(teacherDetailData.teacher.monthlySalary || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-textMuted uppercase font-bold block">Class Teacher</span>
                  <span className="font-semibold text-success">{teacherDetailData.teacher.isClassTeacher ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {/* Salary History */}
              <div className="space-y-2">
                <span className="font-bold text-darkBrown block uppercase text-[11px] tracking-wider">Salary Payout History</span>
                {teacherDetailData.salaryHistory.length === 0 ? (
                  <div className="p-3 text-textMuted text-[11px] bg-surface rounded-xl">No salary records yet.</div>
                ) : (
                  <div className="space-y-1">
                    {teacherDetailData.salaryHistory.map((s) => (
                      <div key={s._id} className="p-2.5 bg-surface rounded-xl border border-almond/40 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-darkBrown">{s.month}</span>
                        <span>Base: ₹{s.baseSalary}</span>
                        <span>Net Payout: <strong className="font-mono text-chestnut">₹{s.netSalary}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold uppercase">{s.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE SALARY MODAL */}
      {isSalaryModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-almond/30">
              <h3 className="text-base font-bold text-darkBrown flex items-center gap-1.5">
                <DollarSign className="w-5 h-5 text-success" />
                <span>Issue Monthly Salary ({selectedTeacher.name})</span>
              </h3>
              <button onClick={() => setIsSalaryModalOpen(false)} className="p-1 rounded-lg text-textMuted hover:bg-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalarySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Salary Month (YYYY-MM) *</label>
                <input
                  type="month"
                  required
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-textMuted uppercase">Base Salary *</label>
                  <input
                    type="number"
                    required
                    value={salaryForm.baseSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, baseSalary: e.target.value })}
                    className="w-full px-2 py-1.5 bg-surface border border-almond/60 rounded-lg text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-textMuted uppercase">Allowances</label>
                  <input
                    type="number"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                    className="w-full px-2 py-1.5 bg-surface border border-almond/60 rounded-lg text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-textMuted uppercase">Deductions</label>
                  <input
                    type="number"
                    value={salaryForm.deductions}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                    className="w-full px-2 py-1.5 bg-surface border border-almond/60 rounded-lg text-xs font-mono focus:outline-none focus:border-chestnut"
                  />
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-almond/40 flex items-center justify-between text-xs">
                <span className="font-bold text-darkBrown">Computed Net Salary:</span>
                <span className="font-mono font-bold text-lg text-chestnut">
                  ₹{(Number(salaryForm.baseSalary || 0) + Number(salaryForm.allowances || 0) - Number(salaryForm.deductions || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-almond/30">
                <button
                  type="button"
                  onClick={() => setIsSalaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-success hover:bg-darkBrown text-white text-xs font-bold shadow-md transition-all"
                >
                  Save Salary Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Reset Password ({selectedTeacher.name})</h3>
            {formError && <div className="p-2 bg-danger/10 text-danger text-xs rounded-lg">{formError}</div>}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs font-mono focus:outline-none focus:border-chestnut"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-warning text-white text-xs font-bold shadow-sm">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Confirm Delete Teacher</h3>
            <p className="text-xs text-textMuted">
              Are you sure you want to delete <strong className="text-darkBrown">{deleteTargetTeacher.name}</strong> ({deleteTargetTeacher.employeeId})? This action will permanently remove their profile and login account.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteTargetTeacher(null)}
                className="px-4 py-2 rounded-xl border border-almond text-textMuted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeacher}
                className="px-5 py-2 rounded-xl bg-danger hover:bg-darkBrown text-white text-xs font-bold shadow-sm"
              >
                Yes, Delete Teacher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIAL DISPLAY MODAL */}
      <CredentialModal
        isOpen={Boolean(createdCredentials)}
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
    </div>
  );
};

export default TeacherManagementPage;
