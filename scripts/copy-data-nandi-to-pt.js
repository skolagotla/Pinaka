/**
 * Copy Data from Nandi to PT Database
 * 
 * Copies all data from the "nandi" database to the "PT" database.
 * This script handles foreign key relationships and preserves data integrity.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

// Get DATABASE_URL from environment
const originalUrl = process.env.DATABASE_URL;

if (!originalUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

/**
 * Build DATABASE_URL with a specific database name
 */
function buildDatabaseUrl(dbName) {
  try {
    const url = new URL(originalUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  } catch (error) {
    throw new Error(`Failed to build database URL: ${error.message}`);
  }
}

/**
 * Parse DATABASE_URL to extract connection details
 */
function parseDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1),
      user: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false,
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error.message}`);
  }
}

/**
 * Get base connection config (without database name)
 */
function getBaseConnectionConfig() {
  const parsed = parseDatabaseUrl(originalUrl);
  return {
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    ssl: parsed.ssl,
  };
}

/**
 * Check if database exists
 */
async function databaseExists(dbName) {
  const baseConfig = getBaseConnectionConfig();
  const client = new Client({
    ...baseConfig,
    database: 'postgres',
  });

  try {
    await client.connect();
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    await client.end();
    return result.rows.length > 0;
  } catch (error) {
    await client.end();
    throw error;
  }
}

// Create Prisma clients for both databases
const nandiUrl = buildDatabaseUrl('nandi');
const ptUrl = buildDatabaseUrl('PT');

const nandiPrisma = new PrismaClient({
  datasources: {
    db: {
      url: nandiUrl,
    },
  },
});

const ptPrisma = new PrismaClient({
  datasources: {
    db: {
      url: ptUrl,
    },
  },
});

/**
 * Table insertion order (respecting foreign key relationships)
 * Tables without foreign keys come first
 */
const TABLE_ORDER = [
  // Base tables (no foreign keys)
  'Country',
  'Region',
  
  // Admin and user tables
  'Admin',
  'PropertyManagementCompany',
  'Landlord',
  'Tenant',
  'ServiceProvider',
  
  // RBAC tables (must be in order)
  'Role',
  'RolePermission',
  'UserRole',
  'UserPermission',
  'Scope',
  'RBACAuditLog',
  'ApprovalRequest',
  
  // Property-related tables
  'Property',
  'Unit',
  'Portfolio',
  'PropertyPortfolio',
  
  // Financial tables
  'Lease',
  'RentPayment',
  'SecurityDeposit',
  'OwnerStatement',
  'OwnerPayout',
  'BankReconciliation',
  
  // Maintenance tables
  'MaintenanceRequest',
  'MaintenanceTask',
  
  // Application tables
  'Application',
  'InspectionChecklist',
  'InspectionChecklistItem',
  
  // Other tables
  'Document',
  'DocumentAuditLog',
  'DocumentMessage',
  'Listing',
  'Eviction',
  'VendorRating',
  'TenantRating',
  
  // Audit and session tables
  'AdminSession',
  'AdminPermission',
  'AdminAuditLog',
];

/**
 * Copy data from one table to another
 */
async function copyTable(tableName, sourcePrisma, targetPrisma) {
  try {
    console.log(`   📋 Copying ${tableName}...`);
    
    // Get all records from source
    const records = await sourcePrisma[tableName].findMany({
      // Exclude relations to avoid deep nesting
      // We'll handle relations separately if needed
    });
    
    if (records.length === 0) {
      console.log(`      ⚠️  No records found in ${tableName}`);
      return { copied: 0, skipped: 0 };
    }
    
    console.log(`      Found ${records.length} record(s)`);
    
    // Copy records to target
    let copied = 0;
    let skipped = 0;
    
    // Use createMany for better performance, but handle errors
    try {
      // Try createMany first (faster, but doesn't return created records)
      await targetPrisma[tableName].createMany({
        data: records,
        skipDuplicates: true, // Skip if record already exists
      });
      copied = records.length;
      console.log(`      ✅ Copied ${copied} record(s) (skipped duplicates)`);
    } catch (createManyError) {
      // If createMany fails (e.g., unique constraint), try individual creates
      console.log(`      ⚠️  createMany failed, trying individual creates...`);
      
      for (const record of records) {
        try {
          await targetPrisma[tableName].create({
            data: record,
          });
          copied++;
        } catch (error) {
          // Skip duplicates or other errors
          if (error.code === 'P2002' || error.message.includes('Unique constraint')) {
            skipped++;
          } else {
            console.warn(`      ⚠️  Error copying record ${record.id}: ${error.message}`);
            skipped++;
          }
        }
      }
      
      if (copied > 0 || skipped > 0) {
        console.log(`      ✅ Copied ${copied} record(s), skipped ${skipped} duplicate(s)`);
      }
    }
    
    return { copied, skipped };
  } catch (error) {
    console.error(`      ❌ Error copying ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 COPY DATA FROM NANDI TO PT DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Verify databases exist
    console.log('📊 Step 1: Verifying databases...\n');
    
    const nandiExists = await databaseExists('nandi');
    if (!nandiExists) {
      console.error('❌ Source database "nandi" does not exist');
      process.exit(1);
    }
    console.log('✅ Source database "nandi" exists');
    
    const ptExists = await databaseExists('PT');
    if (!ptExists) {
      console.error('❌ Target database "PT" does not exist');
      console.log('   Please run: npx tsx scripts/create-pt-database.js');
      process.exit(1);
    }
    console.log('✅ Target database "PT" exists\n');

    // Step 2: Test connections
    console.log('🔌 Step 2: Testing database connections...\n');
    
    try {
      await nandiPrisma.$connect();
      console.log('✅ Connected to nandi database');
    } catch (error) {
      console.error('❌ Failed to connect to nandi database:', error.message);
      process.exit(1);
    }
    
    try {
      await ptPrisma.$connect();
      console.log('✅ Connected to PT database\n');
    } catch (error) {
      console.error('❌ Failed to connect to PT database:', error.message);
      process.exit(1);
    }

    // Step 3: Copy data table by table
    console.log('📋 Step 3: Copying data...\n');
    
    const stats = {
      totalCopied: 0,
      totalSkipped: 0,
      tablesProcessed: 0,
      tablesFailed: 0,
    };
    
    for (const tableName of TABLE_ORDER) {
      try {
        // Check if table exists in Prisma schema
        if (!nandiPrisma[tableName] || !ptPrisma[tableName]) {
          console.log(`   ⚠️  Skipping ${tableName} (not found in Prisma schema)`);
          continue;
        }
        
        const result = await copyTable(tableName, nandiPrisma, ptPrisma);
        stats.totalCopied += result.copied;
        stats.totalSkipped += result.skipped;
        stats.tablesProcessed++;
      } catch (error) {
        console.error(`   ❌ Failed to copy ${tableName}:`, error.message);
        stats.tablesFailed++;
        // Continue with next table
      }
    }

    // Step 4: Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATA COPY COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 Summary:');
    console.log(`   ✅ Tables processed: ${stats.tablesProcessed}`);
    console.log(`   ✅ Records copied: ${stats.totalCopied}`);
    console.log(`   ⚠️  Records skipped (duplicates): ${stats.totalSkipped}`);
    if (stats.tablesFailed > 0) {
      console.log(`   ❌ Tables failed: ${stats.tablesFailed}`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('   1. Verify data in PT database');
    console.log('   2. Use the database switcher at /db-switcher to switch to PT');
    console.log('   3. Or update .db-config.json manually: { "activeDatabase": "PT" }');
    console.log('   4. Restart your application to use the new database\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await nandiPrisma.$disconnect();
    await ptPrisma.$disconnect();
  }
}

// Run the script
main();

