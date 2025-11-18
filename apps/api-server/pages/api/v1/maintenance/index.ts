/**
 * Maintenance API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.922Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { maintenanceRequestCreateSchema, maintenanceRequestUpdateSchema, maintenanceRequestQuerySchema } from '@/lib/schemas';
import { maintenanceService } from '@/lib/domains/maintenance';
import { z } from 'zod';

/**
 * GET /api/v1/maintenance
 * List maintenances with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = maintenanceRequestQuerySchema.parse(req.query);
    const result = await maintenanceService.list(query);
    
    return res.status(200).json({
      success: true,
      data: result.maintenance || result,
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
    console.error(`[Maintenance API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch maintenances',
    });
  }
}

/**
 * POST /api/v1/maintenance
 * Create a new maintenance
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = maintenanceRequestCreateSchema.parse(req.body);
    const created = await maintenanceService.create(data, { userId: user.userId, userRole: user.role });
    
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
    console.error(`[Maintenance API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create maintenance',
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
