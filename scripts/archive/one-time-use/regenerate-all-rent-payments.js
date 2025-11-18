/**
 * REGENERATE ALL RENT PAYMENT RECORDS
 * ====================================
 * 
 * This script:
 * 1. Deletes ALL existing rent payment records
 * 2. Generates fresh records for each month from lease start until today
 * 3. One record per property per month
 */

const { PrismaClient } = require('@prisma/client');
const { createId } = require('@paralleldrive/cuid2');
const prisma = new PrismaClient();

async function regenerateAllRentPayments() {
  console.log('\n=== REGENERATE ALL RENT PAYMENT RECORDS ===\n');
  
  try {
    // STEP 1: Delete all existing rent payment records
    console.log('STEP 1: Deleting all existing rent payment records...');
    
    const deletedPartials = await prisma.partialPayment.deleteMany({});
    console.log(`  ✅ Deleted ${deletedPartials.count} partial payment records`);
    
    const deletedPayments = await prisma.rentPayment.deleteMany({});
    console.log(`  ✅ Deleted ${deletedPayments.count} rent payment records`);
    
    // STEP 2: Get all active leases
    console.log('\nSTEP 2: Finding all active leases...');
    
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: 'Active'
      },
      include: {
        Unit: {
          include: {
            Property: true
          }
        },
        LeaseTenant: {
          include: {
            Tenant: true
          }
        }
      }
    });
    
    console.log(`  ✅ Found ${activeLeases.length} active leases`);
    
    if (activeLeases.length === 0) {
      console.log('\n⚠️  No active leases found. Nothing to generate.\n');
      await prisma.$disconnect();
      return;
    }
    
    // STEP 3: Generate rent payment records for each lease
    console.log('\nSTEP 3: Generating rent payment records...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalGenerated = 0;
    
    for (const lease of activeLeases) {
      const property = lease.Unit?.Property;
      const tenant = lease.LeaseTenant[0]?.Tenant;
      const propertyName = property?.name || 'Unknown Property';
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant';
      
      console.log(`\n📋 ${propertyName} - ${tenantName}`);
      console.log('='.repeat(60));
      
      const leaseStart = new Date(lease.leaseStart);
      leaseStart.setHours(0, 0, 0, 0);
      
      const leaseEnd = lease.leaseEnd ? new Date(lease.leaseEnd) : null;
      
      console.log(`  Lease Start: ${leaseStart.toLocaleDateString()}`);
      console.log(`  Monthly Rent: $${lease.rentAmount.toFixed(2)}`);
      
      // Generate payment records from lease start to today
      let currentDate = new Date(leaseStart);
      let monthCount = 0;
      
      while (currentDate <= today) {
        // Stop if we've passed the lease end date
        if (leaseEnd && currentDate > leaseEnd) {
          break;
        }
        
        // Calculate due date (first day of the current month in local timezone)
        const dueDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
          0, 0, 0, 0
        );
        
        // Determine status based on whether due date has passed
        let status = 'Unpaid';
        if (dueDate < today) {
          status = 'Overdue';
        }
        
        // Create the rent payment record
        const payment = await prisma.rentPayment.create({
          data: {
            id: createId(),
            leaseId: lease.id,
            amount: lease.rentAmount,
            dueDate: dueDate,
            status: status,
            updatedAt: new Date()
          }
        });
        
        const monthName = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        console.log(`  ✅ ${monthName}: $${lease.rentAmount.toFixed(2)} (${status})`);
        
        monthCount++;
        totalGenerated++;
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      console.log(`  Total months: ${monthCount}`);
    }
    
    // STEP 4: Summary
    console.log('\n=== GENERATION COMPLETE ===');
    console.log(`✅ Generated ${totalGenerated} rent payment records`);
    console.log(`✅ For ${activeLeases.length} active leases`);
    
    // Show summary by property
    console.log('\n=== SUMMARY BY PROPERTY ===\n');
    
    for (const lease of activeLeases) {
      const property = lease.Unit?.Property;
      const tenant = lease.LeaseTenant[0]?.Tenant;
      const propertyName = property?.name || 'Unknown Property';
      const tenantName = tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown Tenant';
      
      const payments = await prisma.rentPayment.findMany({
        where: { leaseId: lease.id },
        orderBy: { dueDate: 'asc' }
      });
      
      const overdue = payments.filter(p => p.status === 'Overdue').length;
      const unpaid = payments.filter(p => p.status === 'Unpaid').length;
      
      console.log(`${propertyName} - ${tenantName}:`);
      console.log(`  Total payments: ${payments.length}`);
      console.log(`  Overdue: ${overdue}`);
      console.log(`  Unpaid: ${unpaid}`);
      console.log('');
    }
    
    console.log('\n✅ All rent payment records regenerated successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateAllRentPayments().catch(console.error);
