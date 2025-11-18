import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Request ID Middleware
 * 
 * Adds a unique request ID to every API request for:
 * - Request tracking across services
 * - Debugging and error correlation
 * - Log aggregation
 * 
 * Usage:
 * ```typescript
 * export default withRequestId(withAuth(async (req, res, user) => {
 *   // Request ID available in req.headers['x-request-id']
 * }));
 * ```
 */

export function withRequestId(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Generate or use existing request ID
    const requestId = 
      (req.headers['x-request-id'] as string) ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to request headers
    req.headers['x-request-id'] = requestId;
    
    // Add to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Continue to handler
    return handler(req, res);
  };
}

