/**
 * Check for recent database schema changes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchemaChanges() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 CHECKING DATABASE SCHEMA FOR RECENT CHANGES');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Check for recent table creation/modification
    const tables = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('📊 Database Tables:');
    console.log(`   Total tables: ${tables.length}`);
    console.log('   Tables:');
    tables.forEach((table, idx) => {
      if (idx < 20) { // Show first 20
        console.log(`   - ${table.tablename}`);
      }
    });
    if (tables.length > 20) {
      console.log(`   ... and ${tables.length - 20} more`);
    }
    console.log('');

    // Check for recent columns (check if any columns were added recently)
    // Note: PostgreSQL doesn't track column creation time, but we can check for unusual columns
    const columns = await prisma.$queryRaw`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
      LIMIT 50;
    `;

    console.log('📋 Sample Columns (first 50):');
    let currentTable = '';
    columns.forEach(col => {
      if (col.table_name !== currentTable) {
        currentTable = col.table_name;
        console.log(`   Table: ${currentTable}`);
      }
      console.log(`     - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // Check for Property table specifically (since we were working on property approval)
    const propertyColumns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'Property'
      ORDER BY ordinal_position;
    `;

    console.log('🏠 Property Table Columns:');
    propertyColumns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    console.log('');

    // Check for PMCApprovalType enum values
    const enumValues = await prisma.$queryRaw`
      SELECT 
        t.typname as enum_name,
        e.enumlabel as enum_value,
        e.enumsortorder
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname = 'PMCApprovalType'
      ORDER BY e.enumsortorder;
    `;

    console.log('🔢 PMCApprovalType Enum Values:');
    enumValues.forEach(enumVal => {
      console.log(`   - ${enumVal.enum_value}`);
    });
    console.log('');

    // Check for any indexes on Property table
    const propertyIndexes = await prisma.$queryRaw`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' 
        AND tablename = 'Property'
      ORDER BY indexname;
    `;

    console.log('🔍 Property Table Indexes:');
    if (propertyIndexes.length > 0) {
      propertyIndexes.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    } else {
      console.log('   No indexes found');
    }
    console.log('');

    // Check for any foreign key constraints on Property table
    const propertyFKs = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'Property';
    `;

    console.log('🔗 Property Table Foreign Keys:');
    if (propertyFKs.length > 0) {
      propertyFKs.forEach(fk => {
        console.log(`   - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('   No foreign keys found');
    }
    console.log('');

    // Check PMCLandlordApproval table structure
    const approvalColumns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'PMCLandlordApproval'
      ORDER BY ordinal_position;
    `;

    console.log('✅ PMCLandlordApproval Table Columns:');
    approvalColumns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}`);
    });
    console.log('');

    console.log('✅ Schema check complete.');

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchemaChanges();

