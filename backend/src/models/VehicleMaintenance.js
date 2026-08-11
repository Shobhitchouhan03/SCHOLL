import mongoose from 'mongoose';

const vehicleMaintenanceSchema = new mongoose.Schema(
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
    maintenanceType: {
      type: String,
      enum: ['scheduled', 'repair', 'inspection', 'tyre', 'battery', 'service', 'other'],
      default: 'service',
    },
    title: {
      type: String,
      required: [true, 'Maintenance title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    odometerReading: {
      type: Number,
      default: 0,
    },
    vendorName: {
      type: String,
      default: '',
      trim: true,
    },
    costMinor: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    nextServiceDate: {
      type: Date,
    },
    nextServiceOdometer: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'inProgress', 'completed', 'cancelled'],
      default: 'completed',
      index: true,
    },
    invoiceUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

vehicleMaintenanceSchema.index({ schoolId: 1, vehicleId: 1, serviceDate: -1 });

export const VehicleMaintenance = mongoose.model('VehicleMaintenance', vehicleMaintenanceSchema);
