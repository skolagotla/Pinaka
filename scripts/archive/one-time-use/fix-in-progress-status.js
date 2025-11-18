/**
 * Script to fix existing tickets that should have changed to "In Progress" 
 * after the first comment but didn't get the status update
 * Run with: node scripts/fix-in-progress-status.js
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

async function fixInProgressStatus() {
  try {
    console.log('Starting In Progress status fix...');
    
    // Find all tickets that are still in "Pending" or "New" status
    const tickets = await prisma.maintenanceRequest.findMany({
      where: {
        status: {
          in: ['Pending', 'New']
        }
      },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' } // Oldest first
        },
        property: {
          include: {
            landlord: true
          }
        },
        tenant: true
      }
    });

    console.log(`Found ${tickets.length} tickets in Pending/New status`);

    if (tickets.length === 0) {
      console.log('No tickets found to update.');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const ticket of tickets) {
      try {
        // Get non-status comments
        const nonStatusComments = ticket.comments.filter(c => !c.isStatusUpdate);
        
        // If there's at least one non-status comment, the ticket should be "In Progress"
        if (nonStatusComments.length > 0) {
          // Check if "In Progress" status update already exists
          const hasInProgressUpdate = ticket.comments.some(c => 
            c.isStatusUpdate && 
            (c.newStatus === 'In Progress' || c.comment.includes('Ticket Update: In Progress'))
          );

          if (!hasInProgressUpdate) {
            // Find the first non-status comment
            const firstComment = nonStatusComments[0];
            
            // Calculate when the status update should have been added (1 minute after first comment)
            const statusUpdateTime = new Date(firstComment.createdAt);
            statusUpdateTime.setMinutes(statusUpdateTime.getMinutes() + 1);

            // Update status to In Progress
            await prisma.maintenanceRequest.update({
              where: { id: ticket.id },
              data: {
                status: 'In Progress',
                updatedAt: new Date()
              }
            });

            // Add status update comment (1 minute after first comment)
            const landlordName = `${ticket.property.landlord.firstName} ${ticket.property.landlord.lastName}`;
            const authorRole = firstComment.authorRole;
            const authorEmail = firstComment.authorEmail;
            const authorName = firstComment.authorName;

            await prisma.maintenanceComment.create({
              data: {
                id: generateCUID(),
                maintenanceRequestId: ticket.id,
                authorEmail,
                authorName,
                authorRole,
                comment: 'Ticket Update: In Progress',
                isStatusUpdate: true,
                oldStatus: ticket.status,
                newStatus: 'In Progress',
                createdAt: statusUpdateTime
              }
            });

            console.log(`✅ Fixed ticket ${ticket.ticketNumber || ticket.id} - Updated to In Progress`);
            fixedCount++;
          } else {
            // Status update exists but ticket status might be wrong
            if (ticket.status !== 'In Progress') {
              await prisma.maintenanceRequest.update({
                where: { id: ticket.id },
                data: {
                  status: 'In Progress',
                  updatedAt: new Date()
                }
              });
              console.log(`✅ Fixed ticket ${ticket.ticketNumber || ticket.id} - Status corrected to In Progress`);
              fixedCount++;
            } else {
              skippedCount++;
            }
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
    console.error('❌ Error fixing In Progress status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixInProgressStatus()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

