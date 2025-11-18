/**
 * Script to delete all maintenance tickets and related data from the database
 * Run with: node scripts/delete-all-maintenance-tickets.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllMaintenanceTickets() {
  try {
    console.log('Starting deletion of all maintenance tickets...');
    
    // First, count how many tickets exist
    const ticketCount = await prisma.maintenanceRequest.count();
    console.log(`Found ${ticketCount} maintenance tickets to delete`);
    
    if (ticketCount === 0) {
      console.log('No maintenance tickets found. Nothing to delete.');
      return;
    }
    
    // Count comments
    const commentCount = await prisma.maintenanceComment.count();
    console.log(`Found ${commentCount} maintenance comments to delete`);
    
    // Delete all maintenance comments first (they have foreign key to maintenance requests)
    // Actually, due to cascade delete, we can just delete the requests and comments will be deleted automatically
    // But let's be explicit and delete comments first to be safe
    const deletedComments = await prisma.maintenanceComment.deleteMany({});
    console.log(`✅ Deleted ${deletedComments.count} maintenance comments`);
    
    // Delete all maintenance requests
    // This will cascade delete related expenses linked to maintenance requests
    const deletedTickets = await prisma.maintenanceRequest.deleteMany({});
    console.log(`✅ Deleted ${deletedTickets.count} maintenance tickets`);
    
    // Verify deletion
    const remainingTickets = await prisma.maintenanceRequest.count();
    const remainingComments = await prisma.maintenanceComment.count();
    
    if (remainingTickets === 0 && remainingComments === 0) {
      console.log('✅ Successfully deleted all maintenance tickets and comments');
    } else {
      console.log(`⚠️  Warning: ${remainingTickets} tickets and ${remainingComments} comments still remain`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting maintenance tickets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllMaintenanceTickets()
  .then(() => {
    console.log('✅ Deletion completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deletion failed:', error);
    process.exit(1);
  });

