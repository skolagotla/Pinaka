const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fix lease dates that may have been affected by timezone issues
 * This script corrects dates that were stored with timezone shifts
 */

async function fixLeaseDates() {
  console.log('🔍 Starting lease date timezone fix...\n');

  try {
    // Fetch all leases
    const leases = await prisma.lease.findMany({
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 Found ${leases.length} leases to check\n`);

    if (leases.length === 0) {
      console.log('✅ No leases found. Nothing to fix.');
      return;
    }

    let fixedCount = 0;
    const updates = [];

    for (const lease of leases) {
      const propertyName = lease.unit.property.propertyName || lease.unit.property.addressLine1;
      const unitName = lease.unit.unitName;
      
      // Get the current stored dates
      const currentLeaseStart = lease.leaseStart;
      const currentLeaseEnd = lease.leaseEnd;

      // Create corrected dates (noon UTC to avoid timezone issues)
      // Use UTC methods to preserve the actual date component
      const fixedLeaseStart = new Date(Date.UTC(
        currentLeaseStart.getUTCFullYear(),
        currentLeaseStart.getUTCMonth(),
        currentLeaseStart.getUTCDate(),
        12, 0, 0
      ));

      let fixedLeaseEnd = null;
      if (currentLeaseEnd) {
        fixedLeaseEnd = new Date(Date.UTC(
          currentLeaseEnd.getUTCFullYear(),
          currentLeaseEnd.getUTCMonth(),
          currentLeaseEnd.getUTCDate(),
          12, 0, 0
        ));
      }

      // Check if dates need fixing (comparing date strings to see if they differ)
      const startDateStr = currentLeaseStart.toISOString().split('T')[0];
      const fixedStartDateStr = fixedLeaseStart.toISOString().split('T')[0];
      
      const endDateStr = currentLeaseEnd ? currentLeaseEnd.toISOString().split('T')[0] : null;
      const fixedEndDateStr = fixedLeaseEnd ? fixedLeaseEnd.toISOString().split('T')[0] : null;

      const needsFix = startDateStr !== fixedStartDateStr || 
                       (endDateStr !== fixedEndDateStr && endDateStr !== null);

      if (needsFix) {
        console.log(`⚠️  Lease needs fixing:`);
        console.log(`   Property: ${propertyName} - ${unitName}`);
        console.log(`   Current Start: ${startDateStr} (${currentLeaseStart.toISOString()})`);
        console.log(`   Fixed Start:   ${fixedStartDateStr} (${fixedLeaseStart.toISOString()})`);
        if (currentLeaseEnd) {
          console.log(`   Current End:   ${endDateStr} (${currentLeaseEnd.toISOString()})`);
          console.log(`   Fixed End:     ${fixedEndDateStr} (${fixedLeaseEnd.toISOString()})`);
        }
        console.log('');

        updates.push({
          id: lease.id,
          leaseStart: fixedLeaseStart,
          leaseEnd: fixedLeaseEnd
        });
        fixedCount++;
      } else {
        console.log(`✅ Lease OK: ${propertyName} - ${unitName}`);
        console.log(`   Start: ${startDateStr}, End: ${endDateStr || 'N/A'}\n`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ All lease dates are correct. No updates needed.');
      return;
    }

    console.log(`\n📝 Summary: ${fixedCount} lease(s) need updating`);
    console.log('🔄 Applying updates...\n');

    // Apply all updates in a transaction
    await prisma.$transaction(
      updates.map(update => 
        prisma.lease.update({
          where: { id: update.id },
          data: {
            leaseStart: update.leaseStart,
            leaseEnd: update.leaseEnd,
            updatedAt: new Date()
          }
        })
      )
    );

    console.log(`✅ Successfully updated ${fixedCount} lease(s)!`);
    console.log('🎉 All lease dates are now corrected.\n');

  } catch (error) {
    console.error('❌ Error fixing lease dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixLeaseDates()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

