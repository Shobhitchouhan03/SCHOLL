import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
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
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      default: 40,
      min: [1, 'Capacity must be positive'],
    },
    roomNumber: {
      type: String,
      default: '',
      trim: true,
    },
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

// Section name must be unique within a class and session
sectionSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model('Section', sectionSchema);
