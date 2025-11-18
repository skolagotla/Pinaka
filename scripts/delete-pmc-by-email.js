/**
 * Script to delete a PMC (Property Management Company) by email
 * Usage: node scripts/delete-pmc-by-email.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deletePMCByEmail(email) {
  console.log(`\n🔍 Looking for PMC with email: ${email}\n`);

  try {
    // First, find the PMC
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { email },
      include: {
        pmcRelationships: {
          include: {
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!pmc) {
      console.log(`❌ No PMC found with email: ${email}`);
      return;
    }

    console.log(`✅ Found PMC:`);
    console.log(`   ID: ${pmc.id}`);
    console.log(`   Company Name: ${pmc.companyName}`);
    console.log(`   Email: ${pmc.email}`);
    console.log(`   Managed Landlords: ${pmc.pmcRelationships.length}`);

    if (pmc.pmcRelationships.length > 0) {
      console.log(`\n⚠️  WARNING: This PMC manages ${pmc.pmcRelationships.length} landlord(s):`);
      pmc.pmcRelationships.forEach((rel, index) => {
        console.log(`   ${index + 1}. ${rel.landlord.firstName} ${rel.landlord.lastName} (${rel.landlord.email})`);
      });
      console.log(`\n   These relationships will also be deleted.`);
    }

    // Delete the PMC (cascade will handle related records)
    console.log(`\n🗑️  Deleting PMC and related records...`);
    
    await prisma.propertyManagementCompany.delete({
      where: { id: pmc.id },
    });

    console.log(`\n✅ Successfully deleted PMC: ${pmc.companyName} (${pmc.email})`);
    console.log(`   Deleted ${pmc.pmcRelationships.length} PMC-Landlord relationship(s)\n`);

  } catch (error) {
    console.error(`\n❌ Error deleting PMC:`, error);
    if (error.code === 'P2003') {
      console.error(`   Foreign key constraint violation. Some related records may still exist.`);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'skolagotla@gmail.com';

deletePMCByEmail(email)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

