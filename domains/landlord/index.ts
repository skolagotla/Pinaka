/**
 * Landlord Domain Re-export
 * Re-exports from domains/landlord/domain
 */

export * from '@/domains/landlord/domain';
export { LandlordService } from '@/domains/landlord/domain/LandlordService';
export { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';

// Re-export service instance
import { LandlordService } from '@/domains/landlord/domain/LandlordService';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { prisma } from '@/lib/prisma';

const landlordRepository = new LandlordRepository(prisma);
export const landlordService = new LandlordService(landlordRepository);

