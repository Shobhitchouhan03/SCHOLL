import mongoose from 'mongoose';

const assetDisposalSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    disposalDate: {
      type: Date,
      default: Date.now,
    },
    disposalMethod: {
      type: String,
      enum: ['sale', 'scrap', 'donation', 'recycle', 'write_off'],
      default: 'scrap',
    },
    disposalAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    reason: {
      type: String,
      required: [true, 'Disposal reason is required'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const AssetDisposal = mongoose.model('AssetDisposal', assetDisposalSchema);
