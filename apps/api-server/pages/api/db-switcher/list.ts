import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import config from '@/lib/config/app-config';
import { getActiveDatabase } from '@/lib/utils/db-config';

/**
 * Parse DATABASE_URL to extract connection details
 */
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname.slice(1),
      user: parsed.username,
      password: parsed.password,
      ssl: parsed.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false,
    };
  } catch (error: any) {
    throw new Error(`Invalid DATABASE_URL: ${error.message}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const databaseUrl = config.database.url;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }
    const parsed = parseDatabaseUrl(databaseUrl);
    
    // Connect to 'postgres' database to list all databases
    const client = new Client({
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: 'postgres',
      ssl: parsed.ssl,
    });

    try {
      await client.connect();
      const result = await client.query(`
        SELECT datname as name
        FROM pg_database
        WHERE datistemplate = false
        AND datname NOT IN ('postgres', 'template0', 'template1')
        ORDER BY datname;
      `);
      
      const databases = result.rows.map(row => row.name);
      const currentDb = getActiveDatabase() || parsed.database;

      await client.end();

      return res.status(200).json({
        success: true,
        data: {
          databases,
          current: currentDb,
        },
      });
    } catch (error: any) {
      await client.end();
      throw error;
    }
  } catch (error: any) {
    console.error('Error listing databases:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Failed to list databases';
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = 'Cannot connect to PostgreSQL server. Please check your DATABASE_URL.';
    } else if (error.message?.includes('password') || error.message?.includes('authentication')) {
      errorMessage = 'Database authentication failed. Please check your DATABASE_URL credentials.';
    } else if (error.message?.includes('does not exist')) {
      errorMessage = 'Database server connection failed.';
    }
    
    return res.status(500).json({
      success: false,
      error: errorMessage,
      code: error.code,
      // Only include details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack,
      }),
    });
  }
}

