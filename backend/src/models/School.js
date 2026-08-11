import mongoose from 'mongoose';

export const SUPPORTED_MODULES = [
  'Attendance',
  'Homework',
  'Results',
  'Fees',
  'Salary',
  'Recruitment',
  'Leave',
  'Parent Portal',
  'Teacher Management',
  'Student Management',
  'Transport',
  'Library',
  'Inventory',
];

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
    },
    schoolCode: {
      type: String,
      required: [true, 'School code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    schoolSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subdomain: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    customDomains: [
      {
        domain: { type: String, lowercase: true, trim: true, required: true },
        status: { type: String, enum: ['pending', 'verified', 'disabled'], default: 'pending' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    schoolType: {
      type: String,
      enum: ['playschool', 'kindergarten', 'primary', 'middle', 'secondary', 'senior-secondary', 'k12', 'custom'],
      default: 'k12',
    },
    shortName: {
      type: String,
      default: '',
      trim: true,
    },
    publicPortalEnabled: {
      type: Boolean,
      default: true,
    },
    portalTitle: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    primaryColor: {
      type: String,
      default: '#8B263E',
      trim: true,
    },
    secondaryColor: {
      type: String,
      default: '#D8A47F',
      trim: true,
    },
    bannerUrl: {
      type: String,
      default: '',
      trim: true,
    },
    letterheadUrl: {
      type: String,
      default: '',
      trim: true,
    },
    sealUrl: {
      type: String,
      default: '',
      trim: true,
    },
    principalName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    alternatePhone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    addressLine1: {
      type: String,
      default: '',
      trim: true,
    },
    addressLine2: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    principalSignatureUrl: {
      type: String,
      default: '',
      trim: true,
    },
    setupStatus: {
      type: String,
      enum: ['notStarted', 'inProgress', 'completed'],
      default: 'notStarted',
    },
    setupStep: {
      type: Number,
      default: 1,
    },
    setupCompletedAt: {
      type: Date,
    },
    subscription: {
      status: {
        type: String,
        enum: ['active', 'suspended', 'expired'],
        default: 'active',
      },
      plan: {
        type: String,
        default: 'Standard',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    },
    enabledModules: {
      type: [String],
      enum: SUPPORTED_MODULES,
      default: [
        'Attendance',
        'Homework',
        'Results',
        'Fees',
        'Parent Portal',
        'Teacher Management',
        'Student Management',
        'Transport',
        'Library',
        'Inventory',
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

schoolSchema.index({ subdomain: 1 }, { unique: true, sparse: true });
schoolSchema.index({ 'customDomains.domain': 1 }, { unique: true, sparse: true });

export const School = mongoose.model('School', schoolSchema);
