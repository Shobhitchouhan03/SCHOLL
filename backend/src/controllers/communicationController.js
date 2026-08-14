import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { NotificationTemplate } from '../models/NotificationTemplate.js';
import { MessageLog } from '../models/MessageLog.js';
import { Teacher } from '../models/Teacher.js';
import { AuditLog } from '../models/AuditLog.js';
import { NotificationDispatcherService } from '../services/NotificationDispatcherService.js';
import { resolveTeacherTeachingContext } from '../utils/teacherResolver.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// Default System Templates
const DEFAULT_TEMPLATES = [
  { eventKey: 'admission', name: 'Student Admission Confirmation', subject: 'Welcome to {{schoolName}}', bodyTemplate: 'Dear {{parentName}}, your child {{studentName}} has been successfully admitted to Class {{className}}.' },
  { eventKey: 'homework', name: 'Homework Publication Alert', subject: 'New Homework Assigned: {{subjectName}}', bodyTemplate: 'Homework for {{subjectName}} due on {{dueDate}} has been published: {{homeworkTitle}}.' },
  { eventKey: 'attendance', name: 'Absentee Attendance Alert', subject: 'Attendance Alert: {{studentName}} Absent', bodyTemplate: 'Dear {{parentName}}, {{studentName}} was marked Absent on {{date}}.' },
  { eventKey: 'feeReminder', name: 'Fee Due Date Reminder', subject: 'School Fee Payment Reminder', bodyTemplate: 'Dear {{parentName}}, fee invoice #{{invoiceNumber}} of ₹{{amount}} is due on {{dueDate}}.' },
  { eventKey: 'examSchedule', name: 'Examination Schedule Published', subject: 'Exam Date Sheet: {{examName}}', bodyTemplate: 'Schedule for {{examName}} starting {{startDate}} is now published.' },
  { eventKey: 'resultPublished', name: 'Report Card Result Published', subject: 'Exam Results Available: {{examName}}', bodyTemplate: 'Report card for {{studentName}} for {{examName}} is available on Parent Portal.' },
  { eventKey: 'leaveApproved', name: 'Leave Application Decision', subject: 'Leave Application {{status}}', bodyTemplate: 'Your leave request for {{days}} day(s) from {{startDate}} has been {{status}}.' },
  { eventKey: 'payrollGenerated', name: 'Monthly Payslip Notification', subject: 'Payslip Available: {{month}} {{year}}', bodyTemplate: 'Dear {{teacherName}}, your salary payslip for {{month}} {{year}} (Net: ₹{{netSalary}}) has been generated.' },
  { eventKey: 'generalNotice', name: 'General Circular Announcement', subject: 'School Announcement: {{title}}', bodyTemplate: '{{content}}' },
];

// ==========================================
// PRINCIPAL ANNOUNCEMENT CONTROLLERS
// ==========================================

export const createAnnouncement = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, content, announcementType, targetAudience, targetClassIds, targetSectionIds, targetUserIds, channels, scheduledAt, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const mode = status || 'published';

    const announcement = await Announcement.create({
      schoolId,
      title: title.trim(),
      content: content.trim(),
      announcementType: announcementType || 'general',
      status: mode,
      targetAudience: targetAudience || 'all',
      targetClassIds: Array.isArray(targetClassIds) ? targetClassIds : [],
      targetSectionIds: Array.isArray(targetSectionIds) ? targetSectionIds : [],
      targetUserIds: Array.isArray(targetUserIds) ? targetUserIds : [],
      channels: Array.isArray(channels) && channels.length > 0 ? channels : ['inApp'],
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      publishedAt: mode === 'published' ? new Date() : undefined,
      createdBy: req.user._id,
      authorRole: 'principal',
    });

    let dispatchResult = null;
    if (mode === 'published') {
      dispatchResult = await NotificationDispatcherService.dispatchAnnouncement(announcement._id);
    }

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'CREATE_ANNOUNCEMENT',
      entity: 'Announcement',
      description: `Created announcement "${announcement.title}" (${mode}).`,
    });

    return res.status(201).json({ success: true, message: `Announcement created (${mode}).`, announcement, dispatchResult });
  } catch (error) {
    console.error('Create announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

export const publishAnnouncement = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const announcement = await Announcement.findOne({ _id: id, schoolId });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });

    const dispatchResult = await NotificationDispatcherService.dispatchAnnouncement(announcement._id);

    return res.status(200).json({ success: true, message: 'Announcement published successfully.', announcement, dispatchResult });
  } catch (error) {
    console.error('Publish announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish announcement.' });
  }
};

export const archiveAnnouncement = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const announcement = await Announcement.findOne({ _id: id, schoolId });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });

    announcement.status = 'archived';
    await announcement.save();

    return res.status(200).json({ success: true, message: 'Announcement archived.', announcement });
  } catch (error) {
    console.error('Archive announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive announcement.' });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const announcements = await Announcement.find({ schoolId })
      .populate('targetClassIds', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
};

