/**
 * Payment Dispute and Chargeback Service
 * Implements Business Rule 11.2: Payment Disputes and Chargebacks (Ontario-Compliant)
 * 
 * Rules:
 * - Payment statuses: "Disputed", "Chargeback Pending", "Chargeback Won/Lost", "Reversed"
 * - Late fees: DO NOT auto-reverse, freeze assessment during dispute
 * - Notifications: Tenant, Landlord/PMC, Accountant (optional)
 * - CAN do: Freeze tenant account, prevent maintenance requests, notify legal
 * - MUST NOT do: Auto-evict, auto-send N4 notices, lock tenant out
 */

const { prisma } = require('../prisma');
const { createNotification } = require('./notification-service');
// Import audit logging (TypeScript file - use dynamic import or create JS wrapper)
let logDataAccess = null;
try {
  // Try to import if available
  const auditLogging = require('../rbac/auditLogging');
  logDataAccess = auditLogging.logDataAccess;
} catch (e) {
  // Fallback: create simple audit log directly
  logDataAccess = async (userId, userType, userEmail, userName, resourceType, resourceId, action, ipAddress, userAgent, additionalContext) => {
    try {
      await prisma.rBACAuditLog.create({
        data: {
          userId,
          userType,
          userEmail,
          userName,
          action: `data_access_${action}`,
          resource: resourceType,
          resourceId,
          details: {
            ipAddress,
            userAgent,
            additionalContext,
            timestamp: new Date().toISOString(),
          },
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error('[Audit Log] Failed to log:', error);
    }
  };
}

/**
 * Handle chargeback/dispute detection
 * Called when Stripe webhook receives chargeback.dispute.created event
 */
async function handleChargebackCreated(stripePaymentId, disputeData) {
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

    // Update payment status to "Chargeback Pending"
    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: {
        status: 'chargeback_pending',
        disputeStatus: 'chargeback_pending',
        disputeInitiatedAt: new Date(),
        disputeReason: disputeData.reason || 'Unknown',
        lateFeesFrozen: true, // Freeze late fee assessment
        metadata: {
          ...(stripePayment.metadata || {}),
          disputeId: disputeData.id,
          disputeAmount: disputeData.amount,
          disputeCurrency: disputeData.currency,
        },
      },
    });

    // Mark rent payment as reversed in ledger
    await prisma.rentPayment.update({
      where: { id: stripePayment.rentPaymentId },
      data: {
        status: 'Unpaid', // Mark as unpaid since funds were reversed
        notes: `Payment reversed due to chargeback. Dispute ID: ${disputeData.id}`,
      },
    });

    // Notify tenant
    const tenant = stripePayment.rentPayment.lease.leaseTenants[0]?.tenant;
    if (tenant) {
      await createNotification({
        userId: tenant.id,
        userRole: 'tenant',
        userEmail: tenant.email,
        type: 'payment_disputed',
        title: 'Payment Under Dispute',
        message: 'Your payment is under dispute. Until resolved, rent may be considered unpaid under Ontario law.',
        priority: 'high',
        entityType: 'rent_payment',
        entityId: stripePayment.rentPaymentId,
        actionUrl: `/payments/${stripePayment.rentPaymentId}`,
        actionLabel: 'View Payment',
      });
    }

    // Notify landlord/PMC
    const landlord = stripePayment.rentPayment.lease.unit.property.landlord;
    if (landlord) {
      await createNotification({
        userId: landlord.id,
        userRole: 'landlord',
        userEmail: landlord.email,
        type: 'payment_disputed',
        title: 'Payment Reversed - Chargeback',
        message: `A payment was reversed due to a chargeback. Rent is now outstanding. Amount: $${(stripePayment.amount / 100).toFixed(2)}`,
        priority: 'high',
        entityType: 'rent_payment',
        entityId: stripePayment.rentPaymentId,
        actionUrl: `/rent-payments/${stripePayment.rentPaymentId}`,
        actionLabel: 'View Payment',
        metadata: {
          canMarkUnpaid: true, // Landlord can manually mark as unpaid
        },
      });
    }

    // Freeze tenant account (prevent new payments until dispute resolved)
    // Note: This would require a tenant account status field
    // For now, we'll track this in metadata

    console.log(`[Payment Dispute] Chargeback created for StripePayment ${stripePaymentId}`);
    return { success: true };
  } catch (error) {
    console.error('[Payment Dispute] Error handling chargeback:', error);
    throw error;
  }
}

/**
 * Handle dispute resolution (won or lost)
 * Called when Stripe webhook receives chargeback.dispute.closed event
 */
