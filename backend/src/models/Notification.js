import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['admission', 'homework', 'attendance', 'feeReminder', 'examSchedule', 'resultPublished', 'leaveApproved', 'payrollGenerated', 'generalNotice', 'announcement'],
      default: 'generalNotice',
    },
    channel: {
      type: String,
      enum: ['inApp', 'email', 'sms', 'whatsapp', 'push'],
      default: 'inApp',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
      default: 'delivered',
      index: true,
    },
    readAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    failureReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ schoolId: 1, recipientUserId: 1, status: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
