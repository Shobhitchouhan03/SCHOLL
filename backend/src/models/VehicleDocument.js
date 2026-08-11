import mongoose from 'mongoose';

const vehicleDocumentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportVehicle',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['rc', 'insurance', 'fitness', 'pollution', 'permit', 'taxReceipt', 'other'],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

vehicleDocumentSchema.index({ schoolId: 1, vehicleId: 1, documentType: 1 });

export const VehicleDocument = mongoose.model('VehicleDocument', vehicleDocumentSchema);
