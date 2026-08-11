import mongoose from 'mongoose';

const studentMarksSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    examScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSchedule',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    theoryMarks: {
      type: Number,
      default: 0,
    },
    practicalMarks: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    maximumMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'returned', 'approved', 'locked'],
      default: 'draft',
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['present', 'absent', 'exempted'],
      default: 'present',
    },
    remark: {
      type: String,
      default: '',
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    returnReason: {
      type: String,
      default: '',
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

studentMarksSchema.index({ schoolId: 1, examId: 1, studentId: 1, subjectId: 1 }, { unique: true });
studentMarksSchema.index({ examScheduleId: 1, studentId: 1 });

export const StudentMarks = mongoose.model('StudentMarks', studentMarksSchema);
