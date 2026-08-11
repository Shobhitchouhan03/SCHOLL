import { School } from '../models/School.js';
import { Notice } from '../models/Notice.js';
import { JobPost } from '../models/JobPost.js';
import { GalleryItem } from '../models/GalleryItem.js';
import { resolveTenantFromRequest } from '../services/tenantResolver.js';

// @desc    Get Public School Branding & Website Data by Host or Slug
// @route   GET /api/public/school/resolve
// @route   GET /api/public/school/:schoolSlug
// @access  Public
export const getPublicSchoolBySlug = async (req, res) => {
  try {
    let school = await resolveTenantFromRequest(req);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School portal not found for the requested address or domain.',
      });
    }

    if (!school.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This school account is currently inactive.',
      });
    }

    if (school.publicPortalEnabled === false) {
      return res.status(403).json({
        success: false,
        message: 'The public website portal for this school is currently disabled.',
      });
    }

    const schoolId = school._id;

    // Fetch public notices
    const notices = await Notice.find({
      schoolId,
      status: 'published',
      $or: [{ targetAudience: 'all' }, { targetAudience: 'public' }, { isPublic: true }],
    })
      .sort({ publishDate: -1 })
      .limit(6);

    // Fetch active job posts
    const jobs = await JobPost.find({ schoolId, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6);

    // Fetch public gallery items
    const gallery = await GalleryItem.find({ schoolId, visibility: 'public' })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(12);

    return res.status(200).json({
      success: true,
      school: {
        id: school._id,
        name: school.name,
        shortName: school.shortName || '',
        schoolCode: school.schoolCode,
        schoolSlug: school.schoolSlug,
        subdomain: school.subdomain || '',
        customDomains: school.customDomains || [],
        schoolType: school.schoolType || 'k12',
        logoUrl: school.logoUrl || '',
        bannerUrl: school.bannerUrl || '',
        letterheadUrl: school.letterheadUrl || '',
        tagline: school.tagline || '',
        principalName: school.principalName || '',
        sealUrl: school.sealUrl || '',
        portalTitle: school.portalTitle || `${school.name} Portal`,
        primaryColor: school.primaryColor || '#8B263E',
        secondaryColor: school.secondaryColor || '#D8A47F',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        website: school.website || '',
        publicPortalEnabled: school.publicPortalEnabled !== false,
        enabledModules: school.enabledModules || [],
      },
      notices,
      jobs,
      gallery,
    });
  } catch (error) {
    console.error('Get public school error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve school portal information.',
    });
  }
};
