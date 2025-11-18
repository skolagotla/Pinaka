/**
 * Create Super Admin in PT Database
 * 
 * Creates a superadmin user in the PT database with:
 * - Email: superadmin@admin.local
 * - Password: superadmin (temporary, uses default password check)
 * - Role: SUPER_ADMIN
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { getDatabaseUrl } = require('../lib/utils/db-config');

// Build connection URL for PT database
const originalUrl = process.env.DATABASE_URL;
if (!originalUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Build PT database URL
function buildDatabaseUrl(dbName) {
  try {
    const url = new URL(originalUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  } catch (error) {
    throw new Error(`Failed to build database URL: ${error.message}`);
  }
}

const ptDatabaseUrl = buildDatabaseUrl('PT');

// Create Prisma client with PT database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: ptDatabaseUrl,
    },
  },
});

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 CREATE SUPER ADMIN IN PT DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const email = 'superadmin@admin.local';
    const password = 'superadmin'; // This will be checked via default password in login API
    const firstName = 'Super';
    const lastName = 'Admin';
    const role = 'SUPER_ADMIN';

    // Check if superadmin already exists
    console.log(`📊 Checking if superadmin already exists...`);
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`⚠️  Superadmin with email "${email}" already exists`);
      console.log('   Updating to ensure correct role and status...');
      
      await prisma.admin.update({
        where: { email },
        data: {
          firstName,
          lastName,
          role,
          isActive: true,
          isLocked: false,
        },
      });

      console.log(`✅ Superadmin updated successfully`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${role}`);
    } else {
      // Create new superadmin
      console.log(`🔨 Creating superadmin...`);
      
      const admin = await prisma.admin.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          isActive: true,
          isLocked: false,
          allowedGoogleDomains: [],
          ipWhitelist: [],
          requireIpWhitelist: false,
        },
      });

      console.log(`✅ Superadmin created successfully`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${role}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Superadmin created in PT database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Login Credentials:');
    console.log(`   Email/User ID: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Switch to PT database using /db-switcher');
    console.log('   2. Go to /admin/login');
    console.log('   3. Login with the credentials above\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();

