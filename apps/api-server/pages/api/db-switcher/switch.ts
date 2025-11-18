import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from '@/lib/config/app-config';
import { setActiveDatabase, buildDatabaseUrl, getActiveDatabase } from '@/lib/utils/db-config';
import { updateAuthMode } from '@/lib/utils/env-updater';

const execAsync = promisify(exec);

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

/**
 * Check if database exists
 */
async function databaseExists(databaseUrl: string, dbName: string): Promise<boolean> {
  const parsed = parseDatabaseUrl(databaseUrl);
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
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    await client.end();
    return result.rows.length > 0;
  } catch (error) {
    await client.end();
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { dbName } = req.body;

    if (!dbName || typeof dbName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Database name is required',
      });
    }

    const databaseUrl = config.database.url;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'Database URL not configured' });
    }

    // Check if database exists
    const exists = await databaseExists(databaseUrl, dbName);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: `Database "${dbName}" does not exist`,
      });
    }

    // Get current database to determine AUTH_MODE change
    const currentDb = getActiveDatabase() || 'pinaka';
    const isSwitchingToPT = dbName.toUpperCase() === 'PT';
    const isSwitchingFromPT = currentDb.toUpperCase() === 'PT' && dbName.toUpperCase() !== 'PT';

    // Determine AUTH_MODE based on database switch
    let authMode = 'auto'; // Default
    if (isSwitchingToPT) {
      authMode = 'auto'; // PT DB uses auto (password fallback)
    } else if (isSwitchingFromPT) {
      authMode = 'auth0'; // Production DB uses auth0
    } else {
      // Keep current AUTH_MODE or use auto
      authMode = process.env.AUTH_MODE || 'auto';
    }

    // Update config file
    setActiveDatabase(dbName);
    const newDatabaseUrl = buildDatabaseUrl(dbName);

    // Build restart sequence with proper waits and .env update
    const projectRoot = process.cwd();
    const restartScript = `
      cd "${projectRoot}" && \
      echo "Stopping node..." && \
      pkill -f "next dev" || true && \
      sleep 10 && \
      echo "Clearing cache..." && \
      npm run clear-cache && \
      sleep 10 && \
      echo "Updating AUTH_MODE to ${authMode}..." && \
      node -e "const {updateAuthMode} = require('./lib/utils/env-updater'); updateAuthMode('${authMode}');" && \
      echo "Building..." && \
      npm run build && \
      sleep 10 && \
      echo "Starting dev server..." && \
      npm run dev
    `;

    // Start restart sequence in background (don't wait for it)
    // This allows the API to return immediately
    exec(
      restartScript,
      { cwd: projectRoot },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[DB Switcher] Restart error:', error);
        } else {
          console.log('[DB Switcher] Server restart initiated');
          if (stdout) console.log('[DB Switcher] Output:', stdout);
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: `Switched to database "${dbName}". Server is restarting...`,
      data: {
        dbName,
        databaseUrl: newDatabaseUrl,
        note: 'The server will restart automatically. Please wait a moment and refresh the page.',
      },
    });
  } catch (error: any) {
    console.error('Error switching database:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to switch database',
    });
  }
}

