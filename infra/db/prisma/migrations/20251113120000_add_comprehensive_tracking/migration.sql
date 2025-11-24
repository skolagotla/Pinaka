-- Migration: Add Comprehensive Tracking and PMC-Landlord Approval System
-- Created: 2025-11-13

-- ============================================
-- 1. Add new fields to existing tables
-- ============================================

-- Add invitation tracking to Landlord
ALTER TABLE "Landlord" ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP;

-- Add approval workflow to PropertyManagementCompany
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP;
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP;
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP;

-- Add PMC tracking to Expense
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "createdByPMC" BOOLEAN DEFAULT false;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "pmcId" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "pmcApprovalRequestId" TEXT;

-- Add PMC tracking to MaintenanceRequest
ALTER TABLE "MaintenanceRequest" ADD COLUMN IF NOT EXISTS "createdByPMC" BOOLEAN DEFAULT false;
ALTER TABLE "MaintenanceRequest" ADD COLUMN IF NOT EXISTS "pmcId" TEXT;
ALTER TABLE "MaintenanceRequest" ADD COLUMN IF NOT EXISTS "pmcApprovalRequestId" TEXT;

-- Enhance ActivityLog
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "userType" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "propertyId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "landlordId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "pmcId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "contractorId" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN IF NOT EXISTS "approvalRequestId" TEXT;

-- Enhance AdminAuditLog
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "targetUserId" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "targetUserRole" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "targetEntityType" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "targetEntityId" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "approvalType" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "approvalEntityId" TEXT;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "beforeState" JSONB;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "afterState" JSONB;
ALTER TABLE "AdminAuditLog" ADD COLUMN IF NOT EXISTS "changedFields" TEXT[];

-- Enhance Invitation
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "invitedByAdminId" TEXT;
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "invitedByLandlordId" TEXT;
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "invitedByPMCId" TEXT;
ALTER TABLE "Invitation" ADD COLUMN IF NOT EXISTS "invitationSource" TEXT;

-- ============================================
-- 2. Create new tables
-- ============================================

-- Create PMCLandlord table
CREATE TABLE IF NOT EXISTS "PMCLandlord" (
    "id" TEXT NOT NULL,
    "pmcId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP,
    "contractTerms" JSONB,
    "notes" TEXT,

    CONSTRAINT "PMCLandlord_pkey" PRIMARY KEY ("id")
);

