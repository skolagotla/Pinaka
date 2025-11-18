const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate pro-rated rent for partial month
 */
function calculateProRatedRent(fullRent, startDate, endOfMonth) {
  // Get total days in the month
  const year = startDate.getFullYear();
  const month = startDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate days tenant will occupy (inclusive)
  const startDay = startDate.getDate();
  const daysRented = daysInMonth - startDay + 1;
  
  // Calculate pro-rated amount
  const proRatedAmount = (fullRent / daysInMonth) * daysRented;
  
  return Math.round(proRatedAmount * 100) / 100; // Round to 2 decimal places
}

async function fixProRatedRent() {
  console.log('🔍 Checking all leases for pro-rated rent fixes...\n');
  
  try {
    // Get all active leases
    const leases = await prisma.lease.findMany({
      where: {
        status: 'Active',
      },
      include: {
        rentPayments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
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
    
    console.log(`Found ${leases.length} active leases\n`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const lease of leases) {
      const leaseStartDate = new Date(lease.leaseStart);
      const leaseStartDay = leaseStartDate.getDate();
      const leaseStartMonth = leaseStartDate.getMonth();
      const leaseStartYear = leaseStartDate.getFullYear();
      
      // Only process if lease started mid-month (after 1st)
      if (leaseStartDay > 1) {
        console.log(`\n📋 Lease ID: ${lease.id}`);
        console.log(`   Property: ${lease.unit.property.propertyName}`);
        console.log(`   Tenant: ${lease.leaseTenants.map(lt => `${lt.tenant.firstName} ${lt.tenant.lastName}`).join(', ')}`);
        console.log(`   Lease Start: ${leaseStartDate.toLocaleDateString()} (Day ${leaseStartDay})`);
        console.log(`   Full Rent: $${lease.rentAmount.toFixed(2)}`);
        
        // Find the first month's payment
        const firstPayment = lease.rentPayments.find(payment => {
          const paymentDate = new Date(payment.dueDate);
          return paymentDate.getMonth() === leaseStartMonth && paymentDate.getFullYear() === leaseStartYear;
        });
        
        if (firstPayment) {
          // Calculate what the pro-rated amount should be
          const endOfMonth = new Date(leaseStartYear, leaseStartMonth + 1, 0);
          const expectedProRatedAmount = calculateProRatedRent(lease.rentAmount, leaseStartDate, endOfMonth);
          
          console.log(`   Expected Pro-rated: $${expectedProRatedAmount.toFixed(2)}`);
          console.log(`   Current Amount: $${firstPayment.amount.toFixed(2)}`);
          
          // Check if it needs fixing (allow 0.01 difference for rounding)
          if (Math.abs(firstPayment.amount - expectedProRatedAmount) > 0.01) {
            console.log(`   ⚠️  NEEDS FIX!`);
            
            // Update the payment
            await prisma.rentPayment.update({
              where: { id: firstPayment.id },
              data: { amount: expectedProRatedAmount },
            });
            
            console.log(`   ✅ FIXED: Updated from $${firstPayment.amount.toFixed(2)} to $${expectedProRatedAmount.toFixed(2)}`);
            fixedCount++;
          } else {
            console.log(`   ✓ Already correct (no fix needed)`);
            skippedCount++;
          }
        } else {
          console.log(`   ℹ️  No payment found for first month yet`);
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ Fixed: ${fixedCount} payment(s)`);
    console.log(`   ⏭️  Skipped: ${skippedCount} payment(s) (already correct)`);
    console.log(`   📋 Total Checked: ${leases.length} lease(s)`);
    console.log(`\n✨ Done!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixProRatedRent();

