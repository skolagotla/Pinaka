/**
 * Create 10 Landlords for AB Homes PMC in PT Database
 * 
 * Creates 10 landlord users in the PT database, linked to "AB Homes" PMC company:
 * - Emails: pmc1-lld1@pmc.local to pmc1-lld10@pmc.local
 * - Password: testlld (handled in login API)
 * - All linked to AB Homes PMC via PMCLandlord relationship
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { getDatabaseUrl } = require('../lib/utils/db-config');

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

// Random first and last names for landlords
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez',
  'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams'
];

function getRandomName() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName };
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 CREATE 10 LANDLORDS FOR AB HOMES PMC IN PT DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Get AB Homes PMC company
    console.log('📊 Step 1: Getting AB Homes PMC company...');
    const abHomesEmail = 'ab-homes@pmc.local';
    const abHomesName = 'AB Homes';
    
    const pmc = await prisma.propertyManagementCompany.findUnique({
      where: { email: abHomesEmail },
    });

    if (!pmc) {
      console.error('❌ AB Homes PMC not found. Please create it first using create-ab-homes-pmc-admins.js');
      process.exit(1);
    }
    console.log(`✅ Found AB Homes PMC: ${pmc.companyName} (ID: ${pmc.id})`);

    // Step 2: Get superadmin for assignedBy (if needed for audit logs)
    console.log('\n📊 Step 2: Getting superadmin for assignment...');
    const superadmin = await prisma.admin.findUnique({
      where: { email: 'superadmin@admin.local' },
    });

    if (!superadmin) {
      console.warn('⚠️  Superadmin not found. Continuing without audit logs...');
    } else {
      console.log(`✅ Found superadmin (ID: ${superadmin.id})`);
    }

    // Step 3: Create 10 landlords
    console.log('\n📊 Step 3: Creating 10 landlords for AB Homes...\n');
    const password = 'testlld'; // Password for all landlords
    const createdLandlords = [];

    for (let i = 1; i <= 10; i++) {
      const email = `pmc1-lld${i}@pmc.local`;
      const { firstName, lastName } = getRandomName();
      const landlordId = `LLD-PMC1-${String(i).padStart(2, '0')}`;

      try {
        // Check if landlord already exists
        let landlord = await prisma.landlord.findUnique({
          where: { email },
        });

        if (landlord) {
          console.log(`⚠️  Landlord ${i}/10: ${email} already exists, updating...`);
          landlord = await prisma.landlord.update({
            where: { email },
            data: {
              firstName,
              lastName,
              approvalStatus: 'APPROVED',
              approvedAt: new Date(),
            },
          });
        } else {
          // Create new landlord
          console.log(`🔨 Creating landlord ${i}/10: ${email}...`);
          const landlordIdValue = `lld_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          const now = new Date();
          landlord = await prisma.landlord.create({
            data: {
              id: landlordIdValue,
              landlordId,
              email,
              firstName,
              lastName,
              phone: `555-${String(1000 + i).padStart(4, '0')}`,
              approvalStatus: 'APPROVED',
              approvedAt: now,
              updatedAt: now,
              countryCode: 'CA',
              regionCode: 'ON',
            },
          });
        }

        // Step 4: Link landlord to AB Homes PMC via PMCLandlord relationship
        console.log(`   📋 Linking to AB Homes PMC...`);
        
        // Check if relationship already exists
        const existingRelationship = await prisma.pMCLandlord.findUnique({
          where: {
            pmcId_landlordId: {
              pmcId: pmc.id,
              landlordId: landlord.id,
            },
          },
        });

        if (existingRelationship) {
          // Update existing relationship
          await prisma.pMCLandlord.update({
            where: { id: existingRelationship.id },
            data: {
              status: 'active',
              startedAt: new Date(),
            },
          });
          console.log(`   ✅ Updated existing PMC-Landlord relationship`);
        } else {
          // Create new relationship
          await prisma.pMCLandlord.create({
            data: {
              pmcId: pmc.id,
              landlordId: landlord.id,
              status: 'active',
              startedAt: new Date(),
              contractTerms: {
                commissionRate: 0.08, // 8% commission
                managementFee: 0.10, // 10% management fee
              },
              notes: `Landlord ${i} of 10 for AB Homes PMC`,
            },
          });
          console.log(`   ✅ Created PMC-Landlord relationship`);
        }

        createdLandlords.push({
          id: landlord.id,
          email,
          firstName,
          lastName,
          password,
          landlordId,
        });

        console.log(`   ✅ Landlord ${i}/10 created successfully`);
        console.log(`      Email: ${email}`);
        console.log(`      Name: ${firstName} ${lastName}`);
        console.log(`      Password: ${password}`);
        console.log(`      PMC: ${pmc.companyName}\n`);

      } catch (error) {
        console.error(`   ❌ Error creating landlord ${i}/10 (${email}):`, error.message);
        throw error;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS! 10 landlords created in PT database for AB Homes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 AB Homes PMC Company:');
    console.log(`   Name: ${pmc.companyName}`);
    console.log(`   Email: ${pmc.email}`);
    console.log(`   ID: ${pmc.id}\n`);
    console.log('📝 Created Landlords:');
    createdLandlords.forEach((landlord, index) => {
      console.log(`   ${index + 1}. ${landlord.email} / ${landlord.password} (${landlord.firstName} ${landlord.lastName})`);
    });
    console.log('\n📝 Next steps:');
    console.log('   1. Switch to PT database using /db-switcher');
    console.log('   2. Go to / (main app login)');
    console.log('   3. Login with any of the landlord credentials above');
    console.log('   4. All landlords are linked to AB Homes PMC company\n');

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

