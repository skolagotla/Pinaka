import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { tenantDelinquencyRiskQuerySchema, tenantDelinquencyRiskResponseSchema } from '@/lib/schemas';
import { getTenantDelinquencyRisk } from '@/lib/services/analytics-service';
import { prisma } from '@/lib/prisma';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const queryResult = tenantDelinquencyRiskQuerySchema.safeParse(req.query);
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
          const emptyResponse = {
            success: true,
            data: [],
          };
          const validated = tenantDelinquencyRiskResponseSchema.parse(emptyResponse);
          return res.status(200).json(validated);
        }
      }
    }

    // Get all tenants for this landlord
    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: {
        units: {
          include: {
            leases: {
              include: {
                leaseTenants: {
                  include: {
                    tenant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const tenantIds = new Set<string>();
    properties.forEach(property => {
      property.units.forEach(unit => {
        unit.leases.forEach(lease => {
          lease.leaseTenants.forEach(lt => {
            tenantIds.add(lt.tenantId);
          });
        });
      });
    });

    // Get risk for each tenant
    const risks = await Promise.all(
      Array.from(tenantIds).map(async (tenantId) => {
        try {
          const risk = await getTenantDelinquencyRisk(tenantId);
          return risk;
        } catch (error) {
          console.error(`Error getting risk for tenant ${tenantId}:`, error);
          return null;
        }
      })
    );

    const validRisks = risks.filter(r => r !== null);

    const response = {
      success: true,
      data: validRisks.map(risk => ({
        ...risk,
        lastPaymentDate: risk.lastPaymentDate ? risk.lastPaymentDate.toISOString() : null,
        paymentHistory: risk.paymentHistory.map(p => ({
          ...p,
          date: p.date.toISOString(),
        })),
      })),
    };

    const validated = tenantDelinquencyRiskResponseSchema.parse(response);
    return res.status(200).json(validated);
  } catch (error) {
    console.error('[Tenant Delinquency Risk API] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch tenant delinquency risk',
    });
  }
}, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET'] });

