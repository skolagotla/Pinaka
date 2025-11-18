/**
 * Check for recent database changes (last 2 hours)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentChanges() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 CHECKING DATABASE FOR RECENT CHANGES (Last 2 Hours)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Time Range: ${twoHoursAgo.toISOString()} to ${new Date().toISOString()}\n`);

  try {
    // Check ActivityLogs
    console.log('📋 Activity Logs:');
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    console.log(`   Found ${activityLogs.length} activity log entries`);
    if (activityLogs.length > 0) {
      activityLogs.forEach(log => {
        console.log(`   - [${log.createdAt.toISOString()}] ${log.userRole}: ${log.action} on ${log.entityType} (${log.entityId})`);
      });
    }
    console.log('');

    // Check AdminAuditLogs
    console.log('👤 Admin Audit Logs:');
    const adminLogs = await prisma.adminAuditLog.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      include: {
        admin: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    console.log(`   Found ${adminLogs.length} admin audit log entries`);
    if (adminLogs.length > 0) {
      adminLogs.forEach(log => {
        console.log(`   - [${log.createdAt.toISOString()}] ${log.admin?.email || 'Unknown'}: ${log.action} on ${log.resource || 'N/A'}`);
      });
    }
    console.log('');

    // Check Properties
    console.log('🏠 Properties:');
    const properties = await prisma.property.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        propertyId: true,
        propertyName: true,
        addressLine1: true,
        city: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${properties.length} new properties`);
    if (properties.length > 0) {
      properties.forEach(prop => {
        console.log(`   - [${prop.createdAt.toISOString()}] ${prop.propertyName || prop.addressLine1} (${prop.propertyId})`);
      });
    }
    console.log('');

    // Check Landlords
    console.log('👔 Landlords:');
    const landlords = await prisma.landlord.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        landlordId: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${landlords.length} new landlords`);
    if (landlords.length > 0) {
      landlords.forEach(landlord => {
        console.log(`   - [${landlord.createdAt.toISOString()}] ${landlord.firstName} ${landlord.lastName} (${landlord.email})`);
      });
    }
    console.log('');

    // Check Tenants
    console.log('🏘️ Tenants:');
    const tenants = await prisma.tenant.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${tenants.length} new tenants`);
    if (tenants.length > 0) {
      tenants.forEach(tenant => {
        console.log(`   - [${tenant.createdAt.toISOString()}] ${tenant.firstName} ${tenant.lastName} (${tenant.email})`);
      });
    }
    console.log('');

    // Check Maintenance Requests
    console.log('🔧 Maintenance Requests:');
    const maintenance = await prisma.maintenanceRequest.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${maintenance.length} new maintenance requests`);
    if (maintenance.length > 0) {
      maintenance.forEach(mr => {
        console.log(`   - [${mr.createdAt.toISOString()}] ${mr.title} (Status: ${mr.status})`);
      });
    }
    console.log('');

    // Check PMCLandlordApproval
    console.log('✅ PMC-Landlord Approvals:');
    const approvals = await prisma.pMCLandlordApproval.findMany({
      where: {
        requestedAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        approvalType: true,
        status: true,
        title: true,
        requestedAt: true,
      },
    });
    console.log(`   Found ${approvals.length} new approval requests`);
    if (approvals.length > 0) {
      approvals.forEach(approval => {
        console.log(`   - [${approval.requestedAt.toISOString()}] ${approval.approvalType}: ${approval.title} (Status: ${approval.status})`);
      });
    }
    console.log('');

    // Check Notifications
    console.log('🔔 Notifications:');
    const notifications = await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        userRole: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${notifications.length} new notifications`);
    if (notifications.length > 0) {
      notifications.forEach(notif => {
        console.log(`   - [${notif.createdAt.toISOString()}] ${notif.userRole}: ${notif.type} - ${notif.title}`);
      });
    }
    console.log('');

    // Check Invitations
    console.log('📧 Invitations:');
    const invitations = await prisma.invitation.findMany({
      where: {
        createdAt: {
          gte: twoHoursAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        email: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });
    console.log(`   Found ${invitations.length} new invitations`);
    if (invitations.length > 0) {
      invitations.forEach(inv => {
        console.log(`   - [${inv.createdAt.toISOString()}] ${inv.type} invitation to ${inv.email} (Status: ${inv.status})`);
      });
    }
    console.log('');

    // Check for recent schema changes (check if any tables have recent records)
    console.log('📊 Summary:');
    const summary = {
      activityLogs: activityLogs.length,
      adminLogs: adminLogs.length,
      properties: properties.length,
      landlords: landlords.length,
      tenants: tenants.length,
      maintenance: maintenance.length,
      approvals: approvals.length,
      notifications: notifications.length,
      invitations: invitations.length,
    };
    
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    console.log(`   Total recent records: ${total}`);
    Object.entries(summary).forEach(([key, value]) => {
      if (value > 0) {
        console.log(`   - ${key}: ${value}`);
      }
    });

    if (total === 0) {
      console.log('\n✅ No recent database changes found in the last 2 hours.');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentChanges();

