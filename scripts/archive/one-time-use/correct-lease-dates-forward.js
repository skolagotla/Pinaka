const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Correct lease dates that were accidentally moved backward by one day
 * This adds one day to dates that were incorrectly adjusted
 */

async function correctLeaseDates() {
  console.log('🔍 Correcting lease dates that were moved backward...\n');

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

    // Leases that need correction (these were created recently and might have been affected)
    const updates = [];

    for (const lease of leases) {
      const propertyName = lease.unit.property.propertyName || lease.unit.property.addressLine1;
      const unitName = lease.unit.unitName;
      
      const currentStart = lease.leaseStart;
      const currentEnd = lease.leaseEnd;

      // Check if the time is at noon (12:00), which means it was processed by our script
      const isAtNoon = currentStart.getUTCHours() === 12 && currentStart.getUTCMinutes() === 0;
      
      if (isAtNoon) {
        // Add one day to correct the backward shift
        const correctedStart = new Date(Date.UTC(
          currentStart.getUTCFullYear(),
          currentStart.getUTCMonth(),
          currentStart.getUTCDate() + 1, // Add 1 day
          12, 0, 0
        ));

        let correctedEnd = null;
        if (currentEnd) {
          correctedEnd = new Date(Date.UTC(
            currentEnd.getUTCFullYear(),
            currentEnd.getUTCMonth(),
            currentEnd.getUTCDate() + 1, // Add 1 day
            12, 0, 0
          ));
        }

        const startBefore = currentStart.toISOString().split('T')[0];
        const startAfter = correctedStart.toISOString().split('T')[0];
        const endBefore = currentEnd ? currentEnd.toISOString().split('T')[0] : 'N/A';
        const endAfter = correctedEnd ? correctedEnd.toISOString().split('T')[0] : 'N/A';

        console.log(`🔧 Correcting: ${propertyName} - ${unitName}`);
        console.log(`   Start: ${startBefore} → ${startAfter}`);
        console.log(`   End:   ${endBefore} → ${endAfter}\n`);

        updates.push({
          id: lease.id,
          leaseStart: correctedStart,
          leaseEnd: correctedEnd
        });
      } else {
        console.log(`⏭️  Skipping: ${propertyName} - ${unitName} (not at noon UTC, likely already correct)`);
      }
    }

    if (updates.length === 0) {
      console.log('\n✅ No leases need correction.');
      return;
    }

    console.log(`\n📝 Correcting ${updates.length} lease(s)...`);

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

    console.log(`✅ Successfully corrected ${updates.length} lease(s)!`);
    console.log('🎉 All dates are now accurate.\n');

  } catch (error) {
    console.error('❌ Error correcting lease dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the correction
correctLeaseDates()
  .then(() => {
    console.log('✅ Correction completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Correction failed:', error);
    process.exit(1);
  });

