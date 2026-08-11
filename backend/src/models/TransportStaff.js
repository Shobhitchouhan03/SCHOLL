import mongoose from 'mongoose';

const transportStaffSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Staff name is required'],
      trim: true,
    },
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      uppercase: true,
      trim: true,
    },
    staffType: {
      type: String,
      enum: ['driver', 'attendant', 'transportManager'],
      required: true,
      default: 'driver',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    licenceNumber: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    licenceType: {
      type: String,
      default: '',
      trim: true,
    },
    licenceExpiryDate: {
      type: Date,
    },
    policeVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'notRequired'],
      default: 'pending',
    },
    medicalFitnessExpiryDate: {
      type: Date,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    assignedVehicleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportVehicle',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
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

transportStaffSchema.index({ schoolId: 1, employeeCode: 1 }, { unique: true });
transportStaffSchema.index({ schoolId: 1, staffType: 1, status: 1 });

export const TransportStaff = mongoose.model('TransportStaff', transportStaffSchema);
