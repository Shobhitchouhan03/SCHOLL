import mongoose from 'mongoose';

const libraryConfigurationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
    },
    studentBorrowingLimit: {
      type: Number,
      default: 3,
      min: 1,
    },
    teacherBorrowingLimit: {
      type: Number,
      default: 5,
      min: 1,
    },
    studentLoanDays: {
      type: Number,
      default: 14,
      min: 1,
    },
    teacherLoanDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    maxRenewals: {
      type: Number,
      default: 2,
      min: 0,
    },
    overdueFinePerDayMinor: {
      type: Number,
      default: 1000, // ₹10 per day default in minor units
      min: 0,
    },
    lostBookChargeMode: {
      type: String,
      enum: ['fixed', 'bookPrice', 'custom'],
      default: 'bookPrice',
    },
    lostBookFixedChargeMinor: {
      type: Number,
      default: 50000, // ₹500 fixed
      min: 0,
    },
    reservationEnabled: {
      type: Boolean,
      default: true,
    },
    barcodeEnabled: {
      type: Boolean,
      default: true,
    },
    fineIntegrationWithFees: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    termsAndConditions: {
      type: String,
      default: 'Books must be returned by the due date. Overdue fines accrue daily. Lost or damaged books will incur replacement charges.',
    },
  },
  {
    timestamps: true,
  }
);

export const LibraryConfiguration = mongoose.model('LibraryConfiguration', libraryConfigurationSchema);
