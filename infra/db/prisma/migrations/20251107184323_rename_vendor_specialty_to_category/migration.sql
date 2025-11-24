-- AlterTable: Rename specialty to category in Vendor table
ALTER TABLE "Vendor" RENAME COLUMN "specialty" TO "category";

-- Drop the old index and create a new one
DROP INDEX IF EXISTS "Vendor_specialty_idx";
CREATE INDEX IF NOT EXISTS "Vendor_category_idx" ON "Vendor"("category");
