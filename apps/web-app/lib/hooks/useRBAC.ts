/**
 * RBAC Hook - Phase 7
 * 
 * React hook for RBAC permission checking
 * Integrates with the new RBAC system while maintaining compatibility
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { hasPermission, getUserScopes, canAccess } from '@/lib/rbac/permissions_v2';
import { ResourceCategory, PermissionAction } from '@/lib/rbac/permissions_v2';

interface UseRBACOptions {
  userId?: string;
  userType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface RBACPermissions {
  // Permission check function
  checkPermission: (
    resource: string,
    action: PermissionAction,
    category: ResourceCategory,
    scope?: {
      portfolioId?: string;
      propertyId?: string;
      unitId?: string;
      pmcId?: string;
      landlordId?: string;
    }
  ) => Promise<boolean>;
  
  // Access check function
  checkAccess: (resourceId: string, resourceType: string) => Promise<boolean>;
  
  // Get user scopes
  getScopes: () => Promise<any[]>;
  
  // Quick permission checks (cached)
  canCreate: (resource: string, category: ResourceCategory) => Promise<boolean>;
  canRead: (resource: string, category: ResourceCategory) => Promise<boolean>;
  canUpdate: (resource: string, category: ResourceCategory) => Promise<boolean>;
  canDelete: (resource: string, category: ResourceCategory) => Promise<boolean>;
  canApprove: (resource: string, category: ResourceCategory) => Promise<boolean>;
  
  // State
  loading: boolean;
  error: Error | null;
  scopes: any[];
}

export function useRBAC(
  user: { id: string; type: string } | null,
  options: UseRBACOptions = {}
): RBACPermissions {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [scopes, setScopes] = useState<any[]>([]);
  const [permissionCache, setPermissionCache] = useState<Map<string, boolean>>(new Map());

  const userId = user?.id || options.userId;
  const userType = user?.type || options.userType || 'tenant';

  // Load user scopes on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadScopes();
  }, [userId, userType]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh || !userId) return;

    const interval = setInterval(() => {
      loadScopes();
    }, options.refreshInterval || 60000); // Default 1 minute

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, userId]);

  const loadScopes = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userScopes = await getUserScopes(userId, userType);
      setScopes(userScopes);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading RBAC scopes:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = useCallback(
    async (
      resource: string,
      action: PermissionAction,
      category: ResourceCategory,
      scope?: {
        portfolioId?: string;
        propertyId?: string;
        unitId?: string;
        pmcId?: string;
        landlordId?: string;
      }
    ): Promise<boolean> => {
      if (!userId) return false;

      // Check cache first
      const cacheKey = `${userId}-${resource}-${action}-${category}-${JSON.stringify(scope)}`;
      if (permissionCache.has(cacheKey)) {
        return permissionCache.get(cacheKey)!;
      }

      try {
        const hasAccess = await hasPermission(
          userId,
          userType,
          resource,
          action,
          category,
          scope
        );

        // Cache result
        setPermissionCache((prev) => new Map(prev).set(cacheKey, hasAccess));
        return hasAccess;
      } catch (err) {
        console.error('Error checking permission:', err);
        return false;
      }
    },
    [userId, userType, permissionCache]
  );

  const checkAccess = useCallback(
    async (resourceId: string, resourceType: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        return await canAccess(userId, userType, resourceId, resourceType);
      } catch (err) {
        console.error('Error checking access:', err);
        return false;
      }
    },
    [userId, userType]
  );

  const getScopes = useCallback(async () => {
    if (!userId) return [];
    return await getUserScopes(userId, userType);
  }, [userId, userType]);

  // Quick permission helpers
  const canCreate = useCallback(
    async (resource: string, category: ResourceCategory) => {
      return checkPermission(resource, PermissionAction.CREATE, category);
    },
    [checkPermission]
  );

  const canRead = useCallback(
    async (resource: string, category: ResourceCategory) => {
      return checkPermission(resource, PermissionAction.READ, category);
    },
    [checkPermission]
  );

  const canUpdate = useCallback(
    async (resource: string, category: ResourceCategory) => {
      return checkPermission(resource, PermissionAction.UPDATE, category);
    },
    [checkPermission]
  );

  const canDelete = useCallback(
    async (resource: string, category: ResourceCategory) => {
      return checkPermission(resource, PermissionAction.DELETE, category);
    },
    [checkPermission]
  );

  const canApprove = useCallback(
    async (resource: string, category: ResourceCategory) => {
      return checkPermission(resource, PermissionAction.APPROVE, category);
    },
    [checkPermission]
  );

  return {
    checkPermission,
    checkAccess,
    getScopes,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove,
    loading,
    error,
    scopes,
  };
}

