import mongoose from 'mongoose';

const salaryRecordSchema = new mongoose.Schema(
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
    month: {
      type: String, // Format: YYYY-MM (e.g., 2026-07)
      required: [true, 'Salary month is required'],
      trim: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'processing'],
      default: 'paid',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: schoolId + teacherId + month
salaryRecordSchema.index({ schoolId: 1, teacherId: 1, month: 1 }, { unique: true });

export const SalaryRecord = mongoose.model('SalaryRecord', salaryRecordSchema);
