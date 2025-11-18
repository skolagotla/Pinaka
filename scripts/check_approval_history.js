/**
 * Check approval history for PMC
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApprovalHistory() {
  try {
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { companyId: 'PM3A98B0C3' },
      select: {
        id: true,
        companyId: true,
        approvalStatus: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    if (!pmc) {
      console.log('❌ PMC not found');
      return;
    }

    console.log('📋 PMC Approval Info:');
    console.log(`   Status: ${pmc.approvalStatus}`);
    console.log(`   Approved By: ${pmc.approvedBy || 'N/A'}`);
    console.log(`   Approved At: ${pmc.approvedAt || 'N/A'}`);
    console.log(`   Created At: ${pmc.createdAt}\n`);

    // Check activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        entityType: 'propertyManagementCompany',
        entityId: pmc.id,
        OR: [
          { action: 'APPROVE' },
          { action: 'CREATE' },
          { action: 'UPDATE' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`📝 Activity Logs (${activityLogs.length} found):`);
    activityLogs.forEach((log, index) => {
      console.log(`\n   ${index + 1}. ${log.action} - ${log.userRole}`);
      console.log(`      User: ${log.userEmail || log.userId}`);
      console.log(`      Time: ${log.createdAt}`);
      if (log.details) {
        console.log(`      Details: ${JSON.stringify(log.details)}`);
      }
    });

    // Check if there's an admin who approved
    if (pmc.approvedBy) {
      const admin = await prisma.admin.findUnique({
        where: { id: pmc.approvedBy },
        select: { id: true, email: true, name: true },
      });
      if (admin) {
        console.log(`\n👤 Approved By Admin:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Name: ${admin.name || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApprovalHistory();

