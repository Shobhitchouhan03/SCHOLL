import mongoose from 'mongoose';

const feeConfigurationSchema = new mongoose.Schema(
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
    currency: {
      type: String,
      default: 'INR',
    },
    invoicePrefix: {
      type: String,
      default: 'INV-',
    },
    receiptPrefix: {
      type: String,
      default: 'RCT-',
    },
    paymentPrefix: {
      type: String,
      default: 'PAY-',
    },
    allowPartialPayment: {
      type: Boolean,
      default: true,
    },
    allowOverpayment: {
      type: Boolean,
      default: false,
    },
    lateFeeEnabled: {
      type: Boolean,
      default: true,
    },
    lateFeeType: {
      type: String,
      enum: ['fixed', 'percentage', 'perDay'],
      default: 'fixed',
    },
    lateFeeValue: {
      type: Number,
      default: 100,
    },
    gracePeriodDays: {
      type: Number,
      default: 7,
    },
    receiptFooter: {
      type: String,
      default: 'Thank you for your payment.',
    },
    bankInstructions: {
      type: String,
      default: 'School Main Account: HDFC Bank - A/C 50100000000000',
    },
    onlinePaymentEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

feeConfigurationSchema.index({ schoolId: 1, academicSessionId: 1 }, { unique: true });

export const FeeConfiguration = mongoose.model('FeeConfiguration', feeConfigurationSchema);
