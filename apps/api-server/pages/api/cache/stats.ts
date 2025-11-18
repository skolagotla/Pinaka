/**
 * API Cache Statistics Endpoint
 * GET /api/cache/stats
 * 
 * Returns cache statistics for monitoring
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getCacheStats } from '@/lib/utils/api-cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const stats = getCacheStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[Cache Stats API] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      message: error.message,
    });
  }
}