// ==========================================
// TEACHER CLASS ANNOUNCEMENT CONTROLLERS
// ==========================================

export const createTeacherClassAnnouncement = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, content, targetClassIds, targetSectionIds, channels } = req.body;

    if (!title || !content || !targetClassIds || targetClassIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Title, content, and target class are required.' });
    }

    // Verify teacher assigned classes security check
    const context = await resolveTeacherTeachingContext(req);
    if (!context) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const isAuthorized = targetClassIds.every((clsId) => {
      const secId = Array.isArray(targetSectionIds) && targetSectionIds.length > 0 ? targetSectionIds[0] : null;
      return context.canPublishSubjectAnnouncement(clsId, secId, req.body.subjectId || null);
    });

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Teachers can only send announcements to their assigned classes or subjects.',
      });
    }

    const announcement = await Announcement.create({
      schoolId,
      title: title.trim(),
      content: content.trim(),
      announcementType: 'academic',
      status: 'published',
      targetAudience: 'class',
      targetClassIds: targetClassIds,
      targetSectionIds: Array.isArray(targetSectionIds) ? targetSectionIds : [],
      channels: Array.isArray(channels) && channels.length > 0 ? channels : ['inApp'],
      publishedAt: new Date(),
      createdBy: req.user._id,
      authorRole: 'teacher',
    });

    const dispatchResult = await NotificationDispatcherService.dispatchAnnouncement(announcement._id);

    return res.status(201).json({ success: true, message: 'Class announcement published.', announcement, dispatchResult });
  } catch (error) {
    console.error('Create teacher announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create teacher announcement.' });
  }
};

export const getTeacherAnnouncements = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const announcements = await Announcement.find({ schoolId, createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('Get teacher announcements error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch teacher announcements.' });
  }
};

// ==========================================
// NOTIFICATION TEMPLATES CONTROLLERS
// ==========================================

export const getNotificationTemplates = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    let templates = await NotificationTemplate.find({ schoolId }).sort({ eventKey: 1 });

    if (templates.length === 0) {
      const docs = DEFAULT_TEMPLATES.map((t) => ({
        schoolId,
        eventKey: t.eventKey,
        name: t.name,
        subject: t.subject,
        bodyTemplate: t.bodyTemplate,
        channelsSupported: ['inApp', 'email', 'sms'],
        isActive: true,
      }));
      templates = await NotificationTemplate.insertMany(docs);
    }

    return res.status(200).json({ success: true, templates });
  } catch (error) {
    console.error('Get notification templates error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch templates.' });
  }
};

export const updateNotificationTemplate = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;
    const { subject, bodyTemplate, isActive, channelsSupported } = req.body;

    const template = await NotificationTemplate.findOne({ _id: id, schoolId });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found.' });

    if (subject) template.subject = subject.trim();
    if (bodyTemplate) template.bodyTemplate = bodyTemplate.trim();
    if (isActive !== undefined) template.isActive = Boolean(isActive);
    if (Array.isArray(channelsSupported)) template.channelsSupported = channelsSupported;

    await template.save();

    return res.status(200).json({ success: true, message: 'Template updated.', template });
  } catch (error) {
    console.error('Update template error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update template.' });
  }
};

// ==========================================
// REPORTS & LOGS CONTROLLERS
// ==========================================

export const getCommunicationReports = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    const [totalNotifications, readCount, failedCount, totalLogs, channelBreakdown] = await Promise.all([
      Notification.countDocuments({ schoolId }),
      Notification.countDocuments({ schoolId, status: 'read' }),
      MessageLog.countDocuments({ schoolId, status: 'failed' }),
      MessageLog.countDocuments({ schoolId }),
      MessageLog.aggregate([
        { $match: { schoolId } },
        { $group: { _id: '$channel', count: { $sum: 1 } } },
      ]),
    ]);

    const deliveryRate = totalLogs > 0 ? Math.round(((totalLogs - failedCount) / totalLogs) * 100) : 100;
    const readRate = totalNotifications > 0 ? Math.round((readCount / totalNotifications) * 100) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalSent: totalLogs,
        delivered: totalLogs - failedCount,
        failed: failedCount,
        readCount,
        deliveryRate,
        readRate,
        channelBreakdown,
      },
    });
  } catch (error) {
    console.error('Get communication reports error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch communication reports.' });
  }
};

export const getMessageLogs = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const logs = await MessageLog.find({ schoolId })
      .populate('recipientUserId', 'name role email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('Get message logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch message logs.' });
  }
};

// ==========================================
// USER IN-APP NOTIFICATIONS CONTROLLERS
// ==========================================

export const getUserNotifications = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const notifications = await Notification.find({ schoolId, recipientUserId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => n.status !== 'read').length;

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, schoolId, recipientUserId: req.user._id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });

    notification.status = 'read';
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({ success: true, message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notification read.' });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);

    await Notification.updateMany(
      { schoolId, recipientUserId: req.user._id, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications read.' });
  }
};
