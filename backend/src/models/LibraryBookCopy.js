import mongoose from 'mongoose';

const libraryBookCopySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryBook',
      required: true,
      index: true,
    },
    accessionNumber: {
      type: String,
      required: [true, 'Accession number is required'],
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    shelfLocation: {
      type: String,
      default: '',
      trim: true,
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    acquisitionType: {
      type: String,
      enum: ['purchase', 'donation', 'transfer', 'other'],
      default: 'purchase',
    },
    purchasePriceMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    vendor: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'issued', 'reserved', 'lost', 'damaged', 'repair', 'withdrawn'],
      default: 'available',
      index: true,
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor', 'damaged'],
      default: 'good',
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

libraryBookCopySchema.index({ schoolId: 1, accessionNumber: 1 }, { unique: true });
libraryBookCopySchema.index(
  { schoolId: 1, barcode: 1 },
  { unique: true, partialFilterExpression: { barcode: { $gt: '' } } }
);

export const LibraryBookCopy = mongoose.model('LibraryBookCopy', libraryBookCopySchema);
