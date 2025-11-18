/**
 * API Endpoint: Late Fee Rules
 * GET /api/late-fees/rules - Get late fee rules
 * POST /api/late-fees/rules - Create late fee rule
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
const { prisma } = require('@/lib/prisma');

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  if (req.method === 'GET') {
    try {
      const where: any = { isActive: true };

      if (user.role === 'landlord') {
        where.OR = [
          { landlordId: user.userId },
          { landlordId: null }, // System defaults
        ];
      } else if (user.role === 'pmc') {
        // TODO: Get PMC's managed landlords
        where.OR = [
          { pmcId: user.userId },
          { pmcId: null },
        ];
      }

      const rules = await prisma.lateFeeRule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: rules,
      });
    } catch (error) {
      console.error('[Late Fee Rules API] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch late fee rules',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        name,
        feeType,
        feeAmount,
        feePercent,
        dailyRate,
        gracePeriodDays = 0,
        maxFeeAmount,
        autoApply = true,
        autoApplyAfter = 1,
      } = req.body;

      const rule = await prisma.lateFeeRule.create({
        data: {
          name,
          feeType,
          feeAmount: feeAmount ? parseFloat(feeAmount) : null,
          feePercent: feePercent ? parseFloat(feePercent) : null,
          dailyRate: dailyRate ? parseFloat(dailyRate) : null,
          gracePeriodDays: parseInt(gracePeriodDays, 10),
          maxFeeAmount: maxFeeAmount ? parseFloat(maxFeeAmount) : null,
          autoApply,
          autoApplyAfter: parseInt(autoApplyAfter, 10),
          landlordId: user.role === 'landlord' ? user.userId : null,
          pmcId: user.role === 'pmc' ? user.userId : null,
        },
      });

      return res.status(201).json({
        success: true,
        data: rule,
      });
    } catch (error) {
      console.error('[Late Fee Rules API] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create late fee rule',
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

export default withAuth(handler, { requireRole: ['landlord', 'pmc'], allowedMethods: ['GET', 'POST'] });

