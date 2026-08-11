import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    jobPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['received', 'shortlisted', 'rejected', 'interviewed', 'selected'],
      default: 'received',
      index: true,
    },
    internalNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index({ schoolId: 1, jobPostId: 1, email: 1 });

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
