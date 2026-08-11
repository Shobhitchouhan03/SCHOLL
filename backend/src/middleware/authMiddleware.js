import { authenticate, authorizeRoles, requireSuperAdmin, validateRequest } from './auth.js';

export const protect = authenticate;
export { authenticate, authorizeRoles, requireSuperAdmin, validateRequest };
