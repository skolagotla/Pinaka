/**
 * Script to delete an invitation by email
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteInvitationByEmail(email) {
  console.log(`\n🔍 Looking for invitation with email: ${email}\n`);

  try {
    // Find the invitation
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
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invitation) {
      console.log(`❌ No invitation found with email: ${email}`);
      return;
    }

    console.log(`✅ Found invitation:`);
    console.log(`   ID: ${invitation.id}`);
    console.log(`   Email: ${invitation.email}`);
    console.log(`   Type: ${invitation.type}`);
    console.log(`   Status: ${invitation.status}`);
    console.log(`   Approval Status: ${invitation.approvalStatus || 'N/A'}`);
    console.log(`   Created: ${invitation.createdAt}`);
    
    if (invitation.pmc) {
      console.log(`   ⚠️  WARNING: Associated PMC: ${invitation.pmc.companyName} (${invitation.pmc.email})`);
    }
    if (invitation.landlord) {
      console.log(`   ⚠️  WARNING: Associated Landlord: ${invitation.landlord.firstName} ${invitation.landlord.lastName} (${invitation.landlord.email})`);
    }

    // Delete the invitation
    console.log(`\n🗑️  Deleting invitation...`);
    
    await prisma.invitation.delete({
      where: { id: invitation.id },
    });

    console.log(`\n✅ Successfully deleted invitation for: ${invitation.email}`);
    console.log(`   Type: ${invitation.type}`);
    console.log(`   Status: ${invitation.status}\n`);

  } catch (error) {
    console.error(`\n❌ Error deleting invitation:`, error);
    if (error.code === 'P2003') {
      console.error(`   Foreign key constraint violation. Some related records may still exist.`);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2] || 'skolagotla@gmail.com';

deleteInvitationByEmail(email)
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
