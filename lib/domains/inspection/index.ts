/**
 * Inspection Domain Re-export
 * Re-exports from domains/inspection/domain
 */

export * from '@/domains/inspection/domain';
export { InspectionService } from '@/domains/inspection/domain/InspectionService';
export { InspectionRepository } from '@/domains/inspection/domain/InspectionRepository';

// Re-export service instance
import { InspectionService } from '@/domains/inspection/domain/InspectionService';
import { InspectionRepository } from '@/domains/inspection/domain/InspectionRepository';
import { prisma } from '@/lib/prisma';

const inspectionRepository = new InspectionRepository(prisma);
export const inspectionService = new InspectionService(inspectionRepository);

