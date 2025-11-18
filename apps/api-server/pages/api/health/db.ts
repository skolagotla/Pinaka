/**
 * Database Health Check Endpoint
 * 
 * Provides database connection health status and pool statistics
 * Useful for monitoring and load balancer health checks
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { checkConnectionHealth, getPoolStats } from '@/lib/utils/db-connection-manager';
const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check connection health
    const isHealthy = await checkConnectionHealth();
    
    // Get pool statistics
    const stats = await getPoolStats();
    
    // Return health status
    const statusCode = isHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      ...stats
    });
  } catch (error: any) {
    console.error('[DB Health Check] Error:', error);
    
    res.status(503).json({
      healthy: false,
      timestamp: new Date().toISOString(),
      error: error?.message || 'Unknown error',
      ...(config.app.isDev && {
        stack: error?.stack
      })
    });
  }
}

