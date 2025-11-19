/**
 * Landlord Domain - Central Export
 * 
 * Provides singleton instance of LandlordService for use across the application
 */

export { LandlordService } from '@/domains/landlord/domain/LandlordService';
export { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';

// Re-export service instance
import { LandlordService } from '@/domains/landlord/domain/LandlordService';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { prisma } from '@/lib/prisma';

const landlordRepository = new LandlordRepository(prisma);
export const landlordService = new LandlordService(landlordRepository);

