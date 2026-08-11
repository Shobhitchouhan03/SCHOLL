import mongoose from 'mongoose';

const studentFeeAssignmentSchema = new mongoose.Schema(
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
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: true,
    },
    assignedAmount: {
      type: Number,
      required: true,
    },
    concessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeConcession',
    },
    customAdjustments: [
      {
        description: String,
        amount: Number,
      },
    ],
    assignmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
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

studentFeeAssignmentSchema.index(
  { schoolId: 1, academicSessionId: 1, studentId: 1, feeStructureId: 1 },
  { unique: true }
);

export const StudentFeeAssignment = mongoose.model('StudentFeeAssignment', studentFeeAssignmentSchema);
