/**
 * Script to seed test vendor data
 * Creates 30 vendors with different categories, ratings, and hourly rates
 * Run with: node scripts/seed-vendors.js
 */

const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');
const prisma = new PrismaClient();

// Simple ID generator
function generateCUID() {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  return `${timestamp}${randomPart}`;
}

const vendors = [
  {
    name: 'John Smith',
    businessName: 'Smith Plumbing Services',
    phone: '(416) 555-0101',
    email: 'john.smith@smithplumbing.com',
    category: 'Plumbing',
    rating: 4.8,
    hourlyRate: 95.00,
    notes: 'Specializes in emergency repairs and water heater installations. Available 24/7.',
    isActive: true
  },
  {
    name: 'Maria Garcia',
    businessName: 'Garcia Electrical Solutions',
    phone: '(416) 555-0102',
    email: 'maria@garciaelectric.com',
    category: 'Electrical',
    rating: 4.9,
    hourlyRate: 110.00,
    notes: 'Licensed electrician with 15 years experience. Expert in panel upgrades and smart home installations.',
    isActive: true
  },
  {
    name: 'David Chen',
    businessName: 'Chen HVAC Systems',
    phone: '(416) 555-0103',
    email: 'david@chenhvac.com',
    category: 'HVAC',
    rating: 4.7,
    hourlyRate: 120.00,
    notes: 'Full-service HVAC company. Installation, repair, and maintenance of all heating and cooling systems.',
    isActive: true
  },
  {
    name: 'Sarah Johnson',
    businessName: 'Johnson Landscaping',
    phone: '(416) 555-0104',
    email: 'sarah@johnsonlandscape.com',
    category: 'Landscaping',
    rating: 4.6,
    hourlyRate: 75.00,
    notes: 'Seasonal maintenance, lawn care, tree trimming, and garden design services.',
    isActive: true
  },
  {
    name: 'Michael Brown',
    businessName: 'Brown Painting Co.',
    phone: '(416) 555-0105',
    email: 'mike@brownpainting.com',
    category: 'Other',
    rating: 4.5,
    hourlyRate: 65.00,
    notes: 'Interior and exterior painting. Free estimates. 10-year warranty on all work.',
    isActive: true
  },
  {
    name: 'Robert Wilson',
    businessName: 'Wilson Carpentry',
    phone: '(416) 555-0106',
    email: 'rob@wilsoncarpentry.com',
    category: 'Structural',
    rating: 4.4,
    hourlyRate: 85.00,
    notes: 'Custom cabinets, trim work, deck building, and general carpentry services.',
    isActive: true
  },
  {
    name: 'Jennifer Martinez',
    businessName: 'Martinez Roofing',
    phone: '(416) 555-0107',
    email: 'jennifer@martinezroofing.com',
    category: 'Structural',
    rating: 4.9,
    hourlyRate: 0, // Project-based pricing
    notes: 'Roof repairs, replacements, and inspections. Licensed and insured. Free estimates.',
    isActive: true
  },
  {
    name: 'James Taylor',
    businessName: 'Taylor Flooring',
    phone: '(416) 555-0108',
    email: 'james@taylorflooring.com',
    category: 'Structural',
    rating: 4.3,
    hourlyRate: 70.00,
    notes: 'Hardwood, laminate, tile, and carpet installation. Expert in refinishing and repairs.',
    isActive: true
  },
  {
    name: 'Patricia Anderson',
    businessName: 'Anderson Appliance Repair',
    phone: '(416) 555-0109',
    email: 'patricia@andersonappliance.com',
    category: 'Appliance',
    rating: 4.2,
    hourlyRate: 90.00,
    notes: 'Repairs all major appliances. Same-day service available. Warranty on all repairs.',
    isActive: true
  },
  {
    name: 'William Thomas',
    businessName: 'Thomas Locksmith Services',
    phone: '(416) 555-0110',
    email: 'william@thomaslocksmith.com',
    category: 'Other',
    rating: 4.7,
    hourlyRate: 100.00,
    notes: 'Emergency lockout service, lock installation, key duplication. Available 24/7.',
    isActive: true
  },
  {
    name: 'Linda Jackson',
    businessName: 'Jackson Cleaning Services',
    phone: '(416) 555-0111',
    email: 'linda@jacksoncleaning.com',
    category: 'Other',
    rating: 4.1,
    hourlyRate: 45.00,
    notes: 'Residential and commercial cleaning. Move-in/move-out cleaning available.',
    isActive: true
  },
  {
    name: 'Richard White',
    businessName: 'White Masonry',
    phone: '(416) 555-0112',
    email: 'richard@whitemasonry.com',
    category: 'Structural',
    rating: 4.6,
    hourlyRate: 95.00,
    notes: 'Brick and stone work, chimney repairs, foundation work, and restoration services.',
    isActive: true
  },
  {
    name: 'Barbara Harris',
    businessName: 'Harris Window & Door',
    phone: '(416) 555-0113',
    email: 'barbara@harriswindows.com',
    category: 'Structural',
    rating: 4.4,
    hourlyRate: 80.00,
    notes: 'Window and door installation, repair, and replacement. Energy-efficient options available.',
    isActive: true
  },
  {
    name: 'Charles Martin',
    businessName: 'Martin General Contracting',
    phone: '(416) 555-0114',
    email: 'charles@martincontracting.com',
    category: 'General Contracting',
    rating: 4.8,
    hourlyRate: 105.00,
    notes: 'Full-service contractor. Handles all aspects of renovation and construction projects.',
    isActive: true
  },
  {
    name: 'Susan Clark',
    businessName: 'Clark Snow Removal',
    phone: '(416) 555-0115',
    email: 'susan@clarksnow.com',
    category: 'Other',
    rating: 3.9,
    hourlyRate: 60.00,
    notes: 'Seasonal snow removal service. Commercial and residential properties. On-call service available.',
    isActive: false // Inactive during off-season
  },
  {
    name: 'Joseph Lewis',
    businessName: 'Lewis Drywall',
    phone: '(416) 555-0116',
    email: 'joseph@lewisdrywall.com',
    category: 'Structural',
    rating: 4.3,
    hourlyRate: 55.00,
    notes: 'Drywall installation, repair, and finishing. Texturing and painting services available.',
    isActive: true
  },
  {
    name: 'Jessica Walker',
    businessName: 'Walker Pest Control',
    phone: '(416) 555-0117',
    email: 'jessica@walkerpest.com',
    category: 'Pest Control',
    rating: 4.7,
    hourlyRate: 0, // Service-based pricing
    notes: 'Residential and commercial pest control. Eco-friendly options available. Guaranteed results.',
    isActive: true
  },
  {
    name: 'Daniel Hall',
    businessName: 'Hall Insulation',
    phone: '(416) 555-0118',
    email: 'daniel@hallinsulation.com',
    category: 'Other',
    rating: 4.5,
    hourlyRate: 0, // Project-based pricing
    notes: 'Attic and wall insulation. Energy audits and recommendations. Government rebates available.',
    isActive: true
  },
  {
    name: 'Karen Allen',
    businessName: 'Allen Handyman Services',
    phone: '(416) 555-0119',
    email: 'karen@allenhandyman.com',
    category: 'Other',
    rating: 4.0,
    hourlyRate: 70.00,
    notes: 'General repairs and maintenance. Small projects and odd jobs. Same-day service available.',
    isActive: true
  },
  {
    name: 'Mark Young',
    businessName: 'Young Concrete',
    phone: '(416) 555-0120',
    email: 'mark@youngconcrete.com',
    category: 'Structural',
    rating: 4.4,
    hourlyRate: 0, // Project-based pricing
    notes: 'Driveway, sidewalk, and patio installation. Concrete repair and resurfacing services.',
    isActive: true
  },
  {
    name: 'Alexandra Rodriguez',
    businessName: 'Rodriguez Fence & Gate',
    phone: '(416) 555-0121',
    email: 'alex@rodriguezfence.com',
    category: 'Other',
    rating: 4.6,
    hourlyRate: 75.00,
    notes: 'Wood, vinyl, and chain-link fence installation. Gate repairs and custom designs.',
    isActive: true
  },
  {
    name: 'Kevin Park',
    businessName: 'Park Garage Door Services',
    phone: '(416) 555-0122',
    email: 'kevin@parkgarage.com',
    category: 'Other',
    rating: 4.8,
    hourlyRate: 95.00,
    notes: 'Garage door installation, repair, and maintenance. Spring replacement and opener installation.',
    isActive: true
  },
  {
    name: 'Nicole Foster',
    businessName: 'Foster Septic Services',
    phone: '(416) 555-0123',
    email: 'nicole@fosterseptic.com',
    category: 'Other',
    rating: 4.5,
    hourlyRate: 0, // Service-based pricing
    notes: 'Septic tank pumping, inspection, and repair. Emergency service available.',
    isActive: true
  },
  {
    name: 'Ryan Mitchell',
    businessName: 'Mitchell Welding & Fabrication',
    phone: '(416) 555-0124',
    email: 'ryan@mitchellwelding.com',
    category: 'Structural',
    rating: 4.7,
    hourlyRate: 125.00,
    notes: 'Custom metal fabrication, welding repairs, and structural steel work.',
    isActive: true
  },
  {
    name: 'Amanda Torres',
    businessName: 'Torres Tile & Stone',
    phone: '(416) 555-0125',
    email: 'amanda@torrestile.com',
    category: 'Other',
    rating: 4.9,
    hourlyRate: 85.00,
    notes: 'Ceramic, porcelain, and natural stone tile installation. Backsplash and shower work.',
    isActive: true
  },
  {
    name: 'Brandon Lee',
    businessName: 'Lee Security Systems',
    phone: '(416) 555-0126',
    email: 'brandon@leesecurity.com',
    category: 'Other',
    rating: 4.6,
    hourlyRate: 110.00,
    notes: 'Security camera installation, alarm systems, and smart home integration.',
    isActive: true
  },
  {
    name: 'Stephanie Wright',
    businessName: 'Wright Gutter Solutions',
    phone: '(416) 555-0127',
    email: 'stephanie@wrightgutters.com',
    category: 'Other',
    rating: 4.3,
    hourlyRate: 70.00,
    notes: 'Gutter installation, cleaning, and repair. Leaf guard systems available.',
    isActive: true
  },
  {
    name: 'Tyler Green',
    businessName: 'Green Asphalt Paving',
    phone: '(416) 555-0128',
    email: 'tyler@greenasphalt.com',
    category: 'Structural',
    rating: 4.4,
    hourlyRate: 0, // Project-based pricing
    notes: 'Driveway paving, parking lot installation, and asphalt repair services.',
    isActive: true
  },
  {
    name: 'Rachel Kim',
    businessName: 'Kim Window Cleaning',
    phone: '(416) 555-0129',
    email: 'rachel@kimwindows.com',
    category: 'Other',
    rating: 4.2,
    hourlyRate: 50.00,
    notes: 'Residential and commercial window cleaning. Pressure washing services available.',
    isActive: true
  },
  {
    name: 'Jordan Phillips',
    businessName: 'Phillips Demolition',
    phone: '(416) 555-0130',
    email: 'jordan@phillipsdemo.com',
    category: 'Structural',
    rating: 4.5,
    hourlyRate: 0, // Project-based pricing
    notes: 'Interior and exterior demolition. Debris removal and site cleanup included.',
    isActive: true
  }
];

