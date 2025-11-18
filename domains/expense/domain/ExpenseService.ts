/**
 * Expense Service
 * 
 * Domain logic for Expense domain
 */

import { ExpenseRepository } from './ExpenseRepository';
import { ExpenseCreate, ExpenseUpdate, ExpenseQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class ExpenseService {
  constructor(private repository: ExpenseRepository) {}

  /**
   * Create a new expense with business logic
   */
  async create(data: ExpenseCreate, context: { userId: string }) {
    // If maintenanceRequestId is provided but propertyId is not, fetch propertyId from maintenance request
    let finalPropertyId = data.propertyId;
    if (data.maintenanceRequestId && !data.propertyId) {
      const { prisma } = require('@/lib/prisma');
      const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
        where: { id: data.maintenanceRequestId },
        select: { propertyId: true },
      });
      if (maintenanceRequest) {
        finalPropertyId = maintenanceRequest.propertyId;
      }
    }

    // Validate: Either propertyId or maintenanceRequestId must be provided
    if (!finalPropertyId && !data.maintenanceRequestId) {
      throw new Error('Either propertyId or maintenanceRequestId must be provided');
    }

    // Parse date
    const expenseDate = createDateAtLocalMidnight(data.date);

    // Create expense
    const expense = await this.repository.create({
      ...data,
      propertyId: finalPropertyId,
      date: expenseDate.toISOString().split('T')[0],
      createdBy: context.userId,
    });

    return expense;
  }

  /**
   * Update an expense with business logic
   */
  async update(id: string, data: ExpenseUpdate) {
    // Parse date if provided
    if (data.date) {
      const parsed = createDateAtLocalMidnight(data.date);
      data.date = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  /**
   * Get expenses with pagination
   */
  async list(query: ExpenseQuery & { where?: any }, include?: { property?: boolean; maintenanceRequest?: boolean; pmcApprovalRequest?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get expense by ID
   */
  async getById(id: string, include?: { property?: boolean; maintenanceRequest?: boolean; pmcApprovalRequest?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Delete an expense
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }
}

