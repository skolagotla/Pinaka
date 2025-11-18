/**
 * Delete User by Email
 * 
 * Finds and deletes a user with the specified email address.
 * Handles all user types (Admin, Landlord, Tenant, PMC, ServiceProvider).
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { getDatabaseUrl } = require('@/lib/utils/db-config');

// Get database URL (respects .db-config.json if exists)
const databaseUrl = getDatabaseUrl() || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

/**
 * Main function
 */
async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: npx tsx scripts/delete-user-by-email.js <email>');
    process.exit(1);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  DELETE USER BY EMAIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📧 Searching for user with email: ${email}\n`);

  try {
    await prisma.$connect();

    // Step 1: Find the user in all possible tables
    let userFound = false;
    let userType = null;
    let userId = null;
    let userData = null;

    // Check Admin table
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    if (admin) {
      userFound = true;
      userType = 'admin';
      userId = admin.id;
      userData = admin;
      console.log('✅ Found user in Admin table');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Locked: ${admin.isLocked}\n`);
    }

    // Check Landlord table
    if (!userFound) {
      const landlord = await prisma.landlord.findUnique({
        where: { email },
      });
      if (landlord) {
        userFound = true;
        userType = 'landlord';
        userId = landlord.id;
        userData = landlord;
        console.log('✅ Found user in Landlord table');
        console.log(`   ID: ${landlord.id}`);
        console.log(`   Name: ${landlord.firstName} ${landlord.lastName}`);
        console.log(`   Approval Status: ${landlord.approvalStatus}\n`);
      }
    }

    // Check Tenant table
    if (!userFound) {
      const tenant = await prisma.tenant.findUnique({
        where: { email },
      });
      if (tenant) {
        userFound = true;
        userType = 'tenant';
        userId = tenant.id;
        userData = tenant;
        console.log('✅ Found user in Tenant table');
        console.log(`   ID: ${tenant.id}`);
        console.log(`   Name: ${tenant.firstName} ${tenant.lastName}\n`);
      }
    }

    // Check PropertyManagementCompany table
    if (!userFound) {
      const pmc = await prisma.propertyManagementCompany.findUnique({
        where: { email },
      });
      if (pmc) {
        userFound = true;
        userType = 'pmc';
        userId = pmc.id;
        userData = pmc;
        console.log('✅ Found user in PropertyManagementCompany table');
        console.log(`   ID: ${pmc.id}`);
        console.log(`   Company Name: ${pmc.companyName}`);
        console.log(`   Approval Status: ${pmc.approvalStatus}\n`);
      }
    }

    // Check ServiceProvider table
    if (!userFound) {
      const serviceProvider = await prisma.serviceProvider.findUnique({
        where: { email },
      });
      if (serviceProvider) {
        userFound = true;
        userType = 'serviceProvider';
        userId = serviceProvider.id;
        userData = serviceProvider;
        console.log('✅ Found user in ServiceProvider table');
        console.log(`   ID: ${serviceProvider.id}`);
        console.log(`   Name: ${serviceProvider.name || serviceProvider.firstName} ${serviceProvider.lastName || ''}\n`);
      }
    }

    if (!userFound) {
      console.log('❌ User not found with email:', email);
      console.log('   Searched in: Admin, Landlord, Tenant, PropertyManagementCompany, ServiceProvider');
      process.exit(0);
    }

    // Step 2: Delete related data based on user type
    console.log('🗑️  Step 2: Deleting related data...\n');

    if (userType === 'admin') {
      // Delete Admin-related data
      console.log('   📋 Deleting RBAC roles...');
      const deletedRoles = await prisma.userRole.deleteMany({
        where: {
          userId: userId,
          userType: 'admin',
        },
      });
      console.log(`      ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

      console.log('   📋 Deleting user permissions...');
      // UserPermission is linked to UserRole, so we need to find UserRoles first
      const userRoleIds = await prisma.userRole.findMany({
        where: {
          userId: userId,
          userType: 'admin',
        },
        select: { id: true },
      });
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.id);
        const deletedPermissions = await prisma.userPermission.deleteMany({
          where: {
            userRoleId: { in: roleIds },
          },
        });
        console.log(`      ✅ Deleted ${deletedPermissions.count} permission(s)`);
      } else {
        console.log('      ℹ️  No user permissions found');
      }

      console.log('   📋 Deleting admin sessions...');
      const deletedSessions = await prisma.adminSession.deleteMany({
        where: {
          adminId: userId,
        },
      });
      console.log(`      ✅ Deleted ${deletedSessions.count} session(s)`);

      console.log('   📋 Deleting admin permissions...');
      const deletedAdminPermissions = await prisma.adminPermission.deleteMany({
        where: {
          adminId: userId,
        },
      });
      console.log(`      ✅ Deleted ${deletedAdminPermissions.count} permission(s)`);

      // Note: We'll keep audit logs for historical purposes
      console.log('   ℹ️  Keeping admin audit logs (for historical purposes)');

      // Delete the admin user
      console.log('   📋 Deleting admin user...');
      await prisma.admin.delete({
        where: { id: userId },
      });
      console.log('      ✅ Deleted admin user');

    } else if (userType === 'landlord') {
      // Delete Landlord-related data
      console.log('   📋 Deleting RBAC roles...');
      const deletedRoles = await prisma.userRole.deleteMany({
        where: {
          userId: userId,
          userType: 'landlord',
        },
      });
      console.log(`      ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

      console.log('   📋 Deleting user permissions...');
      const userRoleIds = await prisma.userRole.findMany({
        where: {
          userId: userId,
          userType: 'landlord',
        },
        select: { id: true },
      });
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.id);
        const deletedPermissions = await prisma.userPermission.deleteMany({
          where: {
            userRoleId: { in: roleIds },
          },
        });
        console.log(`      ✅ Deleted ${deletedPermissions.count} permission(s)`);
      } else {
        console.log('      ℹ️  No user permissions found');
      }

      // Note: Properties, leases, etc. should be handled separately
      // We'll just delete the landlord record
      console.log('   ⚠️  Note: Properties and related data are NOT deleted');
      console.log('      You may need to reassign properties to another landlord');

      console.log('   📋 Deleting landlord user...');
      await prisma.landlord.delete({
        where: { id: userId },
      });
      console.log('      ✅ Deleted landlord user');

    } else if (userType === 'tenant') {
      // Delete Tenant-related data
      console.log('   📋 Deleting RBAC roles...');
      const deletedRoles = await prisma.userRole.deleteMany({
        where: {
          userId: userId,
          userType: 'tenant',
        },
      });
      console.log(`      ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

      console.log('   📋 Deleting user permissions...');
      const userRoleIds = await prisma.userRole.findMany({
        where: {
          userId: userId,
          userType: 'tenant',
        },
        select: { id: true },
      });
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.id);
        const deletedPermissions = await prisma.userPermission.deleteMany({
          where: {
            userRoleId: { in: roleIds },
          },
        });
        console.log(`      ✅ Deleted ${deletedPermissions.count} permission(s)`);
      } else {
        console.log('      ℹ️  No user permissions found');
      }

      // Note: Documents, leases, etc. should be handled separately
      console.log('   ⚠️  Note: Documents, leases, and related data are NOT deleted');
      console.log('      You may need to clean up related records manually');

      console.log('   📋 Deleting tenant user...');
      await prisma.tenant.delete({
        where: { id: userId },
      });
      console.log('      ✅ Deleted tenant user');

    } else if (userType === 'pmc') {
      // Delete PMC-related data
      console.log('   📋 Deleting RBAC roles...');
      const deletedRoles = await prisma.userRole.deleteMany({
        where: {
          userId: userId,
          userType: 'pmc',
        },
      });
      console.log(`      ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

      console.log('   📋 Deleting user permissions...');
      const userRoleIds = await prisma.userRole.findMany({
        where: {
          userId: userId,
          userType: 'pmc',
        },
        select: { id: true },
      });
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.id);
        const deletedPermissions = await prisma.userPermission.deleteMany({
          where: {
            userRoleId: { in: roleIds },
          },
        });
        console.log(`      ✅ Deleted ${deletedPermissions.count} permission(s)`);
      } else {
        console.log('      ℹ️  No user permissions found');
      }

      // Note: Properties, landlords, etc. should be handled separately
      console.log('   ⚠️  Note: Properties, landlords, and related data are NOT deleted');
      console.log('      You may need to reassign managed properties');

      console.log('   📋 Deleting PMC user...');
      await prisma.propertyManagementCompany.delete({
        where: { id: userId },
      });
      console.log('      ✅ Deleted PMC user');

    } else if (userType === 'serviceProvider') {
      // Delete ServiceProvider-related data
      console.log('   📋 Deleting RBAC roles...');
      const deletedRoles = await prisma.userRole.deleteMany({
        where: {
          userId: userId,
          userType: 'vendor',
        },
      });
      console.log(`      ✅ Deleted ${deletedRoles.count} RBAC role(s)`);

      console.log('   📋 Deleting user permissions...');
      const userRoleIds = await prisma.userRole.findMany({
        where: {
          userId: userId,
          userType: 'vendor',
        },
        select: { id: true },
      });
      if (userRoleIds.length > 0) {
        const roleIds = userRoleIds.map(ur => ur.id);
        const deletedPermissions = await prisma.userPermission.deleteMany({
          where: {
            userRoleId: { in: roleIds },
          },
        });
        console.log(`      ✅ Deleted ${deletedPermissions.count} permission(s)`);
      } else {
        console.log('      ℹ️  No user permissions found');
      }

      // Note: Maintenance requests, ratings, etc. should be handled separately
      console.log('   ⚠️  Note: Maintenance requests, ratings, and related data are NOT deleted');

      console.log('   📋 Deleting service provider user...');
      await prisma.serviceProvider.delete({
        where: { id: userId },
      });
      console.log('      ✅ Deleted service provider user');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ USER DELETION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📝 Summary:`);
    console.log(`   ✅ Deleted user: ${email}`);
    console.log(`   ✅ User type: ${userType}`);
    console.log(`   ✅ User ID: ${userId}\n`);

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

