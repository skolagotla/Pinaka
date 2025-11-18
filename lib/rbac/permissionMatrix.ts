/**
 * RBAC Permission Matrix Builder
 * Phase 2: Permission Checking Logic
 * 
 * Builds the permission matrix based on design decisions from RBAC_DESIGN_DECISIONS.md
 */

import { PrismaClient, RBACRole, ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Permission matrix definition
 * Based on all 80+ questions answered in RBAC_DESIGN_DECISIONS.md
 */
interface PermissionMatrixEntry {
  role: RBACRole;
  category: ResourceCategory;
  resource: string;
  action: PermissionAction;
  conditions?: any;
}

/**
 * Build permission matrix from design decisions
 * This is a comprehensive matrix based on all the questions we answered
 */
export const PERMISSION_MATRIX: PermissionMatrixEntry[] = [
  // ============================================
  // SUPER_ADMIN - Full system access
  // ============================================
  {
    role: RBACRole.SUPER_ADMIN,
    category: ResourceCategory.USER_ROLE_MANAGEMENT,
    resource: 'users',
    action: PermissionAction.MANAGE,
  },
  {
    role: RBACRole.SUPER_ADMIN,
    category: ResourceCategory.USER_ROLE_MANAGEMENT,
    resource: 'roles',
    action: PermissionAction.MANAGE,
  },
  {
    role: RBACRole.SUPER_ADMIN,
    category: ResourceCategory.SYSTEM_SETTINGS,
    resource: 'settings',
    action: PermissionAction.MANAGE,
  },
  {
    role: RBACRole.SUPER_ADMIN,
    category: ResourceCategory.SYSTEM_SETTINGS,
    resource: 'api_keys',
    action: PermissionAction.CREATE,
  },

  // ============================================
  // PMC_ADMIN - PMC management
  // ============================================
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.USER_ROLE_MANAGEMENT,
    resource: 'users',
    action: PermissionAction.CREATE,
    conditions: { onlyOwnPMC: true },
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.USER_ROLE_MANAGEMENT,
    resource: 'roles',
    action: PermissionAction.ASSIGN,
    conditions: { onlyOwnPMC: true },
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'portfolios',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'properties',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.SYSTEM_SETTINGS,
    resource: 'permissions',
    action: PermissionAction.UPDATE,
    conditions: { onlyOwnPMC: true },
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.SYSTEM_SETTINGS,
    resource: 'roles',
    action: PermissionAction.CREATE,
    conditions: { onlyOwnPMC: true },
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.ACCOUNTING,
    resource: 'reports',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PMC_ADMIN,
    category: ResourceCategory.ACCOUNTING,
    resource: 'data',
    action: PermissionAction.EXPORT,
  },

  // ============================================
  // PROPERTY_MANAGER - Property management
  // ============================================
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'properties',
    action: PermissionAction.UPDATE,
    conditions: { requiresApproval: true, approvalTimeout: 3 }, // 3-day approval
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'units',
    action: PermissionAction.CREATE,
    conditions: { requiresApproval: true },
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.TENANT_MANAGEMENT,
    resource: 'tenants',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.TENANT_MANAGEMENT,
    resource: 'evictions',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'leases',
    action: PermissionAction.CREATE,
    conditions: { requiresApproval: true }, // Always requires owner approval
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'charges',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'payments',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'refunds',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.MAINTENANCE,
    resource: 'expenses',
    action: PermissionAction.APPROVE,
    conditions: { bigExpenseThreshold: true }, // Configurable threshold
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'reports',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'reports',
    action: PermissionAction.EXPORT,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'messages',
    action: PermissionAction.SEND,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'inbox',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.UPLOAD,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.TASK_WORKFLOW_MANAGEMENT,
    resource: 'tasks',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'properties',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'inspections',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.PROPERTY_MANAGER,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'inspections',
    action: PermissionAction.VIEW,
  },

  // ============================================
  // LEASING_AGENT - Leasing and applications
  // ============================================
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'screening',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'leases',
    action: PermissionAction.CREATE,
    conditions: { requiresApproval: true },
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.MARKETING_LISTINGS,
    resource: 'listings',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.MARKETING_LISTINGS,
    resource: 'listings',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.MARKETING_LISTINGS,
    resource: 'listings',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.TENANT_MANAGEMENT,
    resource: 'evictions',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'units',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'properties',
    action: PermissionAction.VIEW,
    conditions: { scopeRestriction: 'property' },
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.TASK_WORKFLOW_MANAGEMENT,
    resource: 'tasks',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.LEASING_AGENT,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'messages',
    action: PermissionAction.SEND,
  },

  // ============================================
  // MAINTENANCE_TECH - Maintenance work
  // ============================================
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.VIEW,
    conditions: { scopeRestriction: 'unit' },
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.UPDATE,
    conditions: { scopeRestriction: 'unit' },
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'invoices',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.VIEW,
    conditions: { workOrderOnly: true },
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'messages',
    action: PermissionAction.SEND,
    conditions: { maintenanceOnly: true },
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'inbox',
    action: PermissionAction.VIEW,
    conditions: { scopeRestriction: 'unit' },
  },
  {
    role: RBACRole.MAINTENANCE_TECH,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'properties',
    action: PermissionAction.VIEW,
    conditions: { scopeRestriction: 'unit' },
  },

  // ============================================
  // ACCOUNTANT - Financial management
  // ============================================
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'chart_of_accounts',
    action: PermissionAction.MANAGE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'bank_reconciliation',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'payouts',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'security_deposits',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'financial_periods',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'charges',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'refunds',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.MAINTENANCE,
    resource: 'expenses',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'invoices',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'reports',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'owner_statements',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.ACCOUNTANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'data',
    action: PermissionAction.EXPORT,
  },

  // ============================================
  // OWNER_LANDLORD - Property owner
  // ============================================
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'properties',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'properties',
    action: PermissionAction.UPDATE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'units',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.TENANT_MANAGEMENT,
    resource: 'tenants',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'leases',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'leases',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.MAINTENANCE,
    resource: 'expenses',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.ASSIGN,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.ACCOUNTING,
    resource: 'payouts',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.ACCOUNTING,
    resource: 'security_deposits',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'reports',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    resource: 'owner_statements',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'charges',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'refunds',
    action: PermissionAction.APPROVE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.UPLOAD,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.VIEW,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.MARKETING_LISTINGS,
    resource: 'listings',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'inspections',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.OWNER_LANDLORD,
    category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    resource: 'inspections',
    action: PermissionAction.VIEW,
  },

  // ============================================
  // TENANT - Tenant access
  // ============================================
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'applications',
    action: PermissionAction.UPDATE,
    conditions: { ownOnly: true, deadline: 7 }, // 1 week deadline
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.LEASING_APPLICATIONS,
    resource: 'screening',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'payments',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.RENT_PAYMENTS,
    resource: 'payments',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'security_deposits',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.CREATE,
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.UPDATE,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.DELETE,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.UPLOAD,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'messages',
    action: PermissionAction.SEND,
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.COMMUNICATION_MESSAGING,
    resource: 'inbox',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.ACCOUNTING,
    resource: 'data',
    action: PermissionAction.EXPORT,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.TENANT,
    category: ResourceCategory.PORTFOLIO_PROPERTY_ASSIGNMENT,
    resource: 'units',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },

  // ============================================
  // VENDOR_SERVICE_PROVIDER - Vendor access
  // ============================================
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.MAINTENANCE,
    resource: 'work_orders',
    action: PermissionAction.VIEW,
    conditions: { assignedOnly: true },
  },
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'invoices',
    action: PermissionAction.SUBMIT,
  },
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'ratings',
    action: PermissionAction.VIEW,
    conditions: { ownOnly: true },
  },
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'ratings',
    action: PermissionAction.CREATE, // Can respond to reviews
  },
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.VENDOR_MANAGEMENT,
    resource: 'tenant_ratings',
    action: PermissionAction.CREATE, // Can rate tenants
  },
  {
    role: RBACRole.VENDOR_SERVICE_PROVIDER,
    category: ResourceCategory.DOCUMENT_MANAGEMENT,
    resource: 'documents',
    action: PermissionAction.VIEW,
    conditions: { workOrderOnly: true },
  },
];

