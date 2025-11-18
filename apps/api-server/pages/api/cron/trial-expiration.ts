/**
 * Cron Job: Check Trial Expiration
 * Should be called daily to check and handle expired trials
 * 
 * Setup in your hosting provider (Vercel Cron, etc.):
 * - Schedule: Daily at midnight UTC
 * - Endpoint: /api/cron/trial-expiration
 * - Secret: Set CRON_SECRET in environment variables
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createErrorResponse, createSuccessResponse, ErrorCodes } from '@/lib/utils/error-response';
import { checkExpiredTrials, sendTrialExpirationWarnings } from '@/lib/services/trial-handler';
const { prisma } = require('@/lib/prisma');

const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify cron secret (if set)
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    const { statusCode, response } = createErrorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized', 401);
    return res.status(statusCode).json(response);
  }

  if (req.method !== 'POST') {
    const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
    return res.status(statusCode).json(response);
  }

  try {
    // Check expired trials
    const expiredResult = await checkExpiredTrials(prisma);

    // Send expiration warnings (3 days before)
    const warningsSent = await sendTrialExpirationWarnings(prisma, 3);

    return res.status(200).json(
      createSuccessResponse({
        timestamp: new Date().toISOString(),
        expiredTrials: expiredResult,
        warningsSent,
      })
    );
  } catch (error: any) {
    console.error('[Trial Expiration Cron] Error:', error);
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to process trial expiration',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
}

