import mongoose from 'mongoose';

const payrollAdjustmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    payrollRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayrollRecord',
      required: true,
      index: true,
    },
    adjustmentType: {
      type: String,
      enum: ['bonus', 'overtime', 'deduction', 'unpaidLeave'],
      required: true,
    },
    amountMinor: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PayrollAdjustment = mongoose.model('PayrollAdjustment', payrollAdjustmentSchema);
