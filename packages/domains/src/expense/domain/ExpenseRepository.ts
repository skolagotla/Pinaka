/**
 * Expense Repository
 * 
 * Data access layer for Expense domain
 */

import { PrismaClient } from '@prisma/client';
import { ExpenseCreate, ExpenseUpdate, ExpenseQuery } from '@/lib/schemas';

export class ExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find expense by ID
   */
  async findById(id: string, include?: { property?: boolean; maintenanceRequest?: boolean; pmcApprovalRequest?: boolean }) {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
            unitCount: true,
          },
        } : false,
        maintenanceRequest: include?.maintenanceRequest ? {
          select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            status: true,
            property: {
              select: {
                id: true,
                propertyName: true,
                addressLine1: true,
                unitCount: true,
              },
            },
          },
        } : false,
        pmcApprovalRequest: include?.pmcApprovalRequest ? {
          select: {
            id: true,
            status: true,
            requestedAt: true,
            approvedAt: true,
            rejectedAt: true,
            rejectionReason: true,
            approvalNotes: true,
          },
        } : false,
      },
    });
  }

  /**
   * Find expenses with filters and pagination
   */
  async findMany(query: ExpenseQuery & { where?: any }, include?: { property?: boolean; maintenanceRequest?: boolean; pmcApprovalRequest?: boolean }) {
    const { page, limit, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.maintenanceRequestId && { maintenanceRequestId: filters.maintenanceRequestId }),
      ...(filters.category && { category: filters.category }),
    };

    // Date range filters
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          property: include?.property ? {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
              unitCount: true,
            },
          } : false,
          maintenanceRequest: include?.maintenanceRequest ? {
            select: {
              id: true,
              ticketNumber: true,
              title: true,
              category: true,
              status: true,
              property: {
                select: {
                  id: true,
                  propertyName: true,
                  addressLine1: true,
                  unitCount: true,
                },
              },
            },
          } : false,
          pmcApprovalRequest: include?.pmcApprovalRequest ? {
            select: {
              id: true,
              status: true,
              requestedAt: true,
              approvedAt: true,
              rejectedAt: true,
              rejectionReason: true,
              approvalNotes: true,
            },
          } : false,
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new expense
   */
  async create(data: ExpenseCreate & { id?: string; createdBy?: string }) {
    return this.prisma.expense.create({
      data: {
        id: data.id || '',
        propertyId: data.propertyId || null,
        maintenanceRequestId: data.maintenanceRequestId || null,
        category: (data.category || 'Other') as string,
        amount: data.amount,
        date: new Date(data.date),
        description: data.description,
        receiptUrl: data.receiptUrl || null,
        paidTo: data.paidTo || null,
        paymentMethod: data.paymentMethod || null,
        isRecurring: data.isRecurring || false,
        recurringFrequency: data.recurringFrequency || null,
        createdBy: data.createdBy || '',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update an expense
   */
  async update(id: string, data: ExpenseUpdate) {
    const updateData: any = {};

    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl || null;
    if (data.paidTo !== undefined) updateData.paidTo = data.paidTo || null;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
    if (data.recurringFrequency !== undefined) updateData.recurringFrequency = data.recurringFrequency || null;
    if (data.maintenanceRequestId !== undefined) {
      updateData.maintenanceRequestId = data.maintenanceRequestId || null;
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete an expense
   */
  async delete(id: string) {
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  /**
   * Count expenses matching criteria
   */
  async count(where: any) {
    return this.prisma.expense.count({ where });
  }
}

