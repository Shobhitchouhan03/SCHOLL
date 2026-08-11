import mongoose from 'mongoose';

const gradeRangeSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, trim: true },
    minimumPercentage: { type: Number, required: true, min: 0, max: 100 },
    maximumPercentage: { type: Number, required: true, min: 0, max: 100 },
    remark: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const schoolConfigurationSchema = new mongoose.Schema(
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
    workingDays: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },
    schoolStartTime: {
      type: String,
      default: '08:00',
      trim: true,
    },
    schoolEndTime: {
      type: String,
      default: '14:30',
      trim: true,
    },
    attendanceClosingTime: {
      type: String,
      default: '09:00',
      trim: true,
    },
    minimumAttendancePercentage: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    gradingSystem: {
      type: [gradeRangeSchema],
      default: [
        { grade: 'A+', minimumPercentage: 90, maximumPercentage: 100, remark: 'Outstanding' },
        { grade: 'A', minimumPercentage: 80, maximumPercentage: 89.99, remark: 'Excellent' },
        { grade: 'B', minimumPercentage: 70, maximumPercentage: 79.99, remark: 'Very Good' },
        { grade: 'C', minimumPercentage: 60, maximumPercentage: 69.99, remark: 'Good' },
        { grade: 'D', minimumPercentage: 40, maximumPercentage: 59.99, remark: 'Satisfactory' },
        { grade: 'F', minimumPercentage: 0, maximumPercentage: 39.99, remark: 'Needs Improvement' },
      ],
    },
    examTerms: {
      type: [String],
      default: ['Term 1', 'Term 2', 'Final Exam'],
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
    },
    setupCompleted: {
      type: Boolean,
      default: false,
    },
    setupCompletedAt: {
      type: Date,
    },
    setupCompletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
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

// One active configuration per school and academic session
schoolConfigurationSchema.index({ schoolId: 1, academicSessionId: 1 }, { unique: true });

export const SchoolConfiguration = mongoose.model('SchoolConfiguration', schoolConfigurationSchema);
