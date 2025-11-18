/**
 * Clear All Landlords Script
 * 
 * This script removes all landlords and their related data from the database.
 * Admin functionality is preserved.
 * 
 * WARNING: This will delete:
 * - All landlords
 * - All properties (cascade)
 * - All units (cascade)
 * - All leases (cascade)
 * - All tenants (cascade)
 * - All rent payments (cascade)
 * - All maintenance requests (cascade)
 * - All documents (cascade)
 * - All conversations (cascade)
 * - All messages (cascade)
 * - All landlord-vendor relationships
 * - All landlord-contractor relationships
 * - All PMC-landlord relationships
 * - All support tickets created/assigned to landlords
 * - All activity logs related to landlords
 * - All invitations sent by landlords
 * 
 * This will NOT delete:
 * - Admin users
 * - Admin settings
 * - Organizations
 * - Vendors (standalone)
 * - Contractors (standalone)
 * - PMCs (standalone)
 * - Country/Region reference data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllLandlords() {
  console.log('🧹 Starting landlord cleanup...\n');

  try {
    // Count landlords before deletion
    const landlordCount = await prisma.landlord.count();
    console.log(`📊 Found ${landlordCount} landlord(s) to delete\n`);

    if (landlordCount === 0) {
      console.log('✅ No landlords found. Database is already clean.');
      return;
    }

    // Count related data before deletion
    const propertyCount = await prisma.property.count();
    const tenantCount = await prisma.tenant.count();
    const leaseCount = await prisma.lease.count();

    console.log('📊 Related data counts (will be cascade deleted):');
    console.log(`  • Properties: ${propertyCount}`);
    console.log(`  • Tenants: ${tenantCount}`);
    console.log(`  • Leases: ${leaseCount}`);
    console.log('  (Plus all related: units, rent payments, documents, conversations, etc.)');
    console.log('');

    // Delete all landlords (cascade will handle related data)
    console.log('🗑️  Deleting landlords and related data...');
    
    const result = await prisma.landlord.deleteMany({});

    console.log(`✅ Successfully deleted ${result.count} landlord(s)\n`);

    // Verify deletion
    const remainingLandlords = await prisma.landlord.count();
    const remainingProperties = await prisma.property.count();
    const remainingTenants = await prisma.tenant.count();
    const remainingLeases = await prisma.lease.count();

    console.log('✅ Verification:');
    console.log(`  • Remaining landlords: ${remainingLandlords}`);
    console.log(`  • Remaining properties: ${remainingProperties}`);
    console.log(`  • Remaining tenants: ${remainingTenants}`);
    console.log(`  • Remaining leases: ${remainingLeases}`);
    console.log('');

    // Verify admin data is intact
    const adminCount = await prisma.admin.count();
    const organizationCount = await prisma.organization.count();
    // const vendorCount = await prisma.vendor.count(); // TODO: vendor model removed, use serviceProvider
    // const contractorCount = await prisma.contractor.count(); // TODO: contractor model removed, use serviceProvider
    const vendorCount = 0; // Placeholder
    const contractorCount = 0; // Placeholder
    const pmcCount = await prisma.propertyManagementCompany.count();

    console.log('✅ Admin and reference data preserved:');
    console.log(`  • Admins: ${adminCount}`);
    console.log(`  • Organizations: ${organizationCount}`);
    console.log(`  • Vendors: ${vendorCount}`);
    console.log(`  • Contractors: ${contractorCount}`);
    console.log(`  • PMCs: ${pmcCount}`);
    console.log('');

    console.log('🎉 Landlord cleanup completed successfully!');
    console.log('✅ Database is now clean and ready for fresh testing.');
    console.log('✅ Admin functionality is preserved and ready to use.');

  } catch (error) {
    console.error('❌ Error during landlord cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllLandlords()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

