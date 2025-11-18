-- Add renewal decision fields to Lease table
-- These fields are defined in the Prisma schema but missing from the database

ALTER TABLE "Lease" 
ADD COLUMN IF NOT EXISTS "renewalDecision" TEXT,
ADD COLUMN IF NOT EXISTS "renewalDecisionAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "renewalDecisionBy" TEXT;

-- Add index on renewalDecision for better query performance
CREATE INDEX IF NOT EXISTS "Lease_renewalDecision_idx" ON "Lease"("renewalDecision");

