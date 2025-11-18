/**
 * Create 2 PMC Admin Users for AB Homes Company in PT Database
 * 
 * Creates 2 PMC Admin users in the PT database, linked to "AB Homes" PMC company:
 * - Emails: pmc1-admin@pmc.local, pmc2-admin@pmc.local
 * - Password: pmcadmin (temporary, uses default password check)
 * - Role: PMC_ADMIN (via RBAC)
 * - Company: AB Homes
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient, RBACRole } = require('@prisma/client');
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
  console.log('👥 CREATE 2 PMC ADMIN USERS FOR AB HOMES IN PT DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Create or get AB Homes PMC company
    console.log('📊 Step 1: Creating/Getting AB Homes PMC company...');
    const abHomesEmail = 'ab-homes@pmc.local';
    const abHomesName = 'AB Homes';
    
    let pmc = await prisma.propertyManagementCompany.findUnique({
      where: { email: abHomesEmail },
    });

    if (!pmc) {
      // Generate a unique companyId
      const companyId = `PMC-AB-${Date.now()}`;
      
      pmc = await prisma.propertyManagementCompany.create({
        data: {
          companyId,
          companyName: abHomesName,
          email: abHomesEmail,
          phone: '555-0200',
          isActive: true,
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
        },
      });
      console.log(`✅ Created AB Homes PMC: ${pmc.companyName} (ID: ${pmc.id})`);
    } else {
      console.log(`✅ Found existing AB Homes PMC: ${pmc.companyName} (ID: ${pmc.id})`);
    }

    // Step 2: Get or create PMC_ADMIN role
    console.log('\n📊 Step 2: Getting PMC_ADMIN role...');
    let pmcAdminRole = await prisma.role.findUnique({
      where: { name: RBACRole.PMC_ADMIN },
    });

    if (!pmcAdminRole) {
      console.log('⚠️  PMC_ADMIN role not found. Creating it...');
      pmcAdminRole = await prisma.role.create({
        data: {
          name: RBACRole.PMC_ADMIN,
          displayName: 'PMC Admin',
          isSystem: true,
          description: 'Property Management Company Administrator',
        },
      });
      console.log(`✅ Created PMC_ADMIN role (ID: ${pmcAdminRole.id})`);
    } else {
      console.log(`✅ Found PMC_ADMIN role (ID: ${pmcAdminRole.id})`);
    }

    // Step 3: Get superadmin for assignedBy
    console.log('\n📊 Step 3: Getting superadmin for assignment...');
    const superadmin = await prisma.admin.findUnique({
      where: { email: 'superadmin@admin.local' },
    });

    if (!superadmin) {
      console.error('❌ Superadmin not found. Please create superadmin first using create-superadmin-pt.js');
      process.exit(1);
    }
    console.log(`✅ Found superadmin (ID: ${superadmin.id})`);

    // Step 4: Create 2 PMC Admin users
    console.log('\n📊 Step 4: Creating 2 PMC Admin users for AB Homes...\n');
    const password = 'pmcadmin'; // Default password for all
    const createdUsers = [];

    for (let i = 1; i <= 2; i++) {
      const email = `pmc${i}-admin@pmc.local`;
      const firstName = `PMC`;
      const lastName = `Admin ${i}`;

      try {
        // Check if admin already exists
        let admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (admin) {
          console.log(`⚠️  Admin ${i}/2: ${email} already exists, updating...`);
          admin = await prisma.admin.update({
            where: { email },
            data: {
              firstName,
              lastName,
              isActive: true,
              isLocked: false,
            },
          });
        } else {
          // Create new admin
          console.log(`🔨 Creating admin ${i}/2: ${email}...`);
          admin = await prisma.admin.create({
            data: {
              email,
              firstName,
              lastName,
              role: 'PLATFORM_ADMIN', // Base admin role
              isActive: true,
              isLocked: false,
              allowedGoogleDomains: [],
              ipWhitelist: [],
              requireIpWhitelist: false,
            },
          });
        }

        // Step 5: Assign PMC_ADMIN RBAC role with PMC scope
        console.log(`   📋 Assigning PMC_ADMIN role with AB Homes PMC scope...`);
        
        // Check if UserRole already exists
        const existingUserRole = await prisma.userRole.findFirst({
          where: {
            userId: admin.id,
            userType: 'admin',
            roleId: pmcAdminRole.id,
            pmcId: pmc.id,
          },
        });

        if (existingUserRole) {
          // Update existing role
          await prisma.userRole.update({
            where: { id: existingUserRole.id },
            data: {
              isActive: true,
              assignedBy: superadmin.id,
              assignedAt: new Date(),
            },
          });
          console.log(`   ✅ Updated existing PMC_ADMIN role assignment`);
        } else {
          // Create new UserRole
          await prisma.userRole.create({
            data: {
              userId: admin.id,
              userType: 'admin',
              roleId: pmcAdminRole.id,
              pmcId: pmc.id,
              isActive: true,
              assignedBy: superadmin.id,
            },
          });
          console.log(`   ✅ Created PMC_ADMIN role assignment`);
        }

        // Log in audit
        await prisma.rBACAuditLog.create({
          data: {
            userId: superadmin.id,
            userType: 'admin',
            action: 'assign_role',
            resource: 'user',
            resourceId: admin.id,
            details: {
              role: RBACRole.PMC_ADMIN,
              pmcId: pmc.id,
              pmcName: pmc.companyName,
            },
          },
        });

        createdUsers.push({
          id: admin.id,
          email,
          firstName,
          lastName,
          password,
        });

        console.log(`   ✅ Admin ${i}/2 created successfully`);
        console.log(`      Email: ${email}`);
        console.log(`      Password: ${password}`);
        console.log(`      PMC: ${pmc.companyName}\n`);

      } catch (error) {
        console.error(`   ❌ Error creating admin ${i}/2 (${email}):`, error.message);
        throw error;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! 2 PMC Admin users created in PT database for AB Homes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 AB Homes PMC Company:');
    console.log(`   Name: ${pmc.companyName}`);
    console.log(`   Email: ${pmc.email}`);
    console.log(`   ID: ${pmc.id}\n`);
    console.log('📝 Created Users:');
    createdUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} / ${user.password}`);
    });
    console.log('\n📝 Next steps:');
    console.log('   1. Switch to PT database using /db-switcher');
    console.log('   2. Go to / (main app login)');
    console.log('   3. Login with any of the PMC admin credentials above');
    console.log('   4. Both users are linked to AB Homes PMC company\n');

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

