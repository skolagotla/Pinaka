/**
 * Landlord API v1 - Individual Resource Operations
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.927Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { landlordUpdateSchema } from '@/lib/schemas';
import { landlordsService } from '@/lib/domains/landlords';
import { z } from 'zod';

/**
 * GET /api/v1/landlords/[id]
 * Get a single landlord by ID
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

    const result = await landlordsService.getById(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Landlord not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error(`[Landlord API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch landlord',
    });
  }
}

/**
 * PATCH /api/v1/landlords/[id]
 * Update a landlord
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

    const data = landlordUpdateSchema.parse(req.body);
    const updated = await landlordsService.update(id, data);
    
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
    console.error(`[Landlord API] PATCH Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update landlord',
    });
  }
}

/**
 * DELETE /api/v1/landlords/[id]
 * Delete a landlord
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

    await landlordsService.delete(id);
    
    return res.status(204).end();
  } catch (error: any) {
    console.error(`[Landlord API] DELETE Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete landlord',
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
