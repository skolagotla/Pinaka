/**
 * Script to update existing approval messages in maintenance comments
 * Changes "Ticket has been closed and approved." to "Ticket has been approved to close."
 * Run with: node scripts/update-approval-messages.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateApprovalMessages() {
  try {
    console.log('Starting approval message update...');
    
    // Find all comments with the old approval message
    const comments = await prisma.maintenanceComment.findMany({
      where: {
        comment: {
          contains: 'Ticket has been closed and approved.'
        }
      }
    });
    
    console.log(`Found ${comments.length} comments with old approval message...`);
    
    if (comments.length === 0) {
      console.log('No comments found to update.');
      return;
    }
    
    // Update each comment
    let updatedCount = 0;
    const updates = [];
    
    for (const comment of comments) {
      const newMessage = comment.comment.replace(
        'Ticket has been closed and approved.',
        'Ticket has been approved to close.'
      );
      
      if (comment.comment !== newMessage) {
        updates.push(
          prisma.maintenanceComment.update({
            where: { id: comment.id },
            data: { comment: newMessage }
          })
        );
        updatedCount++;
      }
    }
    
    if (updates.length > 0) {
      console.log(`\nUpdating ${updates.length} approval messages...`);
      await prisma.$transaction(updates);
      console.log(`✅ Successfully updated ${updates.length} approval messages`);
    } else {
      console.log('No approval messages needed updating.');
    }
    
  } catch (error) {
    console.error('❌ Error updating approval messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateApprovalMessages()
  .then(() => {
    console.log('✅ Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });

