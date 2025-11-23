/**
 * ═══════════════════════════════════════════════════════════════
 * FRONTEND ROLE HELPERS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Client-side role checking utilities
 */

import { Role, isSuperAdmin, hasRole, getRoleDisplayName } from '@/lib/types/roles';

export type UserContext = {
  id: string;
  email: string;
  role?: Role | string;
  roles?: (Role | string)[];
  [key: string]: any;
};

/**
 * Check if user has required role(s)
 * Includes legacy role mapping for backward compatibility
 */
export function requireRole(
  user: UserContext | null | undefined,
  allowedRoles: Role[]
): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Map legacy roles to new roles for backward compatibility
  const roleMapping: Record<string, Role> = {
    'admin': 'super_admin',
    'SUPER_ADMIN': 'super_admin',
    'pmc': 'pmc_admin',
  };

  const normalizedRole = roleMapping[user.role as string] || user.role;
  
  return hasRole(normalizedRole, allowedRoles);
}

/**
 * Check if user is super admin
 */
export function isSuperAdminUser(user: UserContext | null | undefined): boolean {
  if (!user || !user.role) {
    return false;
  }
  return isSuperAdmin(user.role);
}

/**
 * Check if user has admin role (super_admin or pmc_admin)
 */
export function isAdminUser(user: UserContext | null | undefined): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role === 'super_admin' || user.role === 'pmc_admin';
}

/**
 * Get user role display name
 */
export function getUserRoleDisplayName(user: UserContext | null | undefined): string {
  if (!user || !user.role) {
    return 'Unknown';
  }
  return getRoleDisplayName(user.role);
}

/**
 * Check if user can access admin routes
 */
export function canAccessAdminRoutes(user: UserContext | null | undefined): boolean {
  return isSuperAdminUser(user);
}

/**
 * Check if user can access PMC routes
 */
export function canAccessPMCRoutes(user: UserContext | null | undefined): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role === 'super_admin' || user.role === 'pmc_admin' || user.role === 'pm';
}

/**
 * Check if user can access landlord routes
 */
export function canAccessLandlordRoutes(user: UserContext | null | undefined): boolean {
  if (!user || !user.role) {
    return false;
  }
  return user.role === 'super_admin' || user.role === 'landlord';
}

