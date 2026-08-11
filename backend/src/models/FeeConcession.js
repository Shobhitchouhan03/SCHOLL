import mongoose from 'mongoose';

const feeConcessionSchema = new mongoose.Schema(
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
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    concessionType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    maximumAmount: {
      type: Number,
      default: 0,
    },
    applicableCategoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeCategory',
      },
    ],
    reasonRequired: {
      type: Boolean,
      default: true,
    },
    isActive: {
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

feeConcessionSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });

export const FeeConcession = mongoose.model('FeeConcession', feeConcessionSchema);
