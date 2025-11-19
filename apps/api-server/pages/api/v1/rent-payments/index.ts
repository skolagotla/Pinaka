/**
 * RentPayment API v1
 * 
 * Domain-Driven, API-First implementation
 * Generated from schema registry - DO NOT EDIT MANUALLY
 * Run `npm run generate:api-routes` to regenerate
 * 
 * Generated: 2025-11-18T17:00:22.922Z
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentCreateSchema, rentPaymentUpdateSchema, rentPaymentQuerySchema } from '@/lib/schemas';
import { rentPaymentService } from '@/lib/domains/rent-payment';
import { z } from 'zod';

/**
 * GET /api/v1/rent-payments
 * List rent-payments with pagination and filters
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const query = rentPaymentQuerySchema.parse(req.query);
    const result = await rentPaymentService.list(query);
    
    return res.status(200).json({
      success: true,
      data: result.rentPayments || result,
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
    console.error(`[RentPayment API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch rent-payments',
    });
  }
}

/**
 * POST /api/v1/rent-payments
 * Create a new rent-payment
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  try {
    const data = rentPaymentCreateSchema.parse(req.body);
    const created = await rentPaymentService.create(data, { userId: user.userId });
    
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
    console.error(`[RentPayment API] POST Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create rent-payment',
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
