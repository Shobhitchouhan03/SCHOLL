import { School } from '../models/School.js';

/**
 * Normalizes a raw Host or X-Forwarded-Host header value into a clean hostname.
 * Strips port numbers and converts to lowercase.
 */
export const normalizeHostname = (rawHost) => {
  if (!rawHost) return '';
  let host = String(rawHost).toLowerCase().trim();
  // Strip protocol if present
  if (host.startsWith('http://')) host = host.slice(7);
  if (host.startsWith('https://')) host = host.slice(9);
  // Strip port number (e.g. localhost:5173 -> localhost, school.com:8080 -> school.com)
  const portIndex = host.indexOf(':');
  if (portIndex !== -1) {
    host = host.substring(0, portIndex);
  }
  return host.trim();
};

/**
 * Validates domain format (Fully Qualified Domain Name or valid hostname).
 */
export const isValidDomainFormat = (domain) => {
  if (!domain || typeof domain !== 'string') return false;
  const clean = domain.toLowerCase().trim();
  if (clean.length < 3 || clean.length > 253) return false;
  if (clean === 'localhost' || clean.endsWith('.local')) return true;

  // Domain regex matching FQDN (e.g., school.com, sub.school.edu.in)
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(clean);
};

/**
 * Extracts subdomain from a hostname given a root domain.
 * e.g. extractSubdomain('little-stars.yourdomain.com', 'yourdomain.com') -> 'little-stars'
 */
export const extractSubdomain = (host, rootDomain) => {
  const cleanHost = normalizeHostname(host);
  const cleanRoot = normalizeHostname(rootDomain || process.env.ROOT_DOMAIN || 'localhost');

  if (!cleanHost || !cleanRoot || cleanHost === cleanRoot) return null;

  if (cleanHost.endsWith(`.${cleanRoot}`)) {
    const sub = cleanHost.slice(0, cleanHost.length - cleanRoot.length - 1);
    return sub.trim() || null;
  }
  return null;
};

/**
 * Tenant Resolver Abstraction: resolveTenantFromRequest(req)
 * Resolution Priority:
 * 1. Explicit schoolSlug route or query param
 * 2. Custom FQDN hostname match (customDomains.domain)
 * 3. Subdomain extraction (subdomain or schoolSlug match)
 * 4. Authenticated schoolId (req.tenantSchoolId or req.user.schoolId)
 * 5. Fallback -> null
 */
export const resolveTenantFromRequest = async (req) => {
  if (!req) return null;

  // 1. Explicit schoolSlug in route params or query params
  const explicitSlug = req.params?.schoolSlug || req.query?.schoolSlug;
  if (explicitSlug && typeof explicitSlug === 'string') {
    const formattedSlug = explicitSlug.toLowerCase().trim();
    const school = await School.findOne({ schoolSlug: formattedSlug, isActive: true });
    if (school) return school;
  }

  // Extract hostname from headers
  const rawHost = req.headers['x-forwarded-host'] || req.headers['host'] || req.hostname;
  const hostname = normalizeHostname(rawHost);
  const rootDomain = normalizeHostname(process.env.ROOT_DOMAIN || 'localhost');

  // Ignore platform default hostnames for custom domain lookup
  const isPlatformHost =
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === rootDomain;

  if (!isPlatformHost) {
    // 2. Custom FQDN Hostname Match (customDomains.domain)
    const schoolByCustomDomain = await School.findOne({
      'customDomains.domain': hostname,
      'customDomains.status': { $ne: 'disabled' },
      isActive: true,
    });
    if (schoolByCustomDomain) return schoolByCustomDomain;

    // 3. Subdomain Extraction
    const extractedSub = extractSubdomain(hostname, rootDomain);
    if (extractedSub) {
      const schoolBySubdomain = await School.findOne({
        $or: [{ subdomain: extractedSub }, { schoolSlug: extractedSub }],
        isActive: true,
      });
      if (schoolBySubdomain) return schoolBySubdomain;
    }
  }

  // 4. Authenticated Session schoolId
  const authSchoolId = req.tenantSchoolId || req.user?.schoolId;
  if (authSchoolId) {
    const schoolByAuth = await School.findOne({ _id: authSchoolId, isActive: true });
    if (schoolByAuth) return schoolByAuth;
  }

  // 5. Fallback -> No tenant
  return null;
};
