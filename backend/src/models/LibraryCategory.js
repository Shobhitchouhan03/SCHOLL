import mongoose from 'mongoose';

const libraryCategorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LibraryCategory',
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

libraryCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const LibraryCategory = mongoose.model('LibraryCategory', libraryCategorySchema);
