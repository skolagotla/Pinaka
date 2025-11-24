/**
 * Response Formatter Middleware
 * 
 * Standardizes API response formats for consistency between frontend and middleware
 * 
 * Standard Response Format:
 * {
 *   success: boolean,
 *   data?: any,
 *   error?: string,
 *   message?: string,
 *   meta?: {
 *     total?: number,
 *     page?: number,
 *     limit?: number,
 *     timestamp?: string
 *   }
 * }
 */

import { NextApiResponse } from 'next';

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200,
  message?: string,
  meta?: StandardResponse<T>['meta']
) {
  const response: StandardResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
  };
  
  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: NextApiResponse,
  error: string | Error,
  statusCode: number = 500,
  details?: any
) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const response: StandardResponse = {
    success: false,
    error: errorMessage,
    ...(details && { meta: { details, timestamp: new Date().toISOString() } }),
  };
  
  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: NextApiResponse,
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 50,
  message?: string
) {
  return sendSuccess(
    res,
    data,
    200,
    message,
    {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  );
}

/**
 * Response wrapper for consistent error handling
 */
export function withStandardResponse<T>(
  handler: (req: any, res: NextApiResponse, ...args: any[]) => Promise<T>
) {
  return async (req: any, res: NextApiResponse, ...args: any[]) => {
    try {
      const result = await handler(req, res, ...args);
      
      // If response already sent, don't send again
      if (res.headersSent) {
        return result;
      }
      
      // If result is already a response object, return it
      if (result && typeof result === 'object' && 'status' in result) {
        return result;
      }
      
      // Otherwise, send success response
      return sendSuccess(res, result);
    } catch (error: any) {
      // If response already sent, don't send again
      if (res.headersSent) {
        console.error('[Response Formatter] Error after response sent:', error);
        return;
      }
      
      // Determine status code
      let statusCode = 500;
      if (error?.statusCode) {
        statusCode = error.statusCode;
      } else if (error?.status) {
        statusCode = error.status;
      } else if (error?.message?.includes('not found')) {
        statusCode = 404;
      } else if (error?.message?.includes('unauthorized') || error?.message?.includes('forbidden')) {
        statusCode = 403;
      } else if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
        statusCode = 400;
      }
      
      return sendError(res, error, statusCode, {
        ...(process.env.NODE_ENV === 'development' && {
          stack: error?.stack,
          name: error?.name,
        }),
      });
    }
  };
}

