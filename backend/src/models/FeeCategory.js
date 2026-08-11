import mongoose from 'mongoose';

const feeCategorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    categoryType: {
      type: String,
      enum: [
        'tuition',
        'admission',
        'examination',
        'transport',
        'library',
        'activity',
        'laboratory',
        'hostel',
        'annual',
        'lateFee',
        'optional',
        'custom',
      ],
      default: 'tuition',
    },
    isRefundable: {
      type: Boolean,
      default: false,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    taxApplicable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

feeCategorySchema.index({ schoolId: 1, code: 1 }, { unique: true });
feeCategorySchema.index({ schoolId: 1, isActive: 1 });

export const FeeCategory = mongoose.model('FeeCategory', feeCategorySchema);
