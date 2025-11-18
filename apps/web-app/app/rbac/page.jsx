/**
 * RBAC Settings Page (Shared for Admin and PMC)
 * Role-Based Access Control management interface
 * 
 * Features:
 * - Permission Matrix Editor
 * - Role Management
 * - User Role Assignment
 * - Scope Management
 * - RBAC Audit Logs
 */

"use client";

// Re-export the admin RBAC page component
// This allows both admin and PMC users to access RBAC settings
export { default } from '@/app/admin/rbac/page';

