/**
 * API Handler Utilities
 * 
 * Helpers for creating API handlers with schema validation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { apiResponseSchema, errorResponseSchema } from '@/lib/schemas';

/**
 * Create a standardized API handler with schema validation
 */
export function createApiHandler<TBody extends z.ZodTypeAny = z.ZodTypeAny, TQuery extends z.ZodTypeAny = z.ZodTypeAny>(
  config: {
    bodySchema?: TBody;
    querySchema?: TQuery;
    handler: (req: NextApiRequest, res: NextApiResponse, validated: {
      body?: z.infer<TBody>;
      query?: z.infer<TQuery>;
    }) => Promise<any>;
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Validate query parameters
      let validatedQuery: z.infer<TQuery> | undefined;
      if (config.querySchema) {
        const queryResult = config.querySchema.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid query parameters',
              details: (queryResult.error as any).issues || (queryResult.error as any).errors || [],
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: 'v1',
            },
          });
        }
        validatedQuery = queryResult.data;
      }

      // Validate request body
      let validatedBody: z.infer<TBody> | undefined;
      if (config.bodySchema && (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT')) {
        const bodyResult = config.bodySchema.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request body',
              details: (bodyResult.error as any).issues || (bodyResult.error as any).errors || [],
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: 'v1',
            },
          });
        }
        validatedBody = bodyResult.data;
      }

      // Call handler with validated data
      const result = await config.handler(req, res, {
        body: validatedBody,
        query: validatedQuery,
      });

      // If handler already sent response, don't send again
      if (res.headersSent) {
        return;
      }

      // Format success response
      return res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[API Handler] Error:', error);

      // If response already sent, don't send again
      if (res.headersSent) {
        return;
      }

      // Format error response
      return res.status(error.statusCode || 500).json({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
) {
  return {
    success: true as const,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  };
}

