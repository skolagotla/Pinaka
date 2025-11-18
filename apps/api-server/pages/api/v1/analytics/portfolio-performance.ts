import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { portfolioPerformanceQuerySchema, portfolioPerformanceResponseSchema } from '@/lib/schemas';
import { getPortfolioPerformance } from '@/lib/services/analytics-service';
import { prisma } from '@/lib/prisma';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queryResult = portfolioPerformanceQuerySchema.safeParse(req.query);
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
    const { startDate, endDate, landlordId: queryLandlordId } = query;

    let landlordId = user.userId;

    // For PMC, get first managed landlord or use query param
    if (user.role === 'pmc') {
      if (queryLandlordId) {
        // Verify PMC manages this landlord
        const pmcLandlord = await prisma.pMCLandlord.findFirst({
          where: {
            pmcId: user.userId,
            landlordId: queryLandlordId,
            status: 'active',
          },
        });
        if (!pmcLandlord) {
          throw new Error('PMC does not manage this landlord');
        }
        landlordId = queryLandlordId;
      } else {
        // Get first managed landlord
        const pmcLandlord = await prisma.pMCLandlord.findFirst({
          where: {
            pmcId: user.userId,
            status: 'active',
          },
        });
        if (pmcLandlord) {
          landlordId = pmcLandlord.landlordId;
        } else {
          // Return empty result
          const start = startDate ? new Date(startDate) : (() => {
            const d = new Date();
            d.setMonth(d.getMonth() - 12);
            return d;
          })();
          const end = endDate ? new Date(endDate) : new Date();
          const emptyResponse = {
            success: true,
            data: {
              landlordId: null,
              totalProperties: 0,
              totalRent: 0,
              totalExpenses: 0,
              netIncome: 0,
              occupancyRate: 0,
              occupiedUnits: 0,
              totalUnits: 0,
              period: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                days: Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
              },
            },
          };
          const validated = portfolioPerformanceResponseSchema.parse(emptyResponse);
          return res.status(200).json(validated);
        }
      }
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : (() => {
      const d = new Date();
      d.setMonth(d.getMonth() - 12);
      return d;
    })();
    const end = endDate ? new Date(endDate) : new Date();

    const performance = await getPortfolioPerformance(landlordId, start, end);

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

    const validated = portfolioPerformanceResponseSchema.parse(response);
    return res.status(200).json(validated);
  } catch (error) {
    console.error('[Portfolio Performance API] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio performance',
    });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET'] });

