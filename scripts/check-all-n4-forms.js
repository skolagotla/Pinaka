/**
 * Script to check all N4 forms in both GeneratedForm and N4Form tables
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllN4Forms() {
  try {
    console.log('🔍 Checking N4 forms in GeneratedForm table...\n');
    
    // Check GeneratedForm table
    const generatedForms = await prisma.generatedForm.findMany({
      where: {
        formType: "N4",
      },
      select: {
        id: true,
        formType: true,
        status: true,
        generatedBy: true,
        generatedAt: true,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    console.log(`📊 GeneratedForm table: Found ${generatedForms.length} N4 form(s)`);
    if (generatedForms.length > 0) {
      console.log('\nStatus breakdown:');
      const statusCounts = {};
      generatedForms.forEach(form => {
        statusCounts[form.status] = (statusCounts[form.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
      console.log('\nForms:');
      generatedForms.forEach((form, index) => {
        console.log(`  ${index + 1}. ID: ${form.id}, Status: ${form.status}, Generated: ${form.generatedAt.toISOString()}`);
      });
    }

    // Check old N4Form table (if it exists)
    console.log('\n\n🔍 Checking N4Form table (old table)...\n');
    try {
      const oldN4Forms = await prisma.n4Form.findMany({
        select: {
          id: true,
          status: true,
          landlordId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📊 N4Form table: Found ${oldN4Forms.length} form(s)`);
      if (oldN4Forms.length > 0) {
        console.log('\nStatus breakdown:');
        const statusCounts = {};
        oldN4Forms.forEach(form => {
          statusCounts[form.status] = (statusCounts[form.status] || 0) + 1;
        });
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`  - ${status}: ${count}`);
        });
        console.log('\nForms:');
        oldN4Forms.forEach((form, index) => {
          console.log(`  ${index + 1}. ID: ${form.id}, Status: ${form.status}, Created: ${form.createdAt.toISOString()}`);
        });
      }
    } catch (error) {
      if (error.code === 'P2001') {
        console.log('  ℹ️  N4Form table does not exist or is not accessible');
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

checkAllN4Forms()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

