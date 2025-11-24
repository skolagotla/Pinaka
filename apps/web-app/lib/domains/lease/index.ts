/**
 * Lease Domain Re-export
 * Re-exports from domains/lease/domain
 */

export * from '@/domains/lease/domain';
export { LeaseService } from '@/domains/lease/domain/LeaseService';
export { LeaseRepository } from '@/domains/lease/domain/LeaseRepository';

// Re-export service instance
import { LeaseService } from '@/domains/lease/domain/LeaseService';
import { LeaseRepository } from '@/domains/lease/domain/LeaseRepository';
import { prisma } from '@/lib/prisma';

const leaseRepository = new LeaseRepository(prisma);
export const leaseService = new LeaseService(leaseRepository);

