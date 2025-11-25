/**
 * Organization-scoped hook utilities
 * Handles organization filtering for all roles including super_admin
 */
"use client";

import { useV2Auth } from './useV2Auth';

/**
 * Get the effective organization ID for queries
 * - SUPER_ADMIN: returns undefined (no filter, sees all)
 * - Other roles: returns user.organization_id
 */
export function useOrganizationId(): string | undefined {
  const { user, hasRole } = useV2Auth();
  
  if (!user) return undefined;
  
  // Super admin sees all data (no organization filter)
  if (hasRole('super_admin')) {
    return undefined;
  }
  
  // Other roles are scoped to their organization
  return user.user.organization_id || undefined;
}

/**
 * Check if user has access to query data
 * - Always true for authenticated users
 * - Can be extended with additional permission checks
 */
export function useHasDataAccess(): boolean {
  const { user, loading } = useV2Auth();
  return !loading && user !== null;
}

/**
 * Get query enablement based on user role and organization
 * - Super admin: enabled when authenticated (no org required)
 * - Other roles: enabled when authenticated AND has organization_id
 */
export function useQueryEnabled(): boolean {
  const { user, loading, hasRole } = useV2Auth();
  
  if (loading || !user) return false;
  
  // Super admin can query without organization
  if (hasRole('super_admin')) {
    return true;
  }
  
  // Other roles need an organization
  return !!user.user.organization_id;
}

