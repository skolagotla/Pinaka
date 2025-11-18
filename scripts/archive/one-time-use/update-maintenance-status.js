/**
 * Script to update all maintenance tickets from "Completed" to "Closed"
 * Run with: node scripts/update-maintenance-status.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMaintenanceStatus() {
  try {
    console.log('Starting maintenance status update...');
    
    // Update all tickets with status "Completed" to "Closed"
    const result = await prisma.maintenanceRequest.updateMany({
      where: {
        status: 'Completed'
      },
      data: {
        status: 'Closed'
      }
    });
    
    console.log(`✅ Successfully updated ${result.count} maintenance tickets from "Completed" to "Closed"`);
    
    // Also update any comments that reference "Completed" status
    const oldStatusCount = await prisma.maintenanceComment.updateMany({
      where: {
        oldStatus: 'Completed'
      },
      data: {
        oldStatus: 'Closed'
      }
    });
    
    const newStatusCount = await prisma.maintenanceComment.updateMany({
      where: {
        newStatus: 'Completed'
      },
      data: {
        newStatus: 'Closed'
      }
    });
    
    console.log(`✅ Successfully updated maintenance comments (oldStatus: ${oldStatusCount.count}, newStatus: ${newStatusCount.count})`);
    
  } catch (error) {
    console.error('❌ Error updating maintenance status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateMaintenanceStatus()
  .then(() => {
    console.log('✅ Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });

