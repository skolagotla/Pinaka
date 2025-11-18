/**
 * Document Expiration Checker
 * Run this script daily to check for expiring documents and send reminders
 * 
 * Usage:
 * node scripts/check-document-expiration.js
 * 
 * Or set up as a cron job:
 * 0 9 * * * cd /path/to/pinaka && node scripts/check-document-expiration.js
 */

const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const prisma = new PrismaClient();

const {
  sendExpirationReminder,
  sendPostLeaseDocumentReminder,
  sendLandlordExpirationNotification,
} = require('@/lib/email/document-notifications');

const { getCategoryById } = require('@/lib/constants/document-categories');

/**
 * Check documents with expiration dates
 */
async function checkExpiringDocuments() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 Document Expiration Checker');
  console.log(`⏰ Run Time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get all documents with expiration dates
    const documents = await prisma.document.findMany({
      where: {
        expirationDate: {
          not: null,
        },
      },
      include: {
        tenant: {
          include: {
            leaseTenants: {
              include: {
                lease: {
                  include: {
                    unit: {
                      include: {
                        property: {
                          include: {
                            landlord: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`📄 Found ${documents.length} documents with expiration dates\n`);

    if (documents.length === 0) {
      console.log('✅ No documents to check. Exiting.\n');
      return { success: true, checked: 0, reminders: 0 };
    }

    let remindersSent = 0;
    let remindersSkipped = 0;
    let remindersFailed = 0;

    // Group documents by landlord for landlord notifications
    const landlordDocuments = new Map();

    for (const document of documents) {
      const now = dayjs();
      const expiry = dayjs(document.expirationDate);
      const daysRemaining = expiry.diff(now, 'day');

      const category = getCategoryById(document.category);
      const tenant = document.tenant;

      // Get landlord from tenant's lease
      const landlord = tenant.leaseTenants[0]?.lease?.unit?.property?.landlord;

      if (!landlord) {
        console.log(`⚠️  Skipping ${document.originalName} - No landlord found for tenant ${tenant.firstName} ${tenant.lastName}`);
        continue;
      }

      console.log(`🔍 Checking: ${document.originalName}`);
      console.log(`   Tenant: ${tenant.firstName} ${tenant.lastName}`);
      console.log(`   Category: ${category?.name || document.category}`);
      console.log(`   Expires: ${expiry.format('YYYY-MM-DD')} (${daysRemaining} days)`);

      // Determine if we should send a reminder
      let shouldSendReminder = false;
      let reminderType = null;

      if (category && category.expirationReminders) {
        // Check if days remaining matches any reminder threshold
        if (category.expirationReminders.includes(daysRemaining)) {
          shouldSendReminder = true;
          reminderType = daysRemaining <= 7 ? 'urgent' : 'warning';
          console.log(`   ⚠️  Reminder threshold reached: ${daysRemaining} days`);
        }
      }

      // Also send for expired documents (once)
      if (daysRemaining < 0 && daysRemaining >= -1) {
        shouldSendReminder = true;
        reminderType = 'expired';
        console.log(`   🚨 Document expired!`);
      }

      if (!shouldSendReminder) {
        console.log(`   ✓ No reminder needed at this time`);
        remindersSkipped++;
        console.log('');
        continue;
      }

      // Check if reminder was already sent today
      const reminderSentToday = document.reminderSentAt && 
        dayjs(document.reminderSentAt).isSame(now, 'day');

      if (reminderSentToday) {
        console.log(`   ⏭️  Reminder already sent today`);
        remindersSkipped++;
        console.log('');
        continue;
      }

      // Send reminder email
      console.log(`   📧 Sending ${reminderType} reminder to ${tenant.email}...`);
      
      const emailResult = await sendExpirationReminder(
        tenant,
        document,
        landlord,
        daysRemaining
      );

      if (emailResult.success) {
        // Update reminder status
        await prisma.document.update({
          where: { id: document.id },
          data: {
            reminderSent: true,
            reminderSentAt: new Date(),
          },
        });

        console.log(`   ✅ Reminder sent successfully`);
        remindersSent++;

        // Add to landlord notification list
        if (!landlordDocuments.has(landlord.id)) {
          landlordDocuments.set(landlord.id, {
            landlord,
            documents: [],
          });
        }

        landlordDocuments.get(landlord.id).documents.push({
          document,
          tenant,
          daysRemaining,
          reminderType,
        });
      } else {
        console.log(`   ❌ Failed to send reminder: ${emailResult.error}`);
        remindersFailed++;
      }

      console.log('');
    }

    // Send landlord notifications
    console.log('\n📬 Sending landlord notifications...\n');

    for (const [landlordId, data] of landlordDocuments) {
      console.log(`📧 Notifying ${data.landlord.firstName} ${data.landlord.lastName} about ${data.documents.length} document(s)...`);
      
      const emailResult = await sendLandlordExpirationNotification(
        data.landlord,
        data.documents
      );

      if (emailResult.success) {
        console.log(`   ✅ Landlord notification sent`);
      } else {
        console.log(`   ❌ Failed to send landlord notification`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 Documents Checked: ${documents.length}`);
    console.log(`✅ Reminders Sent: ${remindersSent}`);
    console.log(`⏭️  Reminders Skipped: ${remindersSkipped}`);
    console.log(`❌ Reminders Failed: ${remindersFailed}`);
    console.log(`📬 Landlords Notified: ${landlordDocuments.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      checked: documents.length,
      reminders: remindersSent,
      skipped: remindersSkipped,
      failed: remindersFailed,
      landlordsNotified: landlordDocuments.size,
    };
  } catch (error) {
    console.error('\n❌ Error checking document expiration:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check post-lease required documents (Updated ID)
 */
async function checkPostLeaseDocuments() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 Post-Lease Document Checker');
  console.log(`⏰ Run Time: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get all active leases
    const activeLeases = await prisma.lease.findMany({
      where: {
        status: 'Active',
      },
      include: {
        leaseTenants: {
          include: {
            tenant: {
              include: {
                documents: true,
              },
            },
          },
        },
        unit: {
          include: {
            property: {
              include: {
                landlord: true,
              },
            },
          },
        },
      },
    });

    console.log(`📋 Found ${activeLeases.length} active leases\n`);

    if (activeLeases.length === 0) {
      console.log('✅ No active leases to check. Exiting.\n');
      return { success: true, checked: 0, reminders: 0 };
    }

    let remindersSent = 0;
    let remindersSkipped = 0;

    for (const lease of activeLeases) {
      const leaseStart = dayjs(lease.leaseStart);
      const now = dayjs();
      const daysSinceLeaseStart = now.diff(leaseStart, 'day');

      // Check for Updated ID requirement (due 30 days after lease)
      const updateIdDueDate = leaseStart.add(30, 'day');
      const daysUntilDue = updateIdDueDate.diff(now, 'day');
      const daysOverdue = now.diff(updateIdDueDate, 'day');

      for (const lt of lease.leaseTenants) {
        const tenant = lt.tenant;
        const documents = tenant.documents || [];

        console.log(`🔍 Checking: ${tenant.firstName} ${tenant.lastName}`);
        console.log(`   Lease Start: ${leaseStart.format('YYYY-MM-DD')}`);
        console.log(`   Days Since Start: ${daysSinceLeaseStart}`);

        // Check if Updated ID document exists
        const hasUpdatedId = documents.some(doc => doc.category === 'UPDATED_ID');

        if (hasUpdatedId) {
          console.log(`   ✓ Updated ID already uploaded`);
          remindersSkipped++;
          console.log('');
          continue;
        }

        // Send reminders at 20 days and 28 days, or if overdue
        let shouldSendReminder = false;

        if (daysOverdue > 0) {
          // Overdue - send reminder every 7 days
          if (daysOverdue % 7 === 0) {
            shouldSendReminder = true;
            console.log(`   🚨 Document ${daysOverdue} days overdue!`);
          }
        } else if (daysUntilDue === 10 || daysUntilDue === 2) {
          // Send at 10 days before due (20 days after lease) and 2 days before due (28 days after lease)
          shouldSendReminder = true;
          console.log(`   ⚠️  Document due in ${daysUntilDue} days`);
        }

        if (!shouldSendReminder) {
          console.log(`   ✓ No reminder needed at this time`);
          remindersSkipped++;
          console.log('');
          continue;
        }

        const landlord = lease.unit.property.landlord;

        // Send reminder email
        console.log(`   📧 Sending reminder to ${tenant.email}...`);

        const emailResult = await sendPostLeaseDocumentReminder(
          tenant,
          { category: 'UPDATED_ID' },
          landlord,
          daysOverdue > 0 ? daysOverdue : 0
        );

        if (emailResult.success) {
          console.log(`   ✅ Reminder sent successfully`);
          remindersSent++;
        } else {
          console.log(`   ❌ Failed to send reminder`);
        }

        console.log('');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Leases Checked: ${activeLeases.length}`);
    console.log(`✅ Reminders Sent: ${remindersSent}`);
    console.log(`⏭️  Reminders Skipped: ${remindersSkipped}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      checked: activeLeases.length,
      reminders: remindersSent,
      skipped: remindersSkipped,
    };
  } catch (error) {
    console.error('\n❌ Error checking post-lease documents:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🚀 Starting Document Expiration Check...\n');

  // Check expiring documents
  const expiringResult = await checkExpiringDocuments();

  // Check post-lease documents
  const postLeaseResult = await checkPostLeaseDocuments();

  console.log('\n✨ Document expiration check completed!\n');

  return {
    expiring: expiringResult,
    postLease: postLeaseResult,
  };
}

// Run the script
main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

