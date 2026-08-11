import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['events', 'activities', 'infrastructure', 'achievements', 'general'],
      default: 'general',
    },
    eventDate: {
      type: Date,
      default: Date.now,
    },
    visibility: {
      type: String,
      enum: ['public', 'internal'],
      default: 'public',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

galleryItemSchema.index({ schoolId: 1, visibility: 1, sortOrder: 1 });

export const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);
