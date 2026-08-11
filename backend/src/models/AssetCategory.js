import mongoose from 'mongoose';

const assetCategorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset category name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Asset category code is required'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    depreciationRate: {
      type: Number,
      default: 0, // Annual percentage
      min: 0,
      max: 100,
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

assetCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const AssetCategory = mongoose.model('AssetCategory', assetCategorySchema);
