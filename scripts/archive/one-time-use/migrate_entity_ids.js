/**
 * ═══════════════════════════════════════════════════════════════
 * MIGRATION SCRIPT: Update Existing Entity IDs
 * ═══════════════════════════════════════════════════════════════
 * 
 * Updates existing PMC, Contractor, and Vendor records to use
 * the new standard hash format (PM, CO, VD prefixes)
 * 
 * Run: node scripts/migrate_entity_ids.js
 * ═══════════════════════════════════════════════════════════════
 */

const { PrismaClient } = require('@prisma/client');
const { generatePMCHash, generateContractorHash, generateVendorHash, generateUniqueHash } = require('@/lib/hooks/useHashGenerator');

const prisma = new PrismaClient();

async function migrateEntityIds() {
  console.log('🔄 Starting entity ID migration...\n');

  try {
    // Migrate PMCs
    console.log('📋 Migrating Property Management Companies...');
    const allPmcs = await prisma.propertyManagementCompany.findMany({
      select: {
        id: true,
        companyId: true,
        email: true,
        companyName: true,
        country: true,
        provinceState: true,
      },
    });
    
    // Filter PMCs that don't start with 'PM'
    const pmcs = allPmcs.filter(pmc => !pmc.companyId || !pmc.companyId.startsWith('PM'));

    console.log(`   Found ${pmcs.length} PMCs to migrate`);
    let pmcUpdated = 0;
    for (const pmc of pmcs) {
      try {
        const newCompanyId = await generateUniqueHash(
          prisma,
          'PMC',
          [
            pmc.email || '',
            pmc.companyName || '',
            pmc.country || 'CA',
            pmc.provinceState || 'ON',
          ]
        );

        await prisma.propertyManagementCompany.update({
          where: { id: pmc.id },
          data: { companyId: newCompanyId },
        });

        pmcUpdated++;
        console.log(`   ✓ Updated PMC ${pmc.id}: ${pmc.companyId} → ${newCompanyId}`);
      } catch (error) {
        console.error(`   ✗ Error updating PMC ${pmc.id}:`, error.message);
      }
    }
    console.log(`   ✅ Migrated ${pmcUpdated}/${pmcs.length} PMCs\n`);

    // Migrate Contractors
    console.log('📋 Migrating Contractors...');
    const allContractors = await prisma.contractor.findMany({
      select: {
        id: true,
        contractorId: true,
        email: true,
        phone: true,
        country: true,
        provinceState: true,
      },
    });
    
    // Filter Contractors that don't start with 'CO'
    const contractors = allContractors.filter(contractor => !contractor.contractorId || !contractor.contractorId.startsWith('CO'));

    console.log(`   Found ${contractors.length} Contractors to migrate`);
    let contractorUpdated = 0;
    for (const contractor of contractors) {
      try {
        const newContractorId = await generateUniqueHash(
          prisma,
          'CONTRACTOR',
          [
            contractor.email || '',
            contractor.phone || '',
            contractor.country || 'CA',
            contractor.provinceState || 'ON',
          ]
        );

        await prisma.contractor.update({
          where: { id: contractor.id },
          data: { contractorId: newContractorId },
        });

        contractorUpdated++;
        console.log(`   ✓ Updated Contractor ${contractor.id}: ${contractor.contractorId} → ${newContractorId}`);
      } catch (error) {
        console.error(`   ✗ Error updating Contractor ${contractor.id}:`, error.message);
      }
    }
    console.log(`   ✅ Migrated ${contractorUpdated}/${contractors.length} Contractors\n`);

    // Migrate Vendors
    console.log('📋 Migrating Vendors...');
    const allVendors = await prisma.vendor.findMany({
      select: {
        id: true,
        vendorId: true,
        email: true,
        phone: true,
        country: true,
        provinceState: true,
      },
    });
    
    // Filter Vendors that don't start with 'VD'
    const vendors = allVendors.filter(vendor => !vendor.vendorId || !vendor.vendorId.startsWith('VD'));

    console.log(`   Found ${vendors.length} Vendors to migrate`);
    let vendorUpdated = 0;
    for (const vendor of vendors) {
      try {
        const newVendorId = await generateUniqueHash(
          prisma,
          'VENDOR',
          [
            vendor.email || '',
            vendor.phone || '',
            vendor.country || 'CA',
            vendor.provinceState || 'ON',
          ]
        );

        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { vendorId: newVendorId },
        });

        vendorUpdated++;
        console.log(`   ✓ Updated Vendor ${vendor.id}: ${vendor.vendorId} → ${newVendorId}`);
      } catch (error) {
        console.error(`   ✗ Error updating Vendor ${vendor.id}:`, error.message);
      }
    }
    console.log(`   ✅ Migrated ${vendorUpdated}/${vendors.length} Vendors\n`);

    console.log('✅ Migration completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - PMCs: ${pmcUpdated}/${pmcs.length}`);
    console.log(`   - Contractors: ${contractorUpdated}/${contractors.length}`);
    console.log(`   - Vendors: ${vendorUpdated}/${vendors.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateEntityIds()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateEntityIds };

