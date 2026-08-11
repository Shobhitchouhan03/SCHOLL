import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    announcementType: {
      type: String,
      enum: ['general', 'academic', 'event', 'holiday', 'exam', 'fee', 'emergency'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'teachers', 'parents', 'students', 'class', 'section', 'individual'],
      required: true,
      default: 'all',
    },
    targetClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolClass',
      },
    ],
    targetSectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    channels: [
      {
        type: String,
        enum: ['inApp', 'email', 'sms', 'whatsapp', 'push'],
      },
    ],
    scheduledAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    attachmentUrls: [
      {
        type: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorRole: {
      type: String,
      enum: ['principal', 'teacher', 'superAdmin'],
      default: 'principal',
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ schoolId: 1, status: 1, publishedAt: -1 });

export const Announcement = mongoose.model('Announcement', announcementSchema);
