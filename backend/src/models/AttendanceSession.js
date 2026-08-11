import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    attendanceDate: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'locked'],
      default: 'draft',
      index: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
    },
    leaveCount: {
      type: Number,
      default: 0,
    },
    holidayCount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
    lockedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound Unique Index: schoolId + academicSessionId + classId + sectionId + attendanceDate
attendanceSessionSchema.index(
  { schoolId: 1, academicSessionId: 1, classId: 1, sectionId: 1, attendanceDate: 1 },
  { unique: true }
);

export const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
