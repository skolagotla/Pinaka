/**
 * Bank Reconciliation API
 * GET /api/bank-reconciliation - List reconciliations
 * POST /api/bank-reconciliation - Create reconciliation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { hasPermission, canAccessResource } from '@/lib/rbac';
import { ResourceCategory, PermissionAction } from '@prisma/client';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    try {
      const { pmcId, landlordId, propertyId, status } = req.query;

      let where: any = {};

      // Build where clause based on user role
      if (user.role === 'pmc') {
        where.pmcId = user.userId;
      } else if (user.role === 'landlord') {
        where.landlordId = user.userId;
      }

      if (pmcId) {
        where.pmcId = pmcId as string;
      }
      if (landlordId) {
        where.landlordId = landlordId as string;
      }
      if (propertyId) {
        where.propertyId = propertyId as string;
      }
      if (status) {
        where.status = status as string;
      }

      // Check permission
      const canView = await hasPermission(
        user.userId,
        user.role,
        'bank_reconciliation',
        PermissionAction.READ,
        ResourceCategory.ACCOUNTING
      );

      if (!canView) {
        return res.status(403).json({ error: 'You do not have permission to view bank reconciliations' });
      }

      const reconciliations = await prisma.bankReconciliation.findMany({
        where,
        include: {
          pmc: {
            select: {
              id: true,
              companyName: true,
            },
          },
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          property: {
            select: {
              id: true,
              propertyName: true,
            },
          },
        },
        orderBy: {
          reconciliationDate: 'desc',
        },
      });

      return res.status(200).json({ reconciliations });
    } catch (error: any) {
      console.error('Error fetching bank reconciliations:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch bank reconciliations' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        reconciliationDate,
        pmcId,
        landlordId,
        propertyId,
        startingBalance,
        endingBalance,
        matchedPayments,
        matchedExpenses,
        unmatchedPayments,
        unmatchedExpenses,
        notes,
      } = req.body;

      if (!reconciliationDate || !startingBalance || !endingBalance) {
        return res.status(400).json({ error: 'reconciliationDate, startingBalance, and endingBalance are required' });
      }

      // Check permission
      const canCreate = await hasPermission(
        user.userId,
        user.role,
        'bank_reconciliation',
        PermissionAction.CREATE,
        ResourceCategory.ACCOUNTING
      );

      if (!canCreate) {
        return res.status(403).json({ error: 'You do not have permission to create bank reconciliations' });
      }

      // Calculate reconciliation result
      const reconciledAmount = parseFloat(endingBalance) - parseFloat(startingBalance);
      const difference = 0; // Would be calculated based on matched vs unmatched items

      const reconciliation = await prisma.bankReconciliation.create({
        data: {
          reconciliationDate: new Date(reconciliationDate),
          pmcId: pmcId || null,
          landlordId: landlordId || null,
          propertyId: propertyId || null,
          startingBalance: parseFloat(startingBalance),
          endingBalance: parseFloat(endingBalance),
          matchedPayments: matchedPayments || [],
          matchedExpenses: matchedExpenses || [],
          unmatchedPayments: unmatchedPayments || [],
          unmatchedExpenses: unmatchedExpenses || [],
          reconciledAmount,
          difference,
          status: 'draft',
          notes,
        },
        include: {
          pmc: true,
          landlord: true,
          property: true,
        },
      });

      return res.status(201).json({ reconciliation });
    } catch (error: any) {
      console.error('Error creating bank reconciliation:', error);
      return res.status(500).json({ error: error.message || 'Failed to create bank reconciliation' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});

