import mongoose from 'mongoose';

const examScheduleSchema = new mongoose.Schema(
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
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    sectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: {
      type: String,
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '12:00',
    },
    maximumMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: [1, 'Maximum marks must be at least 1'],
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
    },
    practicalMaximumMarks: {
      type: Number,
      default: 0,
    },
    practicalPassingMarks: {
      type: Number,
      default: 0,
    },
    roomNumber: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    assignedTeacherIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
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

examScheduleSchema.index({ schoolId: 1, examId: 1, classId: 1, subjectId: 1 }, { unique: true });
examScheduleSchema.index({ schoolId: 1, examId: 1, examDate: 1 });

export const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
