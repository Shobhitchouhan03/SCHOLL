import api from './api';

/**
 * Resolves school portal data dynamically based on the current window URL or explicit slug.
 * Prioritizes route param :schoolSlug, or current window.location.hostname via host resolution.
 */
export const resolveSchoolPortalData = async (explicitSlug = '') => {
  try {
    let url = '/public/school/resolve';
    if (explicitSlug && typeof explicitSlug === 'string' && explicitSlug.trim()) {
      url = `/public/school/${encodeURIComponent(explicitSlug.trim())}`;
    }

    const response = await api.get(url, {
      headers: {
        'X-Forwarded-Host': window.location.host,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Tenant portal resolution error:', error);
    throw error;
  }
};
