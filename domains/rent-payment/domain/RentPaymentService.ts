/**
 * Rent Payment Service
 * 
 * Domain logic for Rent Payment domain
 */

import { RentPaymentRepository } from './RentPaymentRepository';
import { RentPaymentCreate, RentPaymentUpdate, RentPaymentQuery, RecordPayment, CreatePartialPayment } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';
import { calculateTotalPaid } from '@/lib/utils/payment-utils';

export class RentPaymentService {
  constructor(private repository: RentPaymentRepository) {}

  /**
   * Create a new rent payment with business logic
   */
  async create(data: RentPaymentCreate, context: { userId: string }) {
    // Check if payment already exists for this lease and due date
    const dueDate = createDateAtLocalMidnight(data.dueDate);
    const existingPayment = await this.repository.findByLeaseAndDueDate(data.leaseId, dueDate);

    if (existingPayment) {
      // Update existing payment instead of creating duplicate
      return this.update(existingPayment.id, {
        amount: data.amount,
        paidDate: data.paidDate,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        status: data.status,
        notes: data.notes,
      });
    }

    // Parse dates
    const parsedDueDate = createDateAtLocalMidnight(data.dueDate);
    const parsedPaidDate = data.paidDate ? createDateAtLocalMidnight(data.paidDate) : null;

    // Create payment
    const payment = await this.repository.create({
      ...data,
      dueDate: parsedDueDate.toISOString().split('T')[0],
      paidDate: parsedPaidDate ? parsedPaidDate.toISOString().split('T')[0] : undefined,
    });

    return payment;
  }

  /**
   * Update a rent payment with business logic
   */
  async update(id: string, data: RentPaymentUpdate) {
    // Parse dates if provided
    if (data.dueDate) {
      const parsed = createDateAtLocalMidnight(data.dueDate);
      data.dueDate = parsed.toISOString().split('T')[0] as any;
    }

    if (data.paidDate) {
      const parsed = createDateAtLocalMidnight(data.paidDate);
      data.paidDate = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  /**
   * Record payment (mark as paid)
   */
  async recordPayment(id: string, data: RecordPayment) {
    const paidDate = createDateAtLocalMidnight(data.paidDate);

    const updateData: RentPaymentUpdate = {
      paidDate: paidDate.toISOString().split('T')[0] as any,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      status: 'Paid',
    };

    if (data.amount) {
      updateData.amount = data.amount;
    }

    return this.repository.update(id, updateData);
  }

  /**
   * Mark payment as unpaid
   */
  async markUnpaid(id: string) {
    return this.repository.update(id, {
      status: 'Unpaid',
      paidDate: undefined,
      paymentMethod: undefined,
      referenceNumber: undefined,
    });
  }

  /**
   * Create partial payment
   */
  async createPartialPayment(rentPaymentId: string, data: CreatePartialPayment) {
    const paidDate = createDateAtLocalMidnight(data.paidDate);

    // Get current payment
    const payment = await this.repository.findById(rentPaymentId, { partialPayments: true });
    if (!payment) {
      throw new Error('Rent payment not found');
    }

    // Calculate total partial payments
    const totalPartialPaid = calculateTotalPaid(payment as any);

    // Check if adding this partial payment would exceed the total amount
    if (totalPartialPaid + data.amount > payment.amount) {
      throw new Error('Partial payment amount exceeds remaining balance');
    }

    // Create partial payment
    const { prisma } = require('@/lib/prisma');
    const partialPayment = await prisma.partialPayment.create({
      data: {
        rentPaymentId,
        amount: data.amount,
        paidDate: paidDate,
        paymentMethod: data.paymentMethod || null,
        referenceNumber: data.referenceNumber || null,
        notes: data.notes || null,
      },
    });

    // Update payment status based on total partial payments
    const newTotalPartialPaid = totalPartialPaid + data.amount;
    let newStatus: 'Unpaid' | 'Partial' | 'Paid' = 'Partial';
    if (newTotalPartialPaid >= payment.amount) {
      newStatus = 'Paid';
    }

    await this.repository.update(rentPaymentId, {
      status: newStatus,
    });

    return partialPayment;
  }

  /**
   * Get rent payments with pagination
   */
  async list(query: RentPaymentQuery & { where?: any }, include?: { lease?: boolean; partialPayments?: boolean; stripePayments?: boolean }) {
    return this.repository.findMany(query, include);
  }

  /**
   * Get rent payment by ID
   */
  async getById(id: string, include?: { lease?: boolean; partialPayments?: boolean; stripePayments?: boolean }) {
    return this.repository.findById(id, include);
  }

  /**
   * Delete a rent payment
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }

  /**
   * Get rent payment by ID with full receipt details
   * Includes all relations needed for receipt generation
   */
  async getByIdWithReceiptDetails(id: string) {
    return this.repository.findByIdWithReceiptDetails(id);
  }

  /**
   * Check if rent payment belongs to landlord
   */
  async belongsToLandlord(rentPaymentId: string, landlordId: string): Promise<boolean> {
    return this.repository.belongsToLandlord(rentPaymentId, landlordId);
  }

  /**
   * Check if rent payment belongs to tenant
   */
  async belongsToTenant(rentPaymentId: string, tenantId: string): Promise<boolean> {
    return this.repository.belongsToTenant(rentPaymentId, tenantId);
  }
}

