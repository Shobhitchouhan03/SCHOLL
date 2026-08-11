import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
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
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Exam code is required'],
      uppercase: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ['unitTest', 'monthly', 'term', 'halfYearly', 'annual', 'practical', 'custom'],
      default: 'term',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    applicableClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
      },
    ],
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'ongoing', 'marksEntry', 'review', 'published', 'completed', 'archived'],
      default: 'draft',
      index: true,
    },
    resultPublishDate: {
      type: Date,
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

examSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });
examSchema.index({ schoolId: 1, academicSessionId: 1, status: 1 });

export const Exam = mongoose.model('Exam', examSchema);
