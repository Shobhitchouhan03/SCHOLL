import mongoose from 'mongoose';

const transportAssignmentSchema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    familyAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportRoute',
      required: true,
      index: true,
    },
    pickupStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportStop',
    },
    dropStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportStop',
    },
    assignmentType: {
      type: String,
      enum: ['pickup', 'drop', 'both'],
      default: 'both',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    monthlyFeeMinor: {
      type: Number,
      default: 0,
      min: 0,
    },
    feeStructureLinked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
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

transportAssignmentSchema.index({ schoolId: 1, studentId: 1, academicSessionId: 1, status: 1 });
transportAssignmentSchema.index({ schoolId: 1, routeId: 1, status: 1 });

export const TransportAssignment = mongoose.model('TransportAssignment', transportAssignmentSchema);
