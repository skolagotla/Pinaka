/**
 * Landlord API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.927Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { landlordCreateSchema, landlordUpdateSchema, landlordQuerySchema } from '@/lib/schemas';
import { landlordService } from '@/lib/domains/landlord';
import { z } from 'zod';

/**
 * GET /api/v1/landlords
 * List landlords with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = landlordQuerySchema.parse(req.query);
    const result = await landlordService.list(query);
    
    return res.status(200).json({
      success: true,
      data: result.landlords || [],
      pagination: {
        page: result.page || 1,
        limit: result.limit || 50,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(`[Landlord API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch landlords',
    });
  }
}

/**
 * POST /api/v1/landlords
 * Create a new landlord
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = landlordCreateSchema.parse(req.body);
    const created = await landlordService.create(data, { userId: user.userId, organizationId: user.organizationId });
    
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
    console.error(`[Landlord API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create landlord',
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
