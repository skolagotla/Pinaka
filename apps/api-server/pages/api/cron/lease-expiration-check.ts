/**
 * Cron Job: Lease Expiration Check
 * Checks for expiring leases and sends notifications
 * Should be called daily
 * Implements Business Rule 1: Lease Expiration and Auto-Renewal Logic
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkExpiringLeases, autoConvertToMonthToMonth, NOTIFICATION_DAYS } from '@/lib/services/lease-expiration-service';

const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify cron secret
    const authHeader = req.headers.authorization;
    const providedSecret = authHeader?.replace('Bearer ', '') || req.query.secret as string;

    if (providedSecret !== CRON_SECRET && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const results = {
      expirationNotifications: [] as any[],
      conversions: null as any,
    };

    // Check for each notification day
    for (const days of NOTIFICATION_DAYS) {
      const result = await checkExpiringLeases(days);
      results.expirationNotifications.push({
        daysBeforeExpiration: days,
        ...result,
      });
    }

    // Auto-convert expired leases to month-to-month
    results.conversions = await autoConvertToMonthToMonth();

    const totalNotified = results.expirationNotifications.reduce((sum, r) => sum + r.notified, 0);

    return res.status(200).json({
      success: true,
      message: 'Lease expiration check completed',
      results: {
        expirationNotifications: results.expirationNotifications,
        conversions: results.conversions,
        summary: {
          totalNotified,
          totalConverted: results.conversions?.converted || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron] Error in lease expiration check:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process lease expiration check',
      timestamp: new Date().toISOString(),
    });
  }
}

