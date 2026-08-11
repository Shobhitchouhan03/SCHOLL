import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
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
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    subjectType: {
      type: String,
      enum: ['core', 'elective', 'language', 'activity', 'custom'],
      default: 'core',
    },
    applicableClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Subject code unique within school and session
subjectSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });
// Subject name unique within school and session
subjectSchema.index({ schoolId: 1, academicSessionId: 1, name: 1 }, { unique: true });

export const Subject = mongoose.model('Subject', subjectSchema);
