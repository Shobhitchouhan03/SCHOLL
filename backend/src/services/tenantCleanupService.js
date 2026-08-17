import mongoose from 'mongoose';
import { School } from '../models/School.js';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { StudentAcademicEnrollment } from '../models/StudentAcademicEnrollment.js';
import { StudentDocument } from '../models/StudentDocument.js';
import { StudentAttendance } from '../models/StudentAttendance.js';
import { AttendanceSession } from '../models/AttendanceSession.js';
import { StudentLeave } from '../models/StudentLeave.js';
import { StudentMarks } from '../models/StudentMarks.js';
import { StudentPromotion } from '../models/StudentPromotion.js';
import { StudentStatusHistory } from '../models/StudentStatusHistory.js';
import { StudentFeeAssignment } from '../models/StudentFeeAssignment.js';
import { AcademicSession } from '../models/AcademicSession.js';
import { SchoolClass } from '../models/SchoolClass.js';
import { Section } from '../models/Section.js';
import { Subject } from '../models/Subject.js';
import { SubjectAssignment } from '../models/SubjectAssignment.js';
import { SubjectRemark } from '../models/SubjectRemark.js';
import { Exam } from '../models/Exam.js';
import { ExamSchedule } from '../models/ExamSchedule.js';
import { GradingScheme } from '../models/GradingScheme.js';
import { Result } from '../models/Result.js';
import { Homework } from '../models/Homework.js';
import { FeeCategory } from '../models/FeeCategory.js';
import { FeeStructure } from '../models/FeeStructure.js';
import { FeeInvoice } from '../models/FeeInvoice.js';
import { FeeInvoiceItem } from '../models/FeeInvoiceItem.js';
import { FeePayment } from '../models/FeePayment.js';
import { FeeReceipt } from '../models/FeeReceipt.js';
import { FeeAdjustment } from '../models/FeeAdjustment.js';
import { FeeConcession } from '../models/FeeConcession.js';
import { FeeConfiguration } from '../models/FeeConfiguration.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { LeaveBalance } from '../models/LeaveBalance.js';
import { LeaveType } from '../models/LeaveType.js';
import { SalaryStructure } from '../models/SalaryStructure.js';
import { SalaryRecord } from '../models/SalaryRecord.js';
import { PayrollRun } from '../models/PayrollRun.js';
import { PayrollRecord } from '../models/PayrollRecord.js';
import { PayrollAdjustment } from '../models/PayrollAdjustment.js';
import { JobPost } from '../models/JobPost.js';
import { JobApplication } from '../models/JobApplication.js';
import { Announcement } from '../models/Announcement.js';
import { Notice } from '../models/Notice.js';
import { Notification } from '../models/Notification.js';
import { NotificationTemplate } from '../models/NotificationTemplate.js';
import { MessageLog } from '../models/MessageLog.js';
import { EmailQueue } from '../models/EmailQueue.js';
import { SmsQueue } from '../models/SmsQueue.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { SchoolConfiguration } from '../models/SchoolConfiguration.js';
import { Asset } from '../models/Asset.js';
import { AssetAssignment } from '../models/AssetAssignment.js';
import { AssetCategory } from '../models/AssetCategory.js';
import { AssetDisposal } from '../models/AssetDisposal.js';
import { AssetMaintenance } from '../models/AssetMaintenance.js';
import { ConsumableItem } from '../models/ConsumableItem.js';
import { StockTransaction } from '../models/StockTransaction.js';
import { Vendor } from '../models/Vendor.js';
import { LibraryBook } from '../models/LibraryBook.js';
import { LibraryBookCopy } from '../models/LibraryBookCopy.js';
import { LibraryCategory } from '../models/LibraryCategory.js';
import { LibraryConfiguration } from '../models/LibraryConfiguration.js';
import { LibraryFine } from '../models/LibraryFine.js';
import { LibraryIssue } from '../models/LibraryIssue.js';
import { LibraryMember } from '../models/LibraryMember.js';
import { LibraryReservation } from '../models/LibraryReservation.js';
import { TransportAssignment } from '../models/TransportAssignment.js';
import { TransportConfiguration } from '../models/TransportConfiguration.js';
import { TransportRoute } from '../models/TransportRoute.js';
import { TransportStaff } from '../models/TransportStaff.js';
import { TransportStop } from '../models/TransportStop.js';
import { TransportTrip } from '../models/TransportTrip.js';
import { TransportVehicle } from '../models/TransportVehicle.js';
import { VehicleDocument } from '../models/VehicleDocument.js';
import { VehicleMaintenance } from '../models/VehicleMaintenance.js';
import { FuelLog } from '../models/FuelLog.js';
import { AuditLog } from '../models/AuditLog.js';

