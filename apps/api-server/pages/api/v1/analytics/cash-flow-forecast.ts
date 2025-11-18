import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { cashFlowForecastQuerySchema, cashFlowForecastResponseSchema } from '@/lib/schemas';
import { getCashFlowForecast } from '@/lib/services/analytics-service';
import { prisma } from '@/lib/prisma';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queryResult = cashFlowForecastQuerySchema.safeParse(req.query);
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
    const { startDate, endDate, months = 12, landlordId: queryLandlordId } = query;

    let landlordId = user.userId;

    // For PMC, get first managed landlord or use query param
    if (user.role === 'pmc') {
      if (queryLandlordId) {
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
        const pmcLandlord = await prisma.pMCLandlord.findFirst({
          where: {
            pmcId: user.userId,
            status: 'active',
          },
        });
        if (pmcLandlord) {
          landlordId = pmcLandlord.landlordId;
        } else {
          // Return empty forecast
          const start = startDate ? new Date(startDate) : new Date();
          const end = new Date(start);
          end.setMonth(end.getMonth() + months);
          const emptyResponse = {
            success: true,
            data: {
              landlordId: null,
              forecastPeriod: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                months,
              },
              monthlyForecast: [],
              totalProjectedIncome: 0,
              totalProjectedExpenses: 0,
              totalProjectedNet: 0,
            },
          };
          const validated = cashFlowForecastResponseSchema.parse(emptyResponse);
          return res.status(200).json(validated);
        }
      }
    }

    const forecast = await getCashFlowForecast(landlordId, months);

    const response = {
      success: true,
      data: {
        ...forecast,
        forecastPeriod: {
          startDate: forecast.startDate.toISOString(),
          endDate: forecast.endDate.toISOString(),
          months: forecast.months,
        },
        monthlyForecast: forecast.forecast.map((f: any) => ({
          ...f,
          month: f.month instanceof Date ? f.month.toISOString() : f.month,
        })),
      },
    };

    const validated = cashFlowForecastResponseSchema.parse(response);
    return res.status(200).json(validated);
  } catch (error) {
    console.error('[Cash Flow Forecast API] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch cash flow forecast',
    });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET'] });

