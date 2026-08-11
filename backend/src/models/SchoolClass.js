import mongoose from 'mongoose';

const schoolClassSchema = new mongoose.Schema(
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
      required: [true, 'Class name is required'],
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    numericOrder: {
      type: Number,
      required: true,
      default: 1,
    },
    category: {
      type: String,
      enum: ['prePrimary', 'primary', 'middle', 'secondary', 'seniorSecondary', 'custom'],
      default: 'primary',
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

// Class name must be unique within a school and academic session
schoolClassSchema.index({ schoolId: 1, academicSessionId: 1, name: 1 }, { unique: true });

export const SchoolClass = mongoose.model('SchoolClass', schoolClassSchema);
