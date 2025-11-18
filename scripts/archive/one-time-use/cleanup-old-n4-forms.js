/**
 * Script to delete all forms from the old N4Form table
 * (These are legacy forms that should be migrated to GeneratedForm)
 * 
 * Usage: node scripts/cleanup-old-n4-forms.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOldN4Forms() {
  try {
    console.log('🔍 Finding all forms in old N4Form table...\n');
    
    // Check old N4Form table
    let oldForms = [];
    try {
      oldForms = await prisma.n4Form.findMany({
        select: {
          id: true,
          status: true,
          landlordId: true,
          tenantName: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📊 N4Form table (old): Found ${oldForms.length} form(s)`);
      
      if (oldForms.length === 0) {
        console.log('✅ No forms in old N4Form table to delete.');
        return;
      }

      // Show status breakdown
      console.log('\nStatus breakdown:');
      const statusCounts = {};
      oldForms.forEach(form => {
        statusCounts[form.status] = (statusCounts[form.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });

      // Show forms
      console.log('\nForms to be deleted:');
      oldForms.forEach((form, index) => {
        console.log(`  ${index + 1}. ID: ${form.id}, Status: ${form.status}, Tenant: ${form.tenantName}, Created: ${form.createdAt.toISOString()}`);
      });

      // Delete all forms from old N4Form table
      console.log('\n🗑️  Deleting all forms from old N4Form table...');
      const result = await prisma.n4Form.deleteMany({});
      console.log(`✅ Successfully deleted ${result.count} form(s) from old N4Form table`);
      console.log('\n✨ Done! Old N4Form table is now clean.');

    } catch (error) {
      if (error.code === 'P2001') {
        console.log('ℹ️  N4Form table does not exist or is not accessible');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOldN4Forms()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

