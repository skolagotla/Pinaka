/**
 * ═══════════════════════════════════════════════════════════════
 * BACKEND ROLE HELPERS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Server-side role checking utilities
 */

import { Role, isSuperAdmin, hasRole } from '@/lib/types/roles';

export type UserContext = {
  id: string;
  email: string;
  role?: Role | string;
  roles?: (Role | string)[];
  [key: string]: any;
};

/**
 * Require specific role(s) - throws error if not authorized
 */
export function requireRole(
  user: UserContext | null | undefined,
  allowedRoles: Role[]
): asserts user is UserContext & { role: Role } {
  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const userRole = user.role;
  
  if (!userRole) {
    throw new Error('Unauthorized: User role not found');
  }

  if (!hasRole(userRole, allowedRoles)) {
    throw new Error(`Forbidden: This action requires one of: ${allowedRoles.join(', ')}`);
  }
}

/**
 * Check if user has required role(s) - returns boolean
 */
export function checkRole(
  user: UserContext | null | undefined,
  allowedRoles: Role[]
): boolean {
  if (!user || !user.role) {
    return false;
  }

  return hasRole(user.role, allowedRoles);
}

/**
 * Require super admin role
 */
export function requireSuperAdmin(
  user: UserContext | null | undefined
): asserts user is UserContext & { role: 'super_admin' } {
  requireRole(user, ['super_admin']);
}

/**
 * Check if user is super admin
 */
export function isUserSuperAdmin(user: UserContext | null | undefined): boolean {
  return checkRole(user, ['super_admin']);
}

/**
 * Require admin role (super_admin or pmc_admin)
 */
export function requireAdmin(
  user: UserContext | null | undefined
): asserts user is UserContext & { role: Role } {
  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }

  const userRole = user.role;
  
  if (!userRole) {
    throw new Error('Unauthorized: User role not found');
  }

  if (userRole !== 'super_admin' && userRole !== 'pmc_admin') {
    throw new Error('Forbidden: This action requires admin role');
  }
}

/**
 * Get user role with fallback
 */
export function getUserRole(user: UserContext | null | undefined): Role | null {
  if (!user || !user.role) {
    return null;
  }
  return user.role as Role;
}

