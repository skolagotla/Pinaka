/**
 * Production-Ready Prisma Client
 * 
 * This module provides a robust Prisma client initialization with:
 * - Connection pooling
 * - Error handling
 * - Retry logic
 * - Health checks
 * - Graceful shutdown
 */

const { PrismaClient } = require("@prisma/client");

let prismaInstance = null;
let isConnecting = false;
const connectionRetries = 3;

/**
 * Get Prisma client instance with retry logic
 */
function getPrisma() {
  // Return existing instance if available
  if (prismaInstance) {
    return prismaInstance;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    throw new Error('Prisma connection in progress');
  }

  isConnecting = true;

  try {
    // Import config
    let config;
    try {
      config = require('./config/app-config').default || require('./config/app-config');
    } catch (e) {
      config = {
        database: {
          url: process.env.DATABASE_URL || 'file:./dev.db',
        },
        app: {
          env: process.env.NODE_ENV || 'development',
        },
      };
    }

    // Configure Prisma Client
    const prismaConfig = {
      log: config.app.env === 'production' 
        ? ['error'] 
        : ['error', 'warn'],
      errorFormat: 'minimal',
      datasources: {
        db: {
          url: config.database.url,
        },
      },
    };

    // Add connection pool configuration for PostgreSQL
    if (config.database.url && config.database.url.startsWith('postgresql://')) {
      try {
        const url = new URL(config.database.url);
        
        if (!url.searchParams.has('connection_limit')) {
          url.searchParams.set('connection_limit', process.env.DB_POOL_SIZE || '20');
        }
        if (!url.searchParams.has('pool_timeout')) {
          url.searchParams.set('pool_timeout', process.env.DB_POOL_TIMEOUT || '20');
        }
        if (!url.searchParams.has('connect_timeout')) {
          url.searchParams.set('connect_timeout', process.env.DB_CONNECT_TIMEOUT || '10');
        }
        
        prismaConfig.datasources.db.url = url.toString();
      } catch (error) {
        console.warn('[Prisma Config] Could not parse DATABASE_URL for pool config:', error.message);
      }
    }

    // Create Prisma client
    prismaInstance = new PrismaClient(prismaConfig);

    // Setup error handler
    if (typeof prismaInstance.$on === 'function') {
      try {
        prismaInstance.$on('error', (e) => {
          console.error('[Prisma Error]', e);
          
          // In production, send to monitoring service
          if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
            // Uncomment when Sentry is configured
            // const Sentry = require('@sentry/nextjs');
            // Sentry.captureException(e, {
            //   tags: { component: 'prisma' },
            // });
          }
        });
      } catch (e) {
        // $on might not be available in all Prisma versions
      }
    }

    // Test connection
    prismaInstance.$connect()
      .then(() => {
        console.log('[Prisma] Connected to database');
        isConnecting = false;
      })
      .catch((error) => {
        console.error('[Prisma] Connection failed:', error);
        prismaInstance = null;
        isConnecting = false;
        throw error;
      });

    // Ensure singleton pattern in development
    if (process.env.NODE_ENV !== "production") {
      global.prisma = prismaInstance;
    }

    isConnecting = false;
    return prismaInstance;
  } catch (error) {
    isConnecting = false;
    console.error('[Prisma] Initialization failed:', error);
    throw new Error('Database connection failed: ' + error.message);
  }
}

/**
 * Retry Prisma operation with exponential backoff
 */
async function withPrismaRetry(operation, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prisma = getPrisma();
      
      if (!prisma) {
        throw new Error('Prisma client not available');
      }
      
      return await operation(prisma);
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors or unique constraint violations
      if (error.code === 'P2002' || error.code === 'P2025' || error.code === 'P2003') {
        throw error;
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Reset instance on connection errors
        if (error.code === 'P1001' || error.code === 'P1017') {
          prismaInstance = null;
        }
      }
    }
  }
  
  throw lastError;
}

/**
 * Health check for Prisma connection
 */
async function healthCheck() {
  try {
    const prisma = getPrisma();
    if (!prisma) {
      return { healthy: false, error: 'Prisma client not initialized' };
    }
    
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    return { 
      healthy: false, 
      error: error.message,
      code: error.code 
    };
  }
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
    }
    process.exit(0);
  });

  process.on('beforeExit', async () => {
    if (prismaInstance) {
      await prismaInstance.$disconnect();
    }
  });
}

module.exports = { 
  prisma: getPrisma(), 
  getPrisma,
  withPrismaRetry,
  healthCheck
};

