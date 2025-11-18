/**
 * Script to update existing landlord IDs to use the latest hash generation logic
 * 
 * This script:
 * 1. Checks all landlords in the database
 * 2. Regenerates landlordId using the current hash generation logic
 * 3. Updates the landlordId field
 * 
 * WARNING: This will update landlordId values, which may affect relationships.
 * Make sure to backup your database before running this script.
 * 
 * Usage: node scripts/update-landlord-ids.js [--dry-run]
 */

const { PrismaClient } = require('@prisma/client');
const { generateLandlordHash } = require('@/lib/hooks/useHashGenerator');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  } else {
    console.log('⚠️  WARNING: This will update landlord IDs in the database!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Fetch all landlords
    const landlords = await prisma.landlord.findMany({
      select: {
        id: true,
        landlordId: true,
        email: true,
        phone: true,
        country: true,
        provinceState: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${landlords.length} landlord(s) to process\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const landlord of landlords) {
      try {
        // Check if landlordId already follows the correct format (LL prefix)
        const hasCorrectFormat = landlord.landlordId && landlord.landlordId.startsWith('LL') && landlord.landlordId.length === 10;

        if (hasCorrectFormat) {
          console.log(`✓ Skipping ${landlord.firstName} ${landlord.lastName} (${landlord.email}) - Already has correct format: ${landlord.landlordId}`);
          skipped++;
          continue;
        }

        // Validate required fields for hash generation
        if (!landlord.email || !landlord.phone || !landlord.country || !landlord.provinceState) {
          console.error(`✗ Skipping ${landlord.firstName} ${landlord.lastName} (${landlord.email}) - Missing required fields for hash generation`);
          errors++;
          continue;
        }

        // Generate new landlord ID using current logic
        const newLandlordId = generateLandlordHash({
          email: landlord.email,
          phone: landlord.phone,
          country: landlord.country,
          provinceState: landlord.provinceState,
        });

        // Check if new ID already exists (collision check)
        const existing = await prisma.landlord.findUnique({
          where: { landlordId: newLandlordId },
        });

        if (existing && existing.id !== landlord.id) {
          console.error(`✗ Collision detected for ${landlord.email}: ${newLandlordId} already exists`);
          console.error(`  Existing landlord: ${existing.firstName} ${existing.lastName} (${existing.email})`);
          errors++;
          continue;
        }

        // Check if any properties reference this landlordId (they use internal id, not landlordId, so safe)
        const propertyCount = await prisma.property.count({
          where: { landlordId: landlord.id }, // Properties use internal id, not landlordId
        });

        if (propertyCount > 0) {
          console.log(`  ⚠️  Note: This landlord has ${propertyCount} property/properties. Properties use internal ID, so update is safe.`);
        }

        if (isDryRun) {
          console.log(`[DRY RUN] Would update ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);
          console.log(`  Old ID: ${landlord.landlordId || 'NULL'}`);
          console.log(`  New ID: ${newLandlordId}\n`);
        } else {
          // Update the landlord ID
          await prisma.landlord.update({
            where: { id: landlord.id },
            data: { landlordId: newLandlordId },
          });

          console.log(`✓ Updated ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);
          console.log(`  Old ID: ${landlord.landlordId || 'NULL'}`);
          console.log(`  New ID: ${newLandlordId}\n`);
        }

        updated++;
      } catch (error) {
        console.error(`✗ Error processing ${landlord.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log(`  Total landlords: ${landlords.length}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (already correct): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('='.repeat(50));

    if (isDryRun) {
      console.log('\n💡 This was a dry run. Run without --dry-run to apply changes.');
    } else {
      console.log('\n✅ Update complete!');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

