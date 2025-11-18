/**
 * Clear all data from database except landlord information
 * This will delete:
 * - All properties and their units
 * - All tenants
 * - All leases
 * - All maintenance requests
 * - All rent payments
 * - All expenses
 * - All documents
 * - All conversations/messages
 * - All tasks
 * - All vendors
 * - All inspection checklists
 * - All forms
 * - All activity logs
 * 
 * But will KEEP:
 * - Landlord records
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllDataExceptLandlords() {
  console.log('🗑️  Starting to clear all data except landlord information...\n');
  
  try {
    // Get counts before deletion
    const counts = {
      properties: await prisma.property.count(),
      units: await prisma.unit.count(),
      tenants: await prisma.tenant.count(),
      leases: await prisma.lease.count(),
      maintenanceRequests: await prisma.maintenanceRequest.count(),
      rentPayments: await prisma.rentPayment.count(),
      expenses: await prisma.expense.count(),
      documents: await prisma.document.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
      tasks: await prisma.task.count(),
      vendors: await prisma.vendor.count(),
      inspectionChecklists: await prisma.inspectionChecklist.count(),
      generatedForms: await prisma.generatedForm.count(),
      activityLogs: await prisma.activityLog.count(),
    };
    
    console.log('📊 Current data counts:');
    console.log(`  Properties: ${counts.properties}`);
    console.log(`  Units: ${counts.units}`);
    console.log(`  Tenants: ${counts.tenants}`);
    console.log(`  Leases: ${counts.leases}`);
    console.log(`  Maintenance Requests: ${counts.maintenanceRequests}`);
    console.log(`  Rent Payments: ${counts.rentPayments}`);
    console.log(`  Expenses: ${counts.expenses}`);
    console.log(`  Documents: ${counts.documents}`);
    console.log(`  Conversations: ${counts.conversations}`);
    console.log(`  Messages: ${counts.messages}`);
    console.log(`  Tasks: ${counts.tasks}`);
    console.log(`  Vendors: ${counts.vendors}`);
    console.log(`  Inspection Checklists: ${counts.inspectionChecklists}`);
    console.log(`  Generated Forms: ${counts.generatedForms}`);
    console.log(`  Activity Logs: ${counts.activityLogs}\n`);
    
    // Delete in order to respect foreign key constraints
    // Start with child records that don't have dependencies
    
    console.log('🗑️  Deleting data...\n');
    
    // 1. Activity Logs (no dependencies)
    if (counts.activityLogs > 0) {
      await prisma.activityLog.deleteMany({});
      console.log(`✅ Deleted ${counts.activityLogs} activity log records`);
    }
    
    // 2. Message Notifications (before messages)
    const notificationCount = await prisma.messageNotification.count();
    if (notificationCount > 0) {
      await prisma.messageNotification.deleteMany({});
      console.log(`✅ Deleted ${notificationCount} message notification records`);
    }
    
    // 3. Messages (before conversations)
    if (counts.messages > 0) {
      await prisma.message.deleteMany({});
      console.log(`✅ Deleted ${counts.messages} message records`);
    }
    
    // 4. Conversations
    if (counts.conversations > 0) {
      await prisma.conversation.deleteMany({});
      console.log(`✅ Deleted ${counts.conversations} conversation records`);
    }
    
    // 5. Task Reminders (before tasks)
    const reminderCount = await prisma.taskReminder.count();
    if (reminderCount > 0) {
      await prisma.taskReminder.deleteMany({});
      console.log(`✅ Deleted ${reminderCount} task reminder records`);
    }
    
    // 6. Tasks
    if (counts.tasks > 0) {
      await prisma.task.deleteMany({});
      console.log(`✅ Deleted ${counts.tasks} task records`);
    }
    
    // 7. Inspection Checklist Items (before checklists)
    const checklistItemCount = await prisma.inspectionChecklistItem.count();
    if (checklistItemCount > 0) {
      await prisma.inspectionChecklistItem.deleteMany({});
      console.log(`✅ Deleted ${checklistItemCount} inspection checklist item records`);
    }
    
    // 8. Inspection Checklists
    if (counts.inspectionChecklists > 0) {
      await prisma.inspectionChecklist.deleteMany({});
      console.log(`✅ Deleted ${counts.inspectionChecklists} inspection checklist records`);
    }
    
    // 9. Document Audit Logs (before documents)
    const docAuditCount = await prisma.documentAuditLog.count();
    if (docAuditCount > 0) {
      await prisma.documentAuditLog.deleteMany({});
      console.log(`✅ Deleted ${docAuditCount} document audit log records`);
    }
    
    // 10. Document Messages (before documents)
    const docMessageCount = await prisma.documentMessage.count();
    if (docMessageCount > 0) {
      await prisma.documentMessage.deleteMany({});
      console.log(`✅ Deleted ${docMessageCount} document message records`);
    }
    
    // 11. Documents
    if (counts.documents > 0) {
      await prisma.document.deleteMany({});
      console.log(`✅ Deleted ${counts.documents} document records`);
    }
    
    // 12. Generated Forms
    if (counts.generatedForms > 0) {
      await prisma.generatedForm.deleteMany({});
      console.log(`✅ Deleted ${counts.generatedForms} generated form records`);
    }
    
    // 13. Maintenance Comments (before maintenance requests)
    const maintenanceCommentCount = await prisma.maintenanceComment.count();
    if (maintenanceCommentCount > 0) {
      await prisma.maintenanceComment.deleteMany({});
      console.log(`✅ Deleted ${maintenanceCommentCount} maintenance comment records`);
    }
    
    // 14. Maintenance Requests
    if (counts.maintenanceRequests > 0) {
      await prisma.maintenanceRequest.deleteMany({});
      console.log(`✅ Deleted ${counts.maintenanceRequests} maintenance request records`);
    }
    
    // 15. Partial Payments (before rent payments)
    const partialPaymentCount = await prisma.partialPayment.count();
    if (partialPaymentCount > 0) {
      await prisma.partialPayment.deleteMany({});
      console.log(`✅ Deleted ${partialPaymentCount} partial payment records`);
    }
    
    // 16. Rent Payments
    if (counts.rentPayments > 0) {
      await prisma.rentPayment.deleteMany({});
      console.log(`✅ Deleted ${counts.rentPayments} rent payment records`);
    }
    
    // 17. Expenses
    if (counts.expenses > 0) {
      await prisma.expense.deleteMany({});
      console.log(`✅ Deleted ${counts.expenses} expense records`);
    }
    
    // 18. Lease Tenants (before leases)
    const leaseTenantCount = await prisma.leaseTenant.count();
    if (leaseTenantCount > 0) {
      await prisma.leaseTenant.deleteMany({});
      console.log(`✅ Deleted ${leaseTenantCount} lease tenant records`);
    }
    
    // 19. Leases
    if (counts.leases > 0) {
      await prisma.lease.deleteMany({});
      console.log(`✅ Deleted ${counts.leases} lease records`);
    }
    
    // 20. Emergency Contacts (before tenants)
    const emergencyContactCount = await prisma.emergencyContact.count();
    if (emergencyContactCount > 0) {
      await prisma.emergencyContact.deleteMany({});
      console.log(`✅ Deleted ${emergencyContactCount} emergency contact records`);
    }
    
    // 21. Employment Documents (before employers)
    const employmentDocCount = await prisma.employmentDocument.count();
    if (employmentDocCount > 0) {
      await prisma.employmentDocument.deleteMany({});
      console.log(`✅ Deleted ${employmentDocCount} employment document records`);
    }
    
    // 22. Employers (before tenants)
    const employerCount = await prisma.employer.count();
    if (employerCount > 0) {
      await prisma.employer.deleteMany({});
      console.log(`✅ Deleted ${employerCount} employer records`);
    }
    
    // 23. Tenants
    if (counts.tenants > 0) {
      await prisma.tenant.deleteMany({});
      console.log(`✅ Deleted ${counts.tenants} tenant records`);
    }
    
    // 24. Units (before properties - cascade will handle this, but explicit for clarity)
    if (counts.units > 0) {
      await prisma.unit.deleteMany({});
      console.log(`✅ Deleted ${counts.units} unit records`);
    }
    
    // 25. Properties (last, as it may cascade to units)
    if (counts.properties > 0) {
      await prisma.property.deleteMany({});
      console.log(`✅ Deleted ${counts.properties} property records`);
    }
    
    // 26. Vendors
    if (counts.vendors > 0) {
      await prisma.vendor.deleteMany({});
      console.log(`✅ Deleted ${counts.vendors} vendor records`);
    }
    
    // Verify deletion
    console.log('\n📊 Verification:');
    const finalCounts = {
      properties: await prisma.property.count(),
      units: await prisma.unit.count(),
      tenants: await prisma.tenant.count(),
      leases: await prisma.lease.count(),
      maintenanceRequests: await prisma.maintenanceRequest.count(),
      rentPayments: await prisma.rentPayment.count(),
      expenses: await prisma.expense.count(),
      documents: await prisma.document.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
      tasks: await prisma.task.count(),
      vendors: await prisma.vendor.count(),
      inspectionChecklists: await prisma.inspectionChecklist.count(),
      generatedForms: await prisma.generatedForm.count(),
      activityLogs: await prisma.activityLog.count(),
    };
    
    const landlordsCount = await prisma.landlord.count();
    
    console.log(`  Properties: ${finalCounts.properties} (was ${counts.properties})`);
    console.log(`  Units: ${finalCounts.units} (was ${counts.units})`);
    console.log(`  Tenants: ${finalCounts.tenants} (was ${counts.tenants})`);
    console.log(`  Leases: ${finalCounts.leases} (was ${counts.leases})`);
    console.log(`  Maintenance Requests: ${finalCounts.maintenanceRequests} (was ${counts.maintenanceRequests})`);
    console.log(`  Rent Payments: ${finalCounts.rentPayments} (was ${counts.rentPayments})`);
    console.log(`  Expenses: ${finalCounts.expenses} (was ${counts.expenses})`);
    console.log(`  Documents: ${finalCounts.documents} (was ${counts.documents})`);
    console.log(`  Conversations: ${finalCounts.conversations} (was ${counts.conversations})`);
    console.log(`  Messages: ${finalCounts.messages} (was ${counts.messages})`);
    console.log(`  Tasks: ${finalCounts.tasks} (was ${counts.tasks})`);
    console.log(`  Vendors: ${finalCounts.vendors} (was ${counts.vendors})`);
    console.log(`  Inspection Checklists: ${finalCounts.inspectionChecklists} (was ${counts.inspectionChecklists})`);
    console.log(`  Generated Forms: ${finalCounts.generatedForms} (was ${counts.generatedForms})`);
    console.log(`  Activity Logs: ${finalCounts.activityLogs} (was ${counts.activityLogs})`);
    console.log(`\n✅ Landlords preserved: ${landlordsCount}`);
    
    console.log('\n🎉 All data cleared successfully (except landlords)!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearAllDataExceptLandlords()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

