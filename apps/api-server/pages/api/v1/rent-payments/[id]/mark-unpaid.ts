/**
 * Mark Rent Payment as Unpaid API v1
 * POST /api/v1/rent-payments/:id/mark-unpaid
 * 
 * Domain-Driven, API-First implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentService } from '@/lib/domains/rent-payment';
const { prisma } = require('@/lib/prisma');

export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid rent payment ID' });
    }

    // Only landlords can mark payments as unpaid
    if (user.role !== 'landlord') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get rent payment and check ownership
    const payment = await prisma.rentPayment.findUnique({
      where: { id },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Rent payment not found' });
    }

    if (payment.lease?.unit?.property?.landlordId !== user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update payment status to unpaid via domain service
    await rentPaymentService.update(id, {
      status: 'Unpaid',
      paidDate: undefined,
      paymentMethod: undefined,
    } as any);

    return res.status(200).json({
      success: true,
      message: 'Payment marked as unpaid',
    });
  } catch (error) {
    console.error('[Mark Rent Payment Unpaid v1] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to mark payment as unpaid',
    });
  }
}, { requireRole: ['landlord'], allowedMethods: ['POST'] });

