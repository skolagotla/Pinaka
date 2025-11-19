/**
 * T776 Tax Form Generation API v1
 * POST /api/v1/analytics/t776/generate
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { generateT776Schema } from '@/lib/schemas';
import { z } from 'zod';
import { landlordService } from '@/lib/domains/landlord';
import { propertyService } from '@/lib/domains/property';

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only admins can generate T776 forms
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = generateT776Schema.parse(req.body);
    const landlordId = data.landlordId;
    if (!landlordId) {
      return res.status(400).json({ error: 'landlordId is required' });
    }
    const propertyIds = data.propertyIds;

    // Verify landlord exists using domain service (Domain-Driven Design)
    const landlord = await landlordService.getById(landlordId);

    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    // Get properties for the landlord using domain service (Domain-Driven Design)
    const propertyQuery: any = {
      landlordId,
      page: 1,
      limit: 1000, // Get all properties
    };
    
    if (data.propertyIds && data.propertyIds.length > 0) {
      propertyQuery.propertyIds = data.propertyIds;
    }

    const propertyResult = await propertyService.list(propertyQuery);
    const properties = propertyResult.properties || propertyResult.data || [];

    // Fetch detailed property data with units, leases, rent payments, and expenses
    // Note: This complex query with nested includes may need to be moved to a PropertyService method
    // For now, we'll use direct Prisma for the complex nested query, but we've already
    // used domain services for the initial landlord and property lookups
    const { prisma } = require('@/lib/prisma');
    const propertyIdsList = properties.map((p: any) => p.id);
    
    const propertiesWithDetails = await prisma.property.findMany({
      where: {
        id: { in: propertyIdsList },
      },
      include: {
        units: {
          include: {
            leases: {
              where: {
                status: 'Active',
                leaseStart: {
                  lte: new Date(`${data.taxYear}-12-31`),
                },
                OR: [
                  { leaseEnd: null },
                  { leaseEnd: { gte: new Date(`${data.taxYear}-01-01`) } },
                ],
              },
              include: {
                rentPayments: {
                  where: {
                    paidDate: {
                      gte: new Date(`${data.taxYear}-01-01`),
                      lte: new Date(`${data.taxYear}-12-31`),
                    },
                    status: 'Paid',
                  },
                },
              },
            },
          },
        },
        expenses: {
          where: {
            date: {
              gte: new Date(`${data.taxYear}-01-01`),
              lte: new Date(`${data.taxYear}-12-31`),
            },
          },
        },
      },
    });

    // Calculate totals
    const totalRentalIncome = propertiesWithDetails.reduce((sum, prop) => {
      return sum + prop.units.reduce((unitSum, unit) => {
        return unitSum + unit.leases.reduce((leaseSum, lease) => {
          return leaseSum + lease.rentPayments.reduce((paymentSum, payment) => {
            return paymentSum + (payment.amount || 0);
          }, 0);
        }, 0);
      }, 0);
    }, 0);

    const totalExpenses = propertiesWithDetails.reduce((sum, prop) => {
      return sum + prop.expenses.reduce((expenseSum, expense) => {
        return expenseSum + (expense.amount || 0);
      }, 0);
    }, 0);

    const netIncome = totalRentalIncome - totalExpenses;

    // Generate T776 form data (simplified - actual implementation would generate PDF)
    const t776Data = {
      landlord: {
        id: landlord.id,
        name: `${landlord.firstName} ${landlord.lastName}`,
        email: landlord.email,
      },
      taxYear: data.taxYear,
      properties: propertiesWithDetails.map(prop => ({
        id: prop.id,
        propertyName: prop.propertyName,
        address: `${prop.addressLine1}, ${prop.city}`,
        rentalIncome: prop.units.reduce((sum, unit) => {
          return sum + unit.leases.reduce((leaseSum, lease) => {
            return leaseSum + lease.rentPayments.reduce((paymentSum, payment) => {
              return paymentSum + (payment.amount || 0);
            }, 0);
          }, 0);
        }, 0),
        expenses: prop.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
      })),
      summary: {
        totalRentalIncome,
        totalExpenses,
        netIncome,
      },
    };

    return res.status(200).json({
      success: true,
      data: t776Data,
      message: 'T776 form generated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    console.error('[T776 Generate v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate T776 form',
    });
  }
}, { requireRole: ['admin'], allowedMethods: ['POST'] });

