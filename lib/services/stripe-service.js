/**
 * Stripe Payment Service
 * Reads configuration from database (PlatformSettings)
 * 
 * To activate:
 * 1. Go to Admin Settings
 * 2. Enable Stripe Payments toggle
 * 3. Enter Stripe API keys
 * 4. Save settings
 */

const { prisma } = require('../prisma');

let stripe = null;
let stripeConfig = null;

// Initialize Stripe from database config
async function initializeStripe(force = false) {
  try {
    // Clear cached config if forcing re-initialization
    if (force) {
      stripeConfig = null;
      stripe = null;
    }

    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'platform_settings' },
    });

    if (!settings || !settings.stripe) {
      stripeConfig = null;
      stripe = null;
      return { enabled: false };
    }

    const config = settings.stripe;
    stripeConfig = config;

    if (config.enabled && config.secretKey) {
      try {
        // Dynamic import to avoid build errors when stripe package is not installed
        const Stripe = require('stripe');
        stripe = new Stripe(config.secretKey);
        console.log('✅ Stripe payment service initialized from database config');
        return { enabled: true, config };
      } catch (error) {
        console.error('❌ Error initializing Stripe:', error);
        stripe = null;
        return { enabled: false, error: error.message };
      }
    } else {
      // Config exists but not enabled or missing key
      stripe = null;
      return { enabled: false };
    }
  } catch (error) {
    console.error('❌ Error loading Stripe config:', error);
    stripe = null;
    stripeConfig = null;
    return { enabled: false };
  }
}

// Initialize on module load
initializeStripe().then(result => {
  if (!result.enabled) {
    console.log('⚠️  Stripe payment service is DEACTIVATED');
    console.log('   To activate: Go to Admin Settings and enable Stripe Payments');
  }
});

// Get current Stripe config
async function getStripeConfig() {
  if (!stripeConfig) {
    await initializeStripe();
  }
  return stripeConfig;
}

const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Check if Stripe is enabled
 */
async function isStripeEnabled() {
  const config = await getStripeConfig();
  return config?.enabled === true && stripe !== null;
}

/**
 * Get or create Stripe customer for a user
 */
async function getOrCreateStripeCustomer(userId, userRole, userEmail, userName) {
  if (!(await isStripeEnabled())) {
    throw new Error('Stripe is not enabled. Enable it in Admin Settings.');
  }

  try {
    // Check if customer exists
    let stripeCustomer = await prisma.stripeCustomer.findFirst({
      where: {
        userId,
        userRole,
      },
    });

    if (stripeCustomer) {
      return stripeCustomer;
    }

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        userId,
        userRole,
      },
    });

    // Save to database
    stripeCustomer = await prisma.stripeCustomer.create({
      data: {
        stripeCustomerId: customer.id,
        userId,
        userRole,
        userEmail,
        name: userName,
        email: userEmail,
      },
    });

    return stripeCustomer;
  } catch (error) {
    console.error('[Stripe Service] Error creating customer:', error);
    throw error;
  }
}

/**
 * Create payment intent for rent payment
 */
