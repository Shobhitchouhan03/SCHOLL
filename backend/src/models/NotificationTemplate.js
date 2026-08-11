import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    eventKey: {
      type: String,
      enum: [
        'admission',
        'homework',
        'attendance',
        'feeReminder',
        'examSchedule',
        'resultPublished',
        'leaveApproved',
        'payrollGenerated',
        'generalNotice',
      ],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    bodyTemplate: {
      type: String,
      required: true,
    },
    channelsSupported: [
      {
        type: String,
        enum: ['inApp', 'email', 'sms', 'whatsapp', 'push'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationTemplateSchema.index({ schoolId: 1, eventKey: 1 }, { unique: true });

export const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);
