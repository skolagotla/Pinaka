/**
 * Script to delete all maintenance tickets from the database
 * Run with: node scripts/clear-all-maintenance-tickets.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllMaintenanceTickets() {
  try {
    console.log('Starting maintenance tickets cleanup...');
    
    // First, delete all comments (they have foreign key to maintenance requests)
    const commentsCount = await prisma.maintenanceComment.count();
    console.log(`Found ${commentsCount} comments to delete...`);
    
    if (commentsCount > 0) {
      await prisma.maintenanceComment.deleteMany({});
      console.log(`✅ Deleted ${commentsCount} comments`);
    }
    
    // Delete all expenses (they have foreign key to maintenance requests)
    const expensesCount = await prisma.expense.count();
    console.log(`Found ${expensesCount} expenses to delete...`);
    
    if (expensesCount > 0) {
      await prisma.expense.deleteMany({});
      console.log(`✅ Deleted ${expensesCount} expenses`);
    }
    
    // Now delete all maintenance requests
    const ticketsCount = await prisma.maintenanceRequest.count();
    console.log(`Found ${ticketsCount} maintenance tickets to delete...`);
    
    if (ticketsCount > 0) {
      await prisma.maintenanceRequest.deleteMany({});
      console.log(`✅ Deleted ${ticketsCount} maintenance tickets`);
    }
    
    console.log('\n✅ All maintenance tickets, comments, and expenses have been cleared');
    console.log(`- Deleted: ${ticketsCount} tickets`);
    console.log(`- Deleted: ${commentsCount} comments`);
    console.log(`- Deleted: ${expensesCount} expenses`);

  } catch (error) {
    console.error('❌ Error clearing maintenance tickets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearAllMaintenanceTickets()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

