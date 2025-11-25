/**
 * Central RBAC Configuration for Pinaka v2 Frontend
 * 
 * Defines role-based screen access, permissions, and allowed actions.
 * This is the single source of truth for frontend access control.
 */

export type Role = 
  | 'super_admin'
  | 'pmc_admin'
  | 'pm'
  | 'landlord'
  | 'tenant'
  | 'vendor';

export type Screen = 
  | '/portfolio'
  | '/portfolio/dashboard'
  | '/portfolio/overview'
  | '/portfolio/administrators'
  | '/portfolio/pmcs'
  | '/portfolio/properties'
  | '/portfolio/units'
  | '/portfolio/landlords'
  | '/portfolio/tenants'
  | '/portfolio/leases'
  | '/portfolio/vendors'
  | '/platform'
  | '/platform/dashboard'
  | '/platform/organizations'
  | '/platform/users'
  | '/platform/rbac'
  | '/platform/audit-logs'
  | '/platform/verifications'
  | '/platform/system'
  | '/platform/security'
  | '/platform/settings'
  | '/work-orders-v2'
  | '/messages'
  | '/reports'
  | '/settings';

export type Action = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'MANAGE';

export type Resource = 
  | 'organization'
  | 'user'
  | 'property'
  | 'unit'
  | 'landlord'
  | 'tenant'
  | 'lease'
  | 'vendor'
  | 'work_order'
  | 'attachment'
  | 'message'
  | 'notification'
  | 'audit_log'
  | 'task'
  | 'conversation'
  | 'invitation'
  | 'form'
  | 'rent_payment'
  | 'expense'
  | 'inspection';

export interface ScreenPermissions {
  canView: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canManage?: boolean;
}

export interface RoleScreenConfig {
  screens: Screen[];
  screenPermissions: Partial<Record<Screen, ScreenPermissions>>;
  resourcePermissions: Partial<Record<Resource, Action[]>>;
}

/**
 * ROLE_SCREENS: Maps each role to allowed screens and permissions
 */
