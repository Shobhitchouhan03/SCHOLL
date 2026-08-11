import mongoose from 'mongoose';

const transportTripSchema = new mongoose.Schema(
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
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportVehicle',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportStaff',
      required: true,
    },
    attendantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportStaff',
      },
    ],
    tripDate: {
      type: Date,
      default: Date.now,
    },
    tripType: {
      type: String,
      enum: ['morningPickup', 'afternoonDrop', 'special'],
      default: 'morningPickup',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    startingOdometer: {
      type: Number,
      default: 0,
    },
    endingOdometer: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'started', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    studentCount: {
      type: Number,
      default: 0,
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

transportTripSchema.index({ schoolId: 1, routeId: 1, tripDate: -1 });

export const TransportTrip = mongoose.model('TransportTrip', transportTripSchema);
