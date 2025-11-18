/**
 * Script to update existing status update messages to be friendly and professional
 * Run with: node scripts/update-status-messages.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Function to generate friendly status message
function generateFriendlyStatusMessage(oldStatus, newStatus, authorRole, landlordName, tenantName) {
  const actorName = authorRole === "landlord" ? landlordName : tenantName;
  
  if (newStatus === "Closed" && oldStatus !== "Closed") {
    return `${actorName} asked to close the Case`;
  } else if (oldStatus === "New" && newStatus === "Pending") {
    return `Case Reviewed, Status : Pending`;
  } else if (oldStatus === "Pending" && newStatus === "In Progress") {
    return `Case Status now is In Progress`;
  } else if (oldStatus === "Closed" && newStatus !== "Closed") {
    return `Ticket reopened. Status changed to ${newStatus}.`;
  } else {
    return `Status updated to ${newStatus}.`;
  }
}

async function updateStatusMessages() {
  try {
    console.log('Starting status message update...');
    
    // Get all status update comments
    const statusComments = await prisma.maintenanceComment.findMany({
      where: {
        isStatusUpdate: true
      },
      include: {
        maintenanceRequest: {
          include: {
            property: {
              include: {
                landlord: true
              }
            },
            tenant: true
          }
        }
      }
    });
    
    console.log(`Found ${statusComments.length} status update comments to review...`);
    
    let updatedCount = 0;
    const updates = [];
    
    for (const comment of statusComments) {
      const { oldStatus, newStatus, authorRole, comment: currentMessage } = comment;
      const landlordName = `${comment.maintenanceRequest.property.landlord.firstName} ${comment.maintenanceRequest.property.landlord.lastName}`;
      const tenantName = `${comment.maintenanceRequest.tenant.firstName} ${comment.maintenanceRequest.tenant.lastName}`;
      
      // Generate new friendly message
      const newMessage = generateFriendlyStatusMessage(
        oldStatus || 'New',
        newStatus || 'Pending',
        authorRole,
        landlordName,
        tenantName
      );
      
      // Only update if message is different and matches old patterns
      const oldPatterns = [
        /has acknowledged the ticket and we are now in/,
        /has viewed your case/,
        /has viewed this case/,
        /has started working on this case/,
        /has marked this case as closed/,
        /Status changed from/
      ];
      
      const needsUpdate = oldPatterns.some(pattern => pattern.test(currentMessage)) || 
                         currentMessage.includes('acknowledged') ||
                         currentMessage.includes('viewed');
      
      if (needsUpdate && currentMessage !== newMessage) {
        updates.push({
          id: comment.id,
          newMessage
        });
      }
    }
    
    console.log(`\nUpdating ${updates.length} status messages...`);
    
    // Update in batches
    for (const update of updates) {
      await prisma.maintenanceComment.update({
        where: { id: update.id },
        data: { comment: update.newMessage }
      });
      updatedCount++;
    }
    
    console.log(`✅ Successfully updated ${updatedCount} status messages`);
    
  } catch (error) {
    console.error('❌ Error updating status messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateStatusMessages()
  .then(() => {
    console.log('✅ Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });

