/**
 * Add Sample Properties: Toronto and Ottawa
 * 
 * Adds two sample properties with realistic addresses:
 * - One property in Toronto, ON
 * - One property in Ottawa, ON
 */

const { PrismaClient } = require('@prisma/client');
const { generatePropertyHash } = require('@/lib/hooks/useHashGenerator');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function addSampleProperties() {
  console.log('🏠 Starting to add sample properties (Toronto and Ottawa)...');
  
  try {
    // Get the first landlord (or you can specify an email)
    const landlord = await prisma.landlord.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!landlord) {
      console.error('❌ No landlord found. Please create a landlord first.');
      process.exit(1);
    }

    console.log(`✅ Using landlord: ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);

    const now = new Date();

    // Sample Property 1: Toronto
    const torontoPropertyData = {
      addressLine1: '123 King Street West',
      postalZip: 'M5H 1A1',
      country: 'CA',
      provinceState: 'ON',
    };
    const torontoProperty = {
      id: generatePropertyHash(torontoPropertyData),
      propertyId: generatePropertyHash(torontoPropertyData),
      landlordId: landlord.id,
      propertyName: 'King Street Condo',
      addressLine1: '123 King Street West',
      addressLine2: 'Unit 1505',
      city: 'Toronto',
      provinceState: 'ON',
      postalZip: 'M5H 1A1',
      country: 'CA',
      unitCount: 1,
      purchasePrice: 450000,
      mortgageAmount: 360000,
      mortgageStartDate: new Date('2020-06-15'),
      mortgageTermYears: 25,
      paymentFrequency: 'biweekly',
      createdAt: now,
      updatedAt: now,
    };

    // Sample Property 2: Ottawa
    const ottawaPropertyData = {
      addressLine1: '456 Rideau Street',
      postalZip: 'K1N 5Y8',
      country: 'CA',
      provinceState: 'ON',
    };
    const ottawaProperty = {
      id: generatePropertyHash(ottawaPropertyData),
      propertyId: generatePropertyHash(ottawaPropertyData),
      landlordId: landlord.id,
      propertyName: 'Rideau Street Apartment',
      addressLine1: '456 Rideau Street',
      addressLine2: 'Apt 3B',
      city: 'Ottawa',
      provinceState: 'ON',
      postalZip: 'K1N 5Y8',
      country: 'CA',
      unitCount: 1,
      purchasePrice: 320000,
      mortgageAmount: 256000,
      mortgageStartDate: new Date('2019-03-20'),
      mortgageTermYears: 25,
      paymentFrequency: 'biweekly',
      createdAt: now,
      updatedAt: now,
    };

    // Check if properties already exist
    const existingToronto = await prisma.property.findUnique({
      where: { id: torontoProperty.id }
    });

    const existingOttawa = await prisma.property.findUnique({
      where: { id: ottawaProperty.id }
    });

    if (existingToronto) {
      console.log('⚠️  Toronto property already exists, skipping...');
    } else {
      const createdToronto = await prisma.property.create({
        data: torontoProperty
      });
      console.log(`✅ Created Toronto property: ${createdToronto.propertyName} (${createdToronto.addressLine1})`);
    }

    if (existingOttawa) {
      console.log('⚠️  Ottawa property already exists, skipping...');
    } else {
      const createdOttawa = await prisma.property.create({
        data: ottawaProperty
      });
      console.log(`✅ Created Ottawa property: ${createdOttawa.propertyName} (${createdOttawa.addressLine1})`);
    }

    // Create units for each property (since unitCount = 1)
    const torontoUnit = await prisma.unit.findFirst({
      where: { propertyId: torontoProperty.id }
    });

    if (!torontoUnit) {
      const torontoUnitId = crypto.randomBytes(8).toString('hex');
      await prisma.unit.create({
        data: {
          id: torontoUnitId,
          propertyId: torontoProperty.id,
          unitName: 'Unit 1505',
          status: 'Vacant',
          createdAt: now,
          updatedAt: now,
        }
      });
      console.log('✅ Created unit for Toronto property');
    }

    const ottawaUnit = await prisma.unit.findFirst({
      where: { propertyId: ottawaProperty.id }
    });

    if (!ottawaUnit) {
      const ottawaUnitId = crypto.randomBytes(8).toString('hex');
      await prisma.unit.create({
        data: {
          id: ottawaUnitId,
          propertyId: ottawaProperty.id,
          unitName: 'Apt 3B',
          status: 'Vacant',
          createdAt: now,
          updatedAt: now,
        }
      });
      console.log('✅ Created unit for Ottawa property');
    }

    console.log('\n🎉 Sample properties added successfully!');
    console.log('\n📋 Summary:');
    console.log('  Toronto: 123 King Street West, Unit 1505, Toronto, ON M5H 1A1');
    console.log('  Ottawa:  456 Rideau Street, Apt 3B, Ottawa, ON K1N 5Y8');

  } catch (error) {
    console.error('❌ Error adding sample properties:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Script completed');
  }
}

addSampleProperties();

