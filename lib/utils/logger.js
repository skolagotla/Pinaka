/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging that respects NODE_ENV
 * In production, only errors are logged
 * In development, all logs are shown
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log info message (development only)
 */
export function logInfo(...args) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Log warning message (development only)
 */
export function logWarn(...args) {
  if (isDevelopment) {
    console.warn(...args);
  }
}

/**
 * Log error message (always logged)
 */
export function logError(...args) {
  console.error(...args);
}

/**
 * Log debug message (development only)
 */
export function logDebug(...args) {
  if (isDevelopment) {
    console.debug(...args);
  }
}

// Default export for convenience
export default {
  info: logInfo,
  warn: logWarn,
  error: logError,
  debug: logDebug,
};

