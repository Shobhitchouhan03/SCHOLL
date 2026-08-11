import mongoose from 'mongoose';

const libraryBookSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    isbn10: {
      type: String,
      default: '',
      trim: true,
    },
    isbn13: {
      type: String,
      default: '',
      trim: true,
    },
    authorNames: [
      {
        type: String,
        trim: true,
      },
    ],
    publisher: {
      type: String,
      default: '',
      trim: true,
    },
    publicationYear: {
      type: Number,
    },
    edition: {
      type: String,
      default: '',
      trim: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryCategory',
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    description: {
      type: String,
      default: '',
    },
    coverImageUrl: {
      type: String,
      default: '',
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    totalCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    issuedCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    lostCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    damagedCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

libraryBookSchema.index({ schoolId: 1, title: 1 });
libraryBookSchema.index({ schoolId: 1, isbn13: 1 });
libraryBookSchema.index({ schoolId: 1, categoryId: 1 });

export const LibraryBook = mongoose.model('LibraryBook', libraryBookSchema);
