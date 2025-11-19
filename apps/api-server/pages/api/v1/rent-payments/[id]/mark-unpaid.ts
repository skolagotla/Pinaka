/**
 * Mark Rent Payment as Unpaid API v1
 * POST /api/v1/rent-payments/:id/mark-unpaid
 * 
 * Domain-Driven, API-First, Shared-Schema implementation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { rentPaymentService } from '@/lib/domains/rent-payment';

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

    // Check ownership using domain service (Domain-Driven Design)
    const hasAccess = await rentPaymentService.belongsToLandlord(id, user.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update payment status to unpaid via domain service
    await rentPaymentService.markUnpaid(id);

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

