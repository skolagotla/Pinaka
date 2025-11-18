/**
 * Rent Payment Repository
 * 
 * Data access layer for Rent Payment domain
 */

import { PrismaClient } from '@prisma/client';
import { RentPaymentCreate, RentPaymentUpdate, RentPaymentQuery } from '@/lib/schemas';

export class RentPaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find rent payment by ID
   */
  async findById(id: string, include?: { lease?: boolean; partialPayments?: boolean; stripePayments?: boolean }) {
    return this.prisma.rentPayment.findUnique({
      where: { id },
      include: {
        partialPayments: include?.partialPayments ? {
          select: {
            id: true,
            amount: true,
            paidDate: true,
            paymentMethod: true,
            referenceNumber: true,
            notes: true,
          },
        } : false,
        stripePayments: include?.stripePayments ? {
          select: {
            id: true,
            status: true,
            retryCount: true,
            retryScheduledAt: true,
            lastRetryAt: true,
            requiresTenantApproval: true,
            tenantApprovedRetry: true,
            tenantApprovedAt: true,
            disputeStatus: true,
            disputeInitiatedAt: true,
            disputeResolvedAt: true,
            disputeReason: true,
            lateFeesFrozen: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        } : false,
        lease: include?.lease ? {
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
                    landlord: {
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
        } : false,
      },
    });
  }

  /**
   * Find rent payment by lease and due date
   */
  async findByLeaseAndDueDate(leaseId: string, dueDate: Date) {
    return this.prisma.rentPayment.findFirst({
      where: {
        leaseId,
        dueDate,
      },
    });
  }

  /**
   * Find rent payments by lease ID
   */
  async findByLeaseId(leaseId: string, orderBy: 'asc' | 'desc' = 'asc') {
    return this.prisma.rentPayment.findMany({
      where: { leaseId },
      orderBy: { dueDate: orderBy },
    });
  }

  /**
   * Find rent payments with filters and pagination
   */
  async findMany(query: RentPaymentQuery & { where?: any }, include?: { lease?: boolean; partialPayments?: boolean; stripePayments?: boolean }) {
    const { page, limit, dueDateFrom, dueDateTo, paidDateFrom, paidDateTo, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.leaseId && { leaseId: filters.leaseId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.propertyId && {
        lease: {
          unit: {
            propertyId: filters.propertyId,
          },
        },
      }),
      ...(filters.tenantId && {
        lease: {
          leaseTenants: {
            some: {
              tenantId: filters.tenantId,
            },
          },
        },
      }),
    };

    // Date range filters
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    if (paidDateFrom || paidDateTo) {
      where.paidDate = {};
      if (paidDateFrom) where.paidDate.gte = new Date(paidDateFrom);
      if (paidDateTo) where.paidDate.lte = new Date(paidDateTo);
    }

    const [rentPayments, total] = await Promise.all([
      this.prisma.rentPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        select: {
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
          overdueReminderSent: true,
          reminderSent: true,
          reminderSentAt: true,
          createdAt: true,
          updatedAt: true,
          partialPayments: include?.partialPayments ? {
            select: {
              id: true,
              amount: true,
              paidDate: true,
              paymentMethod: true,
              referenceNumber: true,
              notes: true,
            },
          } : false,
          stripePayments: include?.stripePayments ? {
            select: {
              id: true,
              status: true,
              retryCount: true,
              retryScheduledAt: true,
              lastRetryAt: true,
              requiresTenantApproval: true,
              tenantApprovedRetry: true,
              tenantApprovedAt: true,
              disputeStatus: true,
              disputeInitiatedAt: true,
              disputeResolvedAt: true,
              disputeReason: true,
              lateFeesFrozen: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          } : false,
          lease: include?.lease ? {
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
          } : false,
        },
      }),
      this.prisma.rentPayment.count({ where }),
    ]);

    return {
      rentPayments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new rent payment
   */
  async create(data: RentPaymentCreate & { id?: string }) {
    return this.prisma.rentPayment.create({
      data: {
        id: data.id || '',
        leaseId: data.leaseId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        status: data.status || 'Unpaid',
        notes: data.notes || null,
      } as any,
    });
  }

  /**
   * Update a rent payment
   */
  async update(id: string, data: RentPaymentUpdate) {
    const updateData: any = {};

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.paidDate !== undefined) {
      updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    }
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
    if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    return this.prisma.rentPayment.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a rent payment
   */
  async delete(id: string) {
    return this.prisma.rentPayment.delete({
      where: { id },
    });
  }

  /**
   * Count rent payments matching criteria
   */
  async count(where: any) {
    return this.prisma.rentPayment.count({ where });
  }
}

