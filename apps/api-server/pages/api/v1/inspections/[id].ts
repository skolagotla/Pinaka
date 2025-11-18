/**
 * Inspection API v1 - Individual Resource Operations
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.924Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { inspectionUpdateSchema } from '@/lib/schemas';
import { inspectionService } from '@/lib/domains/inspection';
import { z } from 'zod';

/**
 * GET /api/v1/inspections/[id]
 * Get a single inspection by ID
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    const result = await inspectionService.getById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Inspection not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(`[Inspection API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch inspection',
    });
  }
}

/**
 * PATCH /api/v1/inspections/[id]
 * Update a inspection
 */
async function handlePatch(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    const data = inspectionUpdateSchema.parse(req.body);
    const updated = await inspectionService.update(id, data);
    
    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error(`[Inspection API] PATCH Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update inspection',
    });
  }
}

/**
 * DELETE /api/v1/inspections/[id]
 * Delete a inspection
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID is required',
      });
    }

    await inspectionService.delete(id);
    
    return res.status(204).end();
  } catch (error: any) {
    console.error(`[Inspection API] DELETE Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete inspection',
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
    case 'PATCH':
      return handlePatch(req, res, user);
    case 'DELETE':
      return handleDelete(req, res, user);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

export default withAuth(handler, {
  requireRole: ['landlord', 'pmc', 'admin'],
  allowedMethods: ['GET', 'PATCH', 'DELETE'],
});
