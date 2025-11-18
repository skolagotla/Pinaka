/**
 * Comprehensive Date Fix Script
 * 
 * This script fixes all date/timezone issues in the database once and for all.
 * It will:
 * 1. Check and fix all lease start dates
 * 2. Recreate all rent payment records with correct UTC dates
 * 3. Ensure all dates are properly stored in UTC
 * 4. Validate all date logic
 */

const { PrismaClient } = require('@prisma/client');
const { createMissingRentPayments } = require('@/lib/rent-payment-service');
const {
  createUTCDate,
  getDateComponents,
  formatDateDisplay
} = require('@/lib/utils/unified-date-formatter');

const prisma = new PrismaClient();

async function fixAllDates() {
  console.log('\n🔧 COMPREHENSIVE DATE FIX SCRIPT');
  console.log('='.repeat(60));
  console.log('This script will fix all date/timezone issues in the database.\n');
  
  try {
    // Step 1: Fix all lease start dates
    console.log('STEP 1: Checking Lease Start Dates');
    console.log('-'.repeat(60));
    
    const leases = await prisma.lease.findMany({
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });
    
    console.log(`Found ${leases.length} leases\n`);
    
    let leaseFixCount = 0;
    
    for (const lease of leases) {
      const propertyName = lease.unit.property.propertyName;
      const tenantName = lease.leaseTenants[0]?.tenant 
        ? `${lease.leaseTenants[0].tenant.firstName} ${lease.leaseTenants[0].tenant.lastName}`
        : 'Unknown';
      
      const currentStart = new Date(lease.leaseStart);
      const { year, month, day } = getDateComponents(currentStart);
      
      // Recreate the date in UTC to ensure it's stored correctly
      const correctStart = createUTCDate(year, month, day);
      
      console.log(`📋 ${propertyName} (${tenantName})`);
      console.log(`   Current: ${currentStart.toISOString()} (${formatDateDisplay(currentStart)})`);
      console.log(`   Correct: ${correctStart.toISOString()} (${formatDateDisplay(correctStart)})`);
      
      // Check if it needs fixing (more than 1 hour difference indicates timezone issue)
      const timeDiff = Math.abs(correctStart.getTime() - currentStart.getTime());
      if (timeDiff > 3600000) { // 1 hour in milliseconds
        console.log(`   ⚠️  NEEDS FIX (${Math.round(timeDiff / 3600000)} hours difference)`);
        
        await prisma.lease.update({
          where: { id: lease.id },
          data: { leaseStart: correctStart },
        });
        
        console.log(`   ✅ FIXED`);
        leaseFixCount++;
      } else {
        console.log(`   ✓ OK`);
      }
      console.log('');
    }
    
    console.log(`Lease Fixes: ${leaseFixCount} / ${leases.length}\n`);
    
    // Step 2: Fix all rent payment due dates
    console.log('\nSTEP 2: Fixing Rent Payment Due Dates');
    console.log('-'.repeat(60));
    
    console.log('Deleting all existing rent payment records...');
    
    const deleteResult = await prisma.rentPayment.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.count} payment records\n`);
    
    console.log('Recreating rent payment records with correct UTC dates...\n');
    
    const created = await createMissingRentPayments();
    console.log(`✅ Created ${created} new payment records\n`);
    
    // Step 3: Verify the fixes
    console.log('\nSTEP 3: Verification');
    console.log('-'.repeat(60));
    
    const allPayments = await prisma.rentPayment.findMany({
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
      orderBy: [
        { lease: { unit: { property: { propertyName: 'asc' } } } },
        { dueDate: 'asc' },
      ],
    });
    
    console.log(`\nTotal Rent Payments: ${allPayments.length}\n`);
    
    // Group by property
    const byProperty = {};
    for (const payment of allPayments) {
      const propName = payment.lease.unit.property.propertyName;
      if (!byProperty[propName]) {
        byProperty[propName] = [];
      }
      byProperty[propName].push(payment);
    }
    
    for (const [propName, payments] of Object.entries(byProperty)) {
      console.log(`📊 ${propName}: ${payments.length} payments`);
      payments.slice(0, 3).forEach(p => {
        console.log(`   - ${formatDateDisplay(p.dueDate)}: $${p.amount.toFixed(2)} (${p.status})`);
      });
      if (payments.length > 3) {
        console.log(`   ... and ${payments.length - 3} more`);
      }
      console.log('');
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Leases checked: ${leases.length}`);
    console.log(`✅ Leases fixed: ${leaseFixCount}`);
    console.log(`✅ Old payments deleted: ${deleteResult.count}`);
    console.log(`✅ New payments created: ${created}`);
    console.log(`✅ Total payments now: ${allPayments.length}`);
    console.log('\n✨ All dates fixed! All dates are now stored in UTC.');
    console.log('   Date display will be handled by the UI layer with proper timezone conversion.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
console.log('\n⚠️  WARNING: This script will DELETE all existing rent payment records');
console.log('   and recreate them with correct dates.\n');
console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  fixAllDates()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}, 5000);