-- Create PMCLandlordApproval table
CREATE TABLE IF NOT EXISTS "PMCLandlordApproval" (
    "id" TEXT NOT NULL,
    "pmcLandlordId" TEXT NOT NULL,
    "approvalType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "requestedBy" TEXT NOT NULL,
    "requestedByEmail" TEXT NOT NULL,
    "requestedByName" TEXT NOT NULL,
    "requestedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedByEmail" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP,
    "approvalNotes" TEXT,
    "rejectedBy" TEXT,
    "rejectedByEmail" TEXT,
    "rejectedByName" TEXT,
    "rejectedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "cancelledBy" TEXT,
    "cancelledByEmail" TEXT,
    "cancelledByName" TEXT,
    "cancelledAt" TIMESTAMP,
    "cancellationReason" TEXT,
    "metadata" JSONB,
    "attachments" JSONB,

    CONSTRAINT "PMCLandlordApproval_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- 3. Add foreign key constraints
-- ============================================

-- Landlord FKs to Admin
ALTER TABLE "Landlord" ADD CONSTRAINT "Landlord_approvedBy_fkey" 
    FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "Landlord" ADD CONSTRAINT "Landlord_rejectedBy_fkey" 
    FOREIGN KEY ("rejectedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "Landlord" ADD CONSTRAINT "Landlord_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- PropertyManagementCompany FKs to Admin
ALTER TABLE "PropertyManagementCompany" ADD CONSTRAINT "PropertyManagementCompany_approvedBy_fkey" 
    FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "PropertyManagementCompany" ADD CONSTRAINT "PropertyManagementCompany_rejectedBy_fkey" 
    FOREIGN KEY ("rejectedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "PropertyManagementCompany" ADD CONSTRAINT "PropertyManagementCompany_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- Vendor FKs to Admin (only when isGlobal=true, but we'll add the constraint anyway)
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_approvedBy_fkey" 
    FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- Contractor FKs to Admin
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_invitedBy_fkey" 
    FOREIGN KEY ("invitedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_approvedBy_fkey" 
    FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- PMCLandlord FKs
ALTER TABLE "PMCLandlord" ADD CONSTRAINT "PMCLandlord_pmcId_fkey" 
    FOREIGN KEY ("pmcId") REFERENCES "PropertyManagementCompany"("id") ON DELETE CASCADE;
ALTER TABLE "PMCLandlord" ADD CONSTRAINT "PMCLandlord_landlordId_fkey" 
    FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE CASCADE;

-- PMCLandlordApproval FKs
ALTER TABLE "PMCLandlordApproval" ADD CONSTRAINT "PMCLandlordApproval_pmcLandlordId_fkey" 
    FOREIGN KEY ("pmcLandlordId") REFERENCES "PMCLandlord"("id") ON DELETE CASCADE;

-- Expense and MaintenanceRequest FKs to PMCLandlordApproval
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_pmcApprovalRequestId_fkey" 
    FOREIGN KEY ("pmcApprovalRequestId") REFERENCES "PMCLandlordApproval"("id") ON DELETE SET NULL;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_pmcApprovalRequestId_fkey" 
    FOREIGN KEY ("pmcApprovalRequestId") REFERENCES "PMCLandlordApproval"("id") ON DELETE SET NULL;

-- ActivityLog FKs
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_landlordId_fkey" 
    FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_pmcId_fkey" 
    FOREIGN KEY ("pmcId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

-- Invitation FKs
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByAdminId_fkey" 
    FOREIGN KEY ("invitedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByLandlordId_fkey" 
    FOREIGN KEY ("invitedByLandlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByPMCId_fkey" 
    FOREIGN KEY ("invitedByPMCId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

-- ============================================
-- 4. Add unique constraints
-- ============================================

ALTER TABLE "PMCLandlord" ADD CONSTRAINT "PMCLandlord_pmcId_landlordId_key" UNIQUE ("pmcId", "landlordId");
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_pmcApprovalRequestId_key" UNIQUE ("pmcApprovalRequestId");
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_pmcApprovalRequestId_key" UNIQUE ("pmcApprovalRequestId");

-- ============================================
-- 5. Add indexes
-- ============================================

-- Landlord indexes
CREATE INDEX IF NOT EXISTS "Landlord_invitedBy_idx" ON "Landlord"("invitedBy");

-- PropertyManagementCompany indexes
CREATE INDEX IF NOT EXISTS "PropertyManagementCompany_approvalStatus_idx" ON "PropertyManagementCompany"("approvalStatus");
CREATE INDEX IF NOT EXISTS "PropertyManagementCompany_approvedBy_idx" ON "PropertyManagementCompany"("approvedBy");
CREATE INDEX IF NOT EXISTS "PropertyManagementCompany_invitedBy_idx" ON "PropertyManagementCompany"("invitedBy");

-- PMCLandlord indexes
CREATE INDEX IF NOT EXISTS "PMCLandlord_pmcId_idx" ON "PMCLandlord"("pmcId");
CREATE INDEX IF NOT EXISTS "PMCLandlord_landlordId_idx" ON "PMCLandlord"("landlordId");
CREATE INDEX IF NOT EXISTS "PMCLandlord_status_idx" ON "PMCLandlord"("status");
CREATE INDEX IF NOT EXISTS "PMCLandlord_startedAt_idx" ON "PMCLandlord"("startedAt");

-- PMCLandlordApproval indexes
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_pmcLandlordId_idx" ON "PMCLandlordApproval"("pmcLandlordId");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_status_idx" ON "PMCLandlordApproval"("status");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_approvalType_idx" ON "PMCLandlordApproval"("approvalType");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_entityType_entityId_idx" ON "PMCLandlordApproval"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_requestedAt_idx" ON "PMCLandlordApproval"("requestedAt");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_approvedBy_idx" ON "PMCLandlordApproval"("approvedBy");
CREATE INDEX IF NOT EXISTS "PMCLandlordApproval_rejectedBy_idx" ON "PMCLandlordApproval"("rejectedBy");

-- Expense indexes
CREATE INDEX IF NOT EXISTS "Expense_pmcId_idx" ON "Expense"("pmcId");
CREATE INDEX IF NOT EXISTS "Expense_pmcApprovalRequestId_idx" ON "Expense"("pmcApprovalRequestId");

-- MaintenanceRequest indexes
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_pmcId_idx" ON "MaintenanceRequest"("pmcId");
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_pmcApprovalRequestId_idx" ON "MaintenanceRequest"("pmcApprovalRequestId");

-- ActivityLog indexes
CREATE INDEX IF NOT EXISTS "ActivityLog_userType_idx" ON "ActivityLog"("userType");
CREATE INDEX IF NOT EXISTS "ActivityLog_propertyId_idx" ON "ActivityLog"("propertyId");
CREATE INDEX IF NOT EXISTS "ActivityLog_landlordId_idx" ON "ActivityLog"("landlordId");
CREATE INDEX IF NOT EXISTS "ActivityLog_tenantId_idx" ON "ActivityLog"("tenantId");
CREATE INDEX IF NOT EXISTS "ActivityLog_pmcId_idx" ON "ActivityLog"("pmcId");
CREATE INDEX IF NOT EXISTS "ActivityLog_vendorId_idx" ON "ActivityLog"("vendorId");
CREATE INDEX IF NOT EXISTS "ActivityLog_contractorId_idx" ON "ActivityLog"("contractorId");
CREATE INDEX IF NOT EXISTS "ActivityLog_userRole_createdAt_idx" ON "ActivityLog"("userRole", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_approvalRequestId_idx" ON "ActivityLog"("approvalRequestId");

-- AdminAuditLog indexes
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetUserId_idx" ON "AdminAuditLog"("targetUserId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetEntityType_targetEntityId_idx" ON "AdminAuditLog"("targetEntityType", "targetEntityId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_approvalType_idx" ON "AdminAuditLog"("approvalType");

-- Invitation indexes
CREATE INDEX IF NOT EXISTS "Invitation_invitedByAdminId_idx" ON "Invitation"("invitedByAdminId");
CREATE INDEX IF NOT EXISTS "Invitation_invitedByLandlordId_idx" ON "Invitation"("invitedByLandlordId");
CREATE INDEX IF NOT EXISTS "Invitation_invitedByPMCId_idx" ON "Invitation"("invitedByPMCId");

