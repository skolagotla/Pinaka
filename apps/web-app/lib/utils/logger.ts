/**
 * Structured Logging Utility
 * 
 * Provides structured logging with correlation IDs for cross-service tracing
 * and consistent log formatting across the application.
 */

interface LogContext {
  correlationId?: string;
  userId?: string;
  userRole?: string;
  propertyId?: string;
  tenantId?: string;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Generate correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get correlation ID from request headers or generate new one
 */
export function getCorrelationId(req: any): string {
  return req.headers['x-correlation-id'] || generateCorrelationId();
}

/**
 * Base logger class
 */
class Logger {
  private context: LogContext = {};

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Format log entry
   */
  private formatLog(level: string, message: string, additionalContext?: LogContext, error?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (Object.keys(this.context).length > 0 || additionalContext) {
      entry.context = { ...this.context, ...additionalContext };
    }

    if (error) {
      entry.error = {
        message: error.message || String(error),
        ...(error.stack && { stack: error.stack }),
        ...(error.code && { code: error.code }),
      };
    }

    return entry;
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatLog('INFO', message, context);
      console.log(JSON.stringify(entry, null, 2));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.formatLog('WARN', message, context);
    console.warn(JSON.stringify(entry, null, 2));
  }

  /**
   * Log error message
   */
  error(message: string, error?: any, context?: LogContext): void {
    const entry = this.formatLog('ERROR', message, context, error);
    console.error(JSON.stringify(entry, null, 2));
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = this.formatLog('DEBUG', message, context);
      console.debug(JSON.stringify(entry, null, 2));
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Create logger with context
 */
export function createLogger(context: LogContext): Logger {
  const newLogger = new Logger();
  newLogger.setContext(context);
  return newLogger;
}

/**
 * Express middleware to add correlation ID to requests
 */
export function correlationIdMiddleware(req: any, res: any, next: any) {
  const correlationId = getCorrelationId(req);
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Set logger context for this request
  logger.setContext({ correlationId });
  
  next();
}

