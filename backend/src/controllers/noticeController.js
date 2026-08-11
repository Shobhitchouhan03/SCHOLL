import { Notice } from '../models/Notice.js';
import { Teacher } from '../models/Teacher.js';
import { ParentProfile } from '../models/ParentProfile.js';
import { AuditLog } from '../models/AuditLog.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// PRINCIPAL NOTICE CONTROLLERS
// ==========================================

export const createNotice = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, content, noticeType, priority, targetRoles, targetClassIds, targetSectionIds, expiryDate, attachmentUrls } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Notice title and content are required.' });
    }

    const notice = await Notice.create({
      schoolId,
      title: title.trim(),
      content: content.trim(),
      noticeType: noticeType || 'general',
      priority: priority || 'normal',
      targetRoles: Array.isArray(targetRoles) && targetRoles.length > 0 ? targetRoles : ['all'],
      targetClassIds: Array.isArray(targetClassIds) ? targetClassIds : [],
      targetSectionIds: Array.isArray(targetSectionIds) ? targetSectionIds : [],
      publishDate: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      attachmentUrls: Array.isArray(attachmentUrls) ? attachmentUrls : [],
      status: 'published',
      createdBy: req.user._id,
      publishedBy: req.user._id,
    });

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'PUBLISH_NOTICE',
      entity: 'Notice',
      description: `Published notice "${notice.title}".`,
    });

    return res.status(201).json({ success: true, message: 'Notice published successfully.', notice });
  } catch (error) {
    console.error('Create notice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish notice.' });
  }
};

export const getPrincipalNotices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const notices = await Notice.find({ schoolId }).sort({ publishDate: -1 });
    return res.status(200).json({ success: true, notices });
  } catch (error) {
    console.error('Get principal notices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
};

export const archiveNotice = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { noticeId } = req.params;

    const notice = await Notice.findOne({ _id: noticeId, schoolId });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found.' });

    notice.status = 'archived';
    await notice.save();

    return res.status(200).json({ success: true, message: 'Notice archived.', notice });
  } catch (error) {
    console.error('Archive notice error:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive notice.' });
  }
};

// ==========================================
// TARGETED USER NOTICE CONTROLLERS
// ==========================================

export const getTeacherNotices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const now = new Date();

    const notices = await Notice.find({
      schoolId,
      status: 'published',
      targetRoles: { $in: ['all', 'teacher'] },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }],
    }).sort({ priority: -1, publishDate: -1 });

    return res.status(200).json({ success: true, notices });
  } catch (error) {
    console.error('Get teacher notices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
};

export const getParentNotices = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const now = new Date();

    const notices = await Notice.find({
      schoolId,
      status: 'published',
      targetRoles: { $in: ['all', 'parent'] },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }],
    }).sort({ priority: -1, publishDate: -1 });

    return res.status(200).json({ success: true, notices });
  } catch (error) {
    console.error('Get parent notices error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
};

// ==========================================
// TEACHER CLASS ANNOUNCEMENT CONTROLLERS
// ==========================================

export const createTeacherClassAnnouncement = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, content, targetClassId, targetSectionId, priority, expiryDate } = req.body;

    if (!title || !content || !targetClassId) {
      return res.status(400).json({ success: false, message: 'Title, content, and target class are required.' });
    }

    const notice = await Notice.create({
      schoolId,
      title: title.trim(),
      content: content.trim(),
      noticeType: 'class_announcement',
      priority: priority || 'normal',
      targetRoles: ['parent', 'student'],
      targetClassIds: [targetClassId],
      targetSectionIds: targetSectionId ? [targetSectionId] : [],
      publishDate: new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'published',
      createdBy: req.user._id,
      publishedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Class announcement published successfully for students & parents.',
      notice,
    });
  } catch (error) {
    console.error('Create class announcement error:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish class announcement.' });
  }
};

export const getTeacherCreatedAnnouncements = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const announcements = await Notice.find({
      schoolId,
      createdBy: req.user._id,
      noticeType: 'class_announcement',
    })
      .populate('targetClassIds', 'name')
      .populate('targetSectionIds', 'name')
      .sort({ publishDate: -1 });

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('Get teacher created announcements error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch class announcements.' });
  }
};
