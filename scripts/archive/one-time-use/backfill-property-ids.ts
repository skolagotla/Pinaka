/**
 * Backfill Script: Populate propertyId in Document, Task, and Expense models
 * 
 * This script infers propertyId from existing relationships:
 * - Document: tenantId → LeaseTenant → Lease → Unit → Property
 * - Expense: maintenanceRequestId → MaintenanceRequest → Property
 * - Task: linkedEntityType/linkedEntityId → (various paths to Property)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillDocumentPropertyIds() {
  console.log('🔄 Backfilling propertyId for Documents...');
  
  const documents = await prisma.document.findMany({
    where: {
      propertyId: null,
      isDeleted: false,
    },
    include: {
      tenant: {
        include: {
          leaseTenants: {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const doc of documents) {
    // Find the property through tenant → lease → unit → property
    const activeLease = doc.tenant.leaseTenants.find(
      (lt) => lt.lease.status === 'Active' || lt.lease.status === 'Pending'
    );

    if (activeLease) {
      const propertyId = activeLease.lease.unit.property.id;
      
      await prisma.document.update({
        where: { id: doc.id },
        data: { propertyId },
      });
      
      updated++;
      console.log(`  ✅ Document ${doc.id} → Property ${propertyId}`);
    } else {
      skipped++;
      console.log(`  ⚠️  Document ${doc.id} → No active lease found`);
    }
  }

  console.log(`✅ Updated ${updated} documents, skipped ${skipped} (no active lease)\n`);
  return { updated, skipped };
}

async function backfillExpensePropertyIds() {
  console.log('🔄 Backfilling propertyId for Expenses...');
  
  const expenses = await prisma.expense.findMany({
    where: {
      propertyId: null,
    },
    include: {
      maintenanceRequest: {
        include: {
          property: true,
        },
      },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const expense of expenses) {
    if (expense.maintenanceRequestId && expense.maintenanceRequest) {
      const propertyId = expense.maintenanceRequest.property.id;
      
      await prisma.expense.update({
        where: { id: expense.id },
        data: { propertyId },
      });
      
      updated++;
      console.log(`  ✅ Expense ${expense.id} → Property ${propertyId} (via maintenance request)`);
    } else {
      skipped++;
      console.log(`  ⚠️  Expense ${expense.id} → No maintenance request link`);
    }
  }

  console.log(`✅ Updated ${updated} expenses, skipped ${skipped} (no maintenance request)\n`);
  return { updated, skipped };
}

async function backfillTaskPropertyIds() {
  console.log('🔄 Backfilling propertyId for Tasks...');
  
  const tasks = await prisma.task.findMany({
    where: {
      propertyId: null,
      linkedEntityType: { not: null },
      linkedEntityId: { not: null },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const task of tasks) {
    let propertyId: string | null = null;

    try {
      switch (task.linkedEntityType) {
        case 'property':
          // Direct property link
          const property = await prisma.property.findUnique({
            where: { id: task.linkedEntityId! },
          });
          if (property) propertyId = property.id;
          break;

        case 'unit':
          // Unit → Property
          const unit = await prisma.unit.findUnique({
            where: { id: task.linkedEntityId! },
            include: { property: true },
          });
          if (unit) propertyId = unit.property.id;
          break;

        case 'lease':
          // Lease → Unit → Property
          const lease = await prisma.lease.findUnique({
            where: { id: task.linkedEntityId! },
            include: {
              unit: {
                include: { property: true },
              },
            },
          });
          if (lease) propertyId = lease.unit.property.id;
          break;

        case 'maintenance':
          // MaintenanceRequest → Property
          const maintenance = await prisma.maintenanceRequest.findUnique({
            where: { id: task.linkedEntityId! },
            include: { property: true },
          });
          if (maintenance) propertyId = maintenance.property.id;
          break;

        default:
          // Unknown entity type, skip
          break;
      }

      if (propertyId) {
        await prisma.task.update({
          where: { id: task.id },
          data: { propertyId },
        });
        
        updated++;
        console.log(`  ✅ Task ${task.id} → Property ${propertyId} (via ${task.linkedEntityType})`);
      } else {
        skipped++;
        console.log(`  ⚠️  Task ${task.id} → Could not resolve property from ${task.linkedEntityType}`);
      }
    } catch (error) {
      skipped++;
      console.log(`  ❌ Task ${task.id} → Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`✅ Updated ${updated} tasks, skipped ${skipped}\n`);
  return { updated, skipped };
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 PROPERTY-CENTRIC BACKFILL SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const docResults = await backfillDocumentPropertyIds();
    const expenseResults = await backfillExpensePropertyIds();
    const taskResults = await backfillTaskPropertyIds();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Documents: ${docResults.updated} updated, ${docResults.skipped} skipped`);
    console.log(`Expenses:  ${expenseResults.updated} updated, ${expenseResults.skipped} skipped`);
    console.log(`Tasks:     ${taskResults.updated} updated, ${taskResults.skipped} skipped`);
    console.log(`\n✅ Backfill completed successfully!`);
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

