/**
 * Rent Payment Domain Re-export
 * Re-exports from domains/rent-payment/domain
 */

export * from '@/domains/rent-payment/domain';
export { RentPaymentService } from '@/domains/rent-payment/domain/RentPaymentService';
export { RentPaymentRepository } from '@/domains/rent-payment/domain/RentPaymentRepository';

// Re-export service instance
import { RentPaymentService } from '@/domains/rent-payment/domain/RentPaymentService';
import { RentPaymentRepository } from '@/domains/rent-payment/domain/RentPaymentRepository';
import { prisma } from '@/lib/prisma';

const rentPaymentRepository = new RentPaymentRepository(prisma);
export const rentPaymentService = new RentPaymentService(rentPaymentRepository);

