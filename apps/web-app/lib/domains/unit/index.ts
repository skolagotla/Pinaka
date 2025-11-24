/**
 * Unit Domain Re-export
 * Re-exports from domains/unit/domain
 */

export * from '@/domains/unit/domain';
export { UnitService } from '@/domains/unit/domain/UnitService';
export { UnitRepository } from '@/domains/unit/domain/UnitRepository';

// Re-export service instance
import { UnitService } from '@/domains/unit/domain/UnitService';
import { UnitRepository } from '@/domains/unit/domain/UnitRepository';
import { PropertyRepository } from '@/domains/property/domain/PropertyRepository';
import { prisma } from '@/lib/prisma';

const unitRepository = new UnitRepository(prisma);
const propertyRepository = new PropertyRepository(prisma);
export const unitService = new UnitService(unitRepository, propertyRepository);

