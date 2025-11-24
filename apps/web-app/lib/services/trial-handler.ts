/**
 * Trial Expiration Handler
 * Handles trial expiration checks and notifications
 */

import { PrismaClient } from '@prisma/client';

/**
 * Check and handle expired trials
 * Should be called periodically (e.g., via cron job)
 */
export async function checkExpiredTrials(prisma: PrismaClient): Promise<{
  checked: number;
  expired: number;
  suspended: number;
}> {
  const now = new Date();

  // Find all organizations with expired trials and no active subscription
  const expiredTrials = await prisma.organization.findMany({
    where: {
      trialEndsAt: {
        lte: now,
      },
      status: {
        in: ['TRIAL', 'ACTIVE'],
      },
      OR: [
        { subscriptionStatus: null },
        { subscriptionStatus: { not: 'active' } },
      ],
    },
    select: {
      id: true,
      name: true,
      trialEndsAt: true,
      subscriptionStatus: true,
    },
  });

  let suspended = 0;

  // Suspend organizations with expired trials
  for (const org of expiredTrials) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        status: 'SUSPENDED',
      },
    });
    suspended++;

    console.log(`[Trial Handler] Suspended organization ${org.id} (${org.name}) - trial expired`);
  }

  return {
    checked: expiredTrials.length,
    expired: expiredTrials.length,
    suspended,
  };
}

/**
 * Send trial expiration warnings
 * Should be called daily to warn organizations about upcoming trial expiration
 */
export async function sendTrialExpirationWarnings(
  prisma: PrismaClient,
  daysBeforeExpiration: number = 3
): Promise<number> {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + daysBeforeExpiration);

  // Find organizations with trials expiring soon
  const expiringTrials = await prisma.organization.findMany({
    where: {
      trialEndsAt: {
        gte: new Date(),
        lte: warningDate,
      },
      status: 'TRIAL',
      subscriptionStatus: {
        not: 'active',
      },
    },
    include: {
      landlords: {
        take: 1, // Get first landlord for notification
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Send email notifications
  const { sendNotificationEmail } = require('../email/notification-emails');
  for (const org of expiringTrials) {
    console.log(
      `[Trial Handler] Trial expiring soon for organization ${org.id} (${org.name}) - expires ${org.trialEndsAt}`
    );
    
    // Send email to organization owners/admins
    try {
      const primaryLandlord = org.landlords?.[0];
      if (primaryLandlord?.email) {
        await sendNotificationEmail({
          to: primaryLandlord.email,
          subject: `Trial Period Expiring Soon - ${org.name}`,
          template: 'trial-expiration',
          data: {
            organizationName: org.name,
            trialEndDate: org.trialEndsAt,
            daysRemaining: org.trialEndsAt ? Math.ceil((new Date(org.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
            upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.pinaka.com'}/settings/billing`,
          },
        });
      }
    } catch (emailError) {
      console.error(`[Trial Handler] Failed to send email for org ${org.id}:`, emailError);
      // Don't fail the entire process if email fails
    }
  }

  return expiringTrials.length;
}

/**
 * Get trial status for an organization
 */
export async function getTrialStatus(
  prisma: PrismaClient,
  organizationId: string
): Promise<{
  hasTrial: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
  daysRemaining: number | null;
}> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      trialEndsAt: true,
      subscriptionStatus: true,
    },
  });

  if (!organization || !organization.trialEndsAt) {
    return {
      hasTrial: false,
      isExpired: false,
      expiresAt: null,
      daysRemaining: null,
    };
  }

  const now = new Date();
  const expiresAt = organization.trialEndsAt;
  const isExpired = expiresAt < now;
  const daysRemaining = isExpired
    ? 0
    : Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    hasTrial: true,
    isExpired,
    expiresAt,
    daysRemaining,
  };
}

