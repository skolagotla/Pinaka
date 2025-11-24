/**
 * ═══════════════════════════════════════════════════════════════
 * ROLE SYSTEM - Unified Role Types
 * ═══════════════════════════════════════════════════════════════
 * 
 * This file defines the unified role system for the Pinaka platform.
 * All role checks should use these types for consistency.
 */

/**
 * Unified Role Type
 * 
 * This is the primary role type used throughout the application.
 * It replaces the previous generic "admin" flag with specific roles.
 */
export type Role = 
  | 'super_admin'    // Full system access (formerly "admin")
  | 'pmc_admin'      // PMC administrator
  | 'pm'             // Property Manager
  | 'landlord'       // Property owner
  | 'tenant'         // Tenant
  | 'vendor'         // Vendor/Service Provider
  | 'contractor';    // Contractor

/**
 * Role Display Names
 * Maps roles to user-friendly display names
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  super_admin: 'Platform Admin',
  pmc_admin: 'PMC Administrator',
  pm: 'Property Manager',
  landlord: 'Landlord',
  tenant: 'Tenant',
  vendor: 'Vendor',
  contractor: 'Contractor',
};

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: 'Full system access with all permissions',
  pmc_admin: 'Property Management Company administrator',
  pm: 'Property Manager with property-level access',
  landlord: 'Property owner with landlord-level access',
  tenant: 'Tenant with tenant-level access',
  vendor: 'Vendor/Service Provider',
  contractor: 'Contractor',
};

/**
 * Check if a role has super admin privileges
 */
export function isSuperAdmin(role: string | Role | null | undefined): boolean {
  return role === 'super_admin';
}

/**
 * Check if a role has admin-level privileges (super_admin or pmc_admin)
 */
export function isAdminRole(role: string | Role | null | undefined): boolean {
  return role === 'super_admin' || role === 'pmc_admin';
}

/**
 * Check if a role has PMC-level privileges
 */
export function isPMCRole(role: string | Role | null | undefined): boolean {
  return role === 'pmc_admin' || role === 'pm';
}

/**
 * Check if a role has property management privileges
 */
export function hasPropertyManagementAccess(role: string | Role | null | undefined): boolean {
  return role === 'super_admin' || role === 'pmc_admin' || role === 'pm' || role === 'landlord';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string | Role | null | undefined): string {
  if (!role) return 'Unknown';
  return ROLE_DISPLAY_NAMES[role as Role] || role;
}

/**
 * Check if user has any of the allowed roles
 */
export function hasRole(userRole: string | Role | null | undefined, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

/**
 * Check if user has all required roles (for multi-role scenarios)
 */
export function hasAllRoles(userRoles: (string | Role)[], requiredRoles: Role[]): boolean {
  return requiredRoles.every(role => userRoles.includes(role));
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRoles: (string | Role)[], allowedRoles: Role[]): boolean {
  return allowedRoles.some(role => userRoles.includes(role));
}

