/**
 * Create Random Properties for AB Homes Landlords
 * 
 * Creates 4-9 random properties per landlord (pmc1-lld1 to pmc1-lld10)
 * - Each property has a random Ontario address
 * - At least one property per landlord is multi-unit (2-4 units)
 * - Random property names
 * - Valid Ontario postal codes
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { generateCUID } = require('../lib/utils/id-generator');
const crypto = require('crypto');

// Build connection URL for PT database
const originalUrl = process.env.DATABASE_URL;
if (!originalUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Build PT database URL
function buildDatabaseUrl(dbName) {
  try {
    const url = new URL(originalUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  } catch (error) {
    throw new Error(`Failed to build database URL: ${error.message}`);
  }
}

const ptDatabaseUrl = buildDatabaseUrl('PT');

// Create Prisma client with PT database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: ptDatabaseUrl,
    },
  },
});

// Ontario cities
const ontarioCities = [
  'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham',
  'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington',
  'Oshawa', 'St. Catharines', 'Cambridge', 'Guelph', 'Thunder Bay', 'Waterloo',
  'Barrie', 'Kingston', 'Sarnia', 'Peterborough', 'Sudbury', 'Sault Ste. Marie',
  'North Bay', 'Belleville', 'Cornwall', 'Timmins', 'Orillia', 'Pembroke', 'Brantford'
];

// Street name prefixes and suffixes
const streetPrefixes = ['Main', 'King', 'Queen', 'Park', 'Oak', 'Maple', 'Elm', 'Cedar', 'Pine', 'First', 'Second', 'Third', 'Church', 'Victoria', 'Wellington', 'Dundas', 'Yonge', 'Bay', 'Front', 'College'];
const streetSuffixes = ['Street', 'Avenue', 'Road', 'Drive', 'Lane', 'Court', 'Crescent', 'Boulevard', 'Way', 'Place'];

// Property name prefixes and suffixes
const propertyNamePrefixes = ['Maple', 'Oak', 'Pine', 'Cedar', 'Elm', 'Park', 'Garden', 'Sunset', 'Sunrise', 'Riverside', 'Lakeside', 'Hillside', 'Meadow', 'Valley', 'Crest', 'Ridge', 'View', 'Heights', 'Manor', 'Court'];
const propertyNameSuffixes = ['Apartments', 'Suites', 'Residence', 'Towers', 'Place', 'House', 'Villa', 'Estates', 'Gardens', 'Lodge', 'Inn', 'Cottages', 'Homes', 'Complex', 'Village'];

// Generate random Ontario postal code (format: A1A 1A1)
function generateOntarioPostalCode() {
  const letters = 'ABCDEFGHJKLMNPRSTVWXYZ'; // Exclude I, O, Q, U
  const numbers = '0123456789';
  
  const firstLetter = letters[Math.floor(Math.random() * letters.length)];
  const firstNumber = numbers[Math.floor(Math.random() * numbers.length)];
  const secondLetter = letters[Math.floor(Math.random() * letters.length)];
  const space = ' ';
  const thirdNumber = numbers[Math.floor(Math.random() * numbers.length)];
  const fourthLetter = letters[Math.floor(Math.random() * letters.length)];
  const fifthNumber = numbers[Math.floor(Math.random() * numbers.length)];
  
  return `${firstLetter}${firstNumber}${secondLetter}${space}${thirdNumber}${fourthLetter}${fifthNumber}`;
}

// Generate random street address
function generateStreetAddress() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const prefix = streetPrefixes[Math.floor(Math.random() * streetPrefixes.length)];
  const suffix = streetSuffixes[Math.floor(Math.random() * streetSuffixes.length)];
  return `${streetNumber} ${prefix} ${suffix}`;
}

// Generate random property name
function generatePropertyName() {
  const prefix = propertyNamePrefixes[Math.floor(Math.random() * propertyNamePrefixes.length)];
  const suffix = propertyNameSuffixes[Math.floor(Math.random() * propertyNameSuffixes.length)];
  return `${prefix} ${suffix}`;
}

// Generate property ID
function generatePropertyId(landlordId, index) {
  return `PROP-${landlordId}-${String(index).padStart(3, '0')}`;
}

// Generate unit ID
function generateUnitId(propertyId, unitNumber) {
  return `UNIT-${propertyId}-${String(unitNumber).padStart(2, '0')}`;
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏠 CREATE RANDOM PROPERTIES FOR AB HOMES LANDLORDS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Get all landlords (pmc1-lld1 to pmc1-lld10)
    console.log('📊 Step 1: Getting all AB Homes landlords...');
    const landlords = [];
    
    for (let i = 1; i <= 10; i++) {
      const email = `pmc1-lld${i}@pmc.local`;
      const landlord = await prisma.landlord.findUnique({
        where: { email },
      });
      
      if (landlord) {
        landlords.push(landlord);
        console.log(`   ✅ Found landlord ${i}: ${landlord.firstName} ${landlord.lastName} (${email})`);
      } else {
        console.log(`   ⚠️  Landlord ${i} not found: ${email}`);
      }
    }

    if (landlords.length === 0) {
      console.error('❌ No landlords found. Please create landlords first using create-pmc1-landlords.js');
      process.exit(1);
    }

    console.log(`\n✅ Found ${landlords.length} landlords\n`);

    // Step 2: Create properties for each landlord
    const now = new Date();
    let totalProperties = 0;
    let totalUnits = 0;

    for (const landlord of landlords) {
      console.log(`\n📊 Creating properties for ${landlord.firstName} ${landlord.lastName} (${landlord.email})...`);
      
      // Random number of properties between 4 and 9
      const numProperties = Math.floor(Math.random() * 6) + 4; // 4-9
      console.log(`   Creating ${numProperties} properties...`);

      // Determine which property will be multi-unit (at least one)
      const multiUnitIndex = Math.floor(Math.random() * numProperties);
      
      for (let i = 0; i < numProperties; i++) {
        const isMultiUnit = i === multiUnitIndex;
        const unitCount = isMultiUnit ? Math.floor(Math.random() * 3) + 2 : 1; // 2-4 units for multi-unit, 1 for single
        
        const city = ontarioCities[Math.floor(Math.random() * ontarioCities.length)];
        const addressLine1 = generateStreetAddress();
        const addressLine2 = isMultiUnit ? null : (Math.random() > 0.7 ? `Unit ${Math.floor(Math.random() * 100) + 1}` : null);
        const postalZip = generateOntarioPostalCode();
        const propertyName = generatePropertyName();
        const propertyId = generatePropertyId(landlord.landlordId || landlord.id, i + 1);
        
        // Generate property hash for ID
        const propertyHash = crypto
          .createHash('sha256')
          .update(`${landlord.id}-${addressLine1}-${city}-${postalZip}`)
          .digest('hex')
          .substring(0, 32);
        
        const propertyIdValue = `prop_${Date.now()}_${propertyHash}`;

        try {
          // Check if property already exists
          const existingProperty = await prisma.property.findUnique({
            where: { propertyId },
          });

          if (existingProperty) {
            console.log(`   ⚠️  Property ${i + 1}/${numProperties} already exists: ${propertyName}`);
            continue;
          }

          // Create property
          const property = await prisma.property.create({
            data: {
              id: propertyIdValue,
              propertyId,
              landlordId: landlord.id,
              propertyName,
              addressLine1,
              addressLine2,
              city,
              provinceState: 'ON',
              postalZip,
              country: 'CA',
              countryCode: 'CA',
              regionCode: 'ON',
              propertyType: isMultiUnit ? 'Multi-family' : 'Single-family',
              unitCount,
              yearBuilt: Math.floor(Math.random() * 50) + 1975, // 1975-2025
              purchasePrice: isMultiUnit 
                ? Math.floor(Math.random() * 500000) + 300000 // 300k-800k for multi-unit
                : Math.floor(Math.random() * 400000) + 200000, // 200k-600k for single
              rent: isMultiUnit 
                ? Math.floor(Math.random() * 3000) + 2000 // 2k-5k for multi-unit
                : Math.floor(Math.random() * 2000) + 1500, // 1.5k-3.5k for single
              createdAt: now,
              updatedAt: now,
            },
          });

          console.log(`   ✅ Created property ${i + 1}/${numProperties}: ${propertyName}`);
          console.log(`      Address: ${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ON ${postalZip}`);
          console.log(`      Type: ${isMultiUnit ? 'Multi-Unit' : 'Single Family'} (${unitCount} unit${unitCount > 1 ? 's' : ''})`);
          totalProperties++;

          // Create units for the property
          if (unitCount > 1) {
            console.log(`      Creating ${unitCount} units...`);
            for (let unitNum = 1; unitNum <= unitCount; unitNum++) {
              const unitId = generateUnitId(propertyId, unitNum);
              const unitIdValue = `unit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
              const unitName = unitCount === 1 ? 'Main Unit' : `Unit ${unitNum}`;
              
              await prisma.unit.create({
                data: {
                  id: unitIdValue,
                  propertyId: property.id,
                  unitName,
                  floorNumber: unitCount > 2 ? Math.floor(Math.random() * 5) + 1 : null,
                  bedrooms: Math.floor(Math.random() * 3) + 1, // 1-3 bedrooms
                  bathrooms: Math.floor(Math.random() * 2) + 1, // 1-2 bathrooms
                  rentPrice: Math.floor(Math.random() * 1500) + 1000, // 1k-2.5k
                  depositAmount: Math.floor(Math.random() * 2000) + 1000, // 1k-3k
                  status: 'Vacant',
                  createdAt: now,
                  updatedAt: now,
                },
              });
              
              totalUnits++;
            }
            console.log(`      ✅ Created ${unitCount} units`);
          } else {
            // Create single unit for single-family property
            const unitId = generateUnitId(propertyId, 1);
            const unitIdValue = `unit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
            
            await prisma.unit.create({
              data: {
                id: unitIdValue,
                propertyId: property.id,
                unitName: 'Main Unit',
                bedrooms: Math.floor(Math.random() * 3) + 2, // 2-4 bedrooms
                bathrooms: Math.floor(Math.random() * 2) + 1.5, // 1.5-2.5 bathrooms
                rentPrice: property.rent || Math.floor(Math.random() * 2000) + 1500,
                depositAmount: Math.floor(Math.random() * 2000) + 1000,
                status: 'Vacant',
                createdAt: now,
                updatedAt: now,
              },
            });
            
            totalUnits++;
          }

        } catch (error) {
          console.error(`   ❌ Error creating property ${i + 1}/${numProperties}:`, error.message);
          // Continue with next property
        }
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! Properties created for all landlords');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Summary:`);
    console.log(`   Total Properties Created: ${totalProperties}`);
    console.log(`   Total Units Created: ${totalUnits}`);
    console.log(`   Landlords: ${landlords.length}`);
    console.log(`   Average Properties per Landlord: ${(totalProperties / landlords.length).toFixed(1)}`);
    console.log(`   Average Units per Landlord: ${(totalUnits / landlords.length).toFixed(1)}\n`);

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

