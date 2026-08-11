import mongoose from 'mongoose';

const transportRouteSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Route code is required'],
      uppercase: true,
      trim: true,
    },
    routeType: {
      type: String,
      enum: ['pickup', 'drop', 'both'],
      default: 'both',
    },
    startLocation: {
      type: String,
      default: '',
      trim: true,
    },
    endLocation: {
      type: String,
      default: 'School Campus',
      trim: true,
    },
    estimatedDistanceKm: {
      type: Number,
      default: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 0,
    },
    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportVehicle',
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportStaff',
    },
    assignedAttendantIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TransportStaff',
      },
    ],
    morningStartTime: {
      type: String,
      default: '07:00',
    },
    afternoonStartTime: {
      type: String,
      default: '14:00',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'suspended'],
      default: 'draft',
      index: true,
    },
    maximumStudents: {
      type: Number,
      default: 40,
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

transportRouteSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });
transportRouteSchema.index({ schoolId: 1, status: 1 });

export const TransportRoute = mongoose.model('TransportRoute', transportRouteSchema);
