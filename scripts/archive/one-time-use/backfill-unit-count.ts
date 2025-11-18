/**
 * Backfill Script: Update property unitCount to match actual unit counts
 * 
 * This script ensures all properties have accurate unitCount values
 * by counting the actual units in the database.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillUnitCounts() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 BACKFILLING PROPERTY UNIT COUNTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get all properties
    const properties = await prisma.property.findMany({
      include: {
        units: true,
      },
    });

    let updated = 0;
    let unchanged = 0;
    let errors = 0;

    for (const property of properties) {
      const actualUnitCount = property.units.length;
      const storedUnitCount = property.unitCount || 0;

      if (actualUnitCount !== storedUnitCount) {
        try {
          await prisma.property.update({
            where: { id: property.id },
            data: { unitCount: actualUnitCount || 1 }, // Ensure at least 1 for single-unit properties
          });

          const propertyName = property.propertyName || property.addressLine1 || property.id;
          console.log(`  ✅ ${propertyName}: ${storedUnitCount} → ${actualUnitCount} units`);
          updated++;
        } catch (error) {
          console.error(`  ❌ Error updating property ${property.id}:`, error);
          errors++;
        }
      } else {
        unchanged++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total properties: ${properties.length}`);
    console.log(`✅ Updated: ${updated}`);
    console.log(`✓ Unchanged: ${unchanged}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`\n✅ Backfill completed successfully!`);
  } catch (error) {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfillUnitCounts();

