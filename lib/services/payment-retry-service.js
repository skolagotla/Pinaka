/**
 * Payment Retry Service
 * Implements Business Rule 11.1: Failed Payment Retry Logic
 * 
 * Rules:
 * - 3 retries total, 12 hours apart
 * - First retry: Automatic (12 hours after first failure)
 * - Second and third retries: Require tenant approval
 * - If tenant doesn't respond, only 1 automatic attempt
 * - Notify tenant after each failed attempt
 * - After all retries fail: Mark as "Failed", apply late fees after due date
 */

const { prisma } = require('../prisma');
const { createNotification } = require('./notification-service');

const RETRY_INTERVAL_HOURS = 12;
const MAX_RETRIES = 3;

/**
 * Schedule payment retry
 * @param {string} stripePaymentId - StripePayment ID
 * @param {number} retryNumber - Which retry attempt (1, 2, or 3)
 * @param {boolean} requiresApproval - Whether tenant approval is required
 */
async function schedulePaymentRetry(stripePaymentId, retryNumber, requiresApproval = false) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: { id: stripePaymentId },
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
      throw new Error(`StripePayment not found: ${stripePaymentId}`);
    }

    // Calculate next retry time (12 hours from now)
    const retryScheduledAt = new Date();
    retryScheduledAt.setHours(retryScheduledAt.getHours() + RETRY_INTERVAL_HOURS);

    // Update StripePayment with retry information
    const updateData = {
      retryCount: retryNumber,
      retryScheduledAt,
      lastRetryAt: new Date(),
      requiresTenantApproval: requiresApproval,
    };

    // If requires approval, reset approval status
    if (requiresApproval) {
      updateData.tenantApprovedRetry = null;
      updateData.tenantApprovedAt = null;
    }

    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: updateData,
    });

    // Notify tenant about failed payment and retry
    const tenant = stripePayment.rentPayment.lease.leaseTenants[0]?.tenant;
    if (tenant) {
      const retryMessage = requiresApproval
        ? `Your payment attempt failed. We need your approval to retry the payment. Please review and approve the retry in your account.`
        : `Your payment attempt failed. We will automatically retry the payment in 12 hours.`;

      await createNotification({
        userId: tenant.id,
        userRole: 'tenant',
        userEmail: tenant.email,
        type: 'payment_failed',
        title: 'Payment Failed - Retry Scheduled',
        message: `Your rent payment of $${(stripePayment.amount / 100).toFixed(2)} failed. ${retryMessage}`,
        priority: 'high',
        entityType: 'rent_payment',
        entityId: stripePayment.rentPaymentId,
        actionUrl: `/payments/${stripePayment.rentPaymentId}`,
        actionLabel: 'View Payment',
        metadata: {
          stripePaymentId,
          retryNumber,
          requiresApproval,
          retryScheduledAt: retryScheduledAt.toISOString(),
        },
      });
    }

    console.log(`[Payment Retry] Scheduled retry #${retryNumber} for StripePayment ${stripePaymentId} at ${retryScheduledAt.toISOString()}`);
    return { success: true, retryScheduledAt };
  } catch (error) {
    console.error('[Payment Retry] Error scheduling retry:', error);
    throw error;
  }
}

/**
 * Process scheduled payment retries
 * Called by cron job to process retries that are due
 */
