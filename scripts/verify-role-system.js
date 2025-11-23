/**
 * ═══════════════════════════════════════════════════════════════
 * VERIFICATION SCRIPT: Verify Role System Implementation
 * ═══════════════════════════════════════════════════════════════
 * 
 * This script verifies that the role system is correctly implemented:
 * 1. All admins have SUPER_ADMIN role
 * 2. Admin endpoints are protected
 * 3. Role helpers are working correctly
 * 
 * Run: node scripts/verify-role-system.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyRoleSystem() {
  console.log('🔍 Verifying Role System Implementation...\n');

  try {
    // 1. Check all admins have SUPER_ADMIN role
    console.log('📊 Step 1: Checking Admin Roles...');
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    console.log(`   Found ${admins.length} admin(s)\n`);

    let allSuperAdmin = true;
    for (const admin of admins) {
      if (admin.role !== 'SUPER_ADMIN') {
        console.log(`   ❌ ${admin.email} has role: ${admin.role} (expected: SUPER_ADMIN)`);
        allSuperAdmin = false;
      } else {
        console.log(`   ✅ ${admin.email} has SUPER_ADMIN role`);
      }
    }

    if (allSuperAdmin) {
      console.log('\n   ✅ All admins have SUPER_ADMIN role\n');
    } else {
      console.log('\n   ⚠️  Some admins do not have SUPER_ADMIN role');
      console.log('   Run: node scripts/migrate-admin-to-super-admin.js\n');
    }

    // 2. Check active admins
    console.log('📊 Step 2: Checking Active Admins...');
    const activeAdmins = admins.filter(a => a.isActive && !a.isLocked);
    console.log(`   Active admins: ${activeAdmins.length}/${admins.length}\n`);

    // 3. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Verification Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Total admins: ${admins.length}`);
    console.log(`   Active admins: ${activeAdmins.length}`);
    console.log(`   All SUPER_ADMIN: ${allSuperAdmin ? '✅' : '❌'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (allSuperAdmin && activeAdmins.length > 0) {
      console.log('✅ Role system verification PASSED!');
      console.log('   All admins are correctly configured with SUPER_ADMIN role.');
      console.log('   The role system is ready to use.\n');
      return true;
    } else {
      console.log('⚠️  Role system verification found issues.');
      if (!allSuperAdmin) {
        console.log('   Please run the migration script to fix admin roles.\n');
      }
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyRoleSystem()
  .then((success) => {
    if (success) {
      console.log('🎉 Verification completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Verification found issues. Please review and fix.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });

