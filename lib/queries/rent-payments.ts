/**
 * Rent Payment Queries
 * 
 * Centralized Prisma queries for rent payments
 * Reduces duplication and ensures consistent data fetching patterns
 */

import { Prisma } from '@prisma/client';

/**
 * Standard select for rent payment queries (optimized)
 * Uses select instead of include for better performance
 * Includes related lease, unit, property, tenants, and partial payments
 */
export function getRentPaymentSelect() {
  return {
    id: true,
    leaseId: true,
    amount: true,
    dueDate: true,
    paidDate: true,
    paymentMethod: true,
    referenceNumber: true,
    status: true,
    notes: true,
    receiptNumber: true,
    receiptSent: true,
    receiptSentAt: true,
    createdAt: true,
    updatedAt: true,
    overdueReminderSent: true,
    reminderSent: true,
    partialPayments: {
      select: {
        id: true,
        amount: true,
        paidDate: true,
        paymentMethod: true,
        referenceNumber: true,
      },
    },
    lease: {
      select: {
        id: true,
        leaseStart: true,
        leaseEnd: true,
        rentAmount: true,
        status: true,
        unit: {
          select: {
            id: true,
            unitName: true,
            property: {
              select: {
                id: true,
                propertyName: true,
                addressLine1: true,
                city: true,
                provinceState: true,
              },
            },
          },
        },
        leaseTenants: {
          select: {
            tenantId: true,
            isPrimaryTenant: true,
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    },
  };
}

/**
 * @deprecated Use getRentPaymentSelect() instead for better performance
 * Standard include for rent payment queries (kept for backward compatibility)
 */
export function getRentPaymentIncludes() {
  return {
    lease: {
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    },
    partialPayments: true,
  } satisfies Prisma.RentPaymentInclude;
}

/**
 * Get all rent payments for a landlord
 * Used in: landlord dashboard, rent payments page, reports
 */
export function getRentPaymentsForLandlord(prisma: any, landlordId: string, useSelect = true) {
  return prisma.rentPayment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlordId,
          },
        },
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'desc',
    },
  });
}

/**
 * Get rent payments for a tenant
 * Used in: tenant dashboard, tenant rent receipts
 */
export function getRentPaymentsForTenant(prisma: any, tenantId: string, onlyReceipts = false, useSelect = true) {
  return prisma.rentPayment.findMany({
    where: {
      ...(onlyReceipts ? { receiptSent: true } : {}),
      lease: {
        leaseTenants: {
          some: {
            tenantId: tenantId,
          },
        },
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      paidDate: 'desc',
    },
  });
}

/**
 * Get overdue rent payments for a landlord
 * Used in: dashboard alerts, notifications
 */
export function getOverdueRentPayments(prisma: any, landlordId: string, useSelect = true) {
  return prisma.rentPayment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlordId,
          },
        },
      },
      status: {
        in: ['Unpaid', 'Partial'],
      },
      dueDate: {
        lt: new Date(),
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'asc',
    },
  });
}

/**
 * Get upcoming rent payment for a tenant
 * Used in: tenant dashboard
 */
export function getUpcomingRentPaymentForTenant(prisma: any, tenantId: string, useSelect = true) {
  return prisma.rentPayment.findFirst({
    where: {
      lease: {
        leaseTenants: {
          some: {
            tenantId: tenantId,
          },
        },
      },
      status: {
        in: ['Unpaid', 'Partial'],
      },
      dueDate: {
        gte: new Date(),
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'asc',
    },
  });
}

/**
 * Get rent payments by status for a landlord
 * Used in: reports, filtering
 */
export function getRentPaymentsByStatus(
  prisma: any, 
  landlordId: string, 
  status: string | string[],
  useSelect = true
) {
  const statuses = Array.isArray(status) ? status : [status];
  
  return prisma.rentPayment.findMany({
    where: {
      lease: {
        unit: {
          property: {
            landlordId: landlordId,
          },
        },
      },
      status: {
        in: statuses,
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'desc',
    },
  });
}

/**
 * Get rent payments for a specific property
 * Used in: property details, property reports
 */
export function getRentPaymentsForProperty(prisma: any, propertyId: string, useSelect = true) {
  return prisma.rentPayment.findMany({
    where: {
      lease: {
        unit: {
          propertyId: propertyId,
        },
      },
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'desc',
    },
  });
}

/**
 * Get rent payments for a specific lease
 * Used in: lease details page
 */
export function getRentPaymentsForLease(prisma: any, leaseId: string, useSelect = true) {
  return prisma.rentPayment.findMany({
    where: {
      leaseId: leaseId,
    },
    ...(useSelect ? { select: getRentPaymentSelect() } : { include: getRentPaymentIncludes() }),
    orderBy: {
      dueDate: 'desc',
    },
  });
}

/**
 * Get monthly payment history for a tenant
 * Used in: tenant dashboard charts
 */
/**
 * Get monthly payment history (optimized - single query instead of N queries)
 * Fetches all payments in date range, then groups by month in memory
 */
export async function getMonthlyPaymentHistory(
  prisma: any, 
  tenantId: string, 
  months = 6
) {
  // Calculate date range
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Fetch all payments in date range in a single query (optimized)
  const payments = await prisma.rentPayment.findMany({
    where: {
      lease: {
        leaseTenants: {
          some: {
            tenantId: tenantId,
          },
        },
      },
      status: 'Paid',
      paidDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amount: true,
      paidDate: true,
    },
  });
  
  // Group payments by month in memory (O(n) instead of N queries)
  const monthlyMap = new Map<string, { amount: number; count: number }>();
  
  for (const payment of payments) {
    if (!payment.paidDate) continue;
    
    const paymentDate = new Date(payment.paidDate);
    const monthKey = paymentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const existing = monthlyMap.get(monthKey) || { amount: 0, count: 0 };
    monthlyMap.set(monthKey, {
      amount: existing.amount + payment.amount,
      count: existing.count + 1,
    });
  }
  
  // Convert to array and fill in missing months
  const monthlyPayments: Array<{ month: string; amount: number; count: number }> = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const data = monthlyMap.get(monthKey) || { amount: 0, count: 0 };
    monthlyPayments.push({
      month: monthKey,
      amount: data.amount,
      count: data.count,
    });
  }
  
  return monthlyPayments;
}

/**
 * Get rent payment statistics for a landlord
 * Used in: landlord dashboard
 */
export async function getRentPaymentStats(prisma: any, landlordId: string) {
  const [paid, unpaid, partial, overdue] = await Promise.all([
    prisma.rentPayment.count({
      where: {
        lease: { unit: { property: { landlordId } } },
        status: 'Paid',
      },
    }),
    prisma.rentPayment.count({
      where: {
        lease: { unit: { property: { landlordId } } },
        status: 'Unpaid',
      },
    }),
    prisma.rentPayment.count({
      where: {
        lease: { unit: { property: { landlordId } } },
        status: 'Partial',
      },
    }),
    prisma.rentPayment.count({
      where: {
        lease: { unit: { property: { landlordId } } },
        status: { in: ['Unpaid', 'Partial'] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return {
    paid,
    unpaid,
    partial,
    overdue,
    total: paid + unpaid + partial,
  };
}

