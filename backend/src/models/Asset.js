import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    serialNumber: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchaseCostMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    warrantyExpiry: {
      type: Date,
    },
    depreciationRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance', 'damaged', 'disposed', 'written_off'],
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

assetSchema.index({ schoolId: 1, assetTag: 1 }, { unique: true });
assetSchema.index(
  { schoolId: 1, barcode: 1 },
  { unique: true, partialFilterExpression: { barcode: { $gt: '' } } }
);

export const Asset = mongoose.model('Asset', assetSchema);
