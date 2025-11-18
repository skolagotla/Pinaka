const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listLandlordsAndPMCs() {
  console.log('\n=== Current Landlords ===');
  const landlords = await prisma.landlord.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      _count: {
        select: {
          properties: true,
          pmcRelationships: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  landlords.forEach((ll, idx) => {
    console.log(`${idx + 1}. ${ll.firstName} ${ll.lastName} (${ll.email})`);
    console.log(`   ID: ${ll.id}`);
    console.log(`   Created: ${ll.createdAt.toISOString()}`);
    console.log(`   Properties: ${ll._count.properties}, PMC Relationships: ${ll._count.pmcRelationships}`);
  });

  console.log('\n=== Current PMCs ===');
  const pmcs = await prisma.propertyManagementCompany.findMany({
    select: {
      id: true,
      email: true,
      companyName: true,
      createdAt: true,
      _count: {
        select: {
          pmcRelationships: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  pmcs.forEach((pmc, idx) => {
    console.log(`${idx + 1}. ${pmc.companyName} (${pmc.email})`);
    console.log(`   ID: ${pmc.id}`);
    console.log(`   Created: ${pmc.createdAt.toISOString()}`);
    console.log(`   Landlord Relationships: ${pmc._count.pmcRelationships}`);
  });

  return { landlords, pmcs };
}

async function deleteLandlord(landlordId) {
  console.log(`\n🗑️  Deleting landlord: ${landlordId}`);
  
  // Prisma will cascade delete related data due to onDelete: Cascade
  // This includes: properties, units, leases, tenants, etc.
  const deleted = await prisma.landlord.delete({
    where: { id: landlordId }
  });
  
  console.log(`✅ Deleted landlord: ${deleted.firstName} ${deleted.lastName} (${deleted.email})`);
  return deleted;
}

async function deletePMC(pmcId) {
  console.log(`\n🗑️  Deleting PMC: ${pmcId}`);
  
  // Prisma will cascade delete related data
  // This includes: PMCLandlord relationships, invitations, etc.
  const deleted = await prisma.propertyManagementCompany.delete({
    where: { id: pmcId }
  });
  
  console.log(`✅ Deleted PMC: ${deleted.companyName} (${deleted.email})`);
  return deleted;
}

async function main() {
  try {
    // List all landlords and PMCs
    const { landlords, pmcs } = await listLandlordsAndPMCs();

    if (landlords.length === 0 && pmcs.length === 0) {
      console.log('\n⚠️  No landlords or PMCs found in database.');
      return;
    }

    // Delete the most recently created landlord (assuming it's the test data)
    if (landlords.length > 0) {
      const testLandlord = landlords[0]; // Most recent
      console.log(`\n📋 Will delete most recent landlord: ${testLandlord.firstName} ${testLandlord.lastName}`);
      await deleteLandlord(testLandlord.id);
    }

    // Delete the most recently created PMC (assuming it's the test data)
    if (pmcs.length > 0) {
      const testPMC = pmcs[0]; // Most recent
      console.log(`\n📋 Will delete most recent PMC: ${testPMC.companyName}`);
      await deletePMC(testPMC.id);
    }

    console.log('\n✅ Test data deletion complete!');
    
    // List remaining data
    console.log('\n=== Remaining Data ===');
    const remaining = await listLandlordsAndPMCs();
    
  } catch (error) {
    console.error('\n❌ Error deleting test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

