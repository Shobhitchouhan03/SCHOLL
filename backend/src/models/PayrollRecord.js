import mongoose from 'mongoose';

const payrollRecordSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    payrollRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PayrollRun',
      required: true,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    salaryStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: true,
    },
    baseSalaryMinor: {
      type: Number,
      required: true,
    },
    allowancesMinor: {
      type: Number,
      default: 0,
    },
    deductionsMinor: {
      type: Number,
      default: 0,
    },
    leaveDeductionMinor: {
      type: Number,
      default: 0,
    },
    overtimeMinor: {
      type: Number,
      default: 0,
    },
    bonusMinor: {
      type: Number,
      default: 0,
    },
    grossSalaryMinor: {
      type: Number,
      required: true,
    },
    netSalaryMinor: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'held'],
      default: 'pending',
      index: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentReference: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    snapshot: {
      teacherName: { type: String, required: true },
      employeeId: { type: String, required: true },
      designation: { type: String, default: '' },
      department: { type: String, default: '' },
      monthName: { type: String, required: true },
      year: { type: Number, required: true },
      baseSalaryRupees: { type: Number, required: true },
      grossSalaryRupees: { type: Number, required: true },
      netSalaryRupees: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

payrollRecordSchema.index({ schoolId: 1, payrollRunId: 1, teacherId: 1 }, { unique: true });

export const PayrollRecord = mongoose.model('PayrollRecord', payrollRecordSchema);
