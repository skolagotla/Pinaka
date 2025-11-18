/**
 * Script to delete all draft N4 forms from both GeneratedForm and N4Form tables
 * 
 * Usage: node scripts/delete-all-draft-n4-forms.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllDraftN4Forms() {
  try {
    console.log('🔍 Finding all draft N4 forms in both tables...\n');
    
    // Check GeneratedForm table
    const generatedDrafts = await prisma.generatedForm.findMany({
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

    console.log(`📊 GeneratedForm table: Found ${generatedDrafts.length} draft N4 form(s)`);
    if (generatedDrafts.length > 0) {
      generatedDrafts.forEach((form, index) => {
        console.log(`  ${index + 1}. ID: ${form.id}, Generated: ${form.generatedAt.toISOString()}`);
      });
    }

    // Check old N4Form table
    let oldDrafts = [];
    try {
      oldDrafts = await prisma.n4Form.findMany({
        where: {
          status: {
            in: ["Draft", "draft"], // Check both cases
          },
        },
        select: {
          id: true,
          status: true,
          landlordId: true,
          createdAt: true,
        },
      });

      console.log(`\n📊 N4Form table (old): Found ${oldDrafts.length} draft form(s)`);
      if (oldDrafts.length > 0) {
        oldDrafts.forEach((form, index) => {
          console.log(`  ${index + 1}. ID: ${form.id}, Status: ${form.status}, Created: ${form.createdAt.toISOString()}`);
        });
      }
    } catch (error) {
      if (error.code === 'P2001') {
        console.log('\n📊 N4Form table (old): Table does not exist or is not accessible');
      } else {
        throw error;
      }
    }

    const totalDrafts = generatedDrafts.length + oldDrafts.length;
    console.log(`\n📋 Total draft N4 forms to delete: ${totalDrafts}`);

    if (totalDrafts === 0) {
      console.log('✅ No draft N4 forms to delete.');
      return;
    }

    // Delete from GeneratedForm
    if (generatedDrafts.length > 0) {
      console.log('\n🗑️  Deleting draft N4 forms from GeneratedForm table...');
      const result1 = await prisma.generatedForm.deleteMany({
        where: {
          formType: "N4",
          status: "draft",
        },
      });
      console.log(`✅ Deleted ${result1.count} form(s) from GeneratedForm`);
    }

    // Delete from old N4Form table
    if (oldDrafts.length > 0) {
      console.log('\n🗑️  Deleting draft N4 forms from N4Form table (old)...');
      const result2 = await prisma.n4Form.deleteMany({
        where: {
          status: {
            in: ["Draft", "draft"],
          },
        },
      });
      console.log(`✅ Deleted ${result2.count} form(s) from N4Form (old)`);
    }

    console.log(`\n✨ Successfully deleted ${totalDrafts} draft N4 form(s) total!`);

  } catch (error) {
    console.error('❌ Error deleting draft N4 forms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
deleteAllDraftN4Forms()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

