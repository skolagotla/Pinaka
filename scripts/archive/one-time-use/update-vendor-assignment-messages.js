/**
 * Script to update existing vendor assignment comments to the new friendly format
 * Run with: node scripts/update-vendor-assignment-messages.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVendorAssignmentMessages() {
  try {
    console.log('Starting vendor assignment message update...');
    
    // Find all comments that contain vendor assignment information
    const comments = await prisma.maintenanceComment.findMany({
      where: {
        OR: [
          { comment: { contains: 'Vendor/Contractor Assigned:' } },
          { comment: { contains: 'Vendor Assigned:' } },
          { comment: { contains: 'Contractor Assigned:' } }
        ]
      },
      include: {
        maintenanceRequest: {
          include: {
            property: true,
            tenant: true
          }
        }
      }
    });

    console.log(`Found ${comments.length} vendor assignment comments to update`);

    if (comments.length === 0) {
      console.log('No vendor assignment comments found. Nothing to update.');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const comment of comments) {
      try {
        // Extract vendor information from the old comment format
        const oldComment = comment.comment;
        
        // Pattern: "Vendor/Contractor Assigned: [Business Name] Phone: [phone] Email: [email]"
        // or variations like "Vendor Assigned: ..." or "Contractor Assigned: ..."
        
        // Try to extract vendor name
        const vendorNameMatch = oldComment.match(/(?:Vendor\/Contractor|Vendor|Contractor)\s+Assigned:\s*([^\n]+)/i);
        if (!vendorNameMatch) {
          console.log(`⚠️  Could not parse comment ${comment.id}, skipping...`);
          skippedCount++;
          continue;
        }

        const vendorName = vendorNameMatch[1].trim();
        
        // Extract phone
        const phoneMatch = oldComment.match(/Phone:\s*([^\n]+)/i);
        const phone = phoneMatch ? phoneMatch[1].trim() : null;
        
        // Extract email
        const emailMatch = oldComment.match(/Email:\s*([^\n]+)/i);
        const email = emailMatch ? emailMatch[1].trim() : null;

        // Try to get vendor details from database if we have the maintenance request
        let contactPerson = vendorName; // Default to vendor name
        let businessName = vendorName;
        
        if (comment.maintenanceRequest?.assignedToVendorId) {
          try {
            const vendor = await prisma.vendor.findUnique({
              where: { id: comment.maintenanceRequest.assignedToVendorId }
            });
            
            if (vendor) {
              businessName = vendor.businessName || vendor.name;
              contactPerson = vendor.name;
              // Use vendor data if available, otherwise use extracted data
              const vendorPhone = vendor.phone || phone;
              const vendorEmail = vendor.email || email;
              
              // Build new message
              let contactInfo = '';
              if (vendorPhone && vendorEmail) {
                contactInfo = `Phone: ${vendorPhone} or Email: ${vendorEmail}`;
              } else if (vendorPhone) {
                contactInfo = `Phone: ${vendorPhone}`;
              } else if (vendorEmail) {
                contactInfo = `Email: ${vendorEmail}`;
              }

              const newComment = `Your ticket has been assigned to ${businessName}, please get in touch with ${contactPerson}${contactInfo ? ` at ${contactInfo}` : ''} to schedule an appointment.`;

              await prisma.maintenanceComment.update({
                where: { id: comment.id },
                data: { comment: newComment }
              });

              console.log(`✅ Updated comment ${comment.id}`);
              updatedCount++;
              continue;
            }
          } catch (error) {
            console.log(`⚠️  Error fetching vendor for comment ${comment.id}:`, error.message);
          }
        }

        // If we couldn't get vendor from DB, use extracted data
        // Try to infer contact person name (usually the part before the business name or email domain)
        if (email) {
          const emailName = email.split('@')[0].replace(/[._]/g, ' ');
          // Capitalize first letter of each word
          contactPerson = emailName.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        }

        // Build new message with extracted data
        let contactInfo = '';
        if (phone && email) {
          contactInfo = `Phone: ${phone} or Email: ${email}`;
        } else if (phone) {
          contactInfo = `Phone: ${phone}`;
        } else if (email) {
          contactInfo = `Email: ${email}`;
        }

        const newComment = `Your ticket has been assigned to ${businessName}, please get in touch with ${contactPerson}${contactInfo ? ` at ${contactInfo}` : ''} to schedule an appointment.`;

        await prisma.maintenanceComment.update({
          where: { id: comment.id },
          data: { comment: newComment }
        });

        console.log(`✅ Updated comment ${comment.id}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error updating comment ${comment.id}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n✅ Update completed:`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Total: ${comments.length}`);

  } catch (error) {
    console.error('❌ Error updating vendor assignment messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateVendorAssignmentMessages()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

