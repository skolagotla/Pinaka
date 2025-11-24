/**
 * Database Connection Manager
 * 
 * Provides connection pooling, retry logic, health checks, and error handling
 * for Prisma database operations.
 */

const { prisma } = require('../prisma');

// Connection health check cache (5 second TTL)
let lastHealthCheck = null;
let healthCheckResult = null;
const HEALTH_CHECK_TTL = 5000; // 5 seconds

/**
 * Check database connection health
 * @returns {Promise<boolean>} True if connection is healthy
 */
async function checkConnectionHealth() {
  const now = Date.now();
  
  // Return cached result if still valid
  if (lastHealthCheck && (now - lastHealthCheck) < HEALTH_CHECK_TTL) {
    return healthCheckResult;
  }
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    healthCheckResult = true;
    lastHealthCheck = now;
    return true;
  } catch (error) {
    console.error('[DB Health Check] Connection failed:', error.message);
    healthCheckResult = false;
    lastHealthCheck = now;
    return false;
  }
}

/**
 * Execute a database operation with retry logic
 * @param {Function} operation - Async function that performs DB operation
 * @param {Object} options - Retry options
 * @returns {Promise<any>} Operation result
 */
async function executeWithRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000, // 1 second
    backoffMultiplier = 2,
    timeout = 30000, // 30 seconds
    onRetry = null
  } = options;
  
  let lastError;
  let currentDelay = retryDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), timeout);
      });
      
      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'P2002' || // Unique constraint violation
          error.code === 'P2025' || // Record not found
          error.message === 'Database operation timeout') {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Log retry attempt
      if (onRetry) {
        onRetry(attempt + 1, error);
      } else {
        console.warn(`[DB Retry] Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }
  
  throw lastError;
}

/**
 * Execute a transaction with retry logic
 * @param {Function} callback - Transaction callback
 * @param {Object} options - Retry options
 * @returns {Promise<any>} Transaction result
 */
async function executeTransaction(callback, options = {}) {
  return executeWithRetry(
    () => prisma.$transaction(callback, {
      timeout: options.transactionTimeout || 20000, // 20 seconds default
      maxWait: options.maxWait || 10000, // 10 seconds max wait
      isolationLevel: options.isolationLevel || 'ReadCommitted'
    }),
    options
  );
}

/**
 * Get connection pool statistics
 * @returns {Promise<Object>} Pool statistics
 */
async function getPoolStats() {
  try {
    // Prisma doesn't expose pool stats directly, but we can check connection
    const isHealthy = await checkConnectionHealth();
    return {
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Gracefully disconnect from database
 */
async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log('[DB Connection] Disconnected successfully');
  } catch (error) {
    console.error('[DB Connection] Error disconnecting:', error);
  }
}

module.exports = {
  checkConnectionHealth,
  executeWithRetry,
  executeTransaction,
  getPoolStats,
  disconnect
};

