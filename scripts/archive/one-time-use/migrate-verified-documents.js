/**
 * Migration Script: Fix Verified Document Names
 * 
 * Updates all documents that have verifiedBy email but null/undefined verifiedByName
 * Looks up the actual name from landlord/tenant tables and updates the document
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateVerifiedDocuments() {
  console.log('\n🔄 Starting migration: Fix verified document names...\n');

  try {
    // Find all verified documents with null or missing verifiedByName
    const verifiedDocs = await prisma.document.findMany({
      where: {
        isVerified: true,
        OR: [
          { verifiedByName: null },
          { verifiedByName: '' },
          { verifiedByName: 'null' },
          { verifiedByName: 'undefined' },
        ]
      },
      select: {
        id: true,
        verifiedBy: true,
        verifiedByName: true,
        verifiedByRole: true,
        originalName: true,
      }
    });

    console.log(`📊 Found ${verifiedDocs.length} documents with missing verifier names\n`);

    if (verifiedDocs.length === 0) {
      console.log('✅ No documents need updating!\n');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const doc of verifiedDocs) {
      try {
        if (!doc.verifiedBy) {
          console.log(`⚠️  Document "${doc.originalName}" (${doc.id}): No verifiedBy email found, skipping`);
          errorCount++;
          continue;
        }

        // Look up the verifier by email
        let verifierName = null;
        let verifierRole = doc.verifiedByRole;

        // Try to find in landlord table
        const landlord = await prisma.landlord.findUnique({
          where: { email: doc.verifiedBy },
          select: { firstName: true, lastName: true, email: true }
        });

        if (landlord) {
          const firstName = landlord.firstName || '';
          const lastName = landlord.lastName || '';
          verifierName = `${firstName} ${lastName}`.trim() || landlord.email || 'Unknown Landlord';
          verifierRole = 'landlord';
        } else {
          // Try to find in tenant table
          const tenant = await prisma.tenant.findUnique({
            where: { email: doc.verifiedBy },
            select: { firstName: true, lastName: true, email: true }
          });

          if (tenant) {
            const firstName = tenant.firstName || '';
            const lastName = tenant.lastName || '';
            verifierName = `${firstName} ${lastName}`.trim() || tenant.email || 'Unknown Tenant';
            verifierRole = 'tenant';
          }
        }

        if (!verifierName) {
          console.log(`⚠️  Document "${doc.originalName}" (${doc.id}): Could not find verifier with email ${doc.verifiedBy}`);
          errorCount++;
          continue;
        }

        // Update the document
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            verifiedByName: verifierName,
            verifiedByRole: verifierRole,
          }
        });

        console.log(`✅ Updated: "${doc.originalName}" → Verified by: ${verifierName} (${verifierRole})`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating document ${doc.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} documents`);
    console.log(`❌ Errors/Skipped: ${errorCount} documents`);
    console.log(`📝 Total processed: ${verifiedDocs.length} documents`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateVerifiedDocuments()
  .then(() => {
    console.log('✅ Migration completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

