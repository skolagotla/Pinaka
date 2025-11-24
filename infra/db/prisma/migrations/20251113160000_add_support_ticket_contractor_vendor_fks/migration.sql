-- Migration: Add contractorId and vendorId FKs to SupportTicket
-- Created: 2025-11-13

-- ============================================
-- 1. Add contractorId and vendorId to SupportTicket
-- ============================================

ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "contractorId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;

-- Add foreign key constraints
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_contractorId_fkey" 
    FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL;

ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_vendorId_fkey" 
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "SupportTicket_contractorId_idx" ON "SupportTicket"("contractorId");
CREATE INDEX IF NOT EXISTS "SupportTicket_vendorId_idx" ON "SupportTicket"("vendorId");

