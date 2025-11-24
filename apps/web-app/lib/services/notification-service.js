/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

const { prisma } = require('../prisma');
const { sendNotificationEmail } = require('../email/notification-emails');

// Notification types
const NOTIFICATION_TYPES = {
  RENT_DUE: 'rent_due',
  RENT_OVERDUE: 'rent_overdue',
  RENT_PAID: 'rent_paid',
  MAINTENANCE_UPDATE: 'maintenance_update',
  MAINTENANCE_NEW: 'maintenance_new',
  APPROVAL_REQUEST: 'approval_request',
  APPROVAL_RESPONSE: 'approval_response',
  DOCUMENT_EXPIRING: 'document_expiring',
  DOCUMENT_EXPIRED: 'document_expired',
  LEASE_RENEWAL: 'lease_renewal',
  LEASE_EXPIRING: 'lease_expiring',
  LEASE_CONVERTED: 'lease_converted',
  LEASE_TERMINATION: 'lease_termination',
  LATE_FEE_APPLIED: 'late_fee_applied',
  PAYMENT_RECEIVED: 'payment_received',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  OWNERSHIP_VERIFICATION_VERIFIED: 'ownership_verification_verified',
  OWNERSHIP_VERIFICATION_REJECTED: 'ownership_verification_rejected',
  OWNERSHIP_VERIFICATION_EXPIRED: 'ownership_verification_expired',
  // Payment retry and dispute notifications (Business Rules 11.1, 11.2, 11.3)
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_DISPUTED: 'payment_disputed',
  PAYMENT_DISPUTE_RESOLVED: 'payment_dispute_resolved',
  PAYMENT_GATEWAY_FAILURE: 'payment_gateway_failure',
};

/**
 * Create a notification
 */
async function createNotification({
  userId,
  userRole,
  userEmail,
  type,
  title,
  message,
  priority = 'normal',
  entityType = null,
  entityId = null,
  actionUrl = null,
  actionLabel = null,
  metadata = null,
}) {
  try {
    // Check user preferences
    const preference = await prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType: type,
        },
      },
    });

    // Default to enabled if no preference exists
    const emailEnabled = preference?.emailEnabled ?? true;
    const pushEnabled = preference?.pushEnabled ?? true;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        userRole,
        userEmail,
        type,
        title,
        message,
        priority,
        entityType,
        entityId,
        actionUrl,
        actionLabel,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });

    // Send email if enabled
    if (emailEnabled) {
      try {
        await sendNotificationEmail({
          to: userEmail,
          type,
          title,
          message,
          actionUrl,
          actionLabel,
        });

        // Update notification
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });
      } catch (emailError) {
        console.error('[Notification Service] Email send failed:', emailError);
        // Don't fail the notification creation if email fails
      }
    }

    // SMS sending (when SMS provider is configured)
    if (process.env.SMS_PROVIDER_ENABLED === 'true' && process.env.SMS_PROVIDER_API_KEY) {
      try {
        // Integration point for SMS providers (Twilio, AWS SNS, etc.)
        // Example: await sendSMS(userPhone, message);
        console.log(`[Notification Service] SMS sending not yet implemented for ${userPhone}`);
        // TODO: Implement SMS provider integration when needed
        // const { sendSMS } = require('../sms/sms-provider');
        // await sendSMS(userPhone, message);
      } catch (smsError) {
        console.error('[Notification Service] SMS sending failed:', smsError);
        // Don't fail notification creation if SMS fails
      }
    }

    // Push notification (when push notification service is configured)
    if (process.env.PUSH_NOTIFICATION_ENABLED === 'true') {
      try {
        // Integration point for push notification services (Firebase, OneSignal, etc.)
        // Example: await sendPushNotification(userId, { title, message });
        console.log(`[Notification Service] Push notification not yet implemented for user ${userId}`);
        // TODO: Implement push notification integration when needed
        // const { sendPushNotification } = require('../push/push-provider');
        // await sendPushNotification(userId, { title, message, data: { entityType, entityId, actionUrl } });
      } catch (pushError) {
        console.error('[Notification Service] Push notification failed:', pushError);
        // Don't fail notification creation if push notification fails
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error);
    throw error;
  }
}

/**
 * Get user notifications
 */
async function getUserNotifications({
  userId,
  userRole,
  limit = 50,
  offset = 0,
  unreadOnly = false,
  archived = false,
}) {
  try {
    // Check if Notification table exists by trying to query it
    // If table doesn't exist, return empty result instead of error
    try {
      await prisma.$queryRaw`SELECT 1 FROM "notification" LIMIT 1`;
    } catch (tableError) {
      // Table doesn't exist - return empty result
      if (tableError?.code === '42P01' || tableError?.message?.includes('does not exist')) {
        console.warn('[Notification Service] Notification table does not exist yet. Returning empty notifications.');
        return {
          notifications: [],
          total: 0,
          unreadCount: 0,
        };
      }
      // Re-throw if it's a different error
      throw tableError;
    }

    const where = {
      userId,
      userRole,
      isArchived: archived,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      unreadCount: await prisma.notification.count({
        where: {
          userId,
          userRole,
          isRead: false,
          isArchived: false,
        },
      }),
    };
  } catch (error) {
    console.error('[Notification Service] Error fetching notifications:', error);
    console.error('[Notification Service] Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      userId,
      userRole,
    });
    // Return empty result instead of throwing to prevent UI errors
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
    };
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
  try {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Notification Service] Error marking as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(userId, userRole) {
  try {
    return await prisma.notification.updateMany({
      where: {
        userId,
        userRole,
        isRead: false,
        isArchived: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Notification Service] Error marking all as read:', error);
    throw error;
  }
}

/**
 * Archive notification
 */
async function archiveNotification(notificationId, userId) {
  try {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Notification Service] Error archiving notification:', error);
    throw error;
  }
}

/**
 * Get or create notification preference
 */
async function getNotificationPreference(userId, notificationType) {
  try {
    let preference = await prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
    });

    if (!preference) {
      // Create default preference
      preference = await prisma.notificationPreference.create({
        data: {
          userId,
          notificationType,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          sendOnDay: true,
        },
      });
    }

    return preference;
  } catch (error) {
    console.error('[Notification Service] Error getting preference:', error);
    throw error;
  }
}

/**
 * Update notification preference
 */
async function updateNotificationPreference(userId, notificationType, updates) {
  try {
    return await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
      update: updates,
      create: {
        userId,
        notificationType,
        ...updates,
      },
    });
  } catch (error) {
    console.error('[Notification Service] Error updating preference:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  getNotificationPreference,
  updateNotificationPreference,
  NOTIFICATION_TYPES,
};

