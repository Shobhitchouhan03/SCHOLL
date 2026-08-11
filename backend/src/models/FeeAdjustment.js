import mongoose from 'mongoose';

const feeAdjustmentSchema = new mongoose.Schema(
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
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: true,
      index: true,
    },
    adjustmentType: {
      type: String,
      enum: ['debit', 'credit', 'waiver', 'lateFee', 'reversal'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceEntityType: {
      type: String,
      default: '',
    },
    referenceEntityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

export const FeeAdjustment = mongoose.model('FeeAdjustment', feeAdjustmentSchema);
