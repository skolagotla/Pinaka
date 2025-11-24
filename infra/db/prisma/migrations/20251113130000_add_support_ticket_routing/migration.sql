-- Migration: Add Support Ticket Routing and Property Management Logic
-- Created: 2025-11-13

-- ============================================
-- 1. Add new fields to SupportTicket
-- ============================================

-- Property context
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "propertyId" TEXT;

-- Creator FKs
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "createdByLandlordId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "createdByTenantId" TEXT;

-- Routing FKs
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "assignedToAdminId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "assignedToLandlordId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "assignedToPMCId" TEXT;

-- ============================================
-- 2. Add foreign key constraints
-- ============================================

-- Property FK
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL;

-- Creator FKs
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdByLandlordId_fkey" 
    FOREIGN KEY ("createdByLandlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdByTenantId_fkey" 
    FOREIGN KEY ("createdByTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL;

-- Routing FKs
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToAdminId_fkey" 
    FOREIGN KEY ("assignedToAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToLandlordId_fkey" 
    FOREIGN KEY ("assignedToLandlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToPMCId_fkey" 
    FOREIGN KEY ("assignedToPMCId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

-- ============================================
-- 3. Add indexes
-- ============================================

CREATE INDEX IF NOT EXISTS "SupportTicket_propertyId_idx" ON "SupportTicket"("propertyId");
CREATE INDEX IF NOT EXISTS "SupportTicket_createdByLandlordId_idx" ON "SupportTicket"("createdByLandlordId");
CREATE INDEX IF NOT EXISTS "SupportTicket_createdByTenantId_idx" ON "SupportTicket"("createdByTenantId");
CREATE INDEX IF NOT EXISTS "SupportTicket_assignedToAdminId_idx" ON "SupportTicket"("assignedToAdminId");
CREATE INDEX IF NOT EXISTS "SupportTicket_assignedToLandlordId_idx" ON "SupportTicket"("assignedToLandlordId");
CREATE INDEX IF NOT EXISTS "SupportTicket_assignedToPMCId_idx" ON "SupportTicket"("assignedToPMCId");

