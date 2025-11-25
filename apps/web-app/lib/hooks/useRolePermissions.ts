/**
 * useRolePermissions Hook
 * 
 * Provides role-based permission checking for the frontend.
 * Uses the centralized RBAC config and integrates with v2 auth.
 */
import { useMemo } from 'react';
import { useV2Auth } from './useV2Auth';
import {
  ROLE_SCREENS,
  Role,
  Screen,
  Action,
  Resource,
  ScreenPermissions,
  canViewScreen,
  canPerformAction,
  getScreenPermissions,
  getScreensForRole,
} from '@/lib/rbac/rbacConfig';

export interface UseRolePermissionsReturn {
  // Current role
  role: Role | null;
  roles: Role[];
  
  // Screen access
  canViewScreen: (screen: Screen) => boolean;
  getScreens: () => Screen[];
  
  // Screen permissions
  getScreenPermissions: (screen: Screen) => ScreenPermissions | null;
  canCreateOnScreen: (screen: Screen) => boolean;
  canEditOnScreen: (screen: Screen) => boolean;
  canDeleteOnScreen: (screen: Screen) => boolean;
  canManageOnScreen: (screen: Screen) => boolean;
  
  // Resource permissions
  canPerform: (action: Action, resource: Resource, resourceOrgId?: string) => boolean;
  canCreate: (resource: Resource, resourceOrgId?: string) => boolean;
  canRead: (resource: Resource, resourceOrgId?: string) => boolean;
  canUpdate: (resource: Resource, resourceOrgId?: string) => boolean;
  canDelete: (resource: Resource, resourceOrgId?: string) => boolean;
  
  // Role checks
  isSuperAdmin: boolean;
  isPMCAdmin: boolean;
  isPM: boolean;
  isLandlord: boolean;
  isTenant: boolean;
  isVendor: boolean;
}

export function useRolePermissions(): UseRolePermissionsReturn {
  const { user, hasRole } = useV2Auth();
  
  // Determine primary role from user's roles
  const role = useMemo<Role | null>(() => {
    if (!user) return null;
    
    if (hasRole('super_admin')) return 'super_admin';
    if (hasRole('pmc_admin')) return 'pmc_admin';
    if (hasRole('pm')) return 'pm';
    if (hasRole('landlord')) return 'landlord';
    if (hasRole('tenant')) return 'tenant';
    if (hasRole('vendor')) return 'vendor';
    
    return null;
  }, [user, hasRole]);
  
  // Get all roles user has
  const roles = useMemo<Role[]>(() => {
    if (!user) return [];
    
    const userRoles: Role[] = [];
    if (hasRole('super_admin')) userRoles.push('super_admin');
    if (hasRole('pmc_admin')) userRoles.push('pmc_admin');
    if (hasRole('pm')) userRoles.push('pm');
    if (hasRole('landlord')) userRoles.push('landlord');
    if (hasRole('tenant')) userRoles.push('tenant');
    if (hasRole('vendor')) userRoles.push('vendor');
    
    return userRoles;
  }, [user, hasRole]);
  
  // Screen access helpers
  const canViewScreenFn = (screen: Screen): boolean => {
    return canViewScreen(role, screen);
  };
  
  const getScreensFn = (): Screen[] => {
    return getScreensForRole(role);
  };
  
  // Screen permissions helpers
  const getScreenPermissionsFn = (screen: Screen): ScreenPermissions | null => {
    return getScreenPermissions(role, screen);
  };
  
  const canCreateOnScreen = (screen: Screen): boolean => {
    const perms = getScreenPermissions(role, screen);
    return perms?.canCreate === true || perms?.canManage === true;
  };
  
  const canEditOnScreen = (screen: Screen): boolean => {
    const perms = getScreenPermissions(role, screen);
    return perms?.canEdit === true || perms?.canManage === true;
  };
  
  const canDeleteOnScreen = (screen: Screen): boolean => {
    const perms = getScreenPermissions(role, screen);
    return perms?.canDelete === true || perms?.canManage === true;
  };
  
  const canManageOnScreen = (screen: Screen): boolean => {
    const perms = getScreenPermissions(role, screen);
    return perms?.canManage === true;
  };
  
  // Resource permissions helpers
  // Note: resourceOrgId is for future org-scoping checks (currently handled by backend)
  const canPerformFn = (
    action: Action,
    resource: Resource,
    resourceOrgId?: string
  ): boolean => {
    // For now, just check the permission matrix
    // In the future, we could add org-scoping logic here
    return canPerformAction(role, action, resource);
  };
  
  const canCreate = (resource: Resource, resourceOrgId?: string): boolean => {
    return canPerformFn('CREATE', resource, resourceOrgId);
  };
  
  const canRead = (resource: Resource, resourceOrgId?: string): boolean => {
    return canPerformFn('READ', resource, resourceOrgId);
  };
  
  const canUpdate = (resource: Resource, resourceOrgId?: string): boolean => {
    return canPerformFn('UPDATE', resource, resourceOrgId);
  };
  
  const canDelete = (resource: Resource, resourceOrgId?: string): boolean => {
    return canPerformFn('DELETE', resource, resourceOrgId);
  };
  
  // Role check helpers
  const isSuperAdmin = role === 'super_admin';
  const isPMCAdmin = role === 'pmc_admin';
  const isPM = role === 'pm';
  const isLandlord = role === 'landlord';
  const isTenant = role === 'tenant';
  const isVendor = role === 'vendor';
  
  return {
    role,
    roles,
    canViewScreen: canViewScreenFn,
    getScreens: getScreensFn,
    getScreenPermissions: getScreenPermissionsFn,
    canCreateOnScreen,
    canEditOnScreen,
    canDeleteOnScreen,
    canManageOnScreen,
    canPerform: canPerformFn,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isSuperAdmin,
    isPMCAdmin,
    isPM,
    isLandlord,
    isTenant,
    isVendor,
  };
}

