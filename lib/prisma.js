// Load .env file early to ensure DATABASE_URL is available
// Next.js loads .env automatically, but we need it for db-config utility
try {
  // Try to load dotenv if available (for non-Next.js contexts)
  if (typeof require !== 'undefined') {
    try {
      require('dotenv').config();
    } catch (e) {
      // dotenv not available or already loaded by Next.js - that's okay
    }
  }
} catch (e) {
  // Ignore errors - Next.js will handle .env loading
}

// Set Prisma query engine path for pnpm workspace
const path = require('path');
const { setPrismaEnginePath } = require('./utils/prisma-engine-finder');

// Find the query engine in the workspace
// lib/prisma.js is at root/lib/prisma.js, so root is one level up
const rootDir = path.resolve(__dirname, '..');
// Also check if we're in a Next.js app directory (apps/api-server or apps/web-app)
const currentDir = process.cwd();
const isInAppDir = currentDir.includes('apps/');
const appRootDir = isInAppDir ? path.resolve(currentDir, '../..') : rootDir;

// Try root first, then app root
let enginePathFound = false;
const enginePath = setPrismaEnginePath(rootDir) || setPrismaEnginePath(appRootDir);

if (enginePath) {
  console.log('[Prisma] Found query engine at:', enginePath);
  enginePathFound = true;
} else {
  console.warn('[Prisma] Query engine not found. Prisma may fail at runtime.');
}

const { PrismaClient } = require("@prisma/client");

// Import centralized config
let config;
try {
  config = require('./config/app-config').default || require('./config/app-config');
} catch (e) {
  // Fallback if import fails
  config = {
    database: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
    app: {
      env: process.env.NODE_ENV || 'development',
    },
  };
}

// Import database config utility to get active database
let dbConfig;
let activeDatabaseUrl;
try {
  dbConfig = require('./utils/db-config');
  // Get the active database URL (uses config file if available, falls back to env)
  try {
    // Ensure DATABASE_URL is set from environment or config
    if (!process.env.DATABASE_URL && config.database.url) {
      process.env.DATABASE_URL = config.database.url;
    }
    activeDatabaseUrl = dbConfig.getDatabaseUrl() || config.database.url || process.env.DATABASE_URL;
    console.log('[Prisma] Using database URL:', activeDatabaseUrl ? activeDatabaseUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET');
  } catch (urlError) {
    // If getDatabaseUrl fails, use default
    console.warn('[Prisma] Error getting database URL from config, using default:', urlError?.message);
    activeDatabaseUrl = config.database.url || process.env.DATABASE_URL;
  }
} catch (e) {
  // If db-config utility fails, fall back to original behavior
  console.warn('[Prisma] Could not load db-config utility, using default DATABASE_URL');
  activeDatabaseUrl = config.database.url || process.env.DATABASE_URL;
}

const globalForPrisma = global;

// Configure Prisma Client with connection pooling and timeouts
const prismaConfig = {
  datasources: activeDatabaseUrl ? {
    db: {
      url: activeDatabaseUrl,
    },
  } : undefined,
  log: config.app.env === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
};

// Add connection pool configuration for PostgreSQL
if (activeDatabaseUrl && activeDatabaseUrl.startsWith('postgresql://')) {
  try {
    // Parse connection string to add pool parameters
    const url = new URL(activeDatabaseUrl);
    
    // Set connection pool parameters (if not already in URL)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', process.env.DB_POOL_SIZE || '10');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', process.env.DB_POOL_TIMEOUT || '10');
    }
    
    prismaConfig.datasources.db.url = url.toString();
  } catch (error) {
    // If URL parsing fails, use activeDatabaseUrl as-is
    console.warn('[Prisma Config] Could not parse DATABASE_URL for pool config:', error.message);
    prismaConfig.datasources.db.url = activeDatabaseUrl;
  }
}

// Create Prisma client
// Note: If database is switched via db-switcher, server restart is required
// to pick up the new database URL from the config file
let prisma;
try {
  // Ensure query engine path is set before creating PrismaClient
  if (!process.env.PRISMA_QUERY_ENGINE_LIBRARY && enginePathFound) {
    // Re-find the engine path if not set
    setPrismaEnginePath(rootDir) || setPrismaEnginePath(appRootDir);
  }
  
  prisma = globalForPrisma.prisma || new PrismaClient(prismaConfig);
} catch (prismaError) {
  console.error('[Prisma] Failed to create Prisma client:', prismaError?.message);
  console.error('[Prisma] Error details:', {
    code: prismaError?.code,
    meta: prismaError?.meta,
    enginePath: process.env.PRISMA_QUERY_ENGINE_LIBRARY,
  });
  // Create a mock Prisma client that will fail gracefully
  // This allows the app to continue even if database is unavailable
  prisma = {
    $connect: async () => { throw new Error('Database connection unavailable'); },
    $disconnect: async () => {},
    // Add other common Prisma methods as no-ops to prevent crashes
    admin: { findUnique: async () => null, findMany: async () => [], count: async () => 0 },
  };
  // Don't cache the failed client
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = null; // Don't cache failed client
  }
}

// Setup phone number auto-formatting middleware
// Only setup middleware at runtime, not during build time
// Skip during build phase to avoid warnings
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     process.env.NEXT_PHASE === 'phase-development-build' ||
                     process.argv.includes('build');

if (!isBuildTime && typeof window === 'undefined') {
  try {
    const { setupPhoneFormattingMiddleware } = require('./prisma-middleware');
    const middlewareSetup = setupPhoneFormattingMiddleware(prisma);
    if (middlewareSetup) {
      console.log('✅ Prisma phone formatting middleware enabled');
    }
  } catch (error) {
    // Only log warnings at runtime, not during build
    console.warn('⚠️  Could not setup phone formatting middleware:', error.message);
  }
}

// Handle connection errors (TypeScript syntax removed for JS file)
if (typeof prisma.$on === 'function') {
  try {
    prisma.$on('error', (e) => {
      console.error('[Prisma Error]', e);
    });
  } catch (e) {
    // $on might not be available in all Prisma versions
  }
}

// Ensure singleton pattern in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

module.exports = { prisma };


