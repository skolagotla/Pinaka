/**
 * Data Migration Script: Assign Existing Landlords to Organizations
 * 
 * This script creates a default organization for each existing landlord
 * and assigns all their properties to that organization.
 * 
 * Run this after applying the Prisma migration that adds the Organization model.
 * 
 * Usage:
 *   tsx scripts/migrate-to-organizations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  organizationsCreated: number;
  landlordsUpdated: number;
  propertiesUpdated: number;
  errors: Array<{ landlordId: string; error: string }>;
}

async function migrateToOrganizations(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    organizationsCreated: 0,
    landlordsUpdated: 0,
    propertiesUpdated: 0,
    errors: [],
  };

  console.log('🚀 Starting migration to Organizations...\n');

  try {
    // Get all landlords that don't have an organization yet
    const landlords = await prisma.landlord.findMany({
      where: {
        organizationId: null,
      },
      include: {
        properties: {
          select: {
            id: true,
            propertyId: true,
            propertyName: true,
          },
        },
      },
    });

    console.log(`📊 Found ${landlords.length} landlords without organizations\n`);

    if (landlords.length === 0) {
      console.log('✅ No landlords to migrate. Migration complete!');
      return stats;
    }

    // Process each landlord
    for (const landlord of landlords) {
      try {
        console.log(`Processing landlord: ${landlord.email} (${landlord.landlordId})`);

        // Generate organization name from landlord name or email
        const orgName = landlord.firstName && landlord.lastName
          ? `${landlord.firstName} ${landlord.lastName}'s Organization`
          : `${landlord.email.split('@')[0]}'s Organization`;

        // Generate subdomain from email (sanitized)
        const subdomain = landlord.email
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .substring(0, 50);

        // Check if subdomain already exists
        let finalSubdomain = subdomain;
        let counter = 1;
        while (await prisma.organization.findUnique({ where: { subdomain: finalSubdomain } })) {
          finalSubdomain = `${subdomain}-${counter}`;
          counter++;
        }

        // Create organization
        const organization = await prisma.organization.create({
          data: {
            name: orgName,
            subdomain: finalSubdomain,
            plan: 'FREE', // Default to FREE plan
            status: 'ACTIVE',
            // Set reasonable defaults for FREE plan
            maxProperties: 10,
            maxTenants: 50,
            maxUsers: 3,
            maxStorageGB: 5,
            maxApiCallsPerMonth: 10000,
            billingEmail: landlord.email,
          },
        });

        stats.organizationsCreated++;

        // Create default organization settings
        await prisma.organizationSettings.create({
          data: {
            organizationId: organization.id,
            emailNotifications: true,
            smsNotifications: false,
          },
        });

        // Update landlord with organizationId
        await prisma.landlord.update({
          where: { id: landlord.id },
          data: { organizationId: organization.id },
        });

        stats.landlordsUpdated++;

        // Update all properties for this landlord
        if (landlord.properties.length > 0) {
          const propertyIds = landlord.properties.map(p => p.id);
          const updateResult = await prisma.property.updateMany({
            where: {
              id: { in: propertyIds },
            },
            data: {
              organizationId: organization.id,
            },
          });

          stats.propertiesUpdated += updateResult.count;
          console.log(`  ✅ Updated ${updateResult.count} properties`);
        }

        console.log(`  ✅ Created organization: ${orgName} (${finalSubdomain})\n`);

      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        console.error(`  ❌ Error processing landlord ${landlord.landlordId}: ${errorMsg}`);
        stats.errors.push({
          landlordId: landlord.landlordId,
          error: errorMsg,
        });
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Organizations created: ${stats.organizationsCreated}`);
    console.log(`  ✅ Landlords updated: ${stats.landlordsUpdated}`);
    console.log(`  ✅ Properties updated: ${stats.propertiesUpdated}`);
    console.log(`  ❌ Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.forEach((err) => {
        console.log(`  - Landlord ${err.landlordId}: ${err.error}`);
      });
    }

    return stats;

  } catch (error: any) {
    console.error('❌ Fatal error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateToOrganizations()
    .then((stats) => {
      if (stats.errors.length === 0) {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
      } else {
        console.log('\n⚠️  Migration completed with errors. Please review.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

export { migrateToOrganizations };

