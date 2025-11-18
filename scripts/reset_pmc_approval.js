/**
 * Reset PMC approval status to PENDING
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPMCApproval() {
  try {
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { companyId: 'PM3A98B0C3' },
      select: {
        id: true,
        companyId: true,
        email: true,
        approvalStatus: true,
        approvedBy: true,
        approvedAt: true,
      },
    });

    if (!pmc) {
      console.log('❌ PMC not found');
      return;
    }

    console.log('📋 Current Status:');
    console.log(`   Status: ${pmc.approvalStatus}`);
    console.log(`   Approved By: ${pmc.approvedBy || 'N/A'}`);
    console.log(`   Approved At: ${pmc.approvedAt || 'N/A'}\n`);

    console.log('🔄 Resetting to PENDING...');

    await prisma.propertyManagementCompany.update({
      where: { id: pmc.id },
      data: {
        approvalStatus: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
      },
    });

    console.log('✅ Successfully reset to PENDING');
    console.log('   The PMC application is now ready for approval\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPMCApproval();