/**
 * Initialize roles in the database
 */
export async function initializeRoles(): Promise<void> {
  const roles = [
    { name: RBACRole.SUPER_ADMIN, displayName: 'Super Admin', isSystem: true },
    { name: RBACRole.PLATFORM_ADMIN, displayName: 'Platform Admin', isSystem: true },
    { name: RBACRole.SUPPORT_ADMIN, displayName: 'Support Admin', isSystem: true },
    { name: RBACRole.BILLING_ADMIN, displayName: 'Billing Admin', isSystem: true },
    { name: RBACRole.AUDIT_ADMIN, displayName: 'Audit Admin', isSystem: true },
    { name: RBACRole.PMC_ADMIN, displayName: 'PMC Admin', isSystem: true },
    { name: RBACRole.PROPERTY_MANAGER, displayName: 'Property Manager', isSystem: true },
    { name: RBACRole.LEASING_AGENT, displayName: 'Leasing Agent', isSystem: true },
    { name: RBACRole.MAINTENANCE_TECH, displayName: 'Maintenance Tech', isSystem: true },
    { name: RBACRole.ACCOUNTANT, displayName: 'Accountant', isSystem: true },
    { name: RBACRole.OWNER_LANDLORD, displayName: 'Owner/Landlord', isSystem: true },
    { name: RBACRole.TENANT, displayName: 'Tenant', isSystem: true },
    { name: RBACRole.VENDOR_SERVICE_PROVIDER, displayName: 'Vendor/Service Provider', isSystem: true },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
  }
}

/**
 * Initialize permission matrix in the database
 */
export async function initializePermissionMatrix(): Promise<void> {
  // First initialize roles
  await initializeRoles();

  // Get all roles
  const roles = await prisma.role.findMany();

  // Create role map
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  // Insert permissions
  for (const entry of PERMISSION_MATRIX) {
    const roleId = roleMap.get(entry.role);
    if (!roleId) {
      console.warn(`Role ${entry.role} not found, skipping permission`);
      continue;
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_category_resource_action: {
          roleId,
          category: entry.category,
          resource: entry.resource,
          action: entry.action,
        },
      },
      update: {
        conditions: entry.conditions || null,
      },
      create: {
        roleId,
        category: entry.category,
        resource: entry.resource,
        action: entry.action,
        conditions: entry.conditions || null,
      },
    });
  }

  console.log('Permission matrix initialized successfully');
}

/**
 * Get permission matrix for a specific role
 */
export async function getRolePermissions(roleName: RBACRole) {
  const role = await prisma.role.findUnique({
    where: { name: roleName },
    include: {
      defaultPermissions: true,
    },
  });

  return role;
}