async function handleDisputeResolved(stripePaymentId, disputeData, won) {
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

    const newStatus = won ? 'chargeback_won' : 'chargeback_lost';
    const paymentStatus = won ? 'succeeded' : 'chargeback_lost';

    // Update payment status
    await prisma.stripePayment.update({
      where: { id: stripePaymentId },
      data: {
        status: paymentStatus,
        disputeStatus: newStatus,
        disputeResolvedAt: new Date(),
        lateFeesFrozen: false, // Unfreeze late fees
        metadata: {
          ...(stripePayment.metadata || {}),
          disputeResolution: won ? 'won' : 'lost',
          disputeResolvedAt: new Date().toISOString(),
        },
      },
    });

    if (won) {
      // Landlord won - restore payment status
      await prisma.rentPayment.update({
        where: { id: stripePayment.rentPaymentId },
        data: {
          status: 'Paid',
          paidDate: new Date(),
        },
      });

      // Notify both parties
      const tenant = stripePayment.rentPayment.lease.leaseTenants[0]?.tenant;
      const landlord = stripePayment.rentPayment.lease.unit.property.landlord;

      if (tenant) {
        await createNotification({
          userId: tenant.id,
          userRole: 'tenant',
          userEmail: tenant.email,
          type: 'payment_dispute_resolved',
          title: 'Dispute Resolved - Payment Restored',
          message: 'The payment dispute has been resolved in favor of the landlord. Your payment has been restored.',
          priority: 'normal',
          entityType: 'rent_payment',
          entityId: stripePayment.rentPaymentId,
        });
      }

      if (landlord) {
        await createNotification({
          userId: landlord.id,
          userRole: 'landlord',
          userEmail: landlord.email,
          type: 'payment_dispute_resolved',
          title: 'Dispute Resolved - You Won',
          message: 'The payment dispute has been resolved in your favor. Payment has been restored.',
          priority: 'normal',
          entityType: 'rent_payment',
          entityId: stripePayment.rentPaymentId,
        });
      }
    } else {
      // Landlord lost - mark as permanently unpaid
      await prisma.rentPayment.update({
        where: { id: stripePayment.rentPaymentId },
        data: {
          status: 'Unpaid',
          notes: `Payment permanently lost due to chargeback. Dispute ID: ${disputeData.id}`,
        },
      });

      // Notify landlord (they may now issue N4 Notice)
      const landlord = stripePayment.rentPayment.lease.unit.property.landlord;
      if (landlord) {
        await createNotification({
          userId: landlord.id,
          userRole: 'landlord',
          userEmail: landlord.email,
          type: 'payment_dispute_resolved',
          title: 'Dispute Resolved - Payment Lost',
          message: 'The payment dispute was resolved in favor of the tenant. The payment is now permanently unpaid. You may issue an N4 Notice if needed.',
          priority: 'high',
          entityType: 'rent_payment',
          entityId: stripePayment.rentPaymentId,
          actionUrl: `/forms?type=N4&tenantId=${stripePayment.rentPayment.lease.leaseTenants[0]?.tenantId}`,
          actionLabel: 'Generate N4 Notice',
        });
      }
    }

    console.log(`[Payment Dispute] Dispute resolved for StripePayment ${stripePaymentId}: ${won ? 'WON' : 'LOST'}`);
    return { success: true, won };
  } catch (error) {
    console.error('[Payment Dispute] Error resolving dispute:', error);
    throw error;
  }
}

/**
 * Mark rent as unpaid (manual action by landlord)
 * Called when landlord clicks "Mark rent as unpaid" button
 */
async function markRentAsUnpaid(rentPaymentId, landlordId) {
  try {
    const rentPayment = await prisma.rentPayment.findUnique({
      where: { id: rentPaymentId },
      include: {
        lease: {
          include: {
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
    });

    if (!rentPayment) {
      throw new Error('Rent payment not found');
    }

    // Verify landlord owns the property
    if (rentPayment.lease.unit.property.landlordId !== landlordId) {
      throw new Error('Unauthorized: You do not own this property');
    }

    // Update rent payment status
    await prisma.rentPayment.update({
      where: { id: rentPaymentId },
      data: {
        status: 'Unpaid',
        notes: `Marked as unpaid by landlord due to chargeback/dispute.`,
      },
    });

    // Log action in audit trail
    try {
      const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
      if (landlord) {
        await logDataAccess(
          landlordId,
          'landlord',
          landlord.email,
          `${landlord.firstName} ${landlord.lastName}`,
          'rent_payment',
          rentPaymentId,
          'mark_unpaid_dispute',
          null, // ipAddress - would be passed from API handler
          null, // userAgent - would be passed from API handler
          {
            reason: 'chargeback_dispute',
            paymentId: rentPaymentId,
            action: 'marked_as_unpaid',
          }
        );
      }
    } catch (auditError) {
      // Don't fail the main operation if audit logging fails
      console.error('[Payment Dispute] Failed to log audit trail:', auditError);
    }

    console.log(`[Payment Dispute] Rent marked as unpaid by landlord ${landlordId} for payment ${rentPaymentId}`);
    return { success: true };
  } catch (error) {
    console.error('[Payment Dispute] Error marking rent as unpaid:', error);
    throw error;
  }
}

module.exports = {
  handleChargebackCreated,
  handleDisputeResolved,
  markRentAsUnpaid,
};

