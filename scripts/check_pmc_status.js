/**
 * Check PMC approval status
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPMCStatus() {
  try {
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { companyId: 'PM3A98B0C3' },
      select: {
        id: true,
        companyId: true,
        email: true,
        companyName: true,
        approvalStatus: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
        invitedBy: true,
        invitedAt: true,
      },
    });

    if (!pmc) {
      console.log('❌ PMC not found');
      return;
    }

    console.log('📋 PMC Details:');
    console.log(JSON.stringify(pmc, null, 2));

    // Check related invitation
    const invitation = await prisma.invitation.findFirst({
      where: { pmcId: pmc.id },
      select: {
        id: true,
        email: true,
        type: true,
        status: true,
        completedAt: true,
        createdAt: true,
        invitedByRole: true,
      },
    });

    if (invitation) {
      console.log('\n📧 Related Invitation:');
      console.log(JSON.stringify(invitation, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPMCStatus();

