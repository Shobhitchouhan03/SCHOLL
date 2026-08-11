import mongoose from 'mongoose';

const libraryFineSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryIssue',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryMember',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    fineType: {
      type: String,
      enum: ['overdue', 'lost', 'damaged', 'manual'],
      default: 'overdue',
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'cancelled'],
      default: 'pending',
      index: true,
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    waiverReason: {
      type: String,
      default: '',
    },
    paymentReference: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

libraryFineSchema.index({ schoolId: 1, memberId: 1, status: 1 });

export const LibraryFine = mongoose.model('LibraryFine', libraryFineSchema);
