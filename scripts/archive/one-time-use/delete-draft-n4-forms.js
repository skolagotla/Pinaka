/**
 * Script to delete all draft N4 forms from GeneratedForm table
 * 
 * Usage: node scripts/delete-draft-n4-forms.js
 * 
 * This will delete all N4 forms with status = "draft" for the current user
 * or all users (if you want to delete all drafts system-wide)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDraftN4Forms() {
  try {
    console.log('🔍 Finding all draft N4 forms...');
    
    // Find all draft N4 forms
    const draftForms = await prisma.generatedForm.findMany({
      where: {
        formType: "N4",
        status: "draft",
      },
      select: {
        id: true,
        formType: true,
        status: true,
        generatedBy: true,
        generatedAt: true,
      },
    });

    console.log(`📊 Found ${draftForms.length} draft N4 form(s)`);

    if (draftForms.length === 0) {
      console.log('✅ No draft N4 forms to delete.');
      return;
    }

    // Show what will be deleted
    console.log('\n📋 Draft N4 Forms to be deleted:');
    draftForms.forEach((form, index) => {
      console.log(`  ${index + 1}. ID: ${form.id}, Generated: ${form.generatedAt.toISOString()}, By: ${form.generatedBy}`);
    });

    // Delete all draft N4 forms
    console.log('\n🗑️  Deleting draft N4 forms...');
    const result = await prisma.generatedForm.deleteMany({
      where: {
        formType: "N4",
        status: "draft",
      },
    });

    console.log(`✅ Successfully deleted ${result.count} draft N4 form(s)`);
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error deleting draft N4 forms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteDraftN4Forms()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

