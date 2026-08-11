import mongoose from 'mongoose';

const feeReceiptSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeePayment',
      required: true,
      index: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    familyAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    snapshot: {
      schoolName: { type: String, required: true },
      schoolCode: { type: String, required: true },
      studentName: { type: String, required: true },
      admissionNumber: { type: String, required: true },
      className: { type: String, default: '' },
      sectionName: { type: String, default: '' },
      paymentAmount: { type: Number, required: true },
      paymentMode: { type: String, required: true },
      paymentDate: { type: Date, required: true },
      invoiceNumber: { type: String, required: true },
      remainingBalance: { type: Number, required: true },
      isReversed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

feeReceiptSchema.index({ schoolId: 1, receiptNumber: 1 }, { unique: true });

export const FeeReceipt = mongoose.model('FeeReceipt', feeReceiptSchema);
