/**
 * Lease API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.922Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { leaseCreateSchema, leaseUpdateSchema, leaseQuerySchema } from '@/lib/schemas';
import { leaseService } from '@/lib/domains/lease';
import { z } from 'zod';

/**
 * GET /api/v1/leases
 * List leases with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = leaseQuerySchema.parse(req.query);
    const result = await leaseService.list(query);
    
    return res.status(200).json({
      success: true,
      data: result.leases || result,
      pagination: result.pagination,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(`[Lease API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch leases',
    });
  }
}

/**
 * POST /api/v1/leases
 * Create a new lease
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = leaseCreateSchema.parse(req.body);
    const created = await leaseService.create(data, { userId: user.userId });
    
    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(`[Lease API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create lease',
    });
  }
}

/**
 * Main handler
 */
async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, user);
    case 'POST':
      return handlePost(req, res, user);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

export default withAuth(handler, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['GET', 'POST'],
});
