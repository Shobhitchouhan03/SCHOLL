import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema(
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
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    sectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true,
      },
    ],
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Homework title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Homework description is required'],
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    assignedDate: {
      type: Date,
      required: [true, 'Assigned date is required'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'archived'],
      default: 'draft',
      index: true,
    },
    attachmentUrls: [
      {
        type: String,
        trim: true,
      },
    ],
    visibleToParents: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
    closedAt: {
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

homeworkSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, subjectId: 1 });
homeworkSchema.index({ schoolId: 1, dueDate: 1 });
homeworkSchema.index({ teacherId: 1, status: 1 });

export const Homework = mongoose.model('Homework', homeworkSchema);
