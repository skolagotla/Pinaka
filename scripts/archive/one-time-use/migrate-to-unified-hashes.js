/**
 * Migration Script: Update All Entities to Unified Hash Format
 * 
 * This script migrates all existing records to use the new unified hash format:
 * - MA: Maintenance Tickets (10 chars)
 * - DO: Documents (10 chars)
 * - RR: Rent Receipts (10 chars)
 * - LL: Landlords (10 chars)
 * - TN: Tenants (10 chars)
 * - PP: Properties (10 chars)
 * - IN: Invitation Tokens (10 chars)
 * 
 * Format: PREFIX(2) + HASH(8) = 10 characters
 * 
 * Run: node scripts/migrate-to-unified-hashes.js
 */

const { PrismaClient } = require('@prisma/client');
const {
  generateMaintenanceHash,
  generateDocumentHash,
  generateRentReceiptHash,
  generateLandlordHash,
  generateTenantHash,
  generatePropertyHash,
  generateInvitationHash,
} = require('@/lib/hooks/useHashGenerator');

const prisma = new PrismaClient();

// Track migration statistics
const stats = {
  maintenance: { total: 0, updated: 0, skipped: 0, errors: 0 },
  documents: { total: 0, updated: 0, skipped: 0, errors: 0 },
  rentReceipts: { total: 0, updated: 0, skipped: 0, errors: 0 },
  landlords: { total: 0, updated: 0, skipped: 0, errors: 0 },
  tenants: { total: 0, updated: 0, skipped: 0, errors: 0 },
  properties: { total: 0, updated: 0, skipped: 0, errors: 0 },
  invitations: { total: 0, updated: 0, skipped: 0, errors: 0 },
};

/**
 * Migrate Maintenance Tickets
 */
async function migrateMaintenance() {
  console.log('\n📋 Migrating Maintenance Tickets...');
  
  const tickets = await prisma.maintenanceRequest.findMany({
    include: {
      property: true,
    },
  });
  
  stats.maintenance.total = tickets.length;
  console.log(`   Found ${tickets.length} tickets`);
  
  for (const ticket of tickets) {
    try {
      // Check if already has new format (MA prefix)
      if (ticket.ticketNumber && ticket.ticketNumber.startsWith('MA')) {
        stats.maintenance.skipped++;
        continue;
      }
      
      // Generate new ticket number
      const newTicketNumber = generateMaintenanceHash(ticket.property);
      
      await prisma.maintenanceRequest.update({
        where: { id: ticket.id },
        data: { ticketNumber: newTicketNumber },
      });
      
      stats.maintenance.updated++;
      console.log(`   ✓ Updated ticket: ${ticket.ticketNumber || 'NO-NUMBER'} → ${newTicketNumber}`);
    } catch (error) {
      stats.maintenance.errors++;
      console.error(`   ✗ Error updating ticket ${ticket.id}:`, error.message);
    }
  }
}

/**
 * Migrate Documents
 */
async function migrateDocuments() {
  console.log('\n📄 Migrating Documents...');
  
  const documents = await prisma.document.findMany();
  
  stats.documents.total = documents.length;
  console.log(`   Found ${documents.length} documents`);
  
  for (const doc of documents) {
    try {
      // Check if already has new format (DO prefix)
      if (doc.documentHash && doc.documentHash.startsWith('DO')) {
        stats.documents.skipped++;
        continue;
      }
      
      // Generate new document hash
      const newDocumentHash = generateDocumentHash({
        fileName: doc.fileName,
        tenantId: doc.tenantId,
        category: doc.category,
      });
      
      await prisma.document.update({
        where: { id: doc.id },
        data: { documentHash: newDocumentHash },
      });
      
      stats.documents.updated++;
      console.log(`   ✓ Updated document: ${doc.documentHash || 'NO-HASH'} → ${newDocumentHash}`);
    } catch (error) {
      stats.documents.errors++;
      console.error(`   ✗ Error updating document ${doc.id}:`, error.message);
    }
  }
}

/**
 * Migrate Rent Receipts
 */
