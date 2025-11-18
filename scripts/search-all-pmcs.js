/**
 * Script to search all PMCs and show details
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function searchAllPMCs() {
  console.log(`\n🔍 Searching all PMCs in database...\n`);

  try {
    // Get all PMCs
    const pmcs = await prisma.propertyManagementCompany.findMany({
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

    console.log(`Found ${pmcs.length} PMC record(s):\n`);

    if (pmcs.length === 0) {
      console.log(`No PMCs found.`);
    } else {
      pmcs.forEach((pmc, index) => {
        console.log(`${index + 1}. ${pmc.companyName}`);
        console.log(`   ID: ${pmc.id}`);
        console.log(`   Email: ${pmc.email}`);
        console.log(`   Company ID: ${pmc.companyId}`);
        console.log(`   Phone: ${pmc.phone || 'N/A'}`);
        console.log(`   Managed Landlords: ${pmc.pmcRelationships.length}`);
        console.log(`   Created: ${pmc.createdAt}`);
        console.log('');
      });
    }

    // Also check invitations
    console.log(`\n🔍 Checking invitations for PMC type...\n`);
    const invitations = await prisma.invitation.findMany({
      where: {
        type: 'pmc',
      },
      include: {
        pmc: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${invitations.length} PMC invitation(s):\n`);
    invitations.forEach((inv, index) => {
      console.log(`${index + 1}. ${inv.email}`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Approval Status: ${inv.approvalStatus || 'N/A'}`);
      if (inv.pmc) {
        console.log(`   ✅ PMC Record: ${inv.pmc.companyName} (${inv.pmc.email})`);
      } else {
        console.log(`   ⚠️  No PMC record created yet`);
      }
      console.log('');
    });

  } catch (error) {
    console.error(`\n❌ Error:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

searchAllPMCs()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

