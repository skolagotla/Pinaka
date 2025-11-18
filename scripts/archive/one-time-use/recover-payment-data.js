/**
 * PAYMENT DATA RECOVERY TOOL
 * ===========================
 * 
 * This script helps recover lost payment data by allowing manual entry
 * of which payments were made.
 * 
 * USAGE:
 * ------
 * 1. Edit the PAYMENTS_TO_RESTORE array below
 * 2. Run: node scripts/recover-payment-data.js
 * 
 * EXAMPLE:
 * --------
 * If tenant "Naga Meruga" paid rent for Greely property on:
 * - February 1, 2025 - Full payment via Bank Transfer
 * - March 1, 2025 - Partial payment $2500 via Check
 * 
 * Add entries like:
 * {
 *   tenantName: "Naga Meruga",
 *   propertyName: "Greely",
 *   month: 2,  // February
 *   year: 2025,
 *   type: "full",  // or "partial"
 *   amount: 5000,  // Full rent amount
 *   paidAmount: 5000,  // Amount actually paid
 *   paidDate: "2025-02-01",
 *   paymentMethod: "Bank Transfer",
 *   referenceNumber: "TXN123456",
 *   notes: ""
 * },
 * {
 *   tenantName: "Naga Meruga",
 *   propertyName: "Greely",
 *   month: 3,  // March
 *   year: 2025,
 *   type: "partial",
 *   amount: 5000,
 *   paidAmount: 2500,
 *   paidDate: "2025-03-01",
 *   paymentMethod: "Check",
 *   referenceNumber: "CHK789",
 *   notes: "Partial payment - waiting for rest"
 * }
 */

const { PrismaClient } = require('@prisma/client');
const { generateDocumentHash } = require('@/lib/hashGenerator');
const prisma = new PrismaClient();

// ============================================
// EDIT THIS ARRAY WITH YOUR PAYMENT DATA
// ============================================
const PAYMENTS_TO_RESTORE = [
  // Example (DELETE THIS and add your real data):
  // {
  //   tenantName: "Naga Meruga",
  //   propertyName: "Greely",
  //   month: 2,
  //   year: 2025,
  //   type: "full",  // or "partial"
  //   amount: 5000,
  //   paidAmount: 5000,
  //   paidDate: "2025-02-01",
  //   paymentMethod: "Bank Transfer",
  //   referenceNumber: "",
  //   notes: ""
  // },
  
  // ADD YOUR PAYMENT DATA HERE:
  
];

async function recoverPayments() {
  console.log('\n=== PAYMENT DATA RECOVERY ===\n');
  
  if (PAYMENTS_TO_RESTORE.length === 0) {
    console.log('❌ No payments to restore!');
    console.log('\nPlease edit this script and add payment data to PAYMENTS_TO_RESTORE array.');
    console.log('See the example at the top of the file.\n');
    await prisma.$disconnect();
    return;
  }
  
  console.log(`Found ${PAYMENTS_TO_RESTORE.length} payments to restore...\n`);
  
  let restored = 0;
  let failed = 0;
  
  for (const payment of PAYMENTS_TO_RESTORE) {
    try {
      console.log(`Processing: ${payment.tenantName} - ${payment.propertyName} - ${payment.month}/${payment.year}`);
      
      // Find the tenant
      const tenant = await prisma.user.findFirst({
        where: {
          firstName: { contains: payment.tenantName.split(' ')[0], mode: 'insensitive' },
          lastName: { contains: payment.tenantName.split(' ')[1] || '', mode: 'insensitive' },
          role: 'tenant'
        }
      });
      
      if (!tenant) {
        console.log(`  ❌ Tenant not found: ${payment.tenantName}`);
        failed++;
        continue;
      }
      
      // Find the property
      const property = await prisma.property.findFirst({
        where: {
          name: { contains: payment.propertyName, mode: 'insensitive' }
        }
      });
      
      if (!property) {
        console.log(`  ❌ Property not found: ${payment.propertyName}`);
        failed++;
        continue;
      }
      
      // Find the lease
      const lease = await prisma.lease.findFirst({
        where: {
          unitId: { in: property.units || [] },
          status: 'Active',
          leaseTenants: {
            some: { tenantId: tenant.id }
          }
        },
        include: {
          unit: true
        }
      });
      
      if (!lease) {
        console.log(`  ❌ Active lease not found for tenant at property`);
        failed++;
        continue;
      }
      
      // Find the rent payment record for this month
      const dueDate = new Date(Date.UTC(payment.year, payment.month, 1, 0, 0, 0));
      
      const rentPayment = await prisma.rentPayment.findFirst({
        where: {
          leaseId: lease.id,
          dueDate: dueDate
        }
      });
      
      if (!rentPayment) {
        console.log(`  ❌ Rent payment record not found for ${payment.month}/${payment.year}`);
        failed++;
        continue;
      }
      
      // Generate receipt number
      const receiptData = {
        country: property.country,
        state: property.state,
        fileName: `rent-${payment.tenantName}-${payment.month}-${payment.year}`
      };
      const receiptNumber = generateDocumentHash('RR', receiptData);
      
      if (payment.type === 'full') {
        // Full payment - update the rent payment record
        await prisma.rentPayment.update({
          where: { id: rentPayment.id },
          data: {
            status: 'Paid',
            paidDate: new Date(payment.paidDate),
            paymentMethod: payment.paymentMethod,
            referenceNumber: payment.referenceNumber || null,
            receiptNumber: receiptNumber,
            notes: payment.notes || null
          }
        });
        
        console.log(`  ✅ Restored full payment: $${payment.paidAmount}`);
        restored++;
        
      } else {
        // Partial payment - create partial payment record
        const partialPayment = await prisma.partialPayment.create({
          data: {
            rentPaymentId: rentPayment.id,
            amount: payment.paidAmount,
            paidDate: new Date(payment.paidDate),
            paymentMethod: payment.paymentMethod,
            referenceNumber: payment.referenceNumber || `PARTIAL-${Date.now()}`,
            notes: payment.notes || null
          }
        });
        
        // Update rent payment status to Partial
        const totalPaid = await prisma.partialPayment.aggregate({
          where: { rentPaymentId: rentPayment.id },
          _sum: { amount: true }
        });
        
        const newStatus = totalPaid._sum.amount >= rentPayment.amount ? 'Paid' : 'Partial';
        
        await prisma.rentPayment.update({
          where: { id: rentPayment.id },
          data: {
            status: newStatus,
            receiptNumber: receiptNumber,
            paidDate: newStatus === 'Paid' ? new Date(payment.paidDate) : null
          }
        });
        
        console.log(`  ✅ Restored partial payment: $${payment.paidAmount}`);
        restored++;
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n=== RECOVERY COMPLETE ===`);
  console.log(`✅ Restored: ${restored}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\n');
  
  await prisma.$disconnect();
}

recoverPayments().catch(console.error);

