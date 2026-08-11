import mongoose from 'mongoose';

const libraryIssueSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryMember',
      required: true,
      index: true,
    },
    memberType: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryBook',
      required: true,
    },
    bookCopyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryBookCopy',
      required: true,
    },
    issueNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedAt: {
      type: Date,
    },
    renewalCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue', 'lost', 'damaged'],
      default: 'issued',
      index: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    returnCondition: {
      type: String,
      enum: ['good', 'fair', 'poor', 'damaged'],
      default: 'good',
    },
    fineAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    fineStatus: {
      type: String,
      enum: ['none', 'pending', 'paid', 'waived'],
      default: 'none',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

libraryIssueSchema.index({ schoolId: 1, issueNumber: 1 }, { unique: true });
libraryIssueSchema.index({ schoolId: 1, memberId: 1, status: 1 });
libraryIssueSchema.index({ schoolId: 1, bookCopyId: 1, status: 1 });

export const LibraryIssue = mongoose.model('LibraryIssue', libraryIssueSchema);
