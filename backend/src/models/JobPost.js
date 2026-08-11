import mongoose from 'mongoose';

const jobPostSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Academics',
      trim: true,
    },
    designation: {
      type: String,
      default: 'Teacher',
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '1-3 Years',
    },
    qualification: {
      type: String,
      default: 'Bachelor / Master Degree',
    },
    employmentType: {
      type: String,
      enum: ['fullTime', 'partTime', 'contract', 'temporary'],
      default: 'fullTime',
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

jobPostSchema.index({ schoolId: 1, status: 1 });

export const JobPost = mongoose.model('JobPost', jobPostSchema);