async function processScheduledRetries() {
  try {
    const now = new Date();
    
    // Find payments with scheduled retries that are due
    const dueRetries = await prisma.stripePayment.findMany({
      where: {
        status: 'failed',
        retryScheduledAt: {
          lte: now,
        },
        retryCount: {
          lt: MAX_RETRIES,
        },
        OR: [
          { requiresTenantApproval: false },
          { 
            requiresTenantApproval: true,
            tenantApprovedRetry: true,
          },
        ],
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

    console.log(`[Payment Retry] Processing ${dueRetries.length} scheduled retries`);

    for (const stripePayment of dueRetries) {
      try {
        // Check if tenant approval is required and not given
        if (stripePayment.requiresTenantApproval && stripePayment.tenantApprovedRetry !== true) {
          console.log(`[Payment Retry] Skipping retry for ${stripePayment.id} - tenant approval required but not given`);
          continue;
        }

        const nextRetryNumber = stripePayment.retryCount + 1;
        const requiresApproval = nextRetryNumber >= 2; // 2nd and 3rd retries require approval

        // Attempt to retry payment via Stripe
        // Note: This would require creating a new PaymentIntent
        // For now, we'll schedule the retry and mark it
        await schedulePaymentRetry(stripePayment.id, nextRetryNumber, requiresApproval);

        // Retry payment via Stripe API (when Stripe is configured)
        // Stripe functionality removed - not needed yet
        if (false && process.env.STRIPE_SECRET_KEY) {
          try {
            // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            
            // Get the original payment intent
            const originalPaymentIntent = stripePayment.paymentIntentId;
            if (originalPaymentIntent) {
              // Create a new payment attempt
              // Note: Stripe doesn't allow retrying the same PaymentIntent
              // You would need to create a new PaymentIntent with the same amount
              const newPaymentIntent = await stripe.paymentIntents.create({
                amount: stripePayment.amount,
                currency: stripePayment.currency || 'cad',
                customer: stripePayment.customerId,
                payment_method: stripePayment.paymentMethodId,
                confirm: true,
                metadata: {
                  rentPaymentId: rentPayment.id,
                  retryNumber: nextRetryNumber.toString(),
                  originalPaymentIntentId: originalPaymentIntent,
                },
              });
              
              if (newPaymentIntent.status === 'succeeded') {
                // Update payment status
                await prisma.stripePayment.update({
                  where: { id: stripePayment.id },
                  data: {
                    status: 'succeeded',
                    paymentIntentId: newPaymentIntent.id,
                  },
                });
                
                await prisma.rentPayment.update({
                  where: { id: rentPayment.id },
                  data: { status: 'Paid' },
                });
                
                return { success: true, paymentIntentId: newPaymentIntent.id };
              }
            }
          } catch (stripeError) {
            console.error('[Payment Retry] Stripe API error:', stripeError);
            throw new Error(`Stripe payment retry failed: ${stripeError.message}`);
          }
        } else {
          console.log('[Payment Retry] Stripe not configured - payment retry scheduled but not processed');
          // Payment retry is scheduled, but actual processing requires Stripe configuration
        }

      } catch (error) {
        console.error(`[Payment Retry] Error processing retry for ${stripePayment.id}:`, error);
        // Continue with other retries
      }
    }

    return { processed: dueRetries.length };
  } catch (error) {
    console.error('[Payment Retry] Error processing scheduled retries:', error);
    throw error;
  }
}

/**
 * Handle final payment failure (all retries exhausted)
 */
async function handleFinalPaymentFailure(stripePaymentId) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: { id: stripePaymentId },
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
                unit: {
                  include: {
                    property: {
                      include: {
                        landlord: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!stripePayment) {
      throw new Error(`StripePayment not found: ${stripePaymentId}`);
    }

    // Mark payment as finally failed
    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: {
        status: 'failed',
        retryScheduledAt: null, // Clear scheduled retry
      },
    });

    // Update rent payment status
    const rentPayment = stripePayment.rentPayment;
    const dueDate = new Date(rentPayment.dueDate);
    const now = new Date();

    // Only mark as overdue and apply late fees if due date has passed
    if (now > dueDate) {
      await prisma.rentPayment.update({
        where: { id: rentPayment.id },
        data: {
          status: 'Overdue',
        },
      });

      // Apply late fees using late fee service
      try {
        const { calculateAndApplyLateFee } = require('./late-fee-service');
        const lateFeeResult = await calculateAndApplyLateFee(
          rentPayment.id,
          null, // rule - will be fetched automatically
          {
            userId: context?.userId || 'system',
            userRole: context?.userRole || 'system',
            userEmail: context?.userEmail || 'system@pinaka.com',
          }
        );
        
        if (lateFeeResult) {
          console.log(`[Payment Retry] Late fee applied: $${lateFeeResult.amount} for payment ${rentPayment.id}`);
        }
      } catch (lateFeeError) {
        console.error('[Payment Retry] Failed to apply late fee:', lateFeeError);
        // Don't fail the payment retry if late fee calculation fails
      }
    } else {
      // Due date hasn't passed yet, just mark as Unpaid
      await prisma.rentPayment.update({
        where: { id: rentPayment.id },
        data: {
          status: 'Unpaid',
        },
      });
    }

    // Notify tenant
    const tenant = rentPayment.lease.leaseTenants[0]?.tenant;
    if (tenant) {
      await createNotification({
        userId: tenant.id,
        userRole: 'tenant',
        userEmail: tenant.email,
        type: 'payment_failed',
        title: 'Payment Failed - All Retries Exhausted',
        message: `All payment retry attempts have failed. Your rent payment of $${(stripePayment.amount / 100).toFixed(2)} remains unpaid. Please update your payment method or contact your landlord.`,
        priority: 'urgent',
        entityType: 'rent_payment',
        entityId: rentPayment.id,
        actionUrl: `/payments/${rentPayment.id}`,
        actionLabel: 'Update Payment Method',
      });
    }

    // Notify landlord/PMC
    const landlord = rentPayment.lease.unit.property.landlord;
    if (landlord) {
      await createNotification({
        userId: landlord.id,
        userRole: 'landlord',
        userEmail: landlord.email,
        type: 'payment_failed',
        title: 'Tenant Payment Failed - All Retries Exhausted',
        message: `Payment for ${tenant?.firstName} ${tenant?.lastName} has failed after all retry attempts. Amount: $${(stripePayment.amount / 100).toFixed(2)}`,
        priority: 'high',
        entityType: 'rent_payment',
        entityId: rentPayment.id,
        actionUrl: `/rent-payments/${rentPayment.id}`,
        actionLabel: 'View Payment',
      });
    }

    console.log(`[Payment Retry] Final failure handled for StripePayment ${stripePaymentId}`);
    return { success: true };
  } catch (error) {
    console.error('[Payment Retry] Error handling final failure:', error);
    throw error;
  }
}

/**
 * Approve retry (called by tenant)
 */
async function approveRetry(stripePaymentId, tenantId) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: { id: stripePaymentId },
      include: {
        rentPayment: {
          include: {
            lease: {
              include: {
                leaseTenants: {
                  where: { tenantId },
                },
              },
            },
          },
        },
      },
    });

    if (!stripePayment) {
      throw new Error('Payment not found');
    }

    // Verify tenant is on the lease
    if (!stripePayment.rentPayment.lease.leaseTenants.length) {
      throw new Error('Tenant not authorized to approve this payment retry');
    }

    // Update approval status
    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: {
        tenantApprovedRetry: true,
        tenantApprovedAt: new Date(),
      },
    });

    console.log(`[Payment Retry] Retry approved by tenant ${tenantId} for StripePayment ${stripePaymentId}`);
    return { success: true };
  } catch (error) {
    console.error('[Payment Retry] Error approving retry:', error);
    throw error;
  }
}