// All 79 tenant-scoped models that store schoolId
export const TENANT_MODELS = [
  { name: 'users', model: User, deleteFilter: (ids) => ({ schoolId: { $in: ids }, role: { $ne: 'superAdmin' } }) },
  { name: 'teachers', model: Teacher },
  { name: 'students', model: Student },
  { name: 'families', model: ParentProfile },
  { name: 'enrollments', model: StudentAcademicEnrollment },
  { name: 'studentDocuments', model: StudentDocument },
  { name: 'studentAttendance', model: StudentAttendance },
  { name: 'attendanceSessions', model: AttendanceSession },
  { name: 'studentLeaves', model: StudentLeave },
  { name: 'studentMarks', model: StudentMarks },
  { name: 'studentPromotions', model: StudentPromotion },
  { name: 'studentStatusHistories', model: StudentStatusHistory },
  { name: 'studentFeeAssignments', model: StudentFeeAssignment },
  { name: 'academicSessions', model: AcademicSession },
  { name: 'classes', model: SchoolClass },
  { name: 'sections', model: Section },
  { name: 'subjects', model: Subject },
  { name: 'subjectAssignments', model: SubjectAssignment },
  { name: 'subjectRemarks', model: SubjectRemark },
  { name: 'exams', model: Exam },
  { name: 'examSchedules', model: ExamSchedule },
  { name: 'gradingSchemes', model: GradingScheme },
  { name: 'results', model: Result },
  { name: 'homework', model: Homework },
  { name: 'feeCategories', model: FeeCategory },
  { name: 'feeStructures', model: FeeStructure },
  { name: 'feeInvoices', model: FeeInvoice },
  { name: 'feeInvoiceItems', model: FeeInvoiceItem },
  { name: 'feePayments', model: FeePayment },
  { name: 'feeReceipts', model: FeeReceipt },
  { name: 'feeAdjustments', model: FeeAdjustment },
  { name: 'feeConcessions', model: FeeConcession },
  { name: 'feeConfigurations', model: FeeConfiguration },
  { name: 'leaveRequests', model: LeaveRequest },
  { name: 'leaveBalances', model: LeaveBalance },
  { name: 'leaveTypes', model: LeaveType },
  { name: 'salaryStructures', model: SalaryStructure },
  { name: 'salaryRecords', model: SalaryRecord },
  { name: 'payrollRuns', model: PayrollRun },
  { name: 'payrollRecords', model: PayrollRecord },
  { name: 'payrollAdjustments', model: PayrollAdjustment },
  { name: 'jobPosts', model: JobPost },
  { name: 'jobApplications', model: JobApplication },
  { name: 'announcements', model: Announcement },
  { name: 'notices', model: Notice },
  { name: 'notifications', model: Notification },
  { name: 'notificationTemplates', model: NotificationTemplate },
  { name: 'messageLogs', model: MessageLog },
  { name: 'emailQueues', model: EmailQueue },
  { name: 'smsQueues', model: SmsQueue },
  { name: 'galleryItems', model: GalleryItem },
  { name: 'schoolConfigurations', model: SchoolConfiguration },
  { name: 'assets', model: Asset },
  { name: 'assetAssignments', model: AssetAssignment },
  { name: 'assetCategories', model: AssetCategory },
  { name: 'assetDisposals', model: AssetDisposal },
  { name: 'assetMaintenances', model: AssetMaintenance },
  { name: 'consumableItems', model: ConsumableItem },
  { name: 'stockTransactions', model: StockTransaction },
  { name: 'vendors', model: Vendor },
  { name: 'libraryBooks', model: LibraryBook },
  { name: 'libraryBookCopies', model: LibraryBookCopy },
  { name: 'libraryCategories', model: LibraryCategory },
  { name: 'libraryConfigurations', model: LibraryConfiguration },
  { name: 'libraryFines', model: LibraryFine },
  { name: 'libraryIssues', model: LibraryIssue },
  { name: 'libraryMembers', model: LibraryMember },
  { name: 'libraryReservations', model: LibraryReservation },
  { name: 'transportAssignments', model: TransportAssignment },
  { name: 'transportConfigurations', model: TransportConfiguration },
  { name: 'transportRoutes', model: TransportRoute },
  { name: 'transportStaff', model: TransportStaff },
  { name: 'transportStops', model: TransportStop },
  { name: 'transportTrips', model: TransportTrip },
  { name: 'transportVehicles', model: TransportVehicle },
  { name: 'vehicleDocuments', model: VehicleDocument },
  { name: 'vehicleMaintenances', model: VehicleMaintenance },
  { name: 'fuelLogs', model: FuelLog },
  { name: 'auditLogs', model: AuditLog },
];

/**
 * Calculates dependent record counts across major domains for given school IDs.
 * @param {Array<string|mongoose.Types.ObjectId>} schoolIds
 * @returns {Promise<Object>} Structured dependent counts
 */
