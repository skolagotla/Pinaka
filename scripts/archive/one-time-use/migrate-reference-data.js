/**
 * Migration script to consolidate 7 status/lookup tables into unified ReferenceData table
 * 
 * Migrates:
 * - LeaseStatus → ReferenceData (category: 'lease_status')
 * - MaintenanceStatus → ReferenceData (category: 'maintenance_status')
 * - PaymentStatus → ReferenceData (category: 'payment_status')
 * - UnitStatus → ReferenceData (category: 'unit_status')
 * - MaintenanceCategory → ReferenceData (category: 'maintenance_category')
 * - MaintenancePriority → ReferenceData (category: 'maintenance_priority')
 * - PropertyType → ReferenceData (category: 'property_type')
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to convert name to code (lowercase, replace spaces with underscores)
function nameToCode(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

async function migrateTable(tableName, category) {
  console.log(`\n📦 Migrating ${tableName} → ReferenceData (category: '${category}')...`);
  
  try {
    const records = await prisma[tableName].findMany({
      orderBy: { sortOrder: 'asc' }
    });

    if (records.length === 0) {
      console.log(`   ⚠️  No records found in ${tableName}`);
      return 0;
    }

    let migrated = 0;
    let skipped = 0;

    for (const record of records) {
      const code = nameToCode(record.name);
      
      try {
        await prisma.referenceData.upsert({
          where: {
            category_code: {
              category,
              code
            }
          },
          update: {
            name: record.name,
            description: record.description || null,
            color: record.color || null,
            sortOrder: record.sortOrder || 0,
            isActive: record.isActive !== undefined ? record.isActive : true,
            metadata: null,
            updatedAt: new Date()
          },
          create: {
            category,
            code,
            name: record.name,
            description: record.description || null,
            color: record.color || null,
            sortOrder: record.sortOrder || 0,
            isActive: record.isActive !== undefined ? record.isActive : true,
            metadata: null
          }
        });
        migrated++;
      } catch (error) {
        if (error.code === 'P2002') {
          // Unique constraint violation - record already exists
          console.log(`   ⚠️  Skipping duplicate: ${record.name} (code: ${code})`);
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log(`   ✅ Migrated ${migrated} records, skipped ${skipped} duplicates`);
    return migrated;
  } catch (error) {
    console.error(`   ❌ Error migrating ${tableName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Reference Data Migration...');
    console.log('==========================================\n');

    // Check if ReferenceData table exists and has data
    const existingCount = await prisma.referenceData.count();
    if (existingCount > 0) {
      console.log(`⚠️  Warning: ReferenceData table already has ${existingCount} records.`);
      console.log('   Migration will upsert (update existing or create new) records.\n');
    }

    // Migrate each table
    const migrations = [
      { table: 'leaseStatus', category: 'lease_status' },
      { table: 'maintenanceStatus', category: 'maintenance_status' },
      { table: 'paymentStatus', category: 'payment_status' },
      { table: 'unitStatus', category: 'unit_status' },
      { table: 'maintenanceCategory', category: 'maintenance_category' },
      { table: 'maintenancePriority', category: 'maintenance_priority' },
      { table: 'propertyType', category: 'property_type' },
    ];

    let totalMigrated = 0;
    for (const migration of migrations) {
      const count = await migrateTable(migration.table, migration.category);
      totalMigrated += count;
    }

    // Verify migration
    console.log('\n📊 Migration Summary:');
    console.log('==========================================');
    const finalCount = await prisma.referenceData.count();
    console.log(`Total records in ReferenceData: ${finalCount}`);
    console.log(`Total records migrated: ${totalMigrated}`);

    // Show breakdown by category
    console.log('\n📋 Records by Category:');
    const categories = await prisma.referenceData.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    categories.forEach(cat => {
      console.log(`   ${cat.category}: ${cat._count.category} records`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  Next steps:');
    console.log('   1. Test the application thoroughly');
    console.log('   2. Verify all reference data loads correctly');
    console.log('   3. Once confirmed, drop old tables from schema');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

