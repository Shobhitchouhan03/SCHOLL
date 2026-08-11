import mongoose from 'mongoose';

const studentAttendanceSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    attendanceSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'leave', 'holiday'],
      required: true,
      default: 'present',
    },
    checkInTime: {
      type: String,
      default: '',
      trim: true,
    },
    checkOutTime: {
      type: String,
      default: '',
      trim: true,
    },
    remark: {
      type: String,
      default: '',
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: schoolId + studentId + attendanceDate (one status per student per date)
studentAttendanceSchema.index({ schoolId: 1, studentId: 1, attendanceDate: 1 }, { unique: true });
studentAttendanceSchema.index({ attendanceSessionId: 1, studentId: 1 });
studentAttendanceSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, sectionId: 1, attendanceDate: 1 });

export const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);
