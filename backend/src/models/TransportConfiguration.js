import mongoose from 'mongoose';

const transportConfigurationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
    },
    transportEnabled: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    routeFeeMode: {
      type: String,
      enum: ['stopBased', 'routeBased', 'custom'],
      default: 'stopBased',
    },
    capacityWarningPercentage: {
      type: Number,
      default: 90,
      min: 50,
      max: 100,
    },
    allowCapacityOverride: {
      type: Boolean,
      default: false,
    },
    requireAttendant: {
      type: Boolean,
      default: true,
    },
    gpsIntegrationEnabled: {
      type: Boolean,
      default: false,
    },
    gpsProvider: {
      type: String,
      default: 'none',
    },
    parentDriverPhoneVisible: {
      type: Boolean,
      default: true,
    },
    emergencyContact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    termsAndConditions: {
      type: String,
      default: 'Transport service is subject to vehicle availability, route adherence, and timely fee payment.',
    },
  },
  {
    timestamps: true,
  }
);

export const TransportConfiguration = mongoose.model('TransportConfiguration', transportConfigurationSchema);
