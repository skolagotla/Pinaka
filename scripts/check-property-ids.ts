/**
 * Check Script: Count records that need propertyId backfilling
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecords() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CHECKING RECORDS FOR PROPERTY ID BACKFILL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Check Documents
    const documentsWithoutProperty = await prisma.document.count({
      where: {
        propertyId: null,
        isDeleted: false,
      },
    });

    const totalDocuments = await prisma.document.count({
      where: { isDeleted: false },
    });

    console.log(`📄 Documents:`);
    console.log(`   Total (non-deleted): ${totalDocuments}`);
    console.log(`   Without propertyId: ${documentsWithoutProperty}`);
    console.log(`   With propertyId: ${totalDocuments - documentsWithoutProperty}\n`);

    // Check Expenses
    const expensesWithoutProperty = await prisma.expense.count({
      where: {
        propertyId: null,
      },
    });

    const totalExpenses = await prisma.expense.count();

    console.log(`💰 Expenses:`);
    console.log(`   Total: ${totalExpenses}`);
    console.log(`   Without propertyId: ${expensesWithoutProperty}`);
    console.log(`   With propertyId: ${totalExpenses - expensesWithoutProperty}\n`);

    // Check Tasks
    const tasksWithoutProperty = await prisma.task.count({
      where: {
        propertyId: null,
      },
    });

    const totalTasks = await prisma.task.count();

    console.log(`✅ Tasks:`);
    console.log(`   Total: ${totalTasks}`);
    console.log(`   Without propertyId: ${tasksWithoutProperty}`);
    console.log(`   With propertyId: ${totalTasks - tasksWithoutProperty}\n`);

    // Check if there are any tenants with active leases (for document inference)
    const tenantsWithActiveLeases = await prisma.tenant.count({
      where: {
        leaseTenants: {
          some: {
            lease: {
              status: {
                in: ['Active', 'Pending'],
              },
            },
          },
        },
      },
    });

    console.log(`👥 Tenants with active leases: ${tenantsWithActiveLeases}`);
    console.log(`   (These can be used to infer propertyId for documents)\n`);

    // Summary
    const totalNeedingBackfill = documentsWithoutProperty + expensesWithoutProperty + tasksWithoutProperty;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total records needing backfill: ${totalNeedingBackfill}`);
    
    if (totalNeedingBackfill === 0) {
      console.log(`\n✅ All records already have propertyId or database is empty.`);
    } else {
      console.log(`\n⚠️  ${totalNeedingBackfill} records need propertyId backfilling.`);
      console.log(`   Run: npm run backfill-property-ids`);
    }
  } catch (error) {
    console.error('❌ Error checking records:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecords();

