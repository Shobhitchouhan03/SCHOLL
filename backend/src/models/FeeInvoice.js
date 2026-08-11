import mongoose from 'mongoose';

const feeInvoiceSchema = new mongoose.Schema(
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
    feeAssignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFeeAssignment',
    },
    invoiceNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    concessionAmount: {
      type: Number,
      default: 0,
    },
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    lateFeeAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'partial', 'paid', 'overdue', 'cancelled', 'reversed'],
      default: 'issued',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feeInvoiceSchema.index({ schoolId: 1, invoiceNumber: 1 }, { unique: true });
feeInvoiceSchema.index({ schoolId: 1, studentId: 1, academicSessionId: 1 });
feeInvoiceSchema.index({ schoolId: 1, status: 1, dueDate: 1 });

export const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);
