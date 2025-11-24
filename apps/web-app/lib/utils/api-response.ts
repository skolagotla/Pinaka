import { NextApiRequest } from 'next';

/**
 * Standardized API Response Format
 * 
 * Ensures all API responses follow a consistent structure for:
 * - Better client-side handling
 * - API documentation generation
 * - Error tracking and debugging
 * - Future API versioning
 */

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
};

/**
 * Format a successful API response
 */
export function formatApiResponse<T>(options: {
  data?: T;
  req?: NextApiRequest;
  version?: string;
}): ApiResponse<T> {
  const requestId = options.req?.headers['x-request-id'] as string || 
                    options.req?.headers['x-request-id'] as string ||
                    generateRequestId();

  return {
    success: true,
    data: options.data,
    meta: {
      timestamp: new Date().toISOString(),
      version: options.version || '1.0',
      requestId,
    },
  };
}

/**
 * Format an error API response
 */
export function formatApiError(options: {
  code: string;
  message: string;
  details?: any;
  req?: NextApiRequest;
  version?: string;
}): ApiResponse {
  const requestId = options.req?.headers['x-request-id'] as string || 
                    generateRequestId();

  return {
    success: false,
    error: {
      code: options.code,
      message: options.message,
      details: options.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: options.version || '1.0',
      requestId,
    },
  };
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

