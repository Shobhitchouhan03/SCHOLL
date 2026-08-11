import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
    },
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientContact: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['inApp', 'email', 'sms', 'whatsapp', 'push'],
      required: true,
    },
    subject: {
      type: String,
      default: '',
    },
    messageSnippet: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'sent',
      index: true,
    },
    providerMessageId: {
      type: String,
      default: '',
    },
    failureReason: {
      type: String,
      default: '',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

messageLogSchema.index({ schoolId: 1, channel: 1, status: 1 });

export const MessageLog = mongoose.model('MessageLog', messageLogSchema);
