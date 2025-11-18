const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllInspectionChecklists() {
  try {
    console.log('Starting deletion of all inspection checklists...');
    
    // First, count existing records
    const checklistCount = await prisma.inspectionChecklist.count();
    const itemCount = await prisma.inspectionChecklistItem.count();
    
    console.log(`Found ${checklistCount} checklists and ${itemCount} items`);
    
    if (checklistCount === 0 && itemCount === 0) {
      console.log('No records to delete.');
      return;
    }
    
    // Delete all checklist items first (they have foreign key to checklists)
    // Actually, with cascade delete, we can just delete checklists
    // But let's be explicit and delete items first
    console.log('Deleting all checklist items...');
    const deletedItems = await prisma.inspectionChecklistItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} checklist items`);
    
    // Delete all checklists
    console.log('Deleting all checklists...');
    const deletedChecklists = await prisma.inspectionChecklist.deleteMany({});
    console.log(`Deleted ${deletedChecklists.count} checklists`);
    
    console.log('✅ Successfully deleted all inspection checklist records!');
  } catch (error) {
    console.error('❌ Error deleting inspection checklists:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllInspectionChecklists();

