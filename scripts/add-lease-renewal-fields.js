/**
 * Add renewal decision fields to Lease table
 * These fields are defined in the Prisma schema but missing from the database
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { getDatabaseUrl } = require('../lib/utils/db-config');

// Get the active database URL
const databaseUrl = getDatabaseUrl() || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Create Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 ADD RENEWAL DECISION FIELDS TO LEASE TABLE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Add columns
    await prisma.$executeRaw`
      ALTER TABLE "Lease" 
      ADD COLUMN IF NOT EXISTS "renewalDecision" TEXT,
      ADD COLUMN IF NOT EXISTS "renewalDecisionAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "renewalDecisionBy" TEXT;
    `;
    console.log('✅ Added renewal decision columns to Lease table');

    // Add index
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Lease_renewalDecision_idx" ON "Lease"("renewalDecision");
    `;
    console.log('✅ Created index on renewalDecision');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Renewal decision fields added to Lease table');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('ℹ️  Fields may already exist - this is okay');
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