async function seedVendors() {
  try {
    console.log('Starting vendor seed...');
    
    // Check if vendors already exist
    const existingCount = await prisma.vendor.count();
    if (existingCount >= vendors.length) {
      console.log(`⚠️  Found ${existingCount} existing vendors. Skipping seed to avoid duplicates.`);
      console.log('To reseed, delete existing vendors first or modify this script.');
      return;
    }
    
    // Only add vendors that don't already exist
    const existingVendors = await prisma.vendor.findMany({
      select: { email: true, phone: true }
    });
    const existingEmails = new Set(existingVendors.map(v => v.email).filter(Boolean));
    const existingPhones = new Set(existingVendors.map(v => v.phone));
    
    const vendorsToAdd = vendors.filter(v => 
      !existingEmails.has(v.email) && !existingPhones.has(v.phone)
    );
    
    if (vendorsToAdd.length === 0) {
      console.log('All vendors already exist in database.');
      return;
    }
    
    console.log(`Adding ${vendorsToAdd.length} new vendors (${existingCount} already exist)...`);
    
    const now = new Date();
    const createdVendors = [];
    
    for (const vendorData of vendorsToAdd) {
      const vendor = await prisma.vendor.create({
        data: {
          id: generateCUID(),
          name: vendorData.name,
          businessName: vendorData.businessName,
          phone: vendorData.phone,
          email: vendorData.email,
          category: vendorData.category,
          rating: vendorData.rating,
          hourlyRate: vendorData.hourlyRate === 0 ? null : vendorData.hourlyRate,
          notes: vendorData.notes,
          isActive: vendorData.isActive,
          createdAt: now,
          updatedAt: now
        }
      });
      createdVendors.push(vendor);
      console.log(`✅ Created: ${vendor.name} - ${vendor.category}`);
    }
    
    console.log(`\n✅ Successfully created ${createdVendors.length} vendors`);
    console.log('\nVendor Summary:');
    console.log(`- Active: ${createdVendors.filter(v => v.isActive).length}`);
    console.log(`- Inactive: ${createdVendors.filter(v => !v.isActive).length}`);
    console.log(`- With Ratings: ${createdVendors.filter(v => v.rating).length}`);
    console.log(`- With Hourly Rates: ${createdVendors.filter(v => v.hourlyRate).length}`);
    
    // Group by category
    const byCategory = {};
    createdVendors.forEach(v => {
      byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    });
    console.log('\nBy Category:');
    Object.entries(byCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedVendors()
  .then(() => {
    console.log('\n✅ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });

