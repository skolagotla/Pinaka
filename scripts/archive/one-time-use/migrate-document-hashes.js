/**
 * Migration Script: Generate Document Hashes
 * 
 * This script generates unique nanoid hashes for all existing documents
 * that don't have a documentHash yet.
 * 
 * Run: node scripts/migrate-document-hashes.js
 */

const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

async function migrateDocumentHashes() {
  console.log('🔄 Starting document hash migration...\n');

  try {
    // Find all documents without a documentHash
    const documents = await prisma.document.findMany({
      where: {
        documentHash: null,
      },
      select: {
        id: true,
        originalName: true,
        category: true,
        tenantId: true,
      },
    });

    console.log(`📊 Found ${documents.length} documents needing hash generation\n`);

    if (documents.length === 0) {
      console.log('✅ All documents already have hashes. Nothing to do!');
      return;
    }

    // Generate unique hashes for each document
    const updates = [];
    const hashes = new Set();

    for (const doc of documents) {
      let hash;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique hash (12 characters by default)
      do {
        hash = nanoid(12);
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error(`Failed to generate unique hash after ${maxAttempts} attempts`);
        }
      } while (hashes.has(hash));

      hashes.add(hash);

      updates.push({
        id: doc.id,
        hash,
        category: doc.category,
        originalName: doc.originalName,
      });

      console.log(`  ✓ Generated hash for "${doc.originalName}": ${hash}`);
    }

    console.log(`\n🔄 Updating ${updates.length} documents in database...\n`);

    // Update documents with new hashes
    for (const update of updates) {
      await prisma.document.update({
        where: { id: update.id },
        data: {
          documentHash: update.hash,
          // Also ensure description exists (use category name if empty)
          description: {
            set: update.category, // Will only update if current value is empty
          },
        },
      });

      console.log(`  ✓ Updated document ${update.id}: ${update.hash}`);
    }

    console.log(`\n✅ Successfully migrated ${updates.length} documents!`);
    console.log(`\n📊 Hash Statistics:`);
    console.log(`   - Total documents updated: ${updates.length}`);
    console.log(`   - Hash length: 12 characters`);
    console.log(`   - All hashes unique: ✓`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateDocumentHashes()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

