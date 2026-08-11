import mongoose from 'mongoose';

const libraryReservationSchema = new mongoose.Schema(
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
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryBook',
      required: true,
      index: true,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    queuePosition: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    fulfilledCopyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryBookCopy',
    },
  },
  {
    timestamps: true,
  }
);

libraryReservationSchema.index({ schoolId: 1, bookId: 1, status: 1, queuePosition: 1 });

export const LibraryReservation = mongoose.model('LibraryReservation', libraryReservationSchema);
