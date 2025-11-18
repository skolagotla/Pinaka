/**
 * Data Normalization Script: Phone and Postal Codes
 * 
 * Removes formatting from phone numbers and postal codes to store them in unformatted state.
 * This allows the frontend to handle all formatting consistently.
 * 
 * Before:
 * - Phone: "(416) 555-1234" → After: "4165551234"
 * - Postal: "M5H 2N2" → After: "M5H2N2"
 * 
 * Run this once to clean up existing data.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Remove all formatting from phone number (keep digits only)
 */
function normalizePhone(phone) {
  if (!phone) return phone;
  return phone.replace(/\D/g, ''); // Remove all non-digit characters
}

/**
 * Remove spaces from postal code (keep alphanumeric only)
 */
function normalizePostal(postal) {
  if (!postal) return postal;
  return postal.replace(/\s/g, '').toUpperCase(); // Remove spaces, uppercase
}

async function normalizeData() {
  console.log('='.repeat(60));
  console.log('🔧 Normalizing Phone and Postal Data');
  console.log('='.repeat(60));
  console.log('');

  let totalUpdated = 0;

  // Normalize Landlords
  console.log('🏠 Normalizing Landlords...');
  const landlords = await prisma.landlord.findMany({
    select: { id: true, email: true, phone: true, postalZip: true }
  });

  for (const landlord of landlords) {
    const updates = {};
    
    if (landlord.phone) {
      const normalized = normalizePhone(landlord.phone);
      if (normalized !== landlord.phone) {
        updates.phone = normalized;
        console.log(`  ✓ ${landlord.email}: "${landlord.phone}" → "${normalized}"`);
      }
    }
    
    if (landlord.postalZip) {
      const normalized = normalizePostal(landlord.postalZip);
      if (normalized !== landlord.postalZip) {
        updates.postalZip = normalized;
        console.log(`  ✓ ${landlord.email}: "${landlord.postalZip}" → "${normalized}"`);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.landlord.update({
        where: { id: landlord.id },
        data: updates
      });
      totalUpdated++;
    }
  }
  console.log('');

  // Normalize Tenants
  console.log('👤 Normalizing Tenants...');
  const tenants = await prisma.tenant.findMany({
    select: { id: true, email: true, phone: true, postalZip: true }
  });

  for (const tenant of tenants) {
    const updates = {};
    
    if (tenant.phone) {
      const normalized = normalizePhone(tenant.phone);
      if (normalized !== tenant.phone) {
        updates.phone = normalized;
        console.log(`  ✓ ${tenant.email}: "${tenant.phone}" → "${normalized}"`);
      }
    }
    
    if (tenant.postalZip) {
      const normalized = normalizePostal(tenant.postalZip);
      if (normalized !== tenant.postalZip) {
        updates.postalZip = normalized;
        console.log(`  ✓ ${tenant.email}: "${tenant.postalZip}" → "${normalized}"`);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: updates
      });
      totalUpdated++;
    }
  }
  console.log('');

  // Normalize Properties
  console.log('🏘️  Normalizing Properties...');
  const properties = await prisma.property.findMany({
    select: { id: true, propertyName: true, addressLine1: true, postalZip: true }
  });

  for (const property of properties) {
    const updates = {};
    
    if (property.postalZip) {
      const normalized = normalizePostal(property.postalZip);
      if (normalized !== property.postalZip) {
        updates.postalZip = normalized;
        const name = property.propertyName || property.addressLine1;
        console.log(`  ✓ ${name}: "${property.postalZip}" → "${normalized}"`);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.property.update({
        where: { id: property.id },
        data: updates
      });
      totalUpdated++;
    }
  }
  console.log('');

  // Normalize Emergency Contacts
  console.log('🚨 Normalizing Emergency Contacts...');
  const emergencyContacts = await prisma.emergencyContact.findMany({
    select: { id: true, contactName: true, phone: true }
  });

  for (const contact of emergencyContacts) {
    const updates = {};
    
    if (contact.phone) {
      const normalized = normalizePhone(contact.phone);
      if (normalized !== contact.phone) {
        updates.phone = normalized;
        console.log(`  ✓ ${contact.contactName}: "${contact.phone}" → "${normalized}"`);
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.emergencyContact.update({
        where: { id: contact.id },
        data: updates
      });
      totalUpdated++;
    }
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('✅ Normalization Complete');
  console.log('='.repeat(60));
  console.log(`Total records updated: ${totalUpdated}`);
  console.log('');
  console.log('All phone numbers and postal codes are now stored unformatted.');
  console.log('Frontend will handle formatting for display.');
  console.log('');

  await prisma.$disconnect();
}

normalizeData()
  .catch((error) => {
    console.error('❌ Error during normalization:', error);
    process.exit(1);
  });