async function migrateRentReceipts() {
  console.log('\n🧾 Migrating Rent Receipts...');
  
  const payments = await prisma.rentPayment.findMany({
    where: {
      OR: [
        { status: 'Paid' },
        { status: 'Partial' },
      ],
    },
    include: {
      partialPayments: {
        orderBy: { paidDate: 'desc' },
      },
    },
  });
  
  stats.rentReceipts.total = payments.length;
  console.log(`   Found ${payments.length} paid/partial payments`);
  
  for (const payment of payments) {
    try {
      // Check if already has new format (RR prefix) or no receipt number
      if (!payment.receiptNumber) {
        stats.rentReceipts.skipped++;
        continue;
      }
      
      if (payment.receiptNumber.startsWith('RR')) {
        stats.rentReceipts.skipped++;
        continue;
      }
      
      // Determine effective paid date
      let effectivePaidDate = payment.paidDate;
      if (!effectivePaidDate && payment.partialPayments.length > 0) {
        effectivePaidDate = payment.partialPayments[0].paidDate;
      }
      if (!effectivePaidDate) {
        effectivePaidDate = new Date();
      }
      
      // Generate new receipt number
      const newReceiptNumber = generateRentReceiptHash({
        leaseId: payment.leaseId,
        amount: payment.amount,
        paidDate: effectivePaidDate,
      });
      
      await prisma.rentPayment.update({
        where: { id: payment.id },
        data: { receiptNumber: newReceiptNumber },
      });
      
      stats.rentReceipts.updated++;
      console.log(`   ✓ Updated receipt: ${payment.receiptNumber} → ${newReceiptNumber}`);
    } catch (error) {
      stats.rentReceipts.errors++;
      console.error(`   ✗ Error updating receipt ${payment.id}:`, error.message);
    }
  }
}

/**
 * Migrate Landlords
 */
async function migrateLandlords() {
  console.log('\n🏠 Migrating Landlords...');
  
  const landlords = await prisma.landlord.findMany();
  
  stats.landlords.total = landlords.length;
  console.log(`   Found ${landlords.length} landlords`);
  
  for (const landlord of landlords) {
    try {
      // Check if already has new format (LL prefix)
      if (landlord.landlordId && landlord.landlordId.startsWith('LL')) {
        stats.landlords.skipped++;
        continue;
      }
      
      // Generate new landlord ID
      const newLandlordId = generateLandlordHash({
        email: landlord.email,
        phone: landlord.phone || '',
        country: landlord.country || '',
        provinceState: landlord.provinceState || '',
      });
      
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: { landlordId: newLandlordId },
      });
      
      stats.landlords.updated++;
      console.log(`   ✓ Updated landlord: ${landlord.landlordId} → ${newLandlordId}`);
    } catch (error) {
      stats.landlords.errors++;
      console.error(`   ✗ Error updating landlord ${landlord.id}:`, error.message);
    }
  }
}

/**
 * Migrate Tenants
 */
async function migrateTenants() {
  console.log('\n👤 Migrating Tenants...');
  
  const tenants = await prisma.tenant.findMany();
  
  stats.tenants.total = tenants.length;
  console.log(`   Found ${tenants.length} tenants`);
  
  for (const tenant of tenants) {
    try {
      // Check if already has new format (TN prefix)
      if (tenant.tenantId && tenant.tenantId.startsWith('TN')) {
        stats.tenants.skipped++;
        continue;
      }
      
      // Generate new tenant ID
      const newTenantId = generateTenantHash({
        email: tenant.email,
        phone: tenant.phone || '',
        country: tenant.country || '',
        provinceState: tenant.provinceState || '',
      });
      
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { tenantId: newTenantId },
      });
      
      stats.tenants.updated++;
      console.log(`   ✓ Updated tenant: ${tenant.tenantId} → ${newTenantId}`);
    } catch (error) {
      stats.tenants.errors++;
      console.error(`   ✗ Error updating tenant ${tenant.id}:`, error.message);
    }
  }
}

/**
 * Migrate Properties
 */
