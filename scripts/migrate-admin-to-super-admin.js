/**
 * ═══════════════════════════════════════════════════════════════
 * MIGRATION SCRIPT: Convert existing admins to super_admin role
 * ═══════════════════════════════════════════════════════════════
 * 
 * This script migrates all existing Admin records to have SUPER_ADMIN role.
 * This ensures backward compatibility while formalizing the role system.
 * 
 * Run: node scripts/migrate-admin-to-super-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAdminRoles() {
  console.log('🔄 Starting admin role migration...\n');

  try {
    // Find all admins
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log(`📊 Found ${admins.length} admin(s) to migrate\n`);

    if (admins.length === 0) {
      console.log('✅ No admins found. Migration complete.');
      return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const admin of admins) {
      // Only migrate if not already SUPER_ADMIN
      if (admin.role === 'SUPER_ADMIN') {
        console.log(`⏭️  Skipping ${admin.email} - already SUPER_ADMIN`);
        skipped++;
        continue;
      }

      console.log(`🔄 Migrating ${admin.email} from ${admin.role} to SUPER_ADMIN...`);

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          role: 'SUPER_ADMIN',
        },
      });

      console.log(`✅ Migrated ${admin.email} to SUPER_ADMIN`);
      migrated++;
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total admins: ${admins.length}`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log('\n✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateAdminRoles()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

