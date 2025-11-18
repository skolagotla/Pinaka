/**
 * Remove Duplicate Rent Payments Script
 * 
 * Tenants should only have ONE payment per month, not multiple duplicates.
 * This script finds and removes duplicate payments, keeping only one per lease per month.
 * 
 * Duplicate = Same leaseId + Same year/month
 * 
 * Priority for which one to keep:
 * 1. Paid status (keep paid over unpaid)
 * 2. Partial status (keep partial over unpaid)
 * 3. Oldest payment (keep first created)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicateRentPayments() {
  console.log('='.repeat(60));
  console.log('🔧 Removing Duplicate Rent Payments');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Get all rent payments
    console.log('📋 Step 1: Fetching all rent payments...');
    
    const allPayments = await prisma.rentPayment.findMany({
      include: {
        lease: true,
        partialPayments: true,
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    console.log(`Found ${allPayments.length} total payments`);
    console.log('');

    // Step 2: Group payments by lease and month
    console.log('📊 Step 2: Grouping payments by lease and month...');
    
    const paymentGroups = {};
    
    for (const payment of allPayments) {
      const dueDate = new Date(payment.dueDate);
      const year = dueDate.getFullYear();
      const month = dueDate.getMonth();
      const key = `${payment.leaseId}-${year}-${month}`;
      
      if (!paymentGroups[key]) {
        paymentGroups[key] = [];
      }
      
      paymentGroups[key].push(payment);
    }

    console.log(`Found ${Object.keys(paymentGroups).length} unique lease-month combinations`);
    console.log('');

    // Step 3: Find duplicates
    console.log('🔍 Step 3: Identifying duplicates...');
    
    const duplicateGroups = Object.entries(paymentGroups).filter(([_, payments]) => payments.length > 1);
    
    console.log(`Found ${duplicateGroups.length} groups with duplicates`);
    console.log('');

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Step 4: Show duplicates
    console.log('Duplicate groups:');
    duplicateGroups.forEach(([key, payments]) => {
      const [leaseId, year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month), 1).toLocaleString('default', { month: 'short', year: 'numeric' });
      console.log(`\n  ${monthName} - Lease ${leaseId.substring(0, 8)}... (${payments.length} payments)`);
      payments.forEach(p => {
        console.log(`    - ID: ${p.id.substring(0, 12)}... | Status: ${p.status} | Amount: $${p.amount} | Created: ${p.createdAt.toISOString().split('T')[0]}`);
      });
    });
    console.log('');

    // Step 5: Remove duplicates (keep the best one)
    console.log('🗑️  Step 5: Removing duplicates...');
    
    let deletedCount = 0;
    
    for (const [key, payments] of duplicateGroups) {
      // Sort by priority:
      // 1. Paid > Partial > Overdue > Unpaid
      // 2. Has partial payments > No partial payments
      // 3. Oldest created date
      const sortedPayments = payments.sort((a, b) => {
        // Priority by status
        const statusPriority = { 'Paid': 4, 'Partial': 3, 'Overdue': 2, 'Unpaid': 1 };
        const aPriority = statusPriority[a.status] || 0;
        const bPriority = statusPriority[b.status] || 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        
        // Priority by partial payments
        const aHasPartials = a.partialPayments && a.partialPayments.length > 0;
        const bHasPartials = b.partialPayments && b.partialPayments.length > 0;
        
        if (aHasPartials !== bHasPartials) {
          return bHasPartials ? 1 : -1; // Has partials first
        }
        
        // Priority by creation date (oldest first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      // Keep the first (best) payment, delete the rest
      const toKeep = sortedPayments[0];
      const toDelete = sortedPayments.slice(1);
      
      console.log(`\n  Keeping: ${toKeep.id.substring(0, 12)}... (Status: ${toKeep.status}, Created: ${toKeep.createdAt.toISOString().split('T')[0]})`);
      
      for (const payment of toDelete) {
        console.log(`  Deleting: ${payment.id.substring(0, 12)}... (Status: ${payment.status}, Created: ${payment.createdAt.toISOString().split('T')[0]})`);
        
        // Delete associated partial payments first
        if (payment.partialPayments && payment.partialPayments.length > 0) {
          await prisma.partialPayment.deleteMany({
            where: { rentPaymentId: payment.id },
          });
          console.log(`    └─ Deleted ${payment.partialPayments.length} associated partial payments`);
        }
        
        // Delete the payment
        await prisma.rentPayment.delete({
          where: { id: payment.id },
        });
        
        deletedCount++;
      }
    }
    
    console.log('');
    console.log(`✅ Deleted ${deletedCount} duplicate payments`);
    console.log('');

    // Step 6: Verify results
    console.log('✅ Step 6: Verifying results...');
    
    const finalPayments = await prisma.rentPayment.findMany();
    const finalGroups = {};
    
    for (const payment of finalPayments) {
      const dueDate = new Date(payment.dueDate);
      const year = dueDate.getFullYear();
      const month = dueDate.getMonth();
      const key = `${payment.leaseId}-${year}-${month}`;
      
      if (!finalGroups[key]) {
        finalGroups[key] = [];
      }
      
      finalGroups[key].push(payment);
    }
    
    const finalDuplicates = Object.values(finalGroups).filter(payments => payments.length > 1);
    
    if (finalDuplicates.length === 0) {
      console.log('✅ No duplicates remaining!');
    } else {
      console.log(`⚠️  Warning: ${finalDuplicates.length} groups still have duplicates`);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ Duplicate Removal Complete!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Summary:');
    console.log(`  - Total payments before: ${allPayments.length}`);
    console.log(`  - Duplicate groups found: ${duplicateGroups.length}`);
    console.log(`  - Payments deleted: ${deletedCount}`);
    console.log(`  - Total payments now: ${finalPayments.length}`);
    console.log(`  - One payment per lease-month: ${finalDuplicates.length === 0 ? 'YES ✅' : 'NO ⚠️'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicateRentPayments()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

