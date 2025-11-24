/**
 * Lease Expiration Service
 * Handles lease expiration notifications and auto-conversion to month-to-month
 * Implements Business Rule 1: Lease Expiration and Auto-Renewal Logic
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');
const { sendLeaseRenewalReminder } = require('../email-templates/lease-renewal');

// Notification schedule (days before expiration)
const NOTIFICATION_DAYS = [90, 75, 65, 64, 63, 62, 61]; // 65-61 days = daily reminders
const ASSUME_MONTH_TO_MONTH_DAYS = 59; // If no response by 59 days, assume month-to-month

/**
 * Check for leases expiring soon and send notifications
 * @param {number} daysBeforeExpiration - Days before expiration to check
 * @returns {Promise<{checked: number, notified: number}>}
 */
async function checkExpiringLeases(daysBeforeExpiration) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expirationDate = new Date(today);
    expirationDate.setDate(expirationDate.getDate() + daysBeforeExpiration);
    expirationDate.setHours(23, 59, 59, 999);

    // Find active leases expiring on the target date
    const expiringLeases = await prisma.lease.findMany({
      where: {
        status: 'Active',
        leaseEnd: {
          not: null,
          gte: new Date(expirationDate.setHours(0, 0, 0, 0)),
          lte: new Date(expirationDate.setHours(23, 59, 59, 999)),
        },
      },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    countryCode: true,
                  },
                },
              },
            },
          },
        },
        leaseTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    let notified = 0;

    for (const lease of expiringLeases) {
      // Only process Ontario properties for now
      const isOntario = lease.unit.property.landlord.countryCode === 'CA' && 
                       (lease.unit.property.provinceState === 'ON' || 
                        lease.unit.property.provinceState === 'Ontario');

      if (!isOntario) {
        continue; // Skip non-Ontario properties for now
      }

      const daysRemaining = Math.ceil((new Date(lease.leaseEnd) - today) / (1000 * 60 * 60 * 24));

      // Check if we should send notification for this day
      if (!NOTIFICATION_DAYS.includes(daysRemaining)) {
        continue;
      }

      // Check if notification already sent for this day
      const lastNotification = await prisma.leaseNotification.findFirst({
        where: {
          leaseId: lease.id,
          notificationType: 'expiration_reminder',
          daysBeforeExpiration: daysRemaining,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastNotification) {
        continue; // Already sent
      }

      const landlord = lease.unit.property.landlord;
      const landlordName = `${landlord.firstName} ${landlord.lastName}`;
      const tenantNames = lease.leaseTenants.map(lt => `${lt.tenant.firstName} ${lt.tenant.lastName}`).join(', ');

      const leaseDetails = {
        propertyAddress: lease.unit.property.addressLine1,
        unitName: lease.unit.unitName,
        leaseEndDate: lease.leaseEnd,
        rentAmount: lease.rentAmount,
        landlordName: landlordName,
        tenantNames: tenantNames,
        daysRemaining: daysRemaining,
      };

      // Send email to landlord
      try {
        await sendLeaseRenewalReminder({
          recipientEmail: landlord.email,
          recipientName: landlordName,
          isLandlord: true,
          leaseDetails,
        });
      } catch (error) {
        console.error(`[Lease Expiration] Failed to send email to landlord ${landlord.id}:`, error);
      }

      // Send notification to landlord
      await createNotification({
        userId: landlord.id,
        userRole: 'landlord',
        userEmail: landlord.email,
        type: NOTIFICATION_TYPES.LEASE_EXPIRING,
        title: `Lease Expiring in ${daysRemaining} Days`,
        message: `Lease for ${lease.unit.property.addressLine1} ${lease.unit.unitName} expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. ${daysRemaining <= 61 ? 'Please confirm renewal or prepare for month-to-month conversion.' : 'Please discuss renewal with tenant.'}`,
        priority: daysRemaining <= 61 ? 'high' : 'normal',
        entityType: 'lease',
        entityId: lease.id,
        actionUrl: `/leases/${lease.id}`,
        actionLabel: 'View Lease',
        metadata: {
          daysRemaining,
          leaseEndDate: lease.leaseEnd.toISOString(),
        },
      });

      // Send email and notification to each tenant
      for (const leaseTenant of lease.leaseTenants) {
        try {
          await sendLeaseRenewalReminder({
            recipientEmail: leaseTenant.tenant.email,
            recipientName: `${leaseTenant.tenant.firstName} ${leaseTenant.tenant.lastName}`,
            isLandlord: false,
            leaseDetails,
          });
        } catch (error) {
          console.error(`[Lease Expiration] Failed to send email to tenant ${leaseTenant.tenant.id}:`, error);
        }

        await createNotification({
          userId: leaseTenant.tenant.id,
          userRole: 'tenant',
          userEmail: leaseTenant.tenant.email,
          type: NOTIFICATION_TYPES.LEASE_EXPIRING,
          title: `Lease Expiring in ${daysRemaining} Days`,
          message: `Your lease for ${lease.unit.property.addressLine1} ${lease.unit.unitName} expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. ${daysRemaining <= 61 ? 'Please confirm if you want to renew or continue month-to-month.' : 'Please discuss renewal with your landlord.'}`,
          priority: daysRemaining <= 61 ? 'high' : 'normal',
          entityType: 'lease',
          entityId: lease.id,
          actionUrl: `/leases/${lease.id}`,
          actionLabel: 'View Lease',
          metadata: {
            daysRemaining,
            leaseEndDate: lease.leaseEnd.toISOString(),
          },
        });
      }

      // Record notification sent
      await prisma.leaseNotification.create({
        data: {
          id: `lease_notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          leaseId: lease.id,
          notificationType: 'expiration_reminder',
          daysBeforeExpiration: daysRemaining,
          sentAt: new Date(),
        },
      });

      notified++;
    }

    return {
      checked: expiringLeases.length,
      notified,
    };
  } catch (error) {
    console.error('[Lease Expiration Service] Error:', error);
    throw error;
  }
}

/**
 * Auto-convert expired leases to month-to-month (Ontario properties only)
 * Should be called daily after lease expiration
 */
async function autoConvertToMonthToMonth() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find expired active leases (Ontario properties only)
    const expiredLeases = await prisma.lease.findMany({
      where: {
        status: 'Active',
        leaseEnd: {
          not: null,
          lt: today, // Expired
        },
        // Check if already converted
        NOT: {
          status: 'MonthToMonth',
        },
      },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    countryCode: true,
                  },
                },
              },
            },
          },
        },
        leaseTenants: {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    let converted = 0;
    const errors = [];

    for (const lease of expiredLeases) {
      // Only convert Ontario properties
      const isOntario = lease.unit.property.landlord.countryCode === 'CA' && 
                       (lease.unit.property.provinceState === 'ON' || 
                        lease.unit.property.provinceState === 'Ontario');

      if (!isOntario) {
        continue;
      }

      try {
        // Update lease status to MonthToMonth
        await prisma.lease.update({
          where: { id: lease.id },
          data: {
            status: 'MonthToMonth',
            leaseEnd: null, // Month-to-month has no end date
            updatedAt: new Date(),
          },
        });

        const landlord = lease.unit.property.landlord;
        const landlordName = `${landlord.firstName} ${landlord.lastName}`;

        // Notify landlord
        await createNotification({
          userId: landlord.id,
          userRole: 'landlord',
          userEmail: landlord.email,
          type: NOTIFICATION_TYPES.LEASE_CONVERTED,
          title: 'Lease Converted to Month-to-Month',
          message: `Lease for ${lease.unit.property.addressLine1} ${lease.unit.unitName} has been automatically converted to month-to-month as per Ontario law.`,
          priority: 'normal',
          entityType: 'lease',
          entityId: lease.id,
          actionUrl: `/leases/${lease.id}`,
          actionLabel: 'View Lease',
        });

        // Notify tenants
        for (const leaseTenant of lease.leaseTenants) {
          await createNotification({
            userId: leaseTenant.tenant.id,
            userRole: 'tenant',
            userEmail: leaseTenant.tenant.email,
            type: NOTIFICATION_TYPES.LEASE_CONVERTED,
            title: 'Lease Converted to Month-to-Month',
            message: `Your lease for ${lease.unit.property.addressLine1} ${lease.unit.unitName} has been automatically converted to month-to-month. All terms remain the same, and you can continue renting on a month-to-month basis.`,
            priority: 'normal',
            entityType: 'lease',
            entityId: lease.id,
            actionUrl: `/leases/${lease.id}`,
            actionLabel: 'View Lease',
          });
        }

        converted++;
      } catch (error) {
        errors.push(`Failed to convert lease ${lease.id}: ${error.message}`);
        console.error(`[Lease Expiration] Error converting lease ${lease.id}:`, error);
      }
    }

    return {
      checked: expiredLeases.length,
      converted,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('[Lease Expiration Service] Error in auto-convert:', error);
    throw error;
  }
}

/**
 * Check if lease should assume month-to-month (59 days before expiration, no response)
 */
async function assumeMonthToMonthForNoResponse() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + ASSUME_MONTH_TO_MONTH_DAYS);
    targetDate.setHours(23, 59, 59, 999);

    // Find leases expiring in 59 days that haven't been renewed
    const leasesToAssume = await prisma.lease.findMany({
      where: {
        status: 'Active',
        leaseEnd: {
          not: null,
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
        // Check if renewal decision has been made
        renewalDecision: null, // We'll add this field to schema
      },
      include: {
        unit: {
          include: {
            property: {
              include: {
                landlord: {
                  select: {
                    id: true,
                    countryCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // For now, just notify - actual conversion happens on expiration
    // This is a placeholder for future enhancement
    return {
      checked: leasesToAssume.length,
      assumed: 0, // Will be handled by auto-convert on expiration
    };
  } catch (error) {
    console.error('[Lease Expiration Service] Error in assume month-to-month:', error);
    throw error;
  }
}

module.exports = {
  checkExpiringLeases,
  autoConvertToMonthToMonth,
  assumeMonthToMonthForNoResponse,
  NOTIFICATION_DAYS,
  ASSUME_MONTH_TO_MONTH_DAYS,
};

