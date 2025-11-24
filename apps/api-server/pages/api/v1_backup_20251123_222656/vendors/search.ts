/**
 * Vendor Search API v1
 * GET /api/v1/vendors/search
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service instead of direct Prisma access
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { vendorSearchQuerySchema } from '@/lib/schemas';
import { z } from 'zod';
import { vendorService } from '@/lib/domains/vendor';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const query = vendorSearchQuerySchema.parse(req.query);

    // Use domain service for search
    const vendorQuery: any = {
      page: 1,
      limit: query.limit,
      search: query.q,
      type: query.type,
      isActive: true, // Only show active vendors
    };

    const result = await vendorService.list(vendorQuery);
    
    // Map to response format
    const vendors = (result.providers || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      companyName: v.businessName || v.companyName,
      email: v.email,
      phone: v.phone,
      type: v.type,
      category: v.category,
      isActive: v.isActive,
    }));

    return res.status(200).json({
      success: true,
      data: vendors,
      query: query.q,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[Vendor Search v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to search vendors',
    });
  }
}, { requireRole: ['landlord', 'pmc', 'admin'], allowedMethods: ['GET'] });

