/**
 * Cron Job: Process Scheduled Payment Retries
 * GET /api/cron/process-payment-retries
 * 
 * Processes payment retries that are scheduled and due
 * Should be called every hour (or more frequently)
 * Implements Business Rule 11.1
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { processScheduledRetries } from '@/lib/services/payment-retry-service';

// Simple authentication check (should use a secret token in production)
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify cron secret (in production, use proper authentication)
    const authHeader = req.headers.authorization;
    const providedSecret = authHeader?.replace('Bearer ', '') || req.query.secret as string;

    if (providedSecret !== CRON_SECRET && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await processScheduledRetries();

    return res.status(200).json({
      success: true,
      message: `Processed ${result.processed} payment retries`,
      processed: result.processed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron] Error processing payment retries:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process payment retries',
      timestamp: new Date().toISOString(),
    });
  }
}

