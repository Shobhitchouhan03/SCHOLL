import mongoose from 'mongoose';

const assetMaintenanceSchema = new mongoose.Schema(
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
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    maintenanceType: {
      type: String,
      enum: ['preventive', 'corrective', 'calibration', 'repair'],
      default: 'preventive',
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    costMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
      index: true,
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

export const AssetMaintenance = mongoose.model('AssetMaintenance', assetMaintenanceSchema);
