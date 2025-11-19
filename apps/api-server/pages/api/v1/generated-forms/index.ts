/**
 * GeneratedForm API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.926Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generatedFormCreateSchema, generatedFormUpdateSchema, generatedFormQuerySchema } from '@/lib/schemas';
import { generatedFormService } from '@/lib/domains/generated-form';
import { z } from 'zod';

/**
 * GET /api/v1/generated-forms
 * List generated-forms with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = generatedFormQuerySchema.parse(req.query);
    const result = await generatedFormService.getGeneratedForms(query, user);
    
    const forms = result.forms || [];
    const total = result.total || 0;
    const page = query.page || 1;
    const limit = query.limit || 50;
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      data: forms,
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
    console.error(`[GeneratedForm API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch generated-forms',
    });
  }
}

/**
 * POST /api/v1/generated-forms
 * Create a new generated-form
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = generatedFormCreateSchema.parse(req.body);
    const created = await generatedFormService.createGeneratedForm(data, user);
    
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
    console.error(`[GeneratedForm API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create generated-form',
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
