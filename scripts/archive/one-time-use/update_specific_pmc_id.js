/**
 * ═══════════════════════════════════════════════════════════════
 * UPDATE SPECIFIC PMC ID
 * ═══════════════════════════════════════════════════════════════
 * 
 * Updates a specific PMC record to use the new standard hash format
 * 
 * Run: node scripts/update_specific_pmc_id.js PMCCAON96D5D31B
 * ═══════════════════════════════════════════════════════════════
 */

const { PrismaClient } = require('@prisma/client');
const { generatePMCHash, generateUniqueHash } = require('@/lib/hooks/useHashGenerator');

const prisma = new PrismaClient();

async function updateSpecificPMCId(oldCompanyId) {
  console.log(`🔄 Updating PMC with companyId: ${oldCompanyId}\n`);

  try {
    // Find the PMC record
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { companyId: oldCompanyId },
      select: {
        id: true,
        companyId: true,
        email: true,
        companyName: true,
        country: true,
        provinceState: true,
      },
    });

    if (!pmc) {
      console.error(`❌ PMC with companyId "${oldCompanyId}" not found`);
      process.exit(1);
    }

    console.log(`📋 Found PMC:`);
    console.log(`   ID: ${pmc.id}`);
    console.log(`   Current companyId: ${pmc.companyId}`);
    console.log(`   Email: ${pmc.email}`);
    console.log(`   Company Name: ${pmc.companyName}`);
    console.log(`   Country: ${pmc.country || 'N/A'}`);
    console.log(`   Province/State: ${pmc.provinceState || 'N/A'}\n`);

    // Generate new companyId using standard format
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

    console.log(`🔄 Updating companyId: ${pmc.companyId} → ${newCompanyId}`);

    // Update the record
    await prisma.propertyManagementCompany.update({
      where: { id: pmc.id },
      data: { companyId: newCompanyId },
    });

    console.log(`✅ Successfully updated PMC ${pmc.id}`);
    console.log(`   Old companyId: ${pmc.companyId}`);
    console.log(`   New companyId: ${newCompanyId}\n`);

    // Verify the update
    const updated = await prisma.propertyManagementCompany.findUnique({
      where: { id: pmc.id },
      select: { companyId: true },
    });

    if (updated.companyId === newCompanyId) {
      console.log('✅ Verification successful - companyId updated correctly');
    } else {
      console.error('❌ Verification failed - companyId mismatch');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error updating PMC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get companyId from command line argument
const oldCompanyId = process.argv[2];

if (!oldCompanyId) {
  console.error('❌ Please provide a companyId as an argument');
  console.error('   Usage: node scripts/update_specific_pmc_id.js PMCCAON96D5D31B');
  process.exit(1);
}

// Run update
updateSpecificPMCId(oldCompanyId)
  .then(() => {
    console.log('\n✅ Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  });

