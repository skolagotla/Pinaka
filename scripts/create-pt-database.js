/**
 * Create PT Database Script
 * 
 * Creates a new database called "PT" and copies the schema from "nandi" database
 * without any data. This is useful for setting up a test database.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also try .env

const { Client } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
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
  const parsed = parseDatabaseUrl(databaseUrl);
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

/**
 * Create a new database
 */
async function createDatabase(dbName) {
  const baseConfig = getBaseConnectionConfig();
  const client = new Client({
    ...baseConfig,
    database: 'postgres',
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✅ Database "${dbName}" created successfully`);
    await client.end();
    return true;
  } catch (error) {
    await client.end();
    throw error;
  }
}

/**
 * Build DATABASE_URL with a specific database name
 */
function buildDatabaseUrl(dbName) {
  try {
    const url = new URL(databaseUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  } catch (error) {
    throw new Error(`Failed to build database URL: ${error.message}`);
  }
}

/**
 * Copy schema from source database to target database (without data)
 */
async function copySchema(sourceDbName, targetDbName) {
  const sourceUrl = buildDatabaseUrl(sourceDbName);
  const targetUrl = buildDatabaseUrl(targetDbName);

  console.log(`📋 Copying schema from "${sourceDbName}" to "${targetDbName}"...`);

  // Method 1: Try using pg_dump and psql (most reliable)
  try {
    // Use pg_dump to get schema (structure only, no data)
    const pgDumpCmd = `pg_dump "${sourceUrl}" --schema-only --no-owner --no-acl --clean --if-exists`;
    
    // Apply schema to target database using psql
    const psqlCmd = `psql "${targetUrl}"`;

    console.log('   Using pg_dump/psql method...');
    const { stdout, stderr } = await execAsync(
      `${pgDumpCmd} | ${psqlCmd}`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    );

    // Check for errors (warnings are OK)
    if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE') && !stderr.includes('already exists')) {
      console.warn('   pg_dump/psql warnings:', stderr);
    }

    console.log(`✅ Schema copied successfully from "${sourceDbName}" to "${targetDbName}"`);
    return true;
  } catch (execError) {
    // Method 2: Fallback to Prisma db push
    console.warn('   pg_dump/psql approach failed, trying Prisma db push...');
    console.warn(`   Error: ${execError.message}`);
    
    try {
      const projectRoot = process.cwd();
      const schemaPath = path.join(projectRoot, 'prisma', 'schema.prisma');

      // Use Prisma db push to apply schema to target database
      const env = { ...process.env, DATABASE_URL: targetUrl };
      
      console.log('   Using Prisma db push method...');
      const { stdout, stderr } = await execAsync(
        `npx prisma db push --schema="${schemaPath}" --skip-generate --accept-data-loss`,
        { 
          env,
          maxBuffer: 10 * 1024 * 1024,
          cwd: projectRoot,
        }
      );

      if (stderr && !stderr.includes('WARNING') && !stderr.includes('info')) {
        console.warn('   Prisma db push output:', stderr);
      }

      console.log(`✅ Schema copied successfully using Prisma from "${sourceDbName}" to "${targetDbName}"`);
      return true;
    } catch (prismaError) {
      console.error('❌ Both methods failed:');
      console.error(`   pg_dump error: ${execError.message}`);
      console.error(`   Prisma error: ${prismaError.message}`);
      throw new Error('Failed to copy schema using both methods');
    }
  }
}

/**
 * Main function
 */
async function main() {
  const sourceDbName = 'nandi';
  const targetDbName = 'PT';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗄️  CREATE PT DATABASE FROM NANDI SCHEMA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Check if source database exists
    console.log(`📊 Checking if source database "${sourceDbName}" exists...`);
    const sourceExists = await databaseExists(sourceDbName);
    if (!sourceExists) {
      console.error(`❌ Source database "${sourceDbName}" does not exist`);
      process.exit(1);
    }
    console.log(`✅ Source database "${sourceDbName}" exists\n`);

    // Step 2: Check if target database already exists
    console.log(`📊 Checking if target database "${targetDbName}" exists...`);
    const targetExists = await databaseExists(targetDbName);
    if (targetExists) {
      console.log(`⚠️  Target database "${targetDbName}" already exists`);
      console.log('   Do you want to drop and recreate it? (This will delete all data in PT)');
      console.log('   For now, skipping creation. Delete the database manually if you want to recreate it.');
      process.exit(0);
    }
    console.log(`✅ Target database "${targetDbName}" does not exist\n`);

    // Step 3: Create target database
    console.log(`🔨 Creating database "${targetDbName}"...`);
    await createDatabase(targetDbName);
    console.log('');

    // Step 4: Copy schema (without data)
    await copySchema(sourceDbName, targetDbName);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! PT database created with schema from nandi (no data)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Next steps:');
    console.log('   1. Use the database switcher at /db-switcher to switch to PT');
    console.log('   2. Or update .db-config.json manually: { "activeDatabase": "PT" }');
    console.log('   3. Restart your application to use the new database\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();

