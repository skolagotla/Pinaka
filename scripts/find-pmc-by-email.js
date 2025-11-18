/**
 * Script to find PMC by email (case-insensitive search)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findPMCByEmail(email) {
  console.log(`\n🔍 Searching for PMC with email: ${email}\n`);

  try {
    // Try exact match first
    let pmc = await prisma.propertyManagementCompany.findUnique({
      where: { email },
    });

    if (!pmc) {
      // Try case-insensitive search
      const pmcs = await prisma.propertyManagementCompany.findMany({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });

      if (pmcs.length > 0) {
        pmc = pmcs[0];
        console.log(`⚠️  Found PMC with case-insensitive match:`);
      }
    }

    if (pmc) {
      console.log(`✅ Found PMC:`);
      console.log(`   ID: ${pmc.id}`);
      console.log(`   Company Name: ${pmc.companyName}`);
      console.log(`   Email: ${pmc.email}`);
      console.log(`   Phone: ${pmc.phone || 'N/A'}`);
      console.log(`   Created: ${pmc.createdAt}`);
      console.log(`\n📋 Full record:`, JSON.stringify(pmc, null, 2));
      return pmc;
    } else {
      console.log(`❌ No PMC found with email: ${email}`);
      
      // Check invitations table
      console.log(`\n🔍 Checking invitations table...`);
      const invitation = await prisma.invitation.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
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
      });

      if (invitation) {
        console.log(`✅ Found invitation:`);
        console.log(`   Email: ${invitation.email}`);
        console.log(`   Type: ${invitation.type}`);
        console.log(`   Status: ${invitation.status}`);
        if (invitation.pmc) {
          console.log(`   Associated PMC: ${invitation.pmc.companyName} (${invitation.pmc.email})`);
          return invitation.pmc;
        } else {
          console.log(`   ⚠️  No PMC record associated with this invitation yet.`);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error(`\n❌ Error searching for PMC:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2] || 'skolagotla@gmail.com';

findPMCByEmail(email)
  .then((pmc) => {
    if (pmc) {
      console.log(`\n✅ PMC found. Use delete script to remove it.`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

