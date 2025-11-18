/**
 * Migration script to consolidate Vendor and Contractor into unified ServiceProvider model
 * 
 * Migrates:
 * - Vendor → ServiceProvider (type: 'vendor')
 * - Contractor → ServiceProvider (type: 'contractor')
 * - LandlordVendor → LandlordServiceProvider
 * - LandlordContractor → LandlordServiceProvider
 * - MaintenanceRequest.assignedToVendorId → assignedToProviderId
 * - SupportTicket vendorId/contractorId → serviceProviderId
 * - Invitation vendorId/contractorId → serviceProviderId
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to generate providerId
function generateProviderId(type, originalId) {
  const prefix = type === 'vendor' ? 'VND' : 'CNT';
  return `${prefix}${originalId.substring(0, 12).toUpperCase()}`;
}

async function migrateVendors() {
  console.log('\n📦 Migrating Vendors → ServiceProvider (type: vendor)...');
  
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        landlordVendors: true
      }
    });

    if (vendors.length === 0) {
      console.log('   ⚠️  No vendors found');
      return { migrated: 0, relationships: 0 };
    }

    let migrated = 0;
    let relationships = 0;

    for (const vendor of vendors) {
      try {
        // Create ServiceProvider from Vendor
        const provider = await prisma.serviceProvider.create({
          data: {
            providerId: generateProviderId('vendor', vendor.id),
            type: 'vendor',
            name: vendor.name,
            businessName: vendor.businessName,
            contactName: null, // Vendors don't have contactName
            licenseNumber: null, // Vendors don't have licenseNumber
            email: vendor.email,
            phone: vendor.phone,
            category: vendor.category,
            specialties: [], // Vendors use category, not specialties
            addressLine1: vendor.addressLine1,
            addressLine2: vendor.addressLine2,
            city: vendor.city,
            provinceState: vendor.provinceState,
            postalZip: vendor.postalZip,
            country: vendor.country,
            countryCode: vendor.countryCode,
            regionCode: vendor.regionCode,
            latitude: vendor.latitude,
            longitude: vendor.longitude,
            rating: vendor.rating,
            hourlyRate: vendor.hourlyRate,
            notes: vendor.notes,
            isGlobal: vendor.isGlobal,
            invitedBy: vendor.invitedBy,
            invitedByRole: vendor.invitedByRole,
            approvedBy: vendor.approvedBy,
            approvedAt: vendor.approvedAt,
            isDeleted: vendor.isDeleted,
            deletedAt: vendor.deletedAt,
            deletedBy: vendor.deletedBy,
            deletedByRole: vendor.deletedByRole,
            deletionReason: vendor.deletionReason,
            retainedName: vendor.retainedName,
            retainedEmail: vendor.retainedEmail,
            retainedPhone: vendor.retainedPhone,
            isActive: vendor.isActive,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt
          }
        });

        // Migrate LandlordVendor relationships
        for (const lv of vendor.landlordVendors) {
          await prisma.landlordServiceProvider.create({
            data: {
              landlordId: lv.landlordId,
              providerId: provider.id,
              addedAt: lv.addedAt,
              addedBy: lv.addedBy,
              notes: lv.notes
            }
          });
          relationships++;
        }

        // Update MaintenanceRequest.assignedToVendorId → assignedToProviderId
        await prisma.maintenanceRequest.updateMany({
          where: { assignedToVendorId: vendor.id },
          data: { assignedToProviderId: provider.id }
        });

        // Update SupportTicket.vendorId → serviceProviderId
        await prisma.supportTicket.updateMany({
          where: { vendorId: vendor.id },
          data: { serviceProviderId: provider.id }
        });

        // Update Invitation.vendorId → serviceProviderId
        await prisma.invitation.updateMany({
          where: { vendorId: vendor.id },
          data: { serviceProviderId: provider.id }
        });

        migrated++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping duplicate vendor: ${vendor.name} (${vendor.email})`);
        } else {
          throw error;
        }
      }
    }

    console.log(`   ✅ Migrated ${migrated} vendors, ${relationships} landlord relationships`);
    return { migrated, relationships };
  } catch (error) {
    console.error('   ❌ Error migrating vendors:', error);
    throw error;
  }
}

async function migrateContractors() {
  console.log('\n📦 Migrating Contractors → ServiceProvider (type: contractor)...');
  
  try {
    const contractors = await prisma.contractor.findMany({
      include: {
        landlordContractors: true
      }
    });

    if (contractors.length === 0) {
      console.log('   ⚠️  No contractors found');
      return { migrated: 0, relationships: 0 };
    }

    let migrated = 0;
    let relationships = 0;

    for (const contractor of contractors) {
      try {
        // Create ServiceProvider from Contractor
        const provider = await prisma.serviceProvider.create({
          data: {
            providerId: generateProviderId('contractor', contractor.id),
            type: 'contractor',
            name: contractor.companyName, // Contractors use companyName as name
            businessName: null, // Contractors don't have businessName
            contactName: contractor.contactName,
            licenseNumber: contractor.licenseNumber,
            email: contractor.email,
            phone: contractor.phone,
            category: null, // Contractors use specialties, not category
            specialties: contractor.specialties,
            addressLine1: contractor.addressLine1,
            addressLine2: contractor.addressLine2,
            city: contractor.city,
            provinceState: contractor.provinceState,
            postalZip: contractor.postalZip,
            country: contractor.country,
            countryCode: contractor.countryCode,
            regionCode: contractor.regionCode,
            latitude: contractor.latitude,
            longitude: contractor.longitude,
            rating: contractor.rating,
            hourlyRate: contractor.hourlyRate,
            notes: contractor.notes,
            isGlobal: contractor.isGlobal,
            invitedBy: contractor.invitedBy,
            invitedByRole: contractor.invitedByRole,
            approvedBy: contractor.approvedBy,
            approvedAt: contractor.approvedAt,
            isDeleted: contractor.isDeleted,
            deletedAt: contractor.deletedAt,
            deletedBy: contractor.deletedBy,
            deletedByRole: contractor.deletedByRole,
            deletionReason: contractor.deletionReason,
            retainedName: contractor.retainedName,
            retainedEmail: contractor.retainedEmail,
            retainedPhone: contractor.retainedPhone,
            isActive: contractor.isActive,
            createdAt: contractor.createdAt,
            updatedAt: contractor.updatedAt
          }
        });

        // Migrate LandlordContractor relationships
        for (const lc of contractor.landlordContractors) {
          await prisma.landlordServiceProvider.create({
            data: {
              landlordId: lc.landlordId,
              providerId: provider.id,
              addedAt: lc.addedAt,
              addedBy: lc.addedBy,
              notes: lc.notes
            }
          });
          relationships++;
        }

        // Update SupportTicket.contractorId → serviceProviderId
        await prisma.supportTicket.updateMany({
          where: { contractorId: contractor.id },
          data: { serviceProviderId: provider.id }
        });

        // Update Invitation.contractorId → serviceProviderId
        await prisma.invitation.updateMany({
          where: { contractorId: contractor.id },
          data: { serviceProviderId: provider.id }
        });

        migrated++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Skipping duplicate contractor: ${contractor.companyName} (${contractor.email})`);
        } else {
          throw error;
        }
      }
    }

    console.log(`   ✅ Migrated ${migrated} contractors, ${relationships} landlord relationships`);
    return { migrated, relationships };
  } catch (error) {
    console.error('   ❌ Error migrating contractors:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Service Provider Migration...');
    console.log('==========================================\n');

    // Check if ServiceProvider table exists and has data
    const existingCount = await prisma.serviceProvider.count();
    if (existingCount > 0) {
      console.log(`⚠️  Warning: ServiceProvider table already has ${existingCount} records.`);
      console.log('   Migration will create new records.\n');
    }

    // Migrate vendors
    const vendorResult = await migrateVendors();

    // Migrate contractors
    const contractorResult = await migrateContractors();

    // Verify migration
    console.log('\n📊 Migration Summary:');
    console.log('==========================================');
    const finalCount = await prisma.serviceProvider.count();
    console.log(`Total ServiceProviders: ${finalCount}`);
    console.log(`   - Vendors: ${vendorResult.migrated}`);
    console.log(`   - Contractors: ${contractorResult.migrated}`);
    console.log(`Total Landlord relationships: ${vendorResult.relationships + contractorResult.relationships}`);

    // Show breakdown by type
    console.log('\n📋 ServiceProviders by Type:');
    const types = await prisma.serviceProvider.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });
    types.forEach(t => {
      console.log(`   ${t.type}: ${t._count.type} records`);
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  Next steps:');
    console.log('   1. Update all API endpoints to use ServiceProvider');
    console.log('   2. Update UI components');
    console.log('   3. Test thoroughly');
    console.log('   4. Once confirmed, drop old tables from schema');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

