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
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only accountants and admins can generate T776 forms
    if (user.role !== 'accountant' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = generateT776Schema.parse(req.body);
    const landlordId = data.landlordId || (user.role === 'landlord' ? user.userId : null);
    const propertyIds = data.propertyIds;

    if (!landlordId) {
      return res.status(400).json({ error: 'Landlord ID is required' });
    }

    // Verify landlord exists
    const landlord = await prisma.landlord.findUnique({
      where: { id: landlordId },
    });

    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    // Get properties for the landlord
    const where: any = { landlordId };
    if (data.propertyIds && data.propertyIds.length > 0) {
      where.id = { in: data.propertyIds };
    }

    const properties = await prisma.property.findMany({
      where,
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
    const totalRentalIncome = properties.reduce((sum, prop) => {
      return sum + prop.units.reduce((unitSum, unit) => {
        return unitSum + unit.leases.reduce((leaseSum, lease) => {
          return leaseSum + lease.rentPayments.reduce((paymentSum, payment) => {
            return paymentSum + (payment.amount || 0);
          }, 0);
        }, 0);
      }, 0);
    }, 0);

    const totalExpenses = properties.reduce((sum, prop) => {
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
      properties: properties.map(prop => ({
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
}, { requireRole: ['accountant', 'admin', 'landlord'], allowedMethods: ['POST'] });

