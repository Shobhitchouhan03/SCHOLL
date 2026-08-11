import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { NotificationTemplate } from '../models/NotificationTemplate.js';
import { MessageLog } from '../models/MessageLog.js';
import { EmailQueue } from '../models/EmailQueue.js';
import { SmsQueue } from '../models/SmsQueue.js';

import { EmailService } from './emailService.js';
import { SmsService } from './smsService.js';
import { WhatsappService } from './whatsappService.js';
import { PushService } from './pushService.js';

export class NotificationDispatcherService {
  /**
   * Resolve target user list based on targetAudience, class, section, or individual IDs
   */
  static async resolveTargetUsers({ schoolId, targetAudience, targetClassIds = [], targetSectionIds = [], targetUserIds = [] }) {
    let query = { schoolId, isActive: true };

    switch (targetAudience) {
      case 'all':
        break;
      case 'teachers':
        query.role = 'teacher';
        break;
      case 'parents':
        query.role = 'parent';
        break;
      case 'students':
        query.role = 'student';
        break;
      case 'individual':
        if (targetUserIds.length > 0) {
          query._id = { $in: targetUserIds };
        }
        break;
      case 'class':
      case 'section': {
        // Resolve student & parent user IDs from class/section
        const studentQuery = { schoolId };
        if (targetClassIds.length > 0) studentQuery.classId = { $in: targetClassIds };
        if (targetSectionIds.length > 0) studentQuery.sectionId = { $in: targetSectionIds };

        const students = await Student.find(studentQuery);
        const userIds = [];
        students.forEach((s) => {
          if (s.userId) userIds.push(s.userId);
          if (s.parentUserId) userIds.push(s.parentUserId);
        });

        query._id = { $in: userIds };
        break;
      }
      default:
        break;
    }

    return await User.find(query).select('_id name email phone role');
  }

  /**
   * Dispatch Multi-Channel Announcement
   */
  static async dispatchAnnouncement(announcementId) {
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) throw new Error('Announcement not found.');

    const schoolId = announcement.schoolId;
    const channels = announcement.channels.length > 0 ? announcement.channels : ['inApp'];

    const targetUsers = await this.resolveTargetUsers({
      schoolId,
      targetAudience: announcement.targetAudience,
      targetClassIds: announcement.targetClassIds,
      targetSectionIds: announcement.targetSectionIds,
      targetUserIds: announcement.targetUserIds,
    });

    let dispatchedCount = 0;

    for (const recipient of targetUsers) {
      for (const channel of channels) {
        if (channel === 'inApp') {
          const notif = await Notification.create({
            schoolId,
            recipientUserId: recipient._id,
            announcementId: announcement._id,
            title: announcement.title,
            content: announcement.content,
            category: 'announcement',
            channel: 'inApp',
            status: 'delivered',
            sentAt: new Date(),
          });

          await MessageLog.create({
            schoolId,
            notificationId: notif._id,
            announcementId: announcement._id,
            recipientUserId: recipient._id,
            recipientContact: recipient.email || recipient.name,
            channel: 'inApp',
            subject: announcement.title,
            messageSnippet: announcement.content.substring(0, 100),
            status: 'delivered',
            providerMessageId: `inapp_${notif._id}`,
          });

          dispatchedCount++;
        } else if (channel === 'email' && recipient.email) {
          await EmailQueue.create({
            schoolId,
            to: recipient.email,
            subject: announcement.title,
            body: announcement.content,
            status: 'sent',
          });

          const res = await EmailService.sendEmail({
            to: recipient.email,
            subject: announcement.title,
            body: announcement.content,
          });

          await MessageLog.create({
            schoolId,
            announcementId: announcement._id,
            recipientUserId: recipient._id,
            recipientContact: recipient.email,
            channel: 'email',
            subject: announcement.title,
            messageSnippet: announcement.content.substring(0, 100),
            status: res.success ? 'delivered' : 'failed',
            providerMessageId: res.providerMessageId,
          });

          dispatchedCount++;
        } else if (channel === 'sms' && recipient.phone) {
          await SmsQueue.create({
            schoolId,
            phone: recipient.phone,
            message: `${announcement.title}: ${announcement.content}`,
            status: 'sent',
          });

          const res = await SmsService.sendSms({
            phone: recipient.phone,
            message: `${announcement.title}: ${announcement.content}`,
          });

          await MessageLog.create({
            schoolId,
            announcementId: announcement._id,
            recipientUserId: recipient._id,
            recipientContact: recipient.phone,
            channel: 'sms',
            subject: announcement.title,
            messageSnippet: announcement.content.substring(0, 100),
            status: res.success ? 'delivered' : 'failed',
            providerMessageId: res.providerMessageId,
          });

          dispatchedCount++;
        } else if (channel === 'whatsapp' && recipient.phone) {
          const res = await WhatsappService.sendWhatsapp({
            phone: recipient.phone,
            message: `*${announcement.title}*\n${announcement.content}`,
          });

          await MessageLog.create({
            schoolId,
            announcementId: announcement._id,
            recipientUserId: recipient._id,
            recipientContact: recipient.phone,
            channel: 'whatsapp',
            subject: announcement.title,
            messageSnippet: announcement.content.substring(0, 100),
            status: res.success ? 'delivered' : 'failed',
            providerMessageId: res.providerMessageId,
          });

          dispatchedCount++;
        } else if (channel === 'push') {
          const res = await PushService.sendPush({
            userId: recipient._id,
            title: announcement.title,
            body: announcement.content,
          });

          await MessageLog.create({
            schoolId,
            announcementId: announcement._id,
            recipientUserId: recipient._id,
            recipientContact: recipient.name,
            channel: 'push',
            subject: announcement.title,
            messageSnippet: announcement.content.substring(0, 100),
            status: res.success ? 'delivered' : 'failed',
            providerMessageId: res.providerMessageId,
          });

          dispatchedCount++;
        }
      }
    }

    announcement.status = 'published';
    announcement.publishedAt = new Date();
    await announcement.save();

    return { success: true, targetUserCount: targetUsers.length, dispatchedCount };
  }
}
