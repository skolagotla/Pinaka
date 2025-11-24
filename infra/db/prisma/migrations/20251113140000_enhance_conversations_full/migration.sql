-- Migration: Enhance Conversations with Full Implementation (Option 2)
-- Created: 2025-11-13

-- ============================================
-- 1. Create Enums
-- ============================================

CREATE TYPE "ConversationType" AS ENUM ('LANDLORD_TENANT', 'LANDLORD_PMC', 'PMC_TENANT', 'GROUP');
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- ============================================
-- 2. Add new fields to Conversation
-- ============================================

-- Make propertyId required (will need to handle existing nulls)
ALTER TABLE "Conversation" ALTER COLUMN "propertyId" DROP NOT NULL; -- Temporarily allow nulls during migration

-- Add required FKs
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "landlordId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Add optional PMC FK
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "pmcId" TEXT;

-- Add conversation type and status enums
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "conversationType" "ConversationType" DEFAULT 'LANDLORD_TENANT';
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "status" TEXT; -- Keep old status field for now

-- Add creator FKs
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "createdByLandlordId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "createdByTenantId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "createdByPMCId" TEXT;

-- Add activity tracking
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastMessageId" TEXT;

-- Add read tracking
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "landlordLastReadAt" TIMESTAMP;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "tenantLastReadAt" TIMESTAMP;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "pmcLastReadAt" TIMESTAMP;

-- Add notification settings
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "notifyLandlord" BOOLEAN DEFAULT true;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "notifyTenant" BOOLEAN DEFAULT true;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "notifyPMC" BOOLEAN DEFAULT false;

-- Add metadata
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "priority" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "tags" TEXT[];

-- Keep participants as JSON for backward compat (will migrate to ConversationParticipant)
-- participants field already exists

-- ============================================
-- 3. Add new fields to Message
-- ============================================

-- Add sender FKs
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "senderLandlordId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "senderTenantId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "senderPMCId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "senderRole" TEXT;

-- Add read tracking per participant
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readByLandlord" BOOLEAN DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readByTenant" BOOLEAN DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readByPMC" BOOLEAN DEFAULT false;

-- Keep isRead for backward compat
-- isRead field already exists

-- Add updatedAt
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 4. Create ConversationParticipant table
-- ============================================

CREATE TABLE IF NOT EXISTS "ConversationParticipant" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "participantType" TEXT NOT NULL,
  "participantRole" TEXT NOT NULL DEFAULT 'PARTICIPANT',
  "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastReadAt" TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ConversationParticipant_conversationId_participantId_key" UNIQUE ("conversationId", "participantId")
);

-- ============================================
-- 5. Create MessageAttachment table
-- ============================================

CREATE TABLE IF NOT EXISTS "MessageAttachment" (
  "id" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================
-- 6. Add foreign key constraints
-- ============================================

-- Conversation FKs
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_propertyId_fkey" 
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_landlordId_fkey" 
    FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE CASCADE;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tenantId_fkey" 
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_pmcId_fkey" 
    FOREIGN KEY ("pmcId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdByLandlordId_fkey" 
    FOREIGN KEY ("createdByLandlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdByTenantId_fkey" 
    FOREIGN KEY ("createdByTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdByPMCId_fkey" 
    FOREIGN KEY ("createdByPMCId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_lastMessageId_fkey" 
    FOREIGN KEY ("lastMessageId") REFERENCES "Message"("id") ON DELETE SET NULL;

-- Message FKs
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderLandlordId_fkey" 
    FOREIGN KEY ("senderLandlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL;

ALTER TABLE "Message" ADD CONSTRAINT "Message_senderTenantId_fkey" 
    FOREIGN KEY ("senderTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL;

ALTER TABLE "Message" ADD CONSTRAINT "Message_senderPMCId_fkey" 
    FOREIGN KEY ("senderPMCId") REFERENCES "PropertyManagementCompany"("id") ON DELETE SET NULL;

-- ============================================
-- 7. Add indexes
-- ============================================

-- Conversation indexes
CREATE INDEX IF NOT EXISTS "Conversation_landlordId_idx" ON "Conversation"("landlordId");
CREATE INDEX IF NOT EXISTS "Conversation_tenantId_idx" ON "Conversation"("tenantId");
CREATE INDEX IF NOT EXISTS "Conversation_pmcId_idx" ON "Conversation"("pmcId");
CREATE INDEX IF NOT EXISTS "Conversation_conversationType_idx" ON "Conversation"("conversationType");
CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX IF NOT EXISTS "Conversation_propertyId_landlordId_tenantId_idx" ON "Conversation"("propertyId", "landlordId", "tenantId");

-- Message indexes
CREATE INDEX IF NOT EXISTS "Message_senderLandlordId_idx" ON "Message"("senderLandlordId");
CREATE INDEX IF NOT EXISTS "Message_senderTenantId_idx" ON "Message"("senderTenantId");
CREATE INDEX IF NOT EXISTS "Message_senderPMCId_idx" ON "Message"("senderPMCId");
CREATE INDEX IF NOT EXISTS "Message_senderRole_idx" ON "Message"("senderRole");
CREATE INDEX IF NOT EXISTS "Message_readByLandlord_idx" ON "Message"("readByLandlord");
CREATE INDEX IF NOT EXISTS "Message_readByTenant_idx" ON "Message"("readByTenant");

-- ConversationParticipant indexes
CREATE INDEX IF NOT EXISTS "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");
CREATE INDEX IF NOT EXISTS "ConversationParticipant_participantId_idx" ON "ConversationParticipant"("participantId");
CREATE INDEX IF NOT EXISTS "ConversationParticipant_participantType_idx" ON "ConversationParticipant"("participantType");
CREATE INDEX IF NOT EXISTS "ConversationParticipant_isActive_idx" ON "ConversationParticipant"("isActive");

-- MessageAttachment indexes
CREATE INDEX IF NOT EXISTS "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");
CREATE INDEX IF NOT EXISTS "MessageAttachment_uploadedAt_idx" ON "MessageAttachment"("uploadedAt");

-- ActivityLog conversationId index
CREATE INDEX IF NOT EXISTS "ActivityLog_conversationId_idx" ON "ActivityLog"("conversationId");