/**
 * Reject retry (called by tenant)
 */
async function rejectRetry(stripePaymentId, tenantId) {
  try {
    const stripePayment = await prisma.stripePayment.findUnique({
      where: { id: stripePaymentId },
      include: {
        rentPayment: {
          include: {
            lease: {
              include: {
                leaseTenants: {
                  where: { tenantId },
                },
              },
            },
          },
        },
      },
    });

    if (!stripePayment) {
      throw new Error('Payment not found');
    }

    // Verify tenant is on the lease
    if (!stripePayment.rentPayment.lease.leaseTenants.length) {
      throw new Error('Tenant not authorized to reject this payment retry');
    }

    // Update approval status and cancel retry
    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: {
        tenantApprovedRetry: false,
        tenantApprovedAt: new Date(),
        retryScheduledAt: null, // Cancel scheduled retry
      },
    });

    // If this was the last retry, handle final failure
    if (stripePayment.retryCount >= MAX_RETRIES - 1) {
      await handleFinalPaymentFailure(stripePaymentId);
    }

    console.log(`[Payment Retry] Retry rejected by tenant ${tenantId} for StripePayment ${stripePaymentId}`);
    return { success: true };
  } catch (error) {
    console.error('[Payment Retry] Error rejecting retry:', error);
    throw error;
  }
}

module.exports = {
  schedulePaymentRetry,
  processScheduledRetries,
  handleFinalPaymentFailure,
  approveRetry,
  rejectRetry,
  RETRY_INTERVAL_HOURS,
  MAX_RETRIES,
};

