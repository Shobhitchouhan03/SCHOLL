import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema(
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
    familyAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: true,
      index: true,
    },
    paymentNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'bankTransfer', 'cheque', 'cardReference', 'onlineReference', 'other'],
      default: 'cash',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    chequeNumber: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['recorded', 'cleared', 'bounced', 'reversed'],
      default: 'recorded',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reversedAt: {
      type: Date,
    },
    reversalReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feePaymentSchema.index({ schoolId: 1, paymentNumber: 1 }, { unique: true });
feePaymentSchema.index({ schoolId: 1, invoiceId: 1 });
feePaymentSchema.index({ schoolId: 1, studentId: 1, paymentDate: 1 });

export const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
