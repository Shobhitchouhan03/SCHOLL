import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
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
    fuelDate: {
      type: Date,
      default: Date.now,
    },
    odometerReading: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: 0,
    },
    quantityLitres: {
      type: Number,
      required: [true, 'Fuel quantity in litres is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    amountMinor: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    pricePerLitreMinor: {
      type: Number,
      required: true,
      min: 0,
    },
    fuelStation: {
      type: String,
      default: '',
      trim: true,
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

fuelLogSchema.index({ schoolId: 1, vehicleId: 1, fuelDate: -1 });

export const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
