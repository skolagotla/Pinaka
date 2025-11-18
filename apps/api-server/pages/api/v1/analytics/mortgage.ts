/**
 * Mortgage Analytics API v1
 * GET /api/v1/analytics/mortgage
 * 
 * Domain-Driven, API-First implementation
 * Returns mortgage data for properties
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only landlords can view mortgage data
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get properties with mortgage data for this landlord
    const properties = await prisma.property.findMany({
      where: {
        landlordId: user.userId,
        mortgageAmount: {
          not: null
        }
      },
      select: {
        id: true,
        propertyName: true,
        addressLine1: true,
        city: true,
        mortgageAmount: true,
        mortgageRate: true,
        mortgageTerm: true,
        mortgageStartDate: true,
        mortgagePayment: true,
        mortgageProvider: true,
      },
      orderBy: {
        propertyName: 'asc'
      }
    });

    // Calculate aggregate statistics
    const totalMortgageAmount = properties.reduce((sum: number, p: any) => sum + (p.mortgageAmount || 0), 0);
    const totalMonthlyPayment = properties.reduce((sum: number, p: any) => sum + (p.mortgagePayment || 0), 0);
    const averageRate = properties.length > 0
      ? properties.reduce((sum: number, p: any) => sum + (p.mortgageRate || 0), 0) / properties.length
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        properties,
        summary: {
          totalProperties: properties.length,
          totalMortgageAmount,
          totalMonthlyPayment,
          averageRate: averageRate.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('[Mortgage Analytics v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch mortgage data',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['GET'] });

