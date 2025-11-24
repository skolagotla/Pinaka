-- Migration: Add Country/Region FKs to Property, Landlord, Tenant, Vendor, Contractor, PMC
-- Created: 2025-11-13

-- ============================================
-- 1. Add new fields to Country model
-- ============================================

ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT;
ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "currencySymbol" TEXT;
ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "dateFormat" TEXT DEFAULT 'YYYY-MM-DD';
ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "timeFormat" TEXT DEFAULT '24h';
ALTER TABLE "Country" ADD COLUMN IF NOT EXISTS "legalSystem" TEXT;

-- ============================================
-- 2. Add new fields to Region model
-- ============================================

ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "timezone" TEXT;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "utcOffset" INTEGER;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "legalFramework" TEXT;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "rentControl" BOOLEAN DEFAULT false;
ALTER TABLE "Region" ADD COLUMN IF NOT EXISTS "evictionRules" JSONB;

-- Add indexes for Region
CREATE INDEX IF NOT EXISTS "Region_countryCode_idx" ON "Region"("countryCode");
CREATE INDEX IF NOT EXISTS "Region_timezone_idx" ON "Region"("timezone");

-- ============================================
-- 3. Add Country/Region FKs to Property
-- ============================================

ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "Property" ADD CONSTRAINT "Property_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "Property" ADD CONSTRAINT "Property_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Property_countryCode_idx" ON "Property"("countryCode");
CREATE INDEX IF NOT EXISTS "Property_regionCode_idx" ON "Property"("regionCode");
CREATE INDEX IF NOT EXISTS "Property_countryCode_regionCode_idx" ON "Property"("countryCode", "regionCode");
CREATE INDEX IF NOT EXISTS "Property_countryCode_city_idx" ON "Property"("countryCode", "city");
CREATE INDEX IF NOT EXISTS "Property_countryCode_regionCode_city_idx" ON "Property"("countryCode", "regionCode", "city");

-- ============================================
-- 4. Add Country/Region FKs to Landlord
-- ============================================

ALTER TABLE "Landlord" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Landlord" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "Landlord" ADD CONSTRAINT "Landlord_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "Landlord" ADD CONSTRAINT "Landlord_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Landlord_countryCode_idx" ON "Landlord"("countryCode");
CREATE INDEX IF NOT EXISTS "Landlord_countryCode_regionCode_idx" ON "Landlord"("countryCode", "regionCode");

-- ============================================
-- 5. Add Country/Region FKs to Tenant
-- ============================================

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Tenant_countryCode_idx" ON "Tenant"("countryCode");
CREATE INDEX IF NOT EXISTS "Tenant_countryCode_regionCode_idx" ON "Tenant"("countryCode", "regionCode");

-- ============================================
-- 6. Add Country/Region FKs to Vendor
-- ============================================

ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Vendor" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Vendor_countryCode_idx" ON "Vendor"("countryCode");
CREATE INDEX IF NOT EXISTS "Vendor_countryCode_regionCode_idx" ON "Vendor"("countryCode", "regionCode");

-- ============================================
-- 7. Add Country/Region FKs to Contractor
-- ============================================

ALTER TABLE "Contractor" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "Contractor" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Contractor_countryCode_idx" ON "Contractor"("countryCode");
CREATE INDEX IF NOT EXISTS "Contractor_countryCode_regionCode_idx" ON "Contractor"("countryCode", "regionCode");

-- ============================================
-- 8. Add Country/Region FKs to PropertyManagementCompany
-- ============================================

ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "countryCode" TEXT;
ALTER TABLE "PropertyManagementCompany" ADD COLUMN IF NOT EXISTS "regionCode" TEXT;

-- Add foreign key constraints
ALTER TABLE "PropertyManagementCompany" ADD CONSTRAINT "PropertyManagementCompany_countryCode_fkey" 
    FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE SET NULL;

ALTER TABLE "PropertyManagementCompany" ADD CONSTRAINT "PropertyManagementCompany_region_fkey" 
    FOREIGN KEY ("countryCode", "regionCode") REFERENCES "Region"("countryCode", "code") ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS "PropertyManagementCompany_countryCode_idx" ON "PropertyManagementCompany"("countryCode");
CREATE INDEX IF NOT EXISTS "PropertyManagementCompany_countryCode_regionCode_idx" ON "PropertyManagementCompany"("countryCode", "regionCode");

