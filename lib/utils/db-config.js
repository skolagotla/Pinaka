/**
 * Database Configuration Utility
 * 
 * Manages the active database selection via a config file.
 * This allows switching between databases (e.g., pinaka, PT) without modifying .env
 */

const fs = require('fs');
const path = require('path');

// Use absolute path to ensure we find the config file regardless of working directory
// The config file should be at the project root
// Handle both cases: running from root or from apps/api-server
let rootDir;
try {
  // Try to resolve from __dirname first (works in normal Node.js)
  rootDir = path.resolve(__dirname, '../..');
  // If __dirname is a placeholder (like /ROOT), use process.cwd() instead
  if (rootDir.includes('/ROOT') || rootDir.includes('\\ROOT')) {
    // We're in apps/api-server or apps/web-app, go up two levels
    rootDir = path.resolve(process.cwd(), '../..');
  }
} catch (e) {
  // Fallback to process.cwd() and go up if needed
  rootDir = process.cwd();
  if (rootDir.includes('apps/')) {
    rootDir = path.resolve(rootDir, '../..');
  }
}
const CONFIG_FILE = path.join(rootDir, '.db-config.json');

/**
 * Get the active database name from config file
 * Falls back to default database from DATABASE_URL if config doesn't exist
 */
function getActiveDatabase() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (config.activeDatabase) {
        return config.activeDatabase;
      }
    }
  } catch (error) {
    // Silently fail - don't log warnings for missing config file
    // This is expected when no database has been switched yet
  }
  
  // Fallback: extract database name from DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL || '';
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const dbName = url.pathname.slice(1); // Remove leading '/'
      return dbName || null;
    } catch (error) {
      // Invalid URL, return null
    }
  }
  
  return null;
}

/**
 * Set the active database name in config file
 */
function setActiveDatabase(dbName) {
  try {
    const config = {
      activeDatabase: dbName,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('[DB Config] Error writing config file:', error.message);
    throw error;
  }
}

/**
 * Build DATABASE_URL with a specific database name
 */
function buildDatabaseUrl(dbName) {
  const originalUrl = process.env.DATABASE_URL || '';
  if (!originalUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  try {
    const url = new URL(originalUrl);
    url.pathname = `/${dbName}`;
    return url.toString();
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error.message}`);
  }
}

/**
 * Get the current DATABASE_URL (either from config or env)
 */
function getDatabaseUrl() {
  try {
    const activeDb = getActiveDatabase();
    if (activeDb) {
      // Ensure DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        // Try to load from .env file if not set
        try {
          require('dotenv').config();
        } catch (e) {
          // dotenv might not be available, that's okay
        }
      }
      if (process.env.DATABASE_URL) {
        return buildDatabaseUrl(activeDb);
      } else {
        console.warn('[DB Config] DATABASE_URL not set, cannot build URL for active database:', activeDb);
      }
    }
  } catch (error) {
    // If building URL fails, fall back to default
    console.warn('[DB Config] Error building database URL:', error.message);
  }
  return process.env.DATABASE_URL || '';
}

module.exports = {
  getActiveDatabase,
  setActiveDatabase,
  buildDatabaseUrl,
  getDatabaseUrl,
  CONFIG_FILE,
};

