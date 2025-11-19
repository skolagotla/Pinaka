/**
 * LTB Documents API v1
 * 
 * Domain-Driven, API-First implementation
 * Provides access to Ontario Landlord and Tenant Board forms
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { ltbDocumentQuerySchema } from '@/lib/schemas';
import { ltbDocumentService } from '@/lib/domains/ltb-document';
import { z } from 'zod';

/**
 * GET /api/v1/ltb-documents
 * List LTB documents with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = ltbDocumentQuerySchema.parse(req.query);
    const result = await ltbDocumentService.list(query);
    
    return res.status(200).json({
      success: true,
      data: result.documents,
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
    console.error(`[LTB Documents API] GET Error:`, error);
    console.error(`[LTB Documents API] Error stack:`, error.stack);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch LTB documents',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

/**
 * Handler
 */
export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    return handleGet(req, res, user);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
});

