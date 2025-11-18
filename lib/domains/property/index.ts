/**
 * Property Domain Re-export
 * Re-exports from domains/property/domain
 */

export * from '@/domains/property/domain';
export { PropertyService } from '@/domains/property/domain/PropertyService';
export { PropertyRepository } from '@/domains/property/domain/PropertyRepository';

// Re-export service instance
import { PropertyService } from '@/domains/property/domain/PropertyService';
import { PropertyRepository } from '@/domains/property/domain/PropertyRepository';
import { prisma } from '@/lib/prisma';

const propertyRepository = new PropertyRepository(prisma);
export const propertyService = new PropertyService(propertyRepository);

