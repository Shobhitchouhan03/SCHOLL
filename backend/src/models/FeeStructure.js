import mongoose from 'mongoose';

const feeItemSchema = new mongoose.Schema(
  {
    feeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeCategory',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const installmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    feeItems: [feeItemSchema],
    lateFeeRule: { type: String, default: '' },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
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
      required: [true, 'Fee structure name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Fee structure code is required'],
      uppercase: true,
      trim: true,
    },
    applicableClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
      },
    ],
    applicableSectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    billingFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'halfYearly', 'annual', 'oneTime', 'custom'],
      default: 'annual',
    },
    installments: [installmentSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

feeStructureSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });
feeStructureSchema.index({ schoolId: 1, academicSessionId: 1, isActive: 1 });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
