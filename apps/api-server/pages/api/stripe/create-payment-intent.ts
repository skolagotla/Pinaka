/**
 * API Endpoint: Create Stripe Payment Intent
 * POST /api/stripe/create-payment-intent
 * DEACTIVATED - Returns error if Stripe is not enabled
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { createPaymentIntent, isStripeEnabled, getPublishableKey } from '@/lib/services/stripe-service';

async function handler(req: NextApiRequest, res: NextApiResponse, user: UserContext) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check if Stripe is enabled
  if (!(await isStripeEnabled())) {
    return res.status(503).json({
      success: false,
      error: 'Stripe payment processing is currently disabled',
      message: 'To enable: Go to Admin Settings and enable Stripe Payments',
    });
  }

  try {
    const { rentPaymentId, amount, currency = 'usd' } = req.body;

    if (!rentPaymentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'rentPaymentId and amount are required',
      });
    }

    // Only tenants can create payment intents for their own payments
    if (user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        error: 'Only tenants can create payment intents',
      });
    }

    const result = await createPaymentIntent(rentPaymentId, parseFloat(amount), currency);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Stripe API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment intent',
    });
  }
}

export default withAuth(handler, { requireRole: ['tenant'], allowedMethods: ['POST'] });

