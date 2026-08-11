import mongoose from 'mongoose';

const libraryMemberSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
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
    membershipNumber: {
      type: String,
      required: [true, 'Membership number is required'],
      uppercase: true,
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    borrowingLimit: {
      type: Number,
      default: 3,
      min: 1,
    },
    currentIssuedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fineBalanceMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

libraryMemberSchema.index({ schoolId: 1, membershipNumber: 1 }, { unique: true });
libraryMemberSchema.index(
  { schoolId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { studentId: { $exists: true, $ne: null } } }
);
libraryMemberSchema.index(
  { schoolId: 1, teacherId: 1 },
  { unique: true, partialFilterExpression: { teacherId: { $exists: true, $ne: null } } }
);

export const LibraryMember = mongoose.model('LibraryMember', libraryMemberSchema);
