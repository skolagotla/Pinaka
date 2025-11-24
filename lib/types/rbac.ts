/**
 * RBAC Types
 * Replaces Prisma types for RBAC functionality
 */

export type RBACRole = 
  | 'super_admin'
  | 'pmc_admin'
  | 'pm'
  | 'landlord'
  | 'tenant'
  | 'vendor'
  | 'contractor';

export type ResourceCategory = 
  | 'properties'
  | 'tenants'
  | 'leases'
  | 'work_orders'
  | 'payments'
  | 'documents'
  | 'settings'
  | 'users'
  | 'reports'
  | 'analytics';

export type PermissionAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import';

export interface Permission {
  role: RBACRole;
  resource: ResourceCategory;
  action: PermissionAction;
  allowed: boolean;
}

export interface RolePermissions {
  role: RBACRole;
  permissions: Permission[];
}

