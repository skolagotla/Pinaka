/**
 * Data Audit Script: Phone and Postal Code Formatting
 * 
 * Checks if phone numbers and postal codes are stored consistently in the database.
 * 
 * Best Practice:
 * - Phone: Store unformatted (e.g., "4165551234")
 * - Postal: Store unformatted (e.g., "M5H2N2" for CA, "12345" for US)
 * 
 * This script identifies any formatted values that should be normalized.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditFormatting() {
  console.log('='.repeat(60));
  console.log('📊 Regional Input Formatting Audit');
  console.log('='.repeat(60));
  console.log('');

  // Check Landlords
  console.log('🏠 Checking Landlords...');
  const landlords = await prisma.landlord.findMany({
    select: { 
      id: true, 
      email: true,
      phone: true, 
      postalZip: true,
      country: true
    }
  });

  const landlordsWithFormattedPhone = landlords.filter(l => 
    l.phone && (l.phone.includes('(') || l.phone.includes('-') || l.phone.includes(' '))
  );
  
  const landlordsWithFormattedPostal = landlords.filter(l => 
    l.postalZip && l.postalZip.includes(' ')
  );

  console.log(`  Total landlords: ${landlords.length}`);
  console.log(`  With formatted phone: ${landlordsWithFormattedPhone.length}`);
  console.log(`  With formatted postal: ${landlordsWithFormattedPostal.length}`);
  
  if (landlordsWithFormattedPhone.length > 0) {
    console.log('  Examples:');
    landlordsWithFormattedPhone.slice(0, 3).forEach(l => {
      console.log(`    - ${l.email}: "${l.phone}"`);
    });
  }
  
  if (landlordsWithFormattedPostal.length > 0) {
    console.log('  Examples:');
    landlordsWithFormattedPostal.slice(0, 3).forEach(l => {
      console.log(`    - ${l.email}: "${l.postalZip}" (${l.country})`);
    });
  }
  console.log('');

  // Check Tenants
  console.log('👤 Checking Tenants...');
  const tenants = await prisma.tenant.findMany({
    select: { 
      id: true, 
      email: true,
      phone: true, 
      postalZip: true,
      country: true
    }
  });

  const tenantsWithFormattedPhone = tenants.filter(t => 
    t.phone && (t.phone.includes('(') || t.phone.includes('-') || t.phone.includes(' '))
  );
  
  const tenantsWithFormattedPostal = tenants.filter(t => 
    t.postalZip && t.postalZip.includes(' ')
  );

  console.log(`  Total tenants: ${tenants.length}`);
  console.log(`  With formatted phone: ${tenantsWithFormattedPhone.length}`);
  console.log(`  With formatted postal: ${tenantsWithFormattedPostal.length}`);
  
  if (tenantsWithFormattedPhone.length > 0) {
    console.log('  Examples:');
    tenantsWithFormattedPhone.slice(0, 3).forEach(t => {
      console.log(`    - ${t.email}: "${t.phone}"`);
    });
  }
  
  if (tenantsWithFormattedPostal.length > 0) {
    console.log('  Examples:');
    tenantsWithFormattedPostal.slice(0, 3).forEach(t => {
      console.log(`    - ${t.email}: "${t.postalZip}" (${t.country})`);
    });
  }
  console.log('');

  // Check Properties
  console.log('🏘️  Checking Properties...');
  const properties = await prisma.property.findMany({
    select: { 
      id: true, 
      propertyName: true,
      addressLine1: true,
      postalZip: true,
      country: true
    }
  });

  const propertiesWithFormattedPostal = properties.filter(p => 
    p.postalZip && p.postalZip.includes(' ')
  );

  console.log(`  Total properties: ${properties.length}`);
  console.log(`  With formatted postal: ${propertiesWithFormattedPostal.length}`);
  
  if (propertiesWithFormattedPostal.length > 0) {
    console.log('  Examples:');
    propertiesWithFormattedPostal.slice(0, 3).forEach(p => {
      console.log(`    - ${p.propertyName || p.addressLine1}: "${p.postalZip}" (${p.country})`);
    });
  }
  console.log('');

  // Check Emergency Contacts
  console.log('🚨 Checking Emergency Contacts...');
  const emergencyContacts = await prisma.emergencyContact.findMany({
    select: { 
      id: true, 
      contactName: true,
      phone: true
    }
  });

  const contactsWithFormattedPhone = emergencyContacts.filter(c => 
    c.phone && (c.phone.includes('(') || c.phone.includes('-') || c.phone.includes(' '))
  );

  console.log(`  Total emergency contacts: ${emergencyContacts.length}`);
  console.log(`  With formatted phone: ${contactsWithFormattedPhone.length}`);
  
  if (contactsWithFormattedPhone.length > 0) {
    console.log('  Examples:');
    contactsWithFormattedPhone.slice(0, 3).forEach(c => {
      console.log(`    - ${c.contactName}: "${c.phone}"`);
    });
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('📋 Summary');
  console.log('='.repeat(60));
  
  const totalFormatted = 
    landlordsWithFormattedPhone.length +
    landlordsWithFormattedPostal.length +
    tenantsWithFormattedPhone.length +
    tenantsWithFormattedPostal.length +
    propertiesWithFormattedPostal.length +
    contactsWithFormattedPhone.length;

  if (totalFormatted === 0) {
    console.log('✅ All data is stored in unformatted state - GOOD!');
    console.log('   No migration needed.');
  } else {
    console.log(`⚠️  Found ${totalFormatted} records with formatted data`);
    console.log('');
    console.log('Recommendation:');
    console.log('  1. Create a normalization migration script');
    console.log('  2. Remove formatting characters: ( ) - spaces');
    console.log('  3. Store only digits/alphanumeric');
    console.log('  4. Let frontend handle formatting');
    console.log('');
    console.log('Example migration:');
    console.log('  "(416) 555-1234" → "4165551234"');
    console.log('  "M5H 2N2" → "M5H2N2"');
  }
  console.log('');

  await prisma.$disconnect();
}

auditFormatting()
  .catch((error) => {
    console.error('❌ Error during audit:', error);
    process.exit(1);
  });

