import mongoose from 'mongoose';

const allowanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amountMinor: { type: Number, required: true, min: 0 },
    taxable: { type: Boolean, default: true },
  },
  { _id: false }
);

const deductionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amountMinor: { type: Number, required: true, min: 0 },
    deductionType: { type: String, enum: ['tax', 'pf', 'esi', 'loan', 'other'], default: 'other' },
  },
  { _id: false }
);

const salaryStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveTo: {
      type: Date,
    },
    baseSalaryMinor: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative'],
    },
    allowances: [allowanceSchema],
    deductions: [deductionSchema],
    overtimeRateMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['active', 'superseded', 'archived'],
      default: 'active',
      index: true,
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

salaryStructureSchema.index({ schoolId: 1, teacherId: 1, status: 1 });

export const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);
