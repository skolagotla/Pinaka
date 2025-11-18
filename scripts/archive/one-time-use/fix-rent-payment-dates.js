/**
 * Fix Rent Payment Dates Script
 * 
 * This script:
 * 1. Deletes all rent payments with due dates BEFORE their lease start date (incorrect)
 * 2. Regenerates correct rent payment records using the fixed createMissingRentPayments logic
 * 
 * Run this ONCE after fixing the createMissingRentPayments function
 */

const { PrismaClient } = require('@prisma/client');
const { createMissingRentPayments } = require('@/lib/rent-payment-service');
const prisma = new PrismaClient();

async function fixRentPaymentDates() {
  console.log('='.repeat(60));
  console.log('🔧 Fixing Rent Payment Dates');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Find all payments with due dates before lease start
    console.log('📋 Step 1: Finding invalid rent payments...');
    
    const invalidPayments = await prisma.rentPayment.findMany({
      include: {
        lease: true,
      },
    });

    const paymentsToDelete = invalidPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      const leaseStart = new Date(payment.lease.leaseStart);
      return dueDate < leaseStart;
    });

    console.log(`Found ${paymentsToDelete.length} invalid payments (due date before lease start)`);
    
    if (paymentsToDelete.length > 0) {
      console.log('');
      console.log('Invalid payments:');
      paymentsToDelete.forEach(p => {
        const dueDate = new Date(p.dueDate);
        const leaseStart = new Date(p.lease.leaseStart);
        console.log(`  ❌ Payment ID: ${p.id}`);
        console.log(`     Due Date: ${dueDate.toISOString().split('T')[0]}`);
        console.log(`     Lease Start: ${leaseStart.toISOString().split('T')[0]}`);
        console.log(`     Lease ID: ${p.leaseId}`);
        console.log('');
      });
    }

    // Step 2: Delete invalid payments
    if (paymentsToDelete.length > 0) {
      console.log('🗑️  Step 2: Deleting invalid payments...');
      
      for (const payment of paymentsToDelete) {
        await prisma.rentPayment.delete({
          where: { id: payment.id },
        });
        console.log(`  ✓ Deleted payment ${payment.id}`);
      }
      
      console.log(`✅ Deleted ${paymentsToDelete.length} invalid payments`);
      console.log('');
    } else {
      console.log('✅ No invalid payments found to delete');
      console.log('');
    }

    // Step 3: Regenerate correct payments
    console.log('🔄 Step 3: Regenerating correct rent payments...');
    const createdCount = await createMissingRentPayments();
    console.log(`✅ Created ${createdCount} new payment records`);
    console.log('');

    // Step 4: Verify results
    console.log('✅ Step 4: Verifying results...');
    
    const allPayments = await prisma.rentPayment.findMany({
      include: {
        lease: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const stillInvalid = allPayments.filter(payment => {
      const dueDate = new Date(payment.dueDate);
      const leaseStart = new Date(payment.lease.leaseStart);
      return dueDate < leaseStart;
    });

    if (stillInvalid.length === 0) {
      console.log('✅ All rent payments now have due dates ON or AFTER lease start!');
    } else {
      console.log(`⚠️  Warning: ${stillInvalid.length} payments still have invalid dates`);
    }

    console.log('');
    console.log('Payment summary by lease:');
    const leaseGroups = {};
    allPayments.forEach(p => {
      if (!leaseGroups[p.leaseId]) {
        leaseGroups[p.leaseId] = [];
      }
      leaseGroups[p.leaseId].push(p);
    });

    for (const [leaseId, payments] of Object.entries(leaseGroups)) {
      const lease = payments[0].lease;
      const leaseStart = new Date(lease.leaseStart);
      console.log(`\n  Lease ${leaseId.substring(0, 8)}...`);
      console.log(`    Start: ${leaseStart.toISOString().split('T')[0]}`);
      console.log(`    Payments: ${payments.length}`);
      console.log(`    Due Dates:`);
      payments.slice(0, 5).forEach(p => {
        const dueDate = new Date(p.dueDate);
        const isValid = dueDate >= leaseStart;
        console.log(`      ${isValid ? '✓' : '❌'} ${dueDate.toISOString().split('T')[0]} - ${p.status}`);
      });
      if (payments.length > 5) {
        console.log(`      ... and ${payments.length - 5} more`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Rent Payment Dates Fixed Successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  - Deleted: ${paymentsToDelete.length} invalid payments`);
    console.log(`  - Created: ${createdCount} new correct payments`);
    console.log(`  - Total payments now: ${allPayments.length}`);
    console.log(`  - All payments valid: ${stillInvalid.length === 0 ? 'YES ✅' : 'NO ⚠️'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error fixing rent payment dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixRentPaymentDates()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

