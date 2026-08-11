import mongoose from 'mongoose';

const transportVehicleSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      uppercase: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['bus', 'miniBus', 'van', 'car', 'other'],
      default: 'bus',
    },
    make: {
      type: String,
      default: '',
      trim: true,
    },
    model: {
      type: String,
      default: '',
      trim: true,
    },
    manufacturingYear: {
      type: Number,
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Seating capacity is required'],
      min: [1, 'Seating capacity must be positive'],
    },
    currentOdometer: {
      type: Number,
      default: 0,
      min: 0,
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'cng', 'electric', 'hybrid', 'other'],
      default: 'diesel',
    },
    chassisNumber: {
      type: String,
      default: '',
      trim: true,
    },
    engineNumber: {
      type: String,
      default: '',
      trim: true,
    },
    gpsDeviceId: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'retired'],
      default: 'active',
      index: true,
    },
    insuranceExpiryDate: {
      type: Date,
    },
    fitnessExpiryDate: {
      type: Date,
    },
    pollutionCertificateExpiryDate: {
      type: Date,
    },
    permitExpiryDate: {
      type: Date,
    },
    notes: {
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

transportVehicleSchema.index({ schoolId: 1, vehicleNumber: 1 }, { unique: true });
transportVehicleSchema.index({ schoolId: 1, registrationNumber: 1 }, { unique: true });
transportVehicleSchema.index({ schoolId: 1, status: 1 });

export const TransportVehicle = mongoose.model('TransportVehicle', transportVehicleSchema);
