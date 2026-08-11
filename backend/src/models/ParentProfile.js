import mongoose from 'mongoose';

const parentProfileSchema = new mongoose.Schema(
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
      required: true,
      unique: true,
      index: true,
    },
    familyCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    primaryGuardian: {
      name: { type: String, required: [true, 'Primary guardian name is required'], trim: true },
      relationship: { type: String, required: [true, 'Relationship is required'], default: 'Father', trim: true },
      phone: { type: String, required: [true, 'Primary guardian phone is required'], trim: true },
      whatsapp: { type: String, default: '', trim: true },
      email: { type: String, default: '', lowercase: true, trim: true },
      occupation: { type: String, default: '', trim: true },
      qualification: { type: String, default: '', trim: true },
    },
    secondaryGuardian: {
      name: { type: String, default: '', trim: true },
      relationship: { type: String, default: 'Mother', trim: true },
      phone: { type: String, default: '', trim: true },
      whatsapp: { type: String, default: '', trim: true },
      email: { type: String, default: '', lowercase: true, trim: true },
      occupation: { type: String, default: '', trim: true },
    },
    address: {
      line1: { type: String, default: '', trim: true },
      line2: { type: String, default: '', trim: true },
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      postalCode: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true },
    },
    linkedStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound Unique Index: schoolId + familyCode
parentProfileSchema.index({ schoolId: 1, familyCode: 1 }, { unique: true });
parentProfileSchema.index({ schoolId: 1, linkedStudentIds: 1 });

export const ParentProfile = mongoose.model('ParentProfile', parentProfileSchema);
