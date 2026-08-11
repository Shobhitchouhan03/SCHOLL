import mongoose from 'mongoose';

const gradeRangeSchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, uppercase: true },
    minimumPercentage: { type: Number, required: true },
    maximumPercentage: { type: Number, required: true },
    gradePoint: { type: Number, default: 0 },
    remark: { type: String, default: '' },
  },
  { _id: false }
);

const gradingSchemeSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      default: 'Standard 10-Point Grading Scale',
    },
    ranges: {
      type: [gradeRangeSchema],
      default: [
        { grade: 'A1', minimumPercentage: 91, maximumPercentage: 100, gradePoint: 10, remark: 'Outstanding' },
        { grade: 'A2', minimumPercentage: 81, maximumPercentage: 90, gradePoint: 9, remark: 'Excellent' },
        { grade: 'B1', minimumPercentage: 71, maximumPercentage: 80, gradePoint: 8, remark: 'Very Good' },
        { grade: 'B2', minimumPercentage: 61, maximumPercentage: 70, gradePoint: 7, remark: 'Good' },
        { grade: 'C1', minimumPercentage: 51, maximumPercentage: 60, gradePoint: 6, remark: 'Fair' },
        { grade: 'C2', minimumPercentage: 41, maximumPercentage: 50, gradePoint: 5, remark: 'Average' },
        { grade: 'D', minimumPercentage: 33, maximumPercentage: 40, gradePoint: 4, remark: 'Pass' },
        { grade: 'E', minimumPercentage: 0, maximumPercentage: 32, gradePoint: 0, remark: 'Needs Improvement' },
      ],
    },
    passingPercentage: {
      type: Number,
      default: 33,
    },
    isDefault: {
      type: Boolean,
      default: true,
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

gradingSchemeSchema.index({ schoolId: 1, academicSessionId: 1, isDefault: 1 });

export const GradingScheme = mongoose.model('GradingScheme', gradingSchemeSchema);
