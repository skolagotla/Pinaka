/**
 * RBAC Permission Checking Functions - Legacy Prisma Version
 * 
 * @deprecated This file uses Prisma and is being replaced by permissions_v2.ts
 * New code should use permissions_v2.ts which uses FastAPI v2 endpoints
 * 
 * This file is kept for backward compatibility during migration
 */

// Re-export from v2 version for backward compatibility
export {
  hasPermission,
  canAccess,
  getUserScopes,
  filterByScope,
  PermissionAction,
  ResourceCategory,
  type Scope,
} from './permissions_v2';

// Legacy Prisma-based implementation (deprecated)
// The original implementation used Prisma directly
// Migrated to use FastAPI v2 endpoints in permissions_v2.ts
