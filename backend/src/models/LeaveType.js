import mongoose from 'mongoose';

const leaveTypeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    annualAllowance: {
      type: Number,
      required: true,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    carryForwardAllowed: {
      type: Boolean,
      default: false,
    },
    maximumCarryForward: {
      type: Number,
      default: 0,
    },
    requiresDocument: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

leaveTypeSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
