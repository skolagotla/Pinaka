/**
 * Script to update existing Landlord and Tenant IDs to use the latest hash generation logic
 * 
 * This script:
 * 1. Checks all landlords and tenants in the database
 * 2. Regenerates IDs using the current hash generation logic
 * 3. Updates the landlordId/tenantId fields
 * 
 * WARNING: This will update ID values. Make sure to backup your database before running.
 * 
 * Usage: node scripts/update-entity-ids.js [--dry-run] [--landlords-only] [--tenants-only]
 */

const { PrismaClient } = require('@prisma/client');
const { generateLandlordHash, generateTenantHash } = require('@/lib/hooks/useHashGenerator');

const prisma = new PrismaClient();

async function updateLandlords(isDryRun) {
  console.log('\n' + '='.repeat(60));
  console.log('UPDATING LANDLORD IDs');
  console.log('='.repeat(60) + '\n');

  try {
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
        // Check if landlordId already follows the correct format (LL prefix, 10 chars)
        const hasCorrectFormat = landlord.landlordId && landlord.landlordId.startsWith('LL') && landlord.landlordId.length === 10;

        if (hasCorrectFormat) {
          console.log(`✓ Skipping ${landlord.firstName} ${landlord.lastName} (${landlord.email}) - Already has correct format: ${landlord.landlordId}`);
          skipped++;
          continue;
        }

        // Validate required fields for hash generation
        if (!landlord.email || !landlord.phone || !landlord.country || !landlord.provinceState) {
          console.error(`✗ Skipping ${landlord.firstName} ${landlord.lastName} (${landlord.email}) - Missing required fields`);
          console.error(`  Missing: ${!landlord.email ? 'email ' : ''}${!landlord.phone ? 'phone ' : ''}${!landlord.country ? 'country ' : ''}${!landlord.provinceState ? 'provinceState' : ''}`);
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

        if (isDryRun) {
          console.log(`[DRY RUN] Would update ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);
          console.log(`  Old ID: ${landlord.landlordId || 'NULL'}`);
          console.log(`  New ID: ${newLandlordId}\n`);
        } else {
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
        console.error(`✗ Error processing landlord ${landlord.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '-'.repeat(60));
    console.log('Landlord Summary:');
    console.log(`  Total: ${landlords.length}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (already correct): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('-'.repeat(60));

    return { updated, skipped, errors, total: landlords.length };
  } catch (error) {
    console.error('❌ Fatal error updating landlords:', error);
    throw error;
  }
}

async function updateTenants(isDryRun) {
  console.log('\n' + '='.repeat(60));
  console.log('UPDATING TENANT IDs');
  console.log('='.repeat(60) + '\n');

  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        tenantId: true,
        email: true,
        phone: true,
        country: true,
        provinceState: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${tenants.length} tenant(s) to process\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const tenant of tenants) {
      try {
        // Check if tenantId already follows the correct format (TN prefix, 10 chars)
        const hasCorrectFormat = tenant.tenantId && tenant.tenantId.startsWith('TN') && tenant.tenantId.length === 10;

        if (hasCorrectFormat) {
          console.log(`✓ Skipping ${tenant.firstName} ${tenant.lastName} (${tenant.email}) - Already has correct format: ${tenant.tenantId}`);
          skipped++;
          continue;
        }

        // Validate required fields for hash generation
        if (!tenant.email || !tenant.phone || !tenant.country || !tenant.provinceState) {
          console.error(`✗ Skipping ${tenant.firstName} ${tenant.lastName} (${tenant.email}) - Missing required fields`);
          console.error(`  Missing: ${!tenant.email ? 'email ' : ''}${!tenant.phone ? 'phone ' : ''}${!tenant.country ? 'country ' : ''}${!tenant.provinceState ? 'provinceState' : ''}`);
          errors++;
          continue;
        }

        // Generate new tenant ID using current logic
        const newTenantId = generateTenantHash({
          email: tenant.email,
          phone: tenant.phone,
          country: tenant.country,
          provinceState: tenant.provinceState,
        });

        // Check if new ID already exists (collision check)
        const existing = await prisma.tenant.findUnique({
          where: { tenantId: newTenantId },
        });

        if (existing && existing.id !== tenant.id) {
          console.error(`✗ Collision detected for ${tenant.email}: ${newTenantId} already exists`);
          console.error(`  Existing tenant: ${existing.firstName} ${existing.lastName} (${existing.email})`);
          errors++;
          continue;
        }

        if (isDryRun) {
          console.log(`[DRY RUN] Would update ${tenant.firstName} ${tenant.lastName} (${tenant.email})`);
          console.log(`  Old ID: ${tenant.tenantId || 'NULL'}`);
          console.log(`  New ID: ${newTenantId}\n`);
        } else {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { tenantId: newTenantId },
          });

          console.log(`✓ Updated ${tenant.firstName} ${tenant.lastName} (${tenant.email})`);
          console.log(`  Old ID: ${tenant.tenantId || 'NULL'}`);
          console.log(`  New ID: ${newTenantId}\n`);
        }

        updated++;
      } catch (error) {
        console.error(`✗ Error processing tenant ${tenant.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '-'.repeat(60));
    console.log('Tenant Summary:');
    console.log(`  Total: ${tenants.length}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped (already correct): ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log('-'.repeat(60));

    return { updated, skipped, errors, total: tenants.length };
  } catch (error) {
    console.error('❌ Fatal error updating tenants:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const landlordsOnly = args.includes('--landlords-only');
  const tenantsOnly = args.includes('--tenants-only');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  } else {
    console.log('⚠️  WARNING: This will update Landlord and Tenant IDs in the database!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    let landlordStats = null;
    let tenantStats = null;

    // Update landlords
    if (!tenantsOnly) {
      landlordStats = await updateLandlords(isDryRun);
    }

    // Update tenants
    if (!landlordsOnly) {
      tenantStats = await updateTenants(isDryRun);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(60));
    
    if (landlordStats) {
      console.log(`\nLandlords: ${landlordStats.total} total, ${landlordStats.updated} updated, ${landlordStats.skipped} skipped, ${landlordStats.errors} errors`);
    }
    
    if (tenantStats) {
      console.log(`Tenants: ${tenantStats.total} total, ${tenantStats.updated} updated, ${tenantStats.skipped} skipped, ${tenantStats.errors} errors`);
    }

    const totalUpdated = (landlordStats?.updated || 0) + (tenantStats?.updated || 0);
    const totalErrors = (landlordStats?.errors || 0) + (tenantStats?.errors || 0);

    console.log(`\nOverall: ${totalUpdated} updated, ${totalErrors} errors`);
    console.log('='.repeat(60));

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

