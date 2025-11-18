/**
 * Test Database Connection
 * GET /api/admin/auth/test-db
 * 
 * Tests the current database connection (for debugging)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getActiveDatabase, getDatabaseUrl } from '@/lib/utils/db-config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const activeDb = getActiveDatabase();
    const dbUrl = getDatabaseUrl();
    
    // Try to query the database
    const adminCount = await prisma.admin.count();
    
    return res.status(200).json({
      success: true,
      data: {
        activeDatabase: activeDb,
        databaseUrl: dbUrl.replace(/:[^:@]+@/, ':****@'), // Hide password
        adminCount,
        connectionStatus: 'connected',
      },
    });
  } catch (error: any) {
    console.error('[Test DB] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
}