async function createPaymentIntent(rentPaymentId, amount, currency = 'usd') {
  if (!(await isStripeEnabled())) {
    throw new Error('Stripe is not enabled. Enable it in Admin Settings.');
  }

  try {
    const rentPayment = await prisma.rentPayment.findUnique({
      where: { id: rentPaymentId },
      include: {
        lease: {
          include: {
            leaseTenants: {
              where: { isPrimaryTenant: true },
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });

    if (!rentPayment) {
      throw new Error('Rent payment not found');
    }

    const tenant = rentPayment.lease.leaseTenants[0]?.tenant;
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer(
      tenant.id,
      'tenant',
      tenant.email,
      `${tenant.firstName} ${tenant.lastName}`
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomer.stripeCustomerId,
      metadata: {
        rentPaymentId,
        tenantId: tenant.id,
        type: 'rent_payment',
      },
      description: `Rent payment - ${rentPaymentId}`,
    });

    // Save to database
    const stripePayment = await prisma.stripePayment.create({
      data: {
        rentPaymentId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: stripeCustomer.stripeCustomerId,
        amount: amount * 100, // Store in cents
        currency,
        status: paymentIntent.status,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      stripePaymentId: stripePayment.id,
    };
  } catch (error) {
    console.error('[Stripe Service] Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook
 */
async function handleWebhook(event) {
  if (!(await isStripeEnabled())) {
    throw new Error('Stripe is not enabled');
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'charge.dispute.created':
        // Handle chargeback/dispute creation
        await handleChargebackDispute(event.data.object);
        break;

      case 'charge.dispute.closed':
        // Handle dispute resolution
        await handleDisputeResolution(event.data.object);
        break;

      default:
        console.log(`[Stripe Service] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('[Stripe Service] Error handling webhook:', error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        rentPayment: {
          include: {
            lease: {
              include: {
                leaseTenants: {
                  include: {
                    tenant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!stripePayment) {
      console.error('[Stripe Service] Payment not found:', paymentIntent.id);
      return;
    }

    // Update Stripe payment record
    await prisma.stripePayment.update({
      where: { id: stripePayment.id },
      data: {
        status: 'succeeded',
        stripeChargeId: paymentIntent.latest_charge,
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url,
        webhookReceived: true,
        webhookReceivedAt: new Date(),
      },
    });

    // Update rent payment
    const amountPaid = paymentIntent.amount / 100; // Convert from cents
    const currentBalance = stripePayment.rentPayment.balance || stripePayment.rentPayment.amount;

    await prisma.rentPayment.update({
      where: { id: stripePayment.rentPaymentId },
      data: {
        status: amountPaid >= currentBalance ? 'Paid' : 'Partial',
        paidDate: new Date(),
        balance: Math.max(0, currentBalance - amountPaid),
        paymentMethod: 'stripe',
      },
    });

    // Send notification
    const tenant = stripePayment.rentPayment.lease.leaseTenants[0]?.tenant;
    if (tenant) {
      await createNotification({
        userId: tenant.id,
        userRole: 'tenant',
        userEmail: tenant.email,
        type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
        title: 'Payment Received',
        message: `Your payment of $${amountPaid.toFixed(2)} has been successfully processed.`,
        priority: 'normal',
        entityType: 'rent_payment',
        entityId: stripePayment.rentPaymentId,
        actionUrl: `/payments`,
        actionLabel: 'View Payment',
      });
    }
  } catch (error) {
    console.error('[Stripe Service] Error handling payment success:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 * Implements Business Rule 11.1: Failed Payment Retry Logic
 */
async function handlePaymentFailure(paymentIntent) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
      include: {
        rentPayment: {
          include: {
            lease: {
              include: {
                leaseTenants: {
                  where: { isPrimaryTenant: true },
                  include: {
                    tenant: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!stripePayment) {
      console.error('[Stripe Service] Payment not found for failure:', paymentIntent.id);
      return;
    }

    const { schedulePaymentRetry } = require('./payment-retry-service');
    const { createNotification } = require('./notification-service');

    // Update status
    await prisma.stripePayment.update({
      where: { id: stripePayment.id },
      data: {
        status: 'failed',
        webhookReceived: true,
        webhookReceivedAt: new Date(),
        lastRetryAt: new Date(),
      },
    });

    // Schedule first retry (automatic, no approval needed)
    if (stripePayment.retryCount < 3) {
      const retryNumber = stripePayment.retryCount + 1;
      const requiresApproval = retryNumber >= 2; // 2nd and 3rd retries require approval

      await schedulePaymentRetry(stripePayment.id, retryNumber, requiresApproval);

      // Notify tenant about failure
      const tenant = stripePayment.rentPayment.lease.leaseTenants[0]?.tenant;
      if (tenant) {
        await createNotification({
          userId: tenant.id,
          userRole: 'tenant',
          userEmail: tenant.email,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Your rent payment of $${(stripePayment.amount / 100).toFixed(2)} failed. ${retryNumber === 1 ? 'We will automatically retry in 12 hours.' : 'Please approve the retry attempt in your account.'}`,
          priority: 'high',
          entityType: 'rent_payment',
          entityId: stripePayment.rentPaymentId,
          actionUrl: `/payments/${stripePayment.rentPaymentId}`,
          actionLabel: 'View Payment',
        });
      }
    } else {
      // All retries exhausted, handle final failure
      const { handleFinalPaymentFailure } = require('./payment-retry-service');
      await handleFinalPaymentFailure(stripePayment.id);
    }
  } catch (error) {
    console.error('[Stripe Service] Error handling payment failure:', error);
    throw error;
  }
}

/**
 * Handle chargeback/dispute creation
 * Implements Business Rule 11.2: Payment Disputes and Chargebacks
 */
async function handleChargebackDispute(dispute) {
  try {
    const { handleChargebackCreated } = require('./payment-dispute-service');
    
    // Find StripePayment by charge ID
    const stripePayment = await prisma.stripePayment.findFirst({
      where: {
        stripeChargeId: dispute.charge,
      },
    });

    if (!stripePayment) {
      console.error('[Stripe Service] StripePayment not found for chargeback:', dispute.charge);
      return;
    }

    await handleChargebackCreated(stripePayment.id, {
      id: dispute.id,
      reason: dispute.reason,
      amount: dispute.amount,
      currency: dispute.currency,
    });
  } catch (error) {
    console.error('[Stripe Service] Error handling chargeback:', error);
    throw error;
  }
}

/**
 * Handle dispute resolution
 */
async function handleDisputeResolution(dispute) {
  try {
    const { handleDisputeResolved } = require('./payment-dispute-service');
    
    // Find StripePayment by charge ID
    const stripePayment = await prisma.stripePayment.findFirst({
      where: {
        stripeChargeId: dispute.charge,
      },
    });

    if (!stripePayment) {
      console.error('[Stripe Service] StripePayment not found for dispute resolution:', dispute.charge);
      return;
    }

    const won = dispute.status === 'won';
    await handleDisputeResolved(stripePayment.id, {
      id: dispute.id,
      status: dispute.status,
    }, won);
  } catch (error) {
    console.error('[Stripe Service] Error handling dispute resolution:', error);
    throw error;
  }
}

/**
 * Get Stripe publishable key
 */
async function getPublishableKey() {
  const config = await getStripeConfig();
  return config?.publishableKey || null;
}

module.exports = {
  isStripeEnabled,
  getStripeConfig,
  getPublishableKey,
  getOrCreateStripeCustomer,
  createPaymentIntent,
  handleWebhook,
  initializeStripe, // Export for manual re-initialization after config change
};

