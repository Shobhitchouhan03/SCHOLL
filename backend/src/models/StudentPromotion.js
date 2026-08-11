import mongoose from 'mongoose';

const studentPromotionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    fromAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    toAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    fromClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
    },
    fromSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    toClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
    },
    toSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    finalResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Result',
    },
    promotionDecision: {
      type: String,
      enum: ['promoted', 'retained', 'compartment', 'graduated', 'transferred'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    previousRollNumber: {
      type: Number,
    },
    newRollNumber: {
      type: Number,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    decidedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

studentPromotionSchema.index({ schoolId: 1, studentId: 1, toAcademicSessionId: 1 }, { unique: true });

export const StudentPromotion = mongoose.model('StudentPromotion', studentPromotionSchema);
