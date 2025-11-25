/**
 * RBAC System - Main Export
 * 
 * Central export for all RBAC functionality.
 * Uses the new centralized rbacConfig.ts system.
 */

// Export the new centralized RBAC config
export * from './rbacConfig';

// Export permissions_v2 for backward compatibility (if needed)
export * from './permissions_v2';