async function migrateProperties() {
  console.log('\n🏢 Migrating Properties...');
  
  const properties = await prisma.property.findMany();
  
  stats.properties.total = properties.length;
  console.log(`   Found ${properties.length} properties`);
  
  for (const property of properties) {
    try {
      // Check if already has new format (PP prefix)
      if (property.propertyId && property.propertyId.startsWith('PP')) {
        stats.properties.skipped++;
        continue;
      }
      
      // Generate new property ID
      const newPropertyId = generatePropertyHash({
        addressLine1: property.addressLine1,
        postalZip: property.postalZip,
        country: property.country,
        provinceState: property.provinceState,
      });
      
      await prisma.property.update({
        where: { id: property.id },
        data: { propertyId: newPropertyId },
      });
      
      stats.properties.updated++;
      console.log(`   ✓ Updated property: ${property.propertyId} → ${newPropertyId}`);
    } catch (error) {
      stats.properties.errors++;
      console.error(`   ✗ Error updating property ${property.id}:`, error.message);
    }
  }
}

/**
 * Migrate Invitation Tokens
 */
async function migrateInvitationTokens() {
  console.log('\n🔑 Migrating Invitation Tokens...');
  
  const tenants = await prisma.tenant.findMany({
    where: {
      invitationToken: {
        not: null,
      },
    },
  });
  
  stats.invitations.total = tenants.length;
  console.log(`   Found ${tenants.length} active invitation tokens`);
  
  for (const tenant of tenants) {
    try {
      // Check if already has new format (IN prefix)
      if (tenant.invitationToken && tenant.invitationToken.startsWith('IN')) {
        stats.invitations.skipped++;
        continue;
      }
      
      // Generate new invitation token
      const newInvitationToken = generateInvitationHash({
        tenantEmail: tenant.email,
        landlordEmail: tenant.invitedBy || 'system',
      });
      
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { invitationToken: newInvitationToken },
      });
      
      stats.invitations.updated++;
      console.log(`   ✓ Updated invitation token for: ${tenant.email}`);
    } catch (error) {
      stats.invitations.errors++;
      console.error(`   ✗ Error updating invitation token for ${tenant.id}:`, error.message);
    }
  }
}

/**
 * Print Migration Summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  
  const categories = [
    { name: 'Maintenance Tickets', key: 'maintenance' },
    { name: 'Documents', key: 'documents' },
    { name: 'Rent Receipts', key: 'rentReceipts' },
    { name: 'Landlords', key: 'landlords' },
    { name: 'Tenants', key: 'tenants' },
    { name: 'Properties', key: 'properties' },
    { name: 'Invitation Tokens', key: 'invitations' },
  ];
  
  categories.forEach(({ name, key }) => {
    const data = stats[key];
    console.log(`\n${name}:`);
    console.log(`   Total:   ${data.total}`);
    console.log(`   Updated: ${data.updated} ✓`);
    console.log(`   Skipped: ${data.skipped} (already migrated)`);
    if (data.errors > 0) {
      console.log(`   Errors:  ${data.errors} ✗`);
    }
  });
  
  // Calculate totals
  const totalRecords = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
  const totalUpdated = Object.values(stats).reduce((sum, s) => sum + s.updated, 0);
  const totalSkipped = Object.values(stats).reduce((sum, s) => sum + s.skipped, 0);
  const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);
  
  console.log('\n' + '-'.repeat(60));
  console.log(`TOTALS:`);
  console.log(`   Records:  ${totalRecords}`);
  console.log(`   Updated:  ${totalUpdated} ✓`);
  console.log(`   Skipped:  ${totalSkipped}`);
  if (totalErrors > 0) {
    console.log(`   Errors:   ${totalErrors} ✗`);
  }
  console.log('='.repeat(60));
  
  if (totalErrors === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review the error messages above.');
  }
}

/**
 * Main Migration Function
 */
async function main() {
  console.log('🚀 Starting Unified Hash Migration...');
  console.log('This will update all entities to use the new hash format.');
  console.log('Format: PREFIX(2) + HASH(8) = 10 characters');
  console.log('\nEntity Prefixes:');
  console.log('  • MA: Maintenance Tickets');
  console.log('  • DO: Documents');
  console.log('  • RR: Rent Receipts');
  console.log('  • LL: Landlords');
  console.log('  • TN: Tenants');
  console.log('  • PP: Properties');
  console.log('  • IN: Invitation Tokens');
  
  try {
    await migrateMaintenance();
    await migrateDocuments();
    await migrateRentReceipts();
    await migrateLandlords();
    await migrateTenants();
    await migrateProperties();
    await migrateInvitationTokens();
    
    printSummary();
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
main()
  .then(() => {
    console.log('\n✨ Migration process completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  });

