import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    loginId: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Teacher name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    dob: {
      type: Date,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    qualification: {
      type: String,
      default: '',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      default: 'Teacher',
      trim: true,
    },
    teacherType: {
      type: String,
      enum: [
        'Class Teacher',
        'Subject Teacher',
        'Class & Subject Teacher',
        'Coordinator',
        'Librarian',
        'Transport Staff Viewer',
      ],
      default: 'Subject Teacher',
      index: true,
    },
    isClassTeacher: {
      type: Boolean,
      default: false,
      index: true,
    },
    classTeacherClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SchoolClass',
      default: null,
    },
    classTeacherSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    assignedClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
      },
    ],
    assignedSectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    assignedSubjectIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    monthlySalary: {
      type: Number,
      default: 0,
    },
    bloodGroup: {
      type: String,
      default: '',
      trim: true,
    },
    emergencyContact: {
      type: String,
      default: '',
      trim: true,
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    leaveBalance: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
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

// Compound Unique Index: schoolId + employeeId (employee ID unique per school)
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, isClassTeacher: 1 });

export const Teacher = mongoose.model('Teacher', teacherSchema);
