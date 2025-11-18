/**
 * API Endpoint: Stripe Webhook
 * POST /api/stripe/webhook
 * DEACTIVATED - Returns error if Stripe is not enabled
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { handleWebhook, isStripeEnabled, getStripeConfig } from '@/lib/services/stripe-service';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Stripe needs raw body
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Check if Stripe is enabled
  if (!(await isStripeEnabled())) {
    return res.status(503).json({
      success: false,
      error: 'Stripe payment processing is currently disabled',
    });
  }

  try {
    const config = await getStripeConfig();
    if (!config?.secretKey || !config?.webhookSecret) {
      return res.status(500).json({
        success: false,
        error: 'Stripe configuration incomplete',
      });
    }

    // Dynamic import to avoid build errors when stripe package is not installed
    const Stripe = require('stripe');
    const stripe = new Stripe(config.secretKey);
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({
        success: false,
        error: 'Missing stripe-signature header',
      });
    }

    // Get raw body
    const rawBody = await getRawBody(req);

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, config.webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return res.status(400).json({
        success: false,
        error: 'Invalid signature',
      });
    }

    // Handle webhook
    await handleWebhook(event);

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
}

// Helper to get raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default handler;