export const calculateDependentCounts = async (schoolIds) => {
  const ids = Array.isArray(schoolIds) ? schoolIds : [schoolIds];
  if (ids.length === 0) {
    return {
      users: 0,
      teachers: 0,
      students: 0,
      families: 0,
      enrollments: 0,
      documents: 0,
      attendance: 0,
      results: 0,
      fees: 0,
      hrStaff: 0,
      transport: 0,
      library: 0,
      assets: 0,
    };
  }

  const [
    users,
    teachers,
    students,
    families,
    enrollments,
    documents,
    attendance,
    results,
    feeInvoices,
    feePayments,
    leaveRequests,
    salaryRecords,
    transportAssignments,
    libraryIssues,
    assets,
  ] = await Promise.all([
    User.countDocuments({ schoolId: { $in: ids }, role: { $ne: 'superAdmin' } }),
    Teacher.countDocuments({ schoolId: { $in: ids } }),
    Student.countDocuments({ schoolId: { $in: ids } }),
    ParentProfile.countDocuments({ schoolId: { $in: ids } }),
    StudentAcademicEnrollment.countDocuments({ schoolId: { $in: ids } }),
    StudentDocument.countDocuments({ schoolId: { $in: ids } }),
    StudentAttendance.countDocuments({ schoolId: { $in: ids } }),
    Result.countDocuments({ schoolId: { $in: ids } }),
    FeeInvoice.countDocuments({ schoolId: { $in: ids } }),
    FeePayment.countDocuments({ schoolId: { $in: ids } }),
    LeaveRequest.countDocuments({ schoolId: { $in: ids } }),
    SalaryRecord.countDocuments({ schoolId: { $in: ids } }),
    TransportAssignment.countDocuments({ schoolId: { $in: ids } }),
    LibraryIssue.countDocuments({ schoolId: { $in: ids } }),
    Asset.countDocuments({ schoolId: { $in: ids } }),
  ]);

  return {
    users,
    teachers,
    students,
    families,
    enrollments,
    documents,
    attendance,
    results,
    fees: feeInvoices + feePayments,
    hrStaff: leaveRequests + salaryRecords,
    transport: transportAssignments,
    library: libraryIssues,
    assets,
  };
};

/**
 * Permanently deletes school(s) and all tenant-owned records across 79 collections.
 * Uses MongoDB transactions when supported, with sequential fallback.
 * @param {Array<string|mongoose.Types.ObjectId>} schoolIds
 * @param {Object} [actor] User who initiated the deletion
 * @returns {Promise<Object>} Execution summary with per-collection deleted counts
 */
export const cascadeDeleteSchoolTenantData = async (schoolIds, actor = null) => {
  const ids = (Array.isArray(schoolIds) ? schoolIds : [schoolIds])
    .filter(Boolean)
    .map((id) => (typeof id === 'string' ? id : id.toString()));

  if (ids.length === 0) {
    return {
      requested: 0,
      deleted: 0,
      failed: 0,
      schools: [],
      deletedCounts: {},
      totalDeletedRecords: 0,
    };
  }

  // Fetch target schools first to capture metadata
  const targetSchools = await School.find({ _id: { $in: ids } }).lean();
  const foundSchoolIds = targetSchools.map((s) => s._id.toString());
  const foundSchoolCodes = targetSchools.map((s) => s.schoolCode);

  if (foundSchoolIds.length === 0) {
    return {
      requested: ids.length,
      deleted: 0,
      failed: ids.length,
      schools: [],
      deletedCounts: {},
      totalDeletedRecords: 0,
    };
  }

  const deletedCounts = {};
  let totalDeletedRecords = 0;

  const runDeletion = async (session = null) => {
    const opts = session ? { session } : {};

    // 1. Delete all tenant records across all 79 models
    for (const item of TENANT_MODELS) {
      const filter = item.deleteFilter
        ? item.deleteFilter(foundSchoolIds)
        : { schoolId: { $in: foundSchoolIds } };

      const res = await item.model.deleteMany(filter, opts);
      const count = res?.deletedCount || 0;
      deletedCounts[item.name] = (deletedCounts[item.name] || 0) + count;
      totalDeletedRecords += count;
    }

    // 2. Delete the School records themselves
    const schoolRes = await School.deleteMany({ _id: { $in: foundSchoolIds } }, opts);
    deletedCounts.schools = schoolRes?.deletedCount || 0;
    totalDeletedRecords += deletedCounts.schools;
  };

  // Attempt transactional execution if connected to a replica set; otherwise sequential fallback
  let session = null;
  if (mongoose.connection.readyState === 1) {
    try {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        await runDeletion(session);
      });
    } catch (txError) {
      // If transactions are not supported on standalone mongod (e.g. unit tests or dev without replica set)
      // execute sequential idempotent deletion
      await runDeletion(null);
    } finally {
      if (session) {
        try {
          await session.endSession();
        } catch (e) {
          // Ignore session cleanup errors
        }
      }
    }
  } else {
    await runDeletion(null);
  }

  // Audit log for Super Admin permanent deletion
  if (actor && actor._id) {
    try {
      await AuditLog.create({
        actor: actor._id,
        action: 'PERMANENT_DELETE_SCHOOL',
        description: `Super Admin permanently deleted ${foundSchoolIds.length} school(s): ${foundSchoolCodes.join(', ')} and ${totalDeletedRecords} associated tenant records.`,
        entity: 'School',
      });
    } catch (e) {
      // Audit log non-critical failure
    }
  }

  return {
    requested: ids.length,
    deleted: foundSchoolIds.length,
    failed: ids.length - foundSchoolIds.length,
    schools: foundSchoolCodes,
    deletedCounts,
    totalDeletedRecords,
  };
};
