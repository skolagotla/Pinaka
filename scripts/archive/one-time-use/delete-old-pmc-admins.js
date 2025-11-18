/**
 * Delete Old PMC Admin Users from PT Database
 * 
 * Deletes the old PMC admin users (pmcadmin1@pmc.local through pmcadmin5@pmc.local)
 * Keeps only super admin and the new AB Homes PMC admins
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

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
  console.log('🗑️  DELETE OLD PMC ADMIN USERS FROM PT DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // List of emails to delete
    const emailsToDelete = [
      'pmcadmin1@pmc.local',
      'pmcadmin2@pmc.local',
      'pmcadmin3@pmc.local',
      'pmcadmin4@pmc.local',
      'pmcadmin5@pmc.local',
    ];

    console.log('📊 Step 1: Finding users to delete...\n');
    
    const deletedUsers = [];
    const notFoundUsers = [];

    for (const email of emailsToDelete) {
      try {
        const admin = await prisma.admin.findUnique({
          where: { email },
          include: {
            sessions: true,
            permissions: true,
          },
        });

        if (!admin) {
          console.log(`⚠️  User not found: ${email}`);
          notFoundUsers.push(email);
          continue;
        }

        console.log(`🔍 Found user: ${email} (ID: ${admin.id})`);

        // Step 2: Delete RBAC UserRoles for this admin
        console.log(`   📋 Deleting RBAC roles...`);
        const deletedRoles = await prisma.userRole.deleteMany({
          where: {
            userId: admin.id,
            userType: 'admin',
          },
        });
        console.log(`   ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

        // Step 3: Delete admin sessions
        console.log(`   📋 Deleting sessions...`);
        const deletedSessions = await prisma.adminSession.deleteMany({
          where: {
            adminId: admin.id,
          },
        });
        console.log(`   ✅ Deleted ${deletedSessions.count} session(s)`);

        // Step 4: Delete admin permissions
        console.log(`   📋 Deleting permissions...`);
        const deletedPermissions = await prisma.adminPermission.deleteMany({
          where: {
            adminId: admin.id,
          },
        });
        console.log(`   ✅ Deleted ${deletedPermissions.count} permission(s)`);

        // Step 5: Delete admin audit logs (optional - you might want to keep these)
        // Uncomment if you want to delete audit logs too
        // const deletedAuditLogs = await prisma.adminAuditLog.deleteMany({
        //   where: {
        //     adminId: admin.id,
        //   },
        // });
        // console.log(`   ✅ Deleted ${deletedAuditLogs.count} audit log(s)`);

        // Step 6: Delete the admin user
        console.log(`   📋 Deleting admin user...`);
        await prisma.admin.delete({
          where: { id: admin.id },
        });
        console.log(`   ✅ Deleted admin user: ${email}`);

        deletedUsers.push(email);

      } catch (error) {
        console.error(`   ❌ Error deleting ${email}:`, error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DELETION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📝 Summary:`);
    console.log(`   ✅ Deleted: ${deletedUsers.length} user(s)`);
    if (deletedUsers.length > 0) {
      deletedUsers.forEach((email, index) => {
        console.log(`      ${index + 1}. ${email}`);
      });
    }
    
    if (notFoundUsers.length > 0) {
      console.log(`   ⚠️  Not found: ${notFoundUsers.length} user(s)`);
      notFoundUsers.forEach((email, index) => {
        console.log(`      ${index + 1}. ${email}`);
      });
    }

    console.log('\n📝 Remaining users in system:');
    console.log('   - superadmin@admin.local (Super Admin)');
    console.log('   - pmc1-admin@pmc.local (AB Homes PMC Admin)');
    console.log('   - pmc2-admin@pmc.local (AB Homes PMC Admin)\n');

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

