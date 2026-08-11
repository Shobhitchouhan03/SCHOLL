import mongoose from 'mongoose';

const transportStopSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportRoute',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Stop code is required'],
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    stopOrder: {
      type: Number,
      required: true,
      min: 1,
    },
    morningPickupTime: {
      type: String,
      default: '07:30',
    },
    afternoonDropTime: {
      type: String,
      default: '14:30',
    },
    distanceFromSchoolKm: {
      type: Number,
      default: 0,
    },
    monthlyFeeMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    landmark: {
      type: String,
      default: '',
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

transportStopSchema.index({ schoolId: 1, routeId: 1, code: 1 }, { unique: true });
transportStopSchema.index({ schoolId: 1, routeId: 1, stopOrder: 1 }, { unique: true });

export const TransportStop = mongoose.model('TransportStop', transportStopSchema);
