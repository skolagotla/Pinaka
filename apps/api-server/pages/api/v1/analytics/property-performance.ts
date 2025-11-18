import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { propertyPerformanceQuerySchema, propertyPerformanceResponseSchema } from '@/lib/schemas';
import { getPropertyPerformance } from '@/lib/services/analytics-service';
import { propertyService } from '@/lib/domains/property';

/**
 * Property Performance Analytics API v1
 * GET /api/v1/analytics/property-performance
 * 
 * Domain-Driven, API-First implementation
 * Uses domain service for property access checks
 */
export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queryResult = propertyPerformanceQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: queryResult.error.issues,
        },
      });
    }
    const query = queryResult.data;
    const { propertyId, startDate, endDate } = query;

    // Verify access using domain service (Domain-Driven Design)
    const property = await propertyService.getById(propertyId);

    if (!property) {
      throw new Error('Property not found');
    }

    // Access control is handled by PropertyService.getById (includes RBAC)
    // Additional PMC check if needed
    if (user.role === 'pmc') {
      // PropertyService should handle PMC access, but verify if needed
      // This is acceptable as it's a cross-domain authorization check
      const { prisma } = require('@/lib/prisma');
      const pmcLandlord = await prisma.pMCLandlord.findFirst({
        where: {
          pmcId: user.userId,
          landlordId: property.landlordId,
          status: 'active',
        },
      });
      if (!pmcLandlord) {
        throw new Error('PMC does not manage this property');
      }
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 12);
      return d;
    })();
    const end = endDate ? new Date(endDate) : new Date();

    const performance = await getPropertyPerformance(propertyId, start, end);

    if (!performance) {
      return res.status(404).json({ error: 'Performance data not found' });
    }

    const response = {
      success: true,
      data: {
        ...performance,
        period: {
          startDate: performance.period.startDate.toISOString(),
          endDate: performance.period.endDate.toISOString(),
          days: performance.period.days,
        },
      },
    };

    const validated = propertyPerformanceResponseSchema.parse(response);
    return res.status(200).json(validated);
  } catch (error) {
    console.error('[Property Performance API] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch property performance',
    });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET'] });

