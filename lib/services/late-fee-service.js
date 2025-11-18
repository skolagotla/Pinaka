/**
 * Late Fee Service
 * Handles late fee calculation and application
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Get active late fee rule for a landlord/PMC
 */
async function getActiveLateFeeRule(landlordId, pmcId = null) {
  try {
    // Try to get PMC-specific rule first
    if (pmcId) {
      const pmcRule = await prisma.lateFeeRule.findFirst({
        where: {
          pmcId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (pmcRule) return pmcRule;
    }

    // Try landlord-specific rule
    if (landlordId) {
      const landlordRule = await prisma.lateFeeRule.findFirst({
        where: {
          landlordId,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (landlordRule) return landlordRule;
    }

    // Return system default (null landlordId and pmcId)
    const defaultRule = await prisma.lateFeeRule.findFirst({
      where: {
        landlordId: null,
        pmcId: null,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return defaultRule;
  } catch (error) {
    console.error('[Late Fee Service] Error getting rule:', error);
    return null;
  }
}

/**
 * Calculate late fee for a rent payment
 */
function calculateLateFee(rentPayment, rule) {
  if (!rule || !rule.isActive) {
    return null;
  }

  const dueDate = new Date(rentPayment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

  // Check grace period
  if (daysOverdue <= rule.gracePeriodDays) {
    return null;
  }

  // Check if payment is actually overdue
  if (rentPayment.status === 'Paid' && rentPayment.balance === 0) {
    return null;
  }

  let feeAmount = 0;

  switch (rule.feeType) {
    case 'fixed':
      feeAmount = rule.feeAmount || 0;
      break;

    case 'percentage':
      feeAmount = (rentPayment.amount * (rule.feePercent || 0)) / 100;
      break;

    case 'daily':
      const daysToCharge = daysOverdue - rule.gracePeriodDays;
      if (rule.compoundDaily) {
        // Compound daily fee
        feeAmount = rentPayment.amount * Math.pow(1 + (rule.dailyRate || 0) / 100, daysToCharge) - rentPayment.amount;
      } else {
        // Simple daily fee
        feeAmount = (rule.dailyRate || 0) * daysToCharge;
      }
      break;

    default:
      return null;
  }

  // Apply max fee cap if set
  if (rule.maxFeeAmount && feeAmount > rule.maxFeeAmount) {
    feeAmount = rule.maxFeeAmount;
  }

  return {
    feeAmount: Math.round(feeAmount * 100) / 100, // Round to 2 decimal places
    feeType: rule.feeType,
    daysOverdue,
    ruleId: rule.id,
  };
}

/**
 * Apply late fee to a rent payment
 */
async function applyLateFee(rentPaymentId, rule = null) {
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
            leaseTenants: {
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

    // Get rule if not provided
    if (!rule) {
      const landlordId = rentPayment.lease.unit.property.landlordId;
      // Get PMC ID if applicable (property is managed by PMC)
      let pmcId = null;
      if (rentPayment.lease.unit.property.pmcId) {
        pmcId = rentPayment.lease.unit.property.pmcId;
      } else if (rentPayment.lease.unit.property.landlord?.pmcId) {
        // Check if landlord is managed by PMC
        pmcId = rentPayment.lease.unit.property.landlord.pmcId;
      }
      rule = await getActiveLateFeeRule(landlordId, pmcId);
    }

    if (!rule) {
      return null; // No rule configured
    }

    // Check if late fee already applied
    const existingFee = await prisma.lateFee.findFirst({
      where: {
        rentPaymentId,
        isPaid: false,
      },
    });

    if (existingFee) {
      return existingFee; // Already has an unpaid late fee
    }

    // Calculate fee
    const feeCalculation = calculateLateFee(rentPayment, rule);

    if (!feeCalculation || feeCalculation.feeAmount <= 0) {
      return null; // No fee to apply
    }

    // Create late fee record
    const lateFee = await prisma.lateFee.create({
      data: {
        rentPaymentId,
        ruleId: rule.id,
        feeAmount: feeCalculation.feeAmount,
        feeType: feeCalculation.feeType,
        calculatedAt: new Date(),
        appliedAt: new Date(),
      },
    });

    // Send notification to tenant
    const primaryTenant = rentPayment.lease.leaseTenants.find(lt => lt.isPrimaryTenant)?.tenant ||
                          rentPayment.lease.leaseTenants[0]?.tenant;

    if (primaryTenant) {
      await createNotification({
        userId: primaryTenant.id,
        userRole: 'tenant',
        userEmail: primaryTenant.email,
        type: NOTIFICATION_TYPES.LATE_FEE_APPLIED,
        title: 'Late Fee Applied',
        message: `A late fee of $${feeCalculation.feeAmount.toFixed(2)} has been applied to your rent payment due ${new Date(rentPayment.dueDate).toLocaleDateString()}.`,
        priority: 'high',
        entityType: 'late_fee',
        entityId: lateFee.id,
        actionUrl: `/payments`,
        actionLabel: 'View Payment',
      });
    }

    return lateFee;
  } catch (error) {
    console.error('[Late Fee Service] Error applying late fee:', error);
    throw error;
  }
}

/**
 * Auto-apply late fees for overdue payments
 */
async function autoApplyLateFees(landlordId = null) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get overdue rent payments
    const where = {
      status: { not: 'Paid' },
      dueDate: { lt: today },
      OR: [
        { balance: { gt: 0 } },
        { status: { in: ['Unpaid', 'Overdue', 'Partial'] } },
      ],
    };

    if (landlordId) {
      where.lease = {
        unit: {
          property: {
            landlordId,
          },
        },
      };
    }

    const overduePayments = await prisma.rentPayment.findMany({
      where,
      include: {
        lateFees: {
          where: {
            isPaid: false,
          },
        },
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

    let appliedCount = 0;

    for (const payment of overduePayments) {
      // Check if already has unpaid late fee
      if (payment.lateFees.length > 0) {
        continue;
      }

      // Get rule
      const landlordId = payment.lease.unit.property.landlordId;
      const rule = await getActiveLateFeeRule(landlordId);

      if (!rule || !rule.autoApply) {
        continue;
      }

      // Check auto-apply timing
      const daysOverdue = Math.floor((today - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24));
      if (daysOverdue < rule.autoApplyAfter) {
        continue;
      }

      // Apply late fee
      try {
        await applyLateFee(payment.id, rule);
        appliedCount++;
      } catch (error) {
        console.error(`[Late Fee Service] Error applying fee to payment ${payment.id}:`, error);
      }
    }

    return { appliedCount, totalChecked: overduePayments.length };
  } catch (error) {
    console.error('[Late Fee Service] Error auto-applying late fees:', error);
    throw error;
  }
}

module.exports = {
  getActiveLateFeeRule,
  calculateLateFee,
  applyLateFee,
  autoApplyLateFees,
};

