import mongoose from 'mongoose';

const consumableItemSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Consumable item name is required'],
      trim: true,
    },
    itemCode: {
      type: String,
      required: [true, 'Item code is required'],
      uppercase: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
    },
    unitOfMeasure: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageUnitPriceMinor: {
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

consumableItemSchema.index({ schoolId: 1, itemCode: 1 }, { unique: true });

export const ConsumableItem = mongoose.model('ConsumableItem', consumableItemSchema);
