/**
 * Seed script for reference data tables
 * Populates Countries, Regions, and unified ReferenceData table
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to convert name to code (lowercase, replace spaces with underscores)
function nameToCode(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Helper function to seed reference data
async function seedReferenceData(category, items) {
  for (const item of items) {
    const code = nameToCode(item.name);
    await prisma.referenceData.upsert({
      where: {
        category_code: {
          category,
          code
        }
      },
      update: {
        name: item.name,
        description: item.description || null,
        color: item.color || null,
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
        updatedAt: new Date()
      },
      create: {
        category,
        code,
        name: item.name,
        description: item.description || null,
        color: item.color || null,
        sortOrder: item.sortOrder || 0,
        isActive: item.isActive !== undefined ? item.isActive : true
      }
    });
  }
}

async function main() {
  console.log('🌱 Seeding reference data...\n');

  // ========================================
  // 1. Countries
  // ========================================
  console.log('📍 Seeding Countries...');
  const countries = [
    { code: 'CA', name: 'CA', sortOrder: 1 },
    { code: 'US', name: 'USA', sortOrder: 2 },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: country,
      create: country,
    });
  }
  console.log(`✅ Seeded ${countries.length} countries\n`);

  // ========================================
  // 2. Canadian Provinces
  // ========================================
  console.log('🍁 Seeding Canadian Provinces...');
  const caProvinces = [
    { code: 'AB', name: 'Alberta', sortOrder: 1 },
    { code: 'BC', name: 'British Columbia', sortOrder: 2 },
    { code: 'MB', name: 'Manitoba', sortOrder: 3 },
    { code: 'NB', name: 'New Brunswick', sortOrder: 4 },
    { code: 'NL', name: 'Newfoundland and Labrador', sortOrder: 5 },
    { code: 'NS', name: 'Nova Scotia', sortOrder: 6 },
    { code: 'NT', name: 'Northwest Territories', sortOrder: 7 },
    { code: 'NU', name: 'Nunavut', sortOrder: 8 },
    { code: 'ON', name: 'Ontario', sortOrder: 9 },
    { code: 'PE', name: 'Prince Edward Island', sortOrder: 10 },
    { code: 'QC', name: 'Quebec', sortOrder: 11 },
    { code: 'SK', name: 'Saskatchewan', sortOrder: 12 },
    { code: 'YT', name: 'Yukon', sortOrder: 13 },
  ];

  for (const province of caProvinces) {
    await prisma.region.upsert({
      where: { countryCode_code: { countryCode: 'CA', code: province.code } },
      update: province,
      create: { ...province, countryCode: 'CA' },
    });
  }
  console.log(`✅ Seeded ${caProvinces.length} Canadian provinces\n`);

  // ========================================
  // 3. US States
  // ========================================
  console.log('🦅 Seeding US States...');
  const usStates = [
    { code: 'AL', name: 'Alabama', sortOrder: 1 },
    { code: 'AK', name: 'Alaska', sortOrder: 2 },
    { code: 'AZ', name: 'Arizona', sortOrder: 3 },
    { code: 'AR', name: 'Arkansas', sortOrder: 4 },
    { code: 'CA', name: 'California', sortOrder: 5 },
    { code: 'CO', name: 'Colorado', sortOrder: 6 },
    { code: 'CT', name: 'Connecticut', sortOrder: 7 },
    { code: 'DE', name: 'Delaware', sortOrder: 8 },
    { code: 'FL', name: 'Florida', sortOrder: 9 },
    { code: 'GA', name: 'Georgia', sortOrder: 10 },
    { code: 'HI', name: 'Hawaii', sortOrder: 11 },
    { code: 'ID', name: 'Idaho', sortOrder: 12 },
    { code: 'IL', name: 'Illinois', sortOrder: 13 },
    { code: 'IN', name: 'Indiana', sortOrder: 14 },
    { code: 'IA', name: 'Iowa', sortOrder: 15 },
    { code: 'KS', name: 'Kansas', sortOrder: 16 },
    { code: 'KY', name: 'Kentucky', sortOrder: 17 },
    { code: 'LA', name: 'Louisiana', sortOrder: 18 },
    { code: 'ME', name: 'Maine', sortOrder: 19 },
    { code: 'MD', name: 'Maryland', sortOrder: 20 },
    { code: 'MA', name: 'Massachusetts', sortOrder: 21 },
    { code: 'MI', name: 'Michigan', sortOrder: 22 },
    { code: 'MN', name: 'Minnesota', sortOrder: 23 },
    { code: 'MS', name: 'Mississippi', sortOrder: 24 },
    { code: 'MO', name: 'Missouri', sortOrder: 25 },
    { code: 'MT', name: 'Montana', sortOrder: 26 },
    { code: 'NE', name: 'Nebraska', sortOrder: 27 },
    { code: 'NV', name: 'Nevada', sortOrder: 28 },
    { code: 'NH', name: 'New Hampshire', sortOrder: 29 },
    { code: 'NJ', name: 'New Jersey', sortOrder: 30 },
    { code: 'NM', name: 'New Mexico', sortOrder: 31 },
    { code: 'NY', name: 'New York', sortOrder: 32 },
    { code: 'NC', name: 'North Carolina', sortOrder: 33 },
    { code: 'ND', name: 'North Dakota', sortOrder: 34 },
    { code: 'OH', name: 'Ohio', sortOrder: 35 },
    { code: 'OK', name: 'Oklahoma', sortOrder: 36 },
    { code: 'OR', name: 'Oregon', sortOrder: 37 },
    { code: 'PA', name: 'Pennsylvania', sortOrder: 38 },
    { code: 'RI', name: 'Rhode Island', sortOrder: 39 },
    { code: 'SC', name: 'South Carolina', sortOrder: 40 },
    { code: 'SD', name: 'South Dakota', sortOrder: 41 },
    { code: 'TN', name: 'Tennessee', sortOrder: 42 },
    { code: 'TX', name: 'Texas', sortOrder: 43 },
    { code: 'UT', name: 'Utah', sortOrder: 44 },
    { code: 'VT', name: 'Vermont', sortOrder: 45 },
    { code: 'VA', name: 'Virginia', sortOrder: 46 },
    { code: 'WA', name: 'Washington', sortOrder: 47 },
    { code: 'WV', name: 'West Virginia', sortOrder: 48 },
    { code: 'WI', name: 'Wisconsin', sortOrder: 49 },
    { code: 'WY', name: 'Wyoming', sortOrder: 50 },
  ];

  for (const state of usStates) {
    await prisma.region.upsert({
      where: { countryCode_code: { countryCode: 'US', code: state.code } },
      update: state,
      create: { ...state, countryCode: 'US' },
    });
  }
  console.log(`✅ Seeded ${usStates.length} US states\n`);

  // ========================================
  // 4. Property Types
  // ========================================
  console.log('🏠 Seeding Property Types...');
  const propertyTypes = [
    { name: 'Single-family', description: 'Single family home', sortOrder: 1 },
    { name: 'Duplex', description: 'Two-unit building', sortOrder: 2 },
    { name: 'Triplex', description: 'Three-unit building', sortOrder: 3 },
    { name: 'Fourplex', description: 'Four-unit building', sortOrder: 4 },
    { name: 'Apartment', description: 'Apartment building', sortOrder: 5 },
    { name: 'Condo', description: 'Condominium', sortOrder: 6 },
    { name: 'Townhouse', description: 'Townhouse', sortOrder: 7 },
    { name: 'Multi-family', description: 'Multi-family building', sortOrder: 8 },
    { name: 'Commercial', description: 'Commercial property', sortOrder: 9 },
    { name: 'Mixed-use', description: 'Mixed residential/commercial', sortOrder: 10 },
  ];

  await seedReferenceData('property_type', propertyTypes);
  console.log(`✅ Seeded ${propertyTypes.length} property types\n`);

  // ========================================
  // 5. Unit Statuses
  // ========================================
  console.log('🚪 Seeding Unit Statuses...');
  const unitStatuses = [
    { name: 'Vacant', description: 'Unit is empty and available', color: 'default', sortOrder: 1 },
    { name: 'Occupied', description: 'Unit is currently rented', color: 'success', sortOrder: 2 },
    { name: 'Under Maintenance', description: 'Unit is being repaired', color: 'warning', sortOrder: 3 },
  ];

  await seedReferenceData('unit_status', unitStatuses);
  console.log(`✅ Seeded ${unitStatuses.length} unit statuses\n`);

  // ========================================
  // 6. Maintenance Categories
  // ========================================
  console.log('🔧 Seeding Maintenance Categories...');
  const maintenanceCategories = [
    { name: 'Plumbing', description: 'Water, pipes, drains', sortOrder: 1 },
    { name: 'Electrical', description: 'Wiring, outlets, lighting', sortOrder: 2 },
    { name: 'HVAC', description: 'Heating, ventilation, air conditioning', sortOrder: 3 },
    { name: 'Appliance', description: 'Kitchen and laundry appliances', sortOrder: 4 },
    { name: 'Structural', description: 'Walls, floors, ceilings, foundation', sortOrder: 5 },
    { name: 'Pest Control', description: 'Insects, rodents', sortOrder: 6 },
    { name: 'Landscaping', description: 'Yard, garden, exterior maintenance', sortOrder: 7 },
    { name: 'Security', description: 'Locks, doors, windows, alarms', sortOrder: 8 },
    { name: 'Other', description: 'Other maintenance needs', sortOrder: 9 },
  ];

  await seedReferenceData('maintenance_category', maintenanceCategories);
  console.log(`✅ Seeded ${maintenanceCategories.length} maintenance categories\n`);

  // ========================================
  // 7. Maintenance Priorities
  // ========================================
  console.log('⚡ Seeding Maintenance Priorities...');
  const maintenancePriorities = [
    { name: 'Low', description: 'Can wait, non-urgent', color: 'default', sortOrder: 1 },
    { name: 'Medium', description: 'Should be addressed soon', color: 'processing', sortOrder: 2 },
    { name: 'High', description: 'Important, needs attention', color: 'warning', sortOrder: 3 },
    { name: 'Urgent', description: 'Emergency, immediate action required', color: 'error', sortOrder: 4 },
  ];

  await seedReferenceData('maintenance_priority', maintenancePriorities);
  console.log(`✅ Seeded ${maintenancePriorities.length} maintenance priorities\n`);

  // ========================================
  // 8. Maintenance Statuses
  // ========================================
  console.log('📊 Seeding Maintenance Statuses...');
  const maintenanceStatuses = [
    { name: 'New', description: 'Just submitted, not reviewed', color: 'processing', sortOrder: 1 },
    { name: 'Pending', description: 'Reviewed, awaiting action', color: 'warning', sortOrder: 2 },
    { name: 'In Progress', description: 'Work is being done', color: 'processing', sortOrder: 3 },
    { name: 'Completed', description: 'Work is finished', color: 'success', sortOrder: 4 },
    { name: 'Cancelled', description: 'Request was cancelled', color: 'default', sortOrder: 5 },
  ];

  await seedReferenceData('maintenance_status', maintenanceStatuses);
  console.log(`✅ Seeded ${maintenanceStatuses.length} maintenance statuses\n`);

  // ========================================
  // 9. Lease Statuses
  // ========================================
  console.log('📝 Seeding Lease Statuses...');
  const leaseStatuses = [
    { name: 'Active', description: 'Lease is currently in effect', color: 'success', sortOrder: 1 },
    { name: 'Expired', description: 'Lease term has ended', color: 'warning', sortOrder: 2 },
    { name: 'Terminated', description: 'Lease was terminated early', color: 'error', sortOrder: 3 },
  ];

  await seedReferenceData('lease_status', leaseStatuses);
  console.log(`✅ Seeded ${leaseStatuses.length} lease statuses\n`);

  // ========================================
  // 10. Payment Statuses
  // ========================================
  console.log('💰 Seeding Payment Statuses...');
  const paymentStatuses = [
    { name: 'Unpaid', description: 'Payment not yet made', color: 'warning', sortOrder: 1 },
    { name: 'Paid', description: 'Payment received in full', color: 'success', sortOrder: 2 },
    { name: 'Overdue', description: 'Payment past due date', color: 'error', sortOrder: 3 },
    { name: 'Partial', description: 'Partial payment received', color: 'processing', sortOrder: 4 },
  ];

  await seedReferenceData('payment_status', paymentStatuses);
  console.log(`✅ Seeded ${paymentStatuses.length} payment statuses\n`);

  console.log('🎉 Reference data seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding reference data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

