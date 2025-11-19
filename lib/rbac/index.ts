/**
 * RBAC System - Main Export
 * Phase 2 & 3: Permission Checking Logic & Data Isolation
 * 
 * Central export for all RBAC functionality
 */

// Auto-initialize RBAC when this module is imported (runs on application startup)
if (typeof window === 'undefined') {
  // Only run on server-side
  require('./autoInitialize');
}

// Core permission functions
export {
  hasPermission,
  canAccess,
  getUserScopes,
  filterByScope,
  logPermissionCheck,
} from './permissions';

// Middleware
export {
  withRBAC,
  withScopeCheck,
  withApprovalWorkflow,
  getClientIp,
  getUserAgent,
  type RBACMiddlewareOptions,
} from './middleware';

// Permission matrix
export {
  PERMISSION_MATRIX,
  initializeRoles,
  initializePermissionMatrix,
  getRolePermissions,
} from './permissionMatrix';

// Data isolation (Phase 3)
export {
  getIsolationContext,
  applyPMCIsolation,
  applyLandlordIsolation,
  applyTenantIsolation,
  applyScopeFiltering,
  applyDataIsolation,
  canAccessResource,
  enforcePMCIsolation,
  enforceLandlordIsolation,
  enforceTenantIsolation,
  type UserScope,
  type IsolationContext,
} from './dataIsolation';

// Query builders (Phase 3)
export {
  RBACQueryBuilder,
  createRBACQueryBuilder,
  getRBACQueryBuilder,
} from './queryBuilders';

// Combined middleware (Phase 3)
export {
  withCombinedRBAC,
  requireScope,
  type CombinedRBACOptions,
} from './combinedMiddleware';

// Scope management (Phase 3)
export {
  assignScope,
  removeScope,
  assignPropertyToPM,
  assignUnitToLeasingAgent,
  assignToMaintenanceTech,
  createPortfolioAndAssignProperties,
  getUserScopesWithDetails,
  hasScopeAccess,
} from './scopeManagement';

// Approval workflows (Phase 5)
export {
  createPropertyEditApproval,
  approvePropertyEdit,
  createBigExpenseApproval,
  approveBigExpense,
  createLeaseApproval,
  approveLease,
  createRefundApproval,
  approveRefund,
  getPendingApprovals,
  checkExpiredApprovals,
  rejectApproval,
  type ApprovalRequest,
  type ApprovalApprover,
} from './approvalWorkflows';

// Audit logging (Phase 6)
export {
  logPermissionChange,
  logRoleAssignment,
  logDataAccess,
  logSensitiveDataAccess,
  logReportAccess,
  logDataExport,
  logAccountDeactivation,
  logRoleChange,
  getAuditLogs,
  archiveAuditLogs,
  deleteOldAuditLogs,
  getAuditStatistics,
  exportAuditLogs,
} from './auditLogging';

// API integration examples (Phase 4)
export {
  getProperties,
  getPropertyById,
  updateProperty,
  createExpense,
  getTenants,
  createLease,
  approveLeaseEndpoint,
  getPendingApprovalsEndpoint,
  generateReport,
} from './apiIntegration';

// Edge cases (Phase 9)
export {
  checkMultipleRoles,
  changeUserRole,
  grantEmergencyAccess,
  transferProperty,
  hasEmergencyAccess,
  getUserActiveRoles,
} from './edgeCases';

// Testing utilities (Phase 10)
export {
  testRolePermissions,
  testScopeEnforcement,
  testCrossPMCAccess,
  testCrossLandlordAccess,
  testUnauthorizedAccess,
  testAuditLogging,
  testRBACIntegration,
  generateTestReport,
} from './testing';

// Types - Export as both type and value for compatibility
export {
  ResourceCategory,
  PermissionAction,
  RBACRole,
  ScopeType,
} from '@prisma/client';
export type {
  ApprovalWorkflowType,
  ApprovalRequestStatus,
} from '@prisma/client';