export const ROLE_SCREENS: Record<Role, RoleScreenConfig> = {
  super_admin: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/portfolio/overview',
      '/portfolio/administrators',
      '/portfolio/pmcs',
      '/portfolio/properties',
      '/portfolio/units',
      '/portfolio/landlords',
      '/portfolio/tenants',
      '/portfolio/leases',
      '/portfolio/vendors',
      '/platform',
      '/platform/dashboard',
      '/platform/organizations',
      '/platform/users',
      '/platform/rbac',
      '/platform/audit-logs',
      '/platform/verifications',
      '/platform/system',
      '/platform/security',
      '/platform/settings',
      '/work-orders-v2',
      '/messages',
      '/reports',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/dashboard': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/overview': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/administrators': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/pmcs': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/properties': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/units': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/landlords': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/tenants': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/leases': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/portfolio/vendors': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/dashboard': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/organizations': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/users': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/rbac': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/audit-logs': { canView: true },
      '/platform/verifications': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/system': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/security': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/platform/settings': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/work-orders-v2': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/messages': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/reports': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
      '/settings': { canView: true, canCreate: true, canEdit: true, canDelete: true, canManage: true },
    },
    resourcePermissions: {
      organization: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      user: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      property: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      unit: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      landlord: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      tenant: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      lease: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      vendor: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      work_order: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      attachment: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      message: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      notification: ['READ', 'UPDATE'],
      audit_log: ['READ'],
      task: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      conversation: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      invitation: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      form: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      rent_payment: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      expense: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
      inspection: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'],
    },
  },

  pmc_admin: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/portfolio/overview',
      '/portfolio/properties',
      '/portfolio/units',
      '/portfolio/landlords',
      '/portfolio/tenants',
      '/portfolio/leases',
      '/portfolio/vendors',
      '/work-orders-v2',
      '/messages',
      '/reports',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/dashboard': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/overview': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/properties': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/units': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/landlords': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/tenants': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/leases': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/portfolio/vendors': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/work-orders-v2': { canView: true, canCreate: true, canEdit: true, canDelete: true },
      '/messages': { canView: true, canCreate: true, canEdit: true },
      '/reports': { canView: true },
      '/settings': { canView: true, canEdit: true },
    },
    resourcePermissions: {
      organization: ['READ', 'UPDATE'],
      user: ['CREATE', 'READ', 'UPDATE'],
      property: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      unit: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      landlord: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      tenant: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      lease: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      vendor: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      work_order: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      attachment: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      message: ['CREATE', 'READ', 'UPDATE'],
      notification: ['READ', 'UPDATE'],
      audit_log: ['READ'],
      task: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      conversation: ['CREATE', 'READ', 'UPDATE'],
      invitation: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      form: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      rent_payment: ['CREATE', 'READ', 'UPDATE'],
      expense: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
      inspection: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
    },
  },

  pm: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/portfolio/overview',
      '/portfolio/properties',
      '/portfolio/units',
      '/portfolio/tenants',
      '/portfolio/leases',
      '/work-orders-v2',
      '/messages',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true, canCreate: true, canEdit: true },
      '/portfolio/dashboard': { canView: true, canCreate: true, canEdit: true },
      '/portfolio/overview': { canView: true, canCreate: true, canEdit: true },
      '/portfolio/properties': { canView: true, canEdit: true },
      '/portfolio/units': { canView: true, canCreate: true, canEdit: true },
      '/portfolio/tenants': { canView: true, canCreate: true, canEdit: true },
      '/portfolio/leases': { canView: true, canCreate: true, canEdit: true },
      '/work-orders-v2': { canView: true, canCreate: true, canEdit: true },
      '/messages': { canView: true, canCreate: true, canEdit: true },
      '/settings': { canView: true, canEdit: true },
    },
    resourcePermissions: {
      organization: ['READ'],
      user: ['READ'],
      property: ['READ', 'UPDATE'],
      unit: ['CREATE', 'READ', 'UPDATE'],
      landlord: ['READ'],
      tenant: ['CREATE', 'READ', 'UPDATE'],
      lease: ['CREATE', 'READ', 'UPDATE'],
      vendor: ['READ'],
      work_order: ['CREATE', 'READ', 'UPDATE'],
      attachment: ['CREATE', 'READ'],
      message: ['CREATE', 'READ', 'UPDATE'],
      notification: ['READ', 'UPDATE'],
      audit_log: ['READ'],
      task: ['CREATE', 'READ', 'UPDATE'],
      conversation: ['CREATE', 'READ', 'UPDATE'],
      invitation: ['READ'],
      form: ['READ', 'UPDATE'],
      rent_payment: ['READ'],
      expense: ['READ'],
      inspection: ['CREATE', 'READ', 'UPDATE'],
    },
  },

  landlord: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/portfolio/overview',
      '/portfolio/properties',
      '/portfolio/units',
      '/portfolio/tenants',
      '/portfolio/leases',
      '/work-orders-v2',
      '/messages',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true, canEdit: true },
      '/portfolio/dashboard': { canView: true, canEdit: true },
      '/portfolio/overview': { canView: true, canEdit: true },
      '/portfolio/properties': { canView: true, canEdit: true },
      '/portfolio/units': { canView: true, canEdit: true },
      '/portfolio/tenants': { canView: true },
      '/portfolio/leases': { canView: true, canEdit: true },
      '/work-orders-v2': { canView: true, canCreate: true, canEdit: true },
      '/messages': { canView: true, canCreate: true, canEdit: true },
      '/settings': { canView: true, canEdit: true },
    },
    resourcePermissions: {
      organization: ['READ'],
      user: ['READ'],
      property: ['READ', 'UPDATE'],
      unit: ['READ', 'UPDATE'],
      landlord: ['READ', 'UPDATE'],
      tenant: ['READ'],
      lease: ['READ', 'UPDATE'],
      vendor: ['READ'],
      work_order: ['CREATE', 'READ', 'UPDATE'],
      attachment: ['CREATE', 'READ'],
      message: ['CREATE', 'READ', 'UPDATE'],
      notification: ['READ', 'UPDATE'],
      audit_log: [],
      task: ['READ'],
      conversation: ['CREATE', 'READ', 'UPDATE'],
      invitation: ['READ'],
      form: ['READ'],
      rent_payment: ['READ'],
      expense: ['CREATE', 'READ', 'UPDATE'],
      inspection: ['READ'],
    },
  },

  tenant: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/portfolio/overview',
      '/work-orders-v2',
      '/messages',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true },
      '/portfolio/dashboard': { canView: true },
      '/portfolio/overview': { canView: true },
      '/work-orders-v2': { canView: true, canCreate: true, canEdit: true },
      '/messages': { canView: true, canCreate: true, canEdit: true },
      '/settings': { canView: true, canEdit: true },
    },
    resourcePermissions: {
      organization: ['READ'],
      user: ['READ', 'UPDATE'],
      property: ['READ'],
      unit: ['READ'],
      landlord: ['READ'],
      tenant: ['READ', 'UPDATE'],
      lease: ['READ'],
      vendor: ['READ'],
      work_order: ['CREATE', 'READ', 'UPDATE'],
      attachment: ['CREATE', 'READ'],
      message: ['CREATE', 'READ', 'UPDATE'],
      notification: ['READ', 'UPDATE'],
      audit_log: [],
      task: ['READ'],
      conversation: ['CREATE', 'READ', 'UPDATE'],
      invitation: [],
      form: ['READ'],
      rent_payment: ['READ'],
      expense: [],
      inspection: ['READ'],
    },
  },

  vendor: {
    screens: [
      '/portfolio',
      '/portfolio/dashboard',
      '/work-orders-v2',
      '/messages',
      '/settings',
    ],
    screenPermissions: {
      '/portfolio': { canView: true },
      '/portfolio/dashboard': { canView: true },
      '/work-orders-v2': { canView: true, canEdit: true },
      '/messages': { canView: true, canCreate: true, canEdit: true },
      '/settings': { canView: true, canEdit: true },
    },
    resourcePermissions: {
      organization: ['READ'],
      user: ['READ', 'UPDATE'],
      property: ['READ'],
      unit: ['READ'],
      landlord: ['READ'],
      tenant: ['READ'],
      lease: [],
      vendor: ['READ', 'UPDATE'],
      work_order: ['READ', 'UPDATE'],
      attachment: ['CREATE', 'READ'],
      message: ['CREATE', 'READ', 'UPDATE'],
      notification: ['READ', 'UPDATE'],
      audit_log: [],
      task: ['READ', 'UPDATE'],
      conversation: ['CREATE', 'READ', 'UPDATE'],
      invitation: [],
      form: ['READ'],
      rent_payment: [],
      expense: [],
      inspection: ['READ'],
    },
  },
};

/**
 * Get allowed screens for a role
 */
export function getScreensForRole(role: Role | null): Screen[] {
  if (!role || !ROLE_SCREENS[role]) {
    return [];
  }
  return ROLE_SCREENS[role].screens;
}

/**
 * Check if a role can view a screen
 */
export function canViewScreen(role: Role | null, screen: Screen): boolean {
  if (!role || !ROLE_SCREENS[role]) {
    return false;
  }
  return ROLE_SCREENS[role].screens.includes(screen);
}

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  role: Role | null,
  action: Action,
  resource: Resource
): boolean {
  if (!role || !ROLE_SCREENS[role]) {
    return false;
  }
  const allowedActions = ROLE_SCREENS[role].resourcePermissions[resource] || [];
  return allowedActions.includes(action) || allowedActions.includes('MANAGE');
}

/**
 * Get screen permissions for a role
 */
export function getScreenPermissions(
  role: Role | null,
  screen: Screen
): ScreenPermissions | null {
  if (!role || !ROLE_SCREENS[role]) {
    return null;
  }
  return ROLE_SCREENS[role].screenPermissions[screen] || null;
}

