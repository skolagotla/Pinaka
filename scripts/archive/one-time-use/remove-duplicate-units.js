/**
 * Script to find and remove duplicate units
 * Looks for properties with more units than their unitCount suggests
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAndRemoveDuplicates() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 FINDING DUPLICATE OR EXTRA UNITS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const properties = await prisma.property.findMany({
      include: {
        units: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    let fixed = 0;
    let checked = 0;

    for (const property of properties) {
      const actualUnitCount = property.units.length;
      const storedUnitCount = property.unitCount || 0;

      // Check if there are extra units (more than unitCount suggests for single-unit properties)
      if (storedUnitCount === 1 && actualUnitCount > 1) {
        checked++;
        console.log(`\n📋 ${property.propertyName || property.addressLine1}:`);
        console.log(`   Stored unitCount: ${storedUnitCount}`);
        console.log(`   Actual units: ${actualUnitCount}`);
        
        // Find units named "Unit 1" that might be auto-created duplicates
        const unit1Units = property.units.filter(u => u.unitName === 'Unit 1' || u.unitName === 'unit 1');
        const otherUnits = property.units.filter(u => u.unitName !== 'Unit 1' && u.unitName !== 'unit 1');
        
        if (unit1Units.length > 0 && otherUnits.length > 0) {
          console.log(`   ⚠️  Found ${unit1Units.length} "Unit 1" unit(s) and ${otherUnits.length} other unit(s)`);
          
          // Keep the first non-"Unit 1" unit, delete "Unit 1" units
          if (otherUnits.length > 0) {
            const unitToKeep = otherUnits[0];
            console.log(`   ✅ Keeping: ${unitToKeep.unitName} (ID: ${unitToKeep.id})`);
            
            for (const unit1Unit of unit1Units) {
              // Check if this unit has any leases
              const leases = await prisma.lease.count({
                where: { unitId: unit1Unit.id }
              });
              
              if (leases === 0) {
                console.log(`   🗑️  Deleting duplicate: ${unit1Unit.unitName} (ID: ${unit1Unit.id})`);
                await prisma.unit.delete({
                  where: { id: unit1Unit.id }
                });
                fixed++;
              } else {
                console.log(`   ⚠️  Skipping ${unit1Unit.unitName} - has ${leases} lease(s)`);
              }
            }
            
            // Update property unitCount
            await prisma.property.update({
              where: { id: property.id },
              data: { unitCount: 1 }
            });
            console.log(`   ✅ Updated property unitCount to 1`);
          }
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Properties checked: ${checked}`);
    console.log(`Duplicate units removed: ${fixed}`);
    console.log(`\n✅ Cleanup completed!`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

findAndRemoveDuplicates();

