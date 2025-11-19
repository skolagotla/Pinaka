/**
 * Invitation API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.926Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { invitationCreateSchema, invitationUpdateSchema, invitationQuerySchema } from '@/lib/schemas';
import { invitationService } from '@/lib/domains/invitation';
import { z } from 'zod';

/**
 * GET /api/v1/invitations
 * List invitations with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = invitationQuerySchema.parse(req.query);
    const result = await invitationService.getInvitations(query, user);
    
    const invitations = result.invitations || [];
    const total = result.total || 0;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data: invitations,
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
    console.error(`[Invitation API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch invitations',
    });
  }
}

/**
 * POST /api/v1/invitations
 * Create a new invitation
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = invitationCreateSchema.parse(req.body);
    const created = await invitationService.createInvitation(data, user);
    
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
    console.error(`[Invitation API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create invitation',
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
