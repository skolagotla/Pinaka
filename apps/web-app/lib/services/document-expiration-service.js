/**
 * Document Expiration Service
 * Tracks and alerts on expiring documents
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Check for expiring documents
 * Supports multiple reminder thresholds: 54, 30, and 15 days before expiration
 */
async function checkExpiringDocuments(daysBeforeExpiration = 30) {
  try {
    const today = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysBeforeExpiration);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        expirationDate: {
          gte: today,
          lte: expirationDate,
        },
        isDeleted: false,
        reminderSent: false, // Only get documents that haven't been reminded yet
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
        property: {
          include: {
            landlord: true,
          },
        },
      },
    });

    const notifications = [];

    for (const doc of expiringDocuments) {
      const daysRemaining = Math.ceil((new Date(doc.expirationDate) - today) / (1000 * 60 * 60 * 24));

      // Only send notification if this document matches the target days threshold
      // Allow multiple reminders (54, 30, 15 days) by checking if we're within the threshold range
      if (daysRemaining > daysBeforeExpiration || daysRemaining < (daysBeforeExpiration - 1)) {
        continue; // Skip if not at the target threshold
      }

      // Check if reminder was already sent today for this threshold
      if (doc.reminderSentAt) {
        const lastReminderDate = new Date(doc.reminderSentAt);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        if (lastReminderDate >= todayStart) {
          continue; // Already reminded today
        }
      }

      // Notify tenant
      if (doc.tenant) {
        await createNotification({
          userId: doc.tenant.id,
          userRole: 'tenant',
          userEmail: doc.tenant.email,
          type: NOTIFICATION_TYPES.DOCUMENT_EXPIRING,
          title: 'Document Expiring Soon',
          message: `Your document "${doc.originalName}" (${doc.category}) will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Please upload a new version.`,
          priority: daysRemaining <= 7 ? 'high' : 'normal',
          entityType: 'document',
          entityId: doc.id,
          actionUrl: `/documents?tab=library`,
          actionLabel: 'View Document',
        });
      }

      // Notify landlord
      const landlord = doc.property?.landlord || doc.tenant?.leaseTenants[0]?.lease?.unit?.property?.landlord;
      if (landlord) {
        await createNotification({
          userId: landlord.id,
          userRole: 'landlord',
          userEmail: landlord.email,
          type: NOTIFICATION_TYPES.DOCUMENT_EXPIRING,
          title: 'Tenant Document Expiring',
          message: `Document "${doc.originalName}" for tenant ${doc.tenant?.firstName} ${doc.tenant?.lastName} will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`,
          priority: daysRemaining <= 7 ? 'high' : 'normal',
          entityType: 'document',
          entityId: doc.id,
          actionUrl: `/tenants`,
          actionLabel: 'View Tenant',
        });
      }

      // Mark reminder as sent
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          reminderSent: true,
          reminderSentAt: new Date(),
        },
      });
    }

    return {
      checked: expiringDocuments.length,
      notified: notifications.length,
    };
  } catch (error) {
    console.error('[Document Expiration Service] Error:', error);
    throw error;
  }
}

/**
 * Check for expired documents
 */
async function checkExpiredDocuments() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredDocuments = await prisma.document.findMany({
      where: {
        expirationDate: {
          lt: today,
        },
        isDeleted: false,
        reminderSent: true, // Only get documents that were reminded but still expired
      },
      include: {
        tenant: true,
        property: {
          include: {
            landlord: true,
          },
        },
      },
    });

    for (const doc of expiredDocuments) {
      // Notify tenant
      if (doc.tenant) {
        await createNotification({
          userId: doc.tenant.id,
          userRole: 'tenant',
          userEmail: doc.tenant.email,
          type: NOTIFICATION_TYPES.DOCUMENT_EXPIRED,
          title: 'Document Expired',
          message: `Your document "${doc.originalName}" (${doc.category}) has expired. Please upload a new version immediately.`,
          priority: 'urgent',
          entityType: 'document',
          entityId: doc.id,
          actionUrl: `/documents?tab=library`,
          actionLabel: 'Upload Document',
        });
      }

      // Notify landlord
      const landlord = doc.property?.landlord;
      if (landlord) {
        await createNotification({
          userId: landlord.id,
          userRole: 'landlord',
          userEmail: landlord.email,
          type: NOTIFICATION_TYPES.DOCUMENT_EXPIRED,
          title: 'Tenant Document Expired',
          message: `Document "${doc.originalName}" for tenant ${doc.tenant?.firstName} ${doc.tenant?.lastName} has expired.`,
          priority: 'high',
          entityType: 'document',
          entityId: doc.id,
          actionUrl: `/tenants`,
          actionLabel: 'View Tenant',
        });
      }
    }

    return {
      checked: expiredDocuments.length,
    };
  } catch (error) {
    console.error('[Document Expiration Service] Error:', error);
    throw error;
  }
}

/**
 * Get expiring documents for a user
 */
async function getExpiringDocumentsForUser(userId, userRole, daysBeforeExpiration = 30) {
  try {
    const today = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysBeforeExpiration);

    let where = {
      expirationDate: {
        gte: today,
        lte: expirationDate,
      },
      isDeleted: false,
    };

    if (userRole === 'tenant') {
      where.tenantId = userId;
    } else if (userRole === 'landlord') {
      where.property = {
        landlordId: userId,
      };
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        tenant: true,
        property: true,
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    return documents.map(doc => ({
      ...doc,
      daysUntilExpiration: Math.ceil((new Date(doc.expirationDate) - today) / (1000 * 60 * 60 * 24)),
    }));
  } catch (error) {
    console.error('[Document Expiration Service] Error:', error);
    throw error;
  }
}

module.exports = {
  checkExpiringDocuments,
  checkExpiredDocuments,
  getExpiringDocumentsForUser,
};

