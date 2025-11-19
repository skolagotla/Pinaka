/**
 * Close Period API v1
 * GET/POST /api/v1/analytics/close-period
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { validatePeriodSchema, closePeriodSchema } from '@/lib/schemas';
import { z } from 'zod';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  // Only admins can close periods
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Validate period
    try {
      const query = validatePeriodSchema.parse(req.query);
      
      // Get period details and validate
      const period = await prisma.accountingPeriod.findUnique({
        where: { id: query.periodId },
        include: {
          _count: {
            select: {
              transactions: true,
            }
          }
        }
      });

      if (!period) {
        return res.status(404).json({ error: 'Period not found' });
      }

      if (period.status === 'CLOSED') {
        return res.status(400).json({ error: 'Period is already closed' });
      }

      // Validate period data
      const validation = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[],
        transactionCount: period._count.transactions,
        startDate: period.startDate,
        endDate: period.endDate,
      };

      // Check for unposted transactions
      const unpostedCount = await prisma.transaction.count({
        where: {
          periodId: query.periodId,
          status: 'DRAFT',
        }
      });

      if (unpostedCount > 0) {
        validation.warnings.push(`${unpostedCount} unposted transactions found`);
      }

      // Check for unbalanced accounts
      const accounts = await prisma.account.findMany({
        where: {
          transactions: {
            some: {
              periodId: query.periodId,
            }
          }
        },
        include: {
          transactions: {
            where: {
              periodId: query.periodId,
            }
          }
        }
      });

      const unbalancedAccounts = accounts.filter(account => {
        const balance = account.transactions.reduce((sum, t) => {
          return sum + (t.debitAmount || 0) - (t.creditAmount || 0);
        }, 0);
        return Math.abs(balance) > 0.01; // Allow for rounding
      });

      if (unbalancedAccounts.length > 0) {
        validation.errors.push(`${unbalancedAccounts.length} accounts are unbalanced`);
        validation.isValid = false;
      }

      return res.status(200).json({
        success: true,
        validation,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
      }
      console.error('[Close Period Validate v1] Error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to validate period',
      });
    }
  } else if (req.method === 'POST') {
    // Close period
    try {
      const data = closePeriodSchema.parse(req.body);

      // Validate period first
      const period = await prisma.accountingPeriod.findUnique({
        where: { id: data.periodId },
      });

      if (!period) {
        return res.status(404).json({ error: 'Period not found' });
      }

      if (period.status === 'CLOSED') {
        return res.status(400).json({ error: 'Period is already closed' });
      }

      // Close the period
      const closedPeriod = await prisma.accountingPeriod.update({
        where: { id: data.periodId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedBy: user.userId,
        },
      });

      return res.status(200).json({
        success: true,
        data: closedPeriod,
        message: 'Period closed successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
      }
      console.error('[Close Period v1] Error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to close period',
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}, { requireRole: ['admin'], allowedMethods: ['GET', 'POST'] });

