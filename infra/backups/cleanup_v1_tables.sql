-- ============================================================
-- Pinaka Database Cleanup Script - Remove V1 Tables
-- Generated: 2025-11-24
--
-- This script removes all v1-era database tables and enums
-- while preserving all v2 schema tables.
--
-- WARNING: This will permanently delete data from v1 tables!
-- Make sure you have a backup before running this script.
-- ============================================================

BEGIN;

-- ============================================================
-- Step 1: Drop 61 V1/Deprecated tables
-- ============================================================
-- Tables are dropped in dependency order (children before parents)
-- CASCADE ensures all dependent objects are removed

-- Admin and authentication tables
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "AdminAuditLog" CASCADE;
DROP TABLE IF EXISTS "AdminPermission" CASCADE;
DROP TABLE IF EXISTS "AdminSession" CASCADE;
DROP TABLE IF EXISTS "ApiKey" CASCADE;
DROP TABLE IF EXISTS "FailedLoginAttempt" CASCADE;

-- Application and approval tables
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "ApprovalRequest" CASCADE;

-- Banking and financial tables
DROP TABLE IF EXISTS "BankReconciliation" CASCADE;
DROP TABLE IF EXISTS "FinancialSnapshot" CASCADE;
DROP TABLE IF EXISTS "OwnerPayout" CASCADE;
DROP TABLE IF EXISTS "OwnerStatement" CASCADE;
DROP TABLE IF EXISTS "PartialPayment" CASCADE;
DROP TABLE IF EXISTS "SecurityDeposit" CASCADE;
DROP TABLE IF EXISTS "StripeCustomer" CASCADE;
DROP TABLE IF EXISTS "StripePayment" CASCADE;

-- Content and system tables
DROP TABLE IF EXISTS "ContentItem" CASCADE;
DROP TABLE IF EXISTS "SystemAnnouncement" CASCADE;
DROP TABLE IF EXISTS "ReferenceData" CASCADE;

-- Document management tables
DROP TABLE IF EXISTS "Document" CASCADE;
DROP TABLE IF EXISTS "DocumentAuditLog" CASCADE;
DROP TABLE IF EXISTS "DocumentMessage" CASCADE;
DROP TABLE IF EXISTS "LeaseDocument" CASCADE;

-- Inspection and maintenance tables
DROP TABLE IF EXISTS "InspectionChecklist" CASCADE;
DROP TABLE IF EXISTS "InspectionChecklistItem" CASCADE;
DROP TABLE IF EXISTS "MaintenanceComment" CASCADE;
DROP TABLE IF EXISTS "MaintenanceRequest" CASCADE;
DROP TABLE IF EXISTS "RecurringMaintenance" CASCADE;

-- Messaging tables (v1 version - v2 uses conversations/messages)
DROP TABLE IF EXISTS "ConversationParticipant" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "MessageAttachment" CASCADE;
DROP TABLE IF EXISTS "MessageNotification" CASCADE;

-- PMC and landlord relationship tables
DROP TABLE IF EXISTS "PMCLandlord" CASCADE;
DROP TABLE IF EXISTS "PMCLandlordApproval" CASCADE;
DROP TABLE IF EXISTS "PropertyManagementCompany" CASCADE;
DROP TABLE IF EXISTS "LandlordServiceProvider" CASCADE;

-- Property verification tables
DROP TABLE IF EXISTS "PropertyOwnershipVerification" CASCADE;
DROP TABLE IF EXISTS "PropertyOwnershipVerificationHistory" CASCADE;

-- RBAC and permission tables
DROP TABLE IF EXISTS "RBACAuditLog" CASCADE;
DROP TABLE IF EXISTS "RolePermission" CASCADE;
DROP TABLE IF EXISTS "UserPermission" CASCADE;
DROP TABLE IF EXISTS "UserActivity" CASCADE;

-- Support ticket tables
DROP TABLE IF EXISTS "SupportTicket" CASCADE;
DROP TABLE IF EXISTS "TicketAttachment" CASCADE;
DROP TABLE IF EXISTS "TicketNote" CASCADE;

-- Tenant-related tables
DROP TABLE IF EXISTS "EmergencyContact" CASCADE;
DROP TABLE IF EXISTS "Employer" CASCADE;
DROP TABLE IF EXISTS "EmploymentDocument" CASCADE;
DROP TABLE IF EXISTS "TenantInvitation" CASCADE;
DROP TABLE IF EXISTS "TenantRating" CASCADE;

-- Other v1 tables
DROP TABLE IF EXISTS "Eviction" CASCADE;
DROP TABLE IF EXISTS "GeneratedForm" CASCADE;
DROP TABLE IF EXISTS "LateFee" CASCADE;
DROP TABLE IF EXISTS "LateFeeRule" CASCADE;
DROP TABLE IF EXISTS "Listing" CASCADE;
DROP TABLE IF EXISTS "OrganizationSettings" CASCADE;
DROP TABLE IF EXISTS "TaskReminder" CASCADE;
DROP TABLE IF EXISTS "UnifiedVerification" CASCADE;
DROP TABLE IF EXISTS "UnifiedVerificationHistory" CASCADE;
DROP TABLE IF EXISTS "VendorRating" CASCADE;

-- ============================================================
-- Step 2: Drop 21 V1-only ENUM types
-- ============================================================

DROP TYPE IF EXISTS "AdminRole" CASCADE;
DROP TYPE IF EXISTS "ApprovalRequestStatus" CASCADE;
DROP TYPE IF EXISTS "ApprovalStatus" CASCADE;
DROP TYPE IF EXISTS "ApprovalWorkflowType" CASCADE;
DROP TYPE IF EXISTS "ContentType" CASCADE;
DROP TYPE IF EXISTS "ConversationStatus" CASCADE;
DROP TYPE IF EXISTS "ConversationType" CASCADE;
DROP TYPE IF EXISTS "OrganizationStatus" CASCADE;
DROP TYPE IF EXISTS "OwnershipDocumentType" CASCADE;
DROP TYPE IF EXISTS "PMCApprovalStatus" CASCADE;
DROP TYPE IF EXISTS "PMCApprovalType" CASCADE;
DROP TYPE IF EXISTS "PermissionAction" CASCADE;
DROP TYPE IF EXISTS "PlanType" CASCADE;
DROP TYPE IF EXISTS "RBACRole" CASCADE;
DROP TYPE IF EXISTS "ResourceCategory" CASCADE;
DROP TYPE IF EXISTS "ScopeType" CASCADE;
DROP TYPE IF EXISTS "TicketPriority" CASCADE;
DROP TYPE IF EXISTS "TicketStatus" CASCADE;
DROP TYPE IF EXISTS "UnifiedVerificationStatus" CASCADE;
DROP TYPE IF EXISTS "UnifiedVerificationType" CASCADE;
DROP TYPE IF EXISTS "VerificationStatus" CASCADE;

COMMIT;

-- ============================================================
-- Cleanup Complete!
-- ============================================================
-- Removed: 61 tables, 21 enums
-- Preserved: 18 v2 tables (Organization, Property, Lease, Tenant, 
--           Landlord, Unit, LeaseTenant, Expense, Invitation, 
--           RentPayment, Task, Conversation, Role, UserRole, 
--           Country, Region, Scope, ServiceProvider)
-- ============================================================
