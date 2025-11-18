/**
 * Application Domain Re-export
 * Re-exports from domains/application/domain
 */

export * from '@/domains/application/domain';
export { ApplicationService } from '@/domains/application/domain/ApplicationService';
export { ApplicationRepository } from '@/domains/application/domain/ApplicationRepository';

// Re-export service instance
import { ApplicationService } from '@/domains/application/domain/ApplicationService';
import { ApplicationRepository } from '@/domains/application/domain/ApplicationRepository';
import { UnitRepository } from '@/domains/unit/domain/UnitRepository';
import { prisma } from '@/lib/prisma';

const applicationRepository = new ApplicationRepository(prisma);
const unitRepository = new UnitRepository(prisma);
export const applicationService = new ApplicationService(applicationRepository, unitRepository);

