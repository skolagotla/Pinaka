/**
 * Unit API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.927Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { unitCreateSchema, unitUpdateSchema, unitQuerySchema } from '@/lib/schemas';
import { unitService } from '@/lib/domains/unit';
import { z } from 'zod';

/**
 * GET /api/v1/units
 * List units with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = unitQuerySchema.parse(req.query);
    // Convert query to where clause for repository
    const where: any = {};
    if (query.propertyId) where.propertyId = query.propertyId;
    if (query.status) where.status = query.status;
    
    const result = await unitService.list(where, { property: true });
    
    // UnitService.list returns an array directly
    const units = Array.isArray(result) ? result : [];
    const total = units.length;
    const page = query.page || 1;
    const limit = query.limit || 50;
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data: units,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(`[Unit API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch units',
    });
  }
}

/**
 * POST /api/v1/units
 * Create a new unit
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = unitCreateSchema.parse(req.body);
    const created = await unitService.create(data, { property: true });
    
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
    console.error(`[Unit API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create unit',
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
