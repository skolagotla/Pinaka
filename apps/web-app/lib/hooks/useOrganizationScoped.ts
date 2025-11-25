/**
 * Organization-scoped hook utilities
 * Handles organization filtering for all roles including super_admin
 * Enhanced with role-specific scoping (PM assigned properties, Landlord owned, etc.)
 */
"use client";

import { useMemo } from 'react';
import { useV2Auth } from './useV2Auth';
import { useRolePermissions } from './useRolePermissions';

export interface ScopedOrgFilter {
  orgId?: string;
  propertyIds?: string[];
  unitIds?: string[];
  tenantIds?: string[];
  leaseIds?: string[];
  workOrderIds?: string[];
}

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
  return user.user?.organization_id || user.organization_id || undefined;
}

/**
 * Get comprehensive scoped filter based on user role
 * Returns orgId and optionally propertyIds, unitIds, etc. based on role
 * 
 * - SUPER_ADMIN: no filters (global access)
 * - PMC_ADMIN: orgId filter
 * - PM: orgId + assigned propertyIds (TODO: fetch from backend)
 * - LANDLORD: orgId + owned propertyIds (TODO: fetch from backend)
 * - TENANT: orgId + leaseIds (TODO: fetch from backend)
 * - VENDOR: orgId + assigned workOrderIds (TODO: fetch from backend)
 */
export function useScopedOrgFilter(overrides?: Partial<ScopedOrgFilter>): ScopedOrgFilter {
  const { user, hasRole } = useV2Auth();
  const { role } = useRolePermissions();
  
  return useMemo(() => {
    if (!user) {
      return overrides || {};
    }
    
    // SUPER_ADMIN: no filters
    if (hasRole('super_admin')) {
      return overrides || {};
    }
    
    const orgId = user.user?.organization_id || user.organization_id;
    
    // Base filter with organization
    const filter: ScopedOrgFilter = {
      orgId,
      ...overrides,
    };
    
    // Role-specific scoping
    // Note: For PM, LANDLORD, TENANT, VENDOR, we would need to fetch
    // assigned/owned resources from the backend. For now, we rely on
    // backend RBAC to handle this filtering.
    
    // PMC_ADMIN: just orgId
    if (role === 'pmc_admin') {
      return filter;
    }
    
    // PM: orgId + assigned properties (would need backend call)
    // LANDLORD: orgId + owned properties (would need backend call)
    // TENANT: orgId + their lease (would need backend call)
    // VENDOR: orgId + assigned work orders (would need backend call)
    
    // For now, return orgId filter - backend RBAC handles the rest
    return filter;
  }, [user, hasRole, role, overrides]);
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
  return !!(user.user?.organization_id || user.organization_id);
}

