import mongoose from 'mongoose';

const subjectRemarkSchema = new mongoose.Schema(
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
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      required: true,
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      default: null,
    },
    remark: {
      type: String,
      required: [true, 'Remark content is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectRemarkSchema.index(
  { schoolId: 1, studentId: 1, subjectId: 1, teacherId: 1 },
  { unique: true }
);

export const SubjectRemark = mongoose.model('SubjectRemark', subjectRemarkSchema);
