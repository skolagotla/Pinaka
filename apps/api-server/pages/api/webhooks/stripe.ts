/**
 * Stripe Webhook Handler
 * Handles subscription events from Stripe
 * 
 * NOTE: Stripe functionality is currently commented out - not needed yet
 * 
 * Required Stripe events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - customer.subscription.trial_will_end
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createErrorResponse, createSuccessResponse, ErrorCodes } from '@/lib/utils/error-response';
// const { prisma } = require('@/lib/prisma');

// Stripe webhook secret from environment
// const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Map Stripe plan to our PlanType
 */
/*
function mapStripePlanToPlanType(stripePlanId: string): 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM' {
  // Map Stripe plan IDs to our plan types
  // Update these based on your actual Stripe plan IDs
  const planMap: Record<string, 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM'> = {
    'price_starter': 'STARTER',
    'price_professional': 'PROFESSIONAL',
    'price_enterprise': 'ENTERPRISE',
    // Add more mappings as needed
  };

  return planMap[stripePlanId] || 'CUSTOM';
}
*/

/**
 * Map Stripe subscription status to our status
 */
/*
function mapStripeStatusToOrgStatus(stripeStatus: string): 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'TRIAL' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return stripeStatus === 'trialing' ? 'TRIAL' : 'ACTIVE';
    case 'past_due':
    case 'unpaid':
      return 'SUSPENDED';
    case 'canceled':
    case 'incomplete_expired':
      return 'CANCELLED';
    default:
      return 'ACTIVE';
  }
}
*/

/**
 * Update organization from Stripe subscription
 */
/*
async function updateOrganizationFromSubscription(
  subscriptionId: string,
  subscription: any
): Promise<void> {
  // Find organization by subscriptionId
  const organization = await prisma.organization.findFirst({
    where: { subscriptionId },
  });

  if (!organization) {
    console.warn(`[Stripe Webhook] Organization not found for subscription: ${subscriptionId}`);
    return;
  }

  const plan = subscription.items?.data?.[0]?.price?.id
    ? mapStripePlanToPlanType(subscription.items.data[0].price.id)
    : organization.plan;

  const status = mapStripeStatusToOrgStatus(subscription.status);

  // Update organization
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan,
      status,
      subscriptionStatus: subscription.status,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`[Stripe Webhook] Updated organization ${organization.id}: plan=${plan}, status=${status}`);
}
*/

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Stripe functionality is currently disabled
  return res.status(503).json({
    success: false,
    error: 'Stripe webhook functionality is currently disabled',
    message: 'Stripe integration is not yet implemented',
  });

  /*
  if (req.method !== 'POST') {
    const { statusCode, response } = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED, 'Method not allowed', 405);
    return res.status(statusCode).json(response);
  }

  try {
    // In production, verify webhook signature
    // Verify webhook signature for security
    let event;
    if (STRIPE_WEBHOOK_SECRET) {
      try {
        // Dynamically import stripe to avoid build errors if package not installed
        let stripe;
        try {
          stripe = require('stripe');
        } catch (importError) {
          console.error('[Stripe Webhook] Stripe package not installed. Install with: npm install stripe');
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.INTERNAL_SERVER_ERROR,
            'Stripe package not installed',
            500
          );
          return res.status(statusCode).json(response);
        }
        
        const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
        const sig = req.headers['stripe-signature'] as string;
        
        if (!sig) {
          const { statusCode, response } = createErrorResponse(
            ErrorCodes.UNAUTHORIZED,
            'Missing Stripe signature',
            401
          );
          return res.status(statusCode).json(response);
        }

        event = stripeClient.webhooks.constructEvent(
          req.body,
          sig,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        const { statusCode, response } = createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          'Invalid webhook signature',
          401
        );
        return res.status(statusCode).json(response);
      }
    } else {
      // Development mode: allow unverified events if secret not set
      console.warn('[Stripe Webhook] WARNING: STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      event = req.body;
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await updateOrganizationFromSubscription(
          event.data.object.id,
          event.data.object
        );
        break;

      case 'customer.subscription.deleted':
        await updateOrganizationFromSubscription(
          event.data.object.id,
          { ...event.data.object, status: 'canceled' }
        );
        break;

      case 'invoice.payment_succeeded':
        // Update subscription status to active
        if (event.data.object.subscription) {
          await updateOrganizationFromSubscription(
            event.data.object.subscription,
            { status: 'active' }
          );
        }
        break;

      case 'invoice.payment_failed':
        // Update subscription status to past_due
        if (event.data.object.subscription) {
          await updateOrganizationFromSubscription(
            event.data.object.subscription,
            { status: 'past_due' }
          );
        }
        break;

      case 'customer.subscription.trial_will_end':
        // Send notification (implement separately)
        console.log(`[Stripe Webhook] Trial ending soon for subscription: ${event.data.object.id}`);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return res.status(200).json(createSuccessResponse({ received: true }));
  } catch (error: any) {
    console.error('[Stripe Webhook] Error:', error);
    const { statusCode, response } = createErrorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Webhook processing failed',
      500,
      process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
    );
    return res.status(statusCode).json(response);
  }
  */
}
