import mongoose from 'mongoose';

const studentAcademicEnrollmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    rollNumber: {
      type: Number,
      default: null,
    },
    admissionStatus: {
      type: String,
      default: 'enrolled',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'promoted', 'retained', 'transferred', 'completed'],
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

studentAcademicEnrollmentSchema.index({ schoolId: 1, studentId: 1, academicSessionId: 1 }, { unique: true });

export const StudentAcademicEnrollment = mongoose.model(
  'StudentAcademicEnrollment',
  studentAcademicEnrollmentSchema
);
