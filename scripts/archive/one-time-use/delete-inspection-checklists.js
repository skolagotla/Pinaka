const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllInspectionChecklists() {
  try {
    console.log('Starting deletion of all inspection checklists...');
    
    // First, count how many records exist
    const checklistCount = await prisma.inspectionChecklist.count();
    const itemCount = await prisma.inspectionChecklistItem.count();
    
    console.log(`Found ${checklistCount} checklists and ${itemCount} items`);
    
    if (checklistCount === 0 && itemCount === 0) {
      console.log('No records to delete.');
      return;
    }
    
    // Delete all items first (due to foreign key constraint)
    console.log('Deleting all inspection checklist items...');
    const deletedItems = await prisma.inspectionChecklistItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} items`);
    
    // Then delete all checklists
    console.log('Deleting all inspection checklists...');
    const deletedChecklists = await prisma.inspectionChecklist.deleteMany({});
    console.log(`Deleted ${deletedChecklists.count} checklists`);
    
    console.log('✅ Successfully deleted all inspection checklists and photos!');
    console.log(`   - ${deletedItems.count} items deleted (including all base64 photo data)`);
    console.log(`   - ${deletedChecklists.count} checklists deleted`);
    
  } catch (error) {
    console.error('❌ Error deleting inspection checklists:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllInspectionChecklists();

