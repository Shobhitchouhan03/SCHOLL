import mongoose from 'mongoose';

const subjectResultSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectName: { type: String, required: true },
    obtainedMarks: { type: Number, required: true },
    maximumMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, default: 'D' },
    passStatus: { type: String, enum: ['pass', 'fail', 'absent'], default: 'pass' },
    remark: { type: String, default: '' },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
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
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
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
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    subjectResults: [subjectResultSchema],
    totalObtainedMarks: {
      type: Number,
      required: true,
    },
    totalMaximumMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    overallGrade: {
      type: String,
      default: 'D',
    },
    resultStatus: {
      type: String,
      enum: ['pending', 'pass', 'fail', 'compartment', 'absent'],
      default: 'pending',
    },
    rank: {
      type: Number,
    },
    attendanceSummary: {
      presentDays: { type: Number, default: 0 },
      totalDays: { type: Number, default: 0 },
    },
    teacherRemark: {
      type: String,
      default: '',
    },
    principalRemark: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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

resultSchema.index({ schoolId: 1, examId: 1, studentId: 1 }, { unique: true });
resultSchema.index({ schoolId: 1, examId: 1, classId: 1, sectionId: 1 });
resultSchema.index({ schoolId: 1, studentId: 1, academicSessionId: 1 });

export const Result = mongoose.model('Result', resultSchema);
