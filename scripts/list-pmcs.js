/**
 * Script to list all PMCs in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPMCs() {
  console.log(`\n🔍 Listing all PMCs in the database...\n`);

  try {
    const pmcs = await prisma.propertyManagementCompany.findMany({
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (pmcs.length === 0) {
      console.log(`❌ No PMCs found in the database.\n`);
      return;
    }

    console.log(`✅ Found ${pmcs.length} PMC(s):\n`);
    pmcs.forEach((pmc, index) => {
      console.log(`${index + 1}. ${pmc.companyName}`);
      console.log(`   Email: ${pmc.email}`);
      console.log(`   Phone: ${pmc.phone || 'N/A'}`);
      console.log(`   ID: ${pmc.id}`);
      console.log(`   Created: ${pmc.createdAt.toISOString()}`);
      console.log('');
    });

  } catch (error) {
    console.error(`\n❌ Error listing PMCs:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listPMCs()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

