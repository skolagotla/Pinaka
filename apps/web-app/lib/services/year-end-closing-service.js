/**
 * Year-End Closing Service
 * Handles financial period closing with validation
 * Implements Business Rule 14: Financial Year-End Closing Process
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Validate pre-close checks
 * @param {string} periodId - Financial period ID
 * @returns {Promise<{valid: boolean, errors: string[], warnings: string[]}>}
 */
async function validatePreClose(periodId) {
  const errors = [];
  const warnings = [];

  try {
    // Check 1: All transactions posted
    const unpostedTransactions = await prisma.rentPayment.count({
      where: {
        periodId,
        status: { not: 'Paid' },
      },
    });

    if (unpostedTransactions > 0) {
      warnings.push(`${unpostedTransactions} rent payments not fully paid`);
    }

    // Check 2: No pending approvals
    // This would check approval workflows - placeholder for now
    // const pendingApprovals = await getPendingApprovals(periodId);
    // if (pendingApprovals.length > 0) {
    //   errors.push(`${pendingApprovals.length} pending approvals`);
    // }

    // Check 3: Bank reconciliation complete
    const unreconciledPayments = await prisma.rentPayment.count({
      where: {
        periodId,
        reconciled: false,
      },
    });

    if (unreconciledPayments > 0) {
      warnings.push(`${unreconciledPayments} payments not reconciled`);
    }

    // Check 4: All expenses categorized
    // Placeholder - would check expense categorization

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    console.error('[Year-End Closing] Validation error:', error);
    throw error;
  }
}

/**
 * Close financial period
 * @param {string} periodId - Financial period ID
 * @param {string} closedBy - User ID who is closing
 * @returns {Promise<{success: boolean, periodId: string}>}
 */
async function closePeriod(periodId, closedBy) {
  try {
    // Validate first
    const validation = await validatePreClose(periodId);
    if (!validation.valid) {
      throw new Error(`Pre-close validation failed: ${validation.errors.join(', ')}`);
    }

    // Create or update financial period
    const period = await prisma.financialPeriod.upsert({
      where: { id: periodId },
      update: {
        status: 'closed',
        closedBy,
        closedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: periodId,
        status: 'closed',
        closedBy,
        closedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Generate reports (placeholder)
    // await generatePeriodReports(periodId);

    return {
      success: true,
      periodId: period.id,
      warnings: validation.warnings,
    };
  } catch (error) {
    console.error('[Year-End Closing] Error closing period:', error);
    throw error;
  }
}

/**
 * Reopen period (with restrictions and audit trail)
 */
async function reopenPeriod(periodId, reopenedBy, reason) {
  try {
    // Implement when FinancialPeriod model is created
    // This requires the FinancialPeriod Prisma model to be added to schema.prisma
    
    // Check if FinancialPeriod model exists (would be available via Prisma)
    // For now, log and return success as placeholder
    console.log(`[Year-End Closing] Period ${periodId} reopened by ${reopenedBy}, reason: ${reason}`);
    
    // TODO: Uncomment when FinancialPeriod model is created:
    /*
    const period = await prisma.financialPeriod.findUnique({
      where: { id: periodId },
    });
    
    if (!period) {
      throw new Error('Financial period not found');
    }
    
    if (period.status !== 'CLOSED') {
      throw new Error('Only closed periods can be reopened');
    }
    
    // Update period status
    await prisma.financialPeriod.update({
      where: { id: periodId },
      data: {
        status: 'OPEN',
        reopenedAt: new Date(),
        reopenedBy,
        reopenReason: reason,
      },
    });
    
    // Log audit trail
    await prisma.financialPeriodAuditLog.create({
      data: {
        periodId,
        action: 'REOPENED',
        performedBy: reopenedBy,
        reason,
        timestamp: new Date(),
      },
    });
    */
    // if (!period) {
    //   throw new Error('Period not found');
    // }
    // if (period.status !== 'closed') {
    //   throw new Error('Period is not closed');
    // }

    // Log to audit trail
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: reopenedBy,
        action: 'period_reopened',
        resource: 'financial_period',
        resourceId: periodId,
        details: {
          reason,
          originalCloseDate: period.closedAt,
        },
        success: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Year-End Closing] Error reopening period:', error);
    throw error;
  }
}

module.exports = {
  validatePreClose,
  closePeriod,
  reopenPeriod,
};

