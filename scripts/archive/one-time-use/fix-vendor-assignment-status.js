/**
 * Script to fix existing tickets where vendor assignment was the first comment
 * but didn't trigger the status change to "In Progress"
 * Run with: node scripts/fix-vendor-assignment-status.js
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

async function fixVendorAssignmentStatus() {
  try {
    console.log('Starting vendor assignment status fix...');
    
    // Find all maintenance requests with vendor assignments
    const tickets = await prisma.maintenanceRequest.findMany({
      where: {
        assignedToVendorId: { not: null }
      },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }, // Oldest first to find first comment
        },
        property: {
          include: {
            landlord: true
          }
        },
        tenant: true
      }
    });

    console.log(`Found ${tickets.length} tickets with assigned vendors`);

    if (tickets.length === 0) {
      console.log('No tickets with assigned vendors found.');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const ticket of tickets) {
      try {
        // Skip if already in progress or closed
        if (ticket.status === 'In Progress' || ticket.status === 'Closed') {
          skippedCount++;
          continue;
        }

        // Find vendor assignment comment
        const vendorAssignmentComment = ticket.comments.find(c => 
          !c.isStatusUpdate && 
          (c.comment.includes('ticket has been assigned to') || 
           c.comment.includes('Vendor/Contractor Assigned:') ||
           c.comment.includes('Vendor Assigned:') ||
           c.comment.includes('Contractor Assigned:'))
        );

        if (!vendorAssignmentComment) {
          skippedCount++;
          continue;
        }

        // Check if this was the first non-status comment from the landlord
        const nonStatusComments = ticket.comments.filter(c => !c.isStatusUpdate);
        const firstNonStatusComment = nonStatusComments[0];

        // If vendor assignment was the first comment and it's from landlord
        if (firstNonStatusComment && 
            firstNonStatusComment.id === vendorAssignmentComment.id &&
            vendorAssignmentComment.authorRole === 'landlord' &&
            (ticket.status === 'Pending' || ticket.status === 'New')) {
          
          // Check if "In Progress" status update already exists
          const hasInProgressUpdate = ticket.comments.some(c => 
            c.isStatusUpdate && 
            (c.newStatus === 'In Progress' || c.comment.includes('Ticket Update: In Progress'))
          );

          if (!hasInProgressUpdate) {
            // Update status to In Progress
            await prisma.maintenanceRequest.update({
              where: { id: ticket.id },
              data: {
                status: 'In Progress',
                updatedAt: new Date()
              }
            });

            // Add status update comment
            const landlordName = `${ticket.property.landlord.firstName} ${ticket.property.landlord.lastName}`;
            await prisma.maintenanceComment.create({
              data: {
                id: generateCUID(),
                maintenanceRequestId: ticket.id,
                authorEmail: ticket.property.landlord.email,
                authorName: landlordName,
                authorRole: 'landlord',
                comment: 'Ticket Update: In Progress',
                isStatusUpdate: true,
                oldStatus: ticket.status,
                newStatus: 'In Progress',
                createdAt: new Date(vendorAssignmentComment.createdAt.getTime() + 60000) // 1 minute after vendor assignment
              }
            });

            console.log(`✅ Fixed ticket ${ticket.ticketNumber || ticket.id} - Updated to In Progress`);
            fixedCount++;
          } else {
            console.log(`⏭️  Ticket ${ticket.ticketNumber || ticket.id} already has In Progress update`);
            skippedCount++;
          }
        } else {
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ticket ${ticket.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n✅ Fix completed:`);
    console.log(`- Fixed: ${fixedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Total: ${tickets.length}`);

  } catch (error) {
    console.error('❌ Error fixing vendor assignment status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixVendorAssignmentStatus()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

