import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    permanentStudentId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      uppercase: true,
      trim: true,
    },
    rollNumber: {
      type: Number,
      default: null,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      default: '',
      trim: true,
    },
    lastName: {
      type: String,
      default: '',
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
      default: 'male',
    },
    bloodGroup: {
      type: String,
      default: '',
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      default: '',
      trim: true,
    },
    nationality: {
      type: String,
      default: 'Indian',
      trim: true,
    },
    religion: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    house: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      line1: { type: String, default: '', trim: true },
      line2: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    previousSchool: {
      type: String,
      default: '',
      trim: true,
    },
    medicalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
    currentAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    currentClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    currentSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    parentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'transferred', 'archived', 'graduated'],
      default: 'active',
      index: true,
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

// Compound Unique Indexes
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, permanentStudentId: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, currentAcademicSessionId: 1, currentClassId: 1, currentSectionId: 1 });
studentSchema.index({ schoolId: 1, status: 1 });

export const Student = mongoose.model('Student', studentSchema);
