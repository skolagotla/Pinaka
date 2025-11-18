/**
 * Script to delete a tenant by email address
 * Usage: node scripts/delete-tenant-by-email.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTenantByEmail(email) {
  try {
    console.log(`\n🔍 Searching for tenant with email: ${email}`);
    
    // Find tenant by email
    const tenant = await prisma.tenant.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!tenant) {
      console.log(`❌ Tenant with email ${email} not found.`);
      return;
    }

    console.log(`\n📋 Tenant found:`);
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Name: ${tenant.firstName} ${tenant.lastName}`);
    console.log(`   Email: ${tenant.email}`);
    console.log(`   Phone: ${tenant.phone || 'N/A'}`);
    console.log(`   Status: Active`);
    console.log(`   Leases: ${tenant.leaseTenants.length}`);

    if (tenant.leaseTenants.length > 0) {
      console.log(`\n⚠️  Warning: Tenant has ${tenant.leaseTenants.length} active lease(s):`);
      tenant.leaseTenants.forEach((lt, index) => {
        const lease = lt.lease;
        const unit = lease?.unit;
        const property = unit?.property;
        console.log(`   ${index + 1}. Lease ID: ${lease?.id}`);
        console.log(`      Property: ${property?.addressLine1 || 'N/A'}`);
        console.log(`      Unit: ${unit?.unitNumber || 'N/A'}`);
        console.log(`      Status: ${lease?.status || 'N/A'}`);
      });
      console.log(`\n⚠️  Warning: Deleting this tenant will also delete all associated lease relationships.`);
      console.log(`   This is a PERMANENT deletion. Are you sure?`);
    }

    // Check for other related records
    const [documentsCount, maintenanceCount, inspectionCount, emergencyContactsCount, employersCount] = await Promise.all([
      prisma.document.count({ where: { tenantId: tenant.id } }),
      prisma.maintenanceRequest.count({ where: { tenantId: tenant.id } }),
      prisma.inspectionChecklist.count({ where: { tenantId: tenant.id } }),
      prisma.emergencyContact.count({ where: { tenantId: tenant.id } }),
      prisma.employer.count({ where: { tenantId: tenant.id } }),
    ]);

    if (documentsCount > 0 || maintenanceCount > 0 || inspectionCount > 0 || emergencyContactsCount > 0 || employersCount > 0) {
      console.log(`\n📊 Related records found:`);
      console.log(`   Documents: ${documentsCount}`);
      console.log(`   Maintenance Requests: ${maintenanceCount}`);
      console.log(`   Inspection Checklists: ${inspectionCount}`);
      console.log(`   Emergency Contacts: ${emergencyContactsCount}`);
      console.log(`   Employers: ${employersCount}`);
      console.log(`\n⚠️  Warning: These related records will be deleted as well (cascade delete).`);
    }

    // Perform hard delete (Tenant model doesn't have soft delete fields)
    console.log(`\n🗑️  Performing permanent deletion...`);
    await prisma.tenant.delete({
      where: { id: tenant.id },
    });

    console.log(`\n✅ Tenant successfully deleted.`);
    console.log(`   ⚠️  This was a PERMANENT deletion. Records cannot be recovered.`);

  } catch (error) {
    console.error(`\n❌ Error deleting tenant:`, error.message);
    if (error.code === 'P2025') {
      console.error(`   Tenant not found in database.`);
    } else {
      console.error(`   Full error:`, error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address is required.');
  console.error('Usage: node scripts/delete-tenant-by-email.js <email>');
  console.error('Example: node scripts/delete-tenant-by-email.js nagasmeruga@gmail.com');
  process.exit(1);
}

// Run the script
deleteTenantByEmail(email)
  .then(() => {
    console.log('\n✅ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

