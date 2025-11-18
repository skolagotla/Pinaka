/**
 * SHOW ALL RENT PAYMENTS
 * ======================
 * 
 * This script displays all rent payment records to help identify
 * which payments were actually made by tenants.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showAllPayments() {
  console.log('\n=== ALL RENT PAYMENT RECORDS ===\n');
  
  const payments = await prisma.rentPayment.findMany({
    include: {
      lease: {
        include: {
          unit: {
            include: {
              property: true
            }
          },
          leaseTenants: {
            include: {
              tenant: true
            }
          }
        }
      },
      partialPayments: true
    },
    orderBy: { dueDate: 'asc' }
  });
  
  // Group by property and tenant
  const grouped = {};
  
  payments.forEach(p => {
    const property = p.lease.unit.property;
    const tenant = p.lease.leaseTenants[0]?.tenant;
    const key = `${property.name} - ${tenant.firstName} ${tenant.lastName}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(p);
  });
  
  // Display
  Object.entries(grouped).forEach(([key, payments]) => {
    console.log(`\n📋 ${key}`);
    console.log('='.repeat(60));
    
    payments.forEach(p => {
      const dueDate = new Date(p.dueDate);
      const monthName = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      console.log(`  ${monthName}:`);
      console.log(`    Amount: $${p.amount.toFixed(2)}`);
      console.log(`    Due Date: ${dueDate.toLocaleDateString()}`);
      console.log(`    Status: ${p.status}`);
      
      if (p.status === 'Paid') {
        console.log(`    ✅ PAID on ${p.paidDate ? new Date(p.paidDate).toLocaleDateString() : 'Unknown'}`);
        console.log(`    Method: ${p.paymentMethod || 'N/A'}`);
        console.log(`    Reference: ${p.referenceNumber || 'N/A'}`);
      } else if (p.status === 'Partial') {
        const totalPaid = p.partialPayments.reduce((sum, pp) => sum + pp.amount, 0);
        console.log(`    💵 PARTIALLY PAID: $${totalPaid.toFixed(2)} of $${p.amount.toFixed(2)}`);
        console.log(`    Partial payments:`);
        p.partialPayments.forEach(pp => {
          console.log(`      - $${pp.amount.toFixed(2)} on ${new Date(pp.paidDate).toLocaleDateString()} (${pp.paymentMethod})`);
        });
      } else {
        console.log(`    ❌ UNPAID`);
      }
      
      console.log('');
    });
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total payments: ${payments.length}`);
  console.log(`Paid: ${payments.filter(p => p.status === 'Paid').length}`);
  console.log(`Partial: ${payments.filter(p => p.status === 'Partial').length}`);
  console.log(`Unpaid: ${payments.filter(p => p.status === 'Unpaid').length}`);
  console.log(`Overdue: ${payments.filter(p => p.status === 'Overdue').length}`);
  console.log('\n');
  
  await prisma.$disconnect();
}

showAllPayments().catch(console.error);

