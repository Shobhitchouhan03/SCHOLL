import { JobPost } from '../models/JobPost.js';
import { JobApplication } from '../models/JobApplication.js';
import { School } from '../models/School.js';
import { AuditLog } from '../models/AuditLog.js';

const getTenantSchoolId = (req) => req.tenantSchoolId || req.user?.schoolId;

// ==========================================
// PRINCIPAL RECRUITMENT CONTROLLERS
// ==========================================

export const createJobPost = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { title, department, designation, description, requirements, experience, qualification, employmentType, openings, applicationDeadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Job title and description are required.' });
    }

    const jobPost = await JobPost.create({
      schoolId,
      title: title.trim(),
      department: (department || 'Academics').trim(),
      designation: (designation || 'Teacher').trim(),
      description: description.trim(),
      requirements: requirements || '',
      experience: experience || '1-3 Years',
      qualification: qualification || 'Graduate / Postgraduate',
      employmentType: employmentType || 'fullTime',
      openings: Number(openings || 1),
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      status: 'draft',
    });

    return res.status(201).json({ success: true, message: 'Job post created in draft mode.', jobPost });
  } catch (error) {
    console.error('Create job post error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create job post.' });
  }
};

export const updateJobPostStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid job status.' });
    }

    const jobPost = await JobPost.findOne({ _id: jobId, schoolId });
    if (!jobPost) return res.status(404).json({ success: false, message: 'Job post not found.' });

    jobPost.status = status;
    if (status === 'published') {
      jobPost.publishedBy = req.user._id;
    }
    await jobPost.save();

    await AuditLog.create({
      schoolId,
      actor: req.user._id,
      action: 'UPDATE_JOB_STATUS',
      entity: 'JobPost',
      description: `Updated status of job post "${jobPost.title}" to ${status}.`,
    });

    return res.status(200).json({ success: true, message: `Job post status updated to ${status}.`, jobPost });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job post status.' });
  }
};

export const getJobPosts = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const jobs = await JobPost.find({ schoolId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Get job posts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch job posts.' });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { jobId } = req.params;

    const applications = await JobApplication.find({ schoolId, jobPostId: jobId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch job applications.' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const schoolId = getTenantSchoolId(req);
    const { applicationId } = req.params;
    const { status, internalNotes } = req.body;

    const application = await JobApplication.findOne({ _id: applicationId, schoolId });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    if (status) application.status = status;
    if (internalNotes !== undefined) application.internalNotes = internalNotes;
    application.reviewedBy = req.user._id;

    await application.save();

    return res.status(200).json({ success: true, message: 'Application updated.', application });
  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
};

// ==========================================
// PUBLIC UNAUTHENTICATED RECRUITMENT CONTROLLERS
// ==========================================

export const getPublicSchoolJobs = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const school = await School.findOne({ schoolCode: schoolCode.toUpperCase() });
    if (!school) return res.status(404).json({ success: false, message: 'School not found.' });

    const jobs = await JobPost.find({ schoolId: school._id, status: 'published' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, schoolName: school.name, jobs });
  } catch (error) {
    console.error('Get public jobs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch public job posts.' });
  }
};

export const submitPublicJobApplication = async (req, res) => {
  try {
    const { schoolCode, jobId } = req.params;
    const { applicantName, email, phone, resumeUrl, coverLetter, experience, qualification } = req.body;

    if (!applicantName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Applicant name, email, and phone are required.' });
    }

    const school = await School.findOne({ schoolCode: schoolCode.toUpperCase() });
    if (!school) return res.status(404).json({ success: false, message: 'School not found.' });

    const jobPost = await JobPost.findOne({ _id: jobId, schoolId: school._id, status: 'published' });
    if (!jobPost) return res.status(404).json({ success: false, message: 'Job post is closed or unavailable.' });

    const application = await JobApplication.create({
      schoolId: school._id,
      jobPostId: jobPost._id,
      applicantName: applicantName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
      experience: experience || '',
      qualification: qualification || '',
      status: 'received',
    });

    return res.status(201).json({
      success: true,
      message: 'Your job application has been submitted successfully.',
      applicationId: application._id,
    });
  } catch (error) {
    console.error('Submit public job application error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit job application.' });
  }
};
