/**
 * Maintenance Domain Re-export
 * Re-exports from domains/maintenance/domain
 */

export * from '@/domains/maintenance/domain';
export { MaintenanceService } from '@/domains/maintenance/domain/MaintenanceService';
export { MaintenanceRepository } from '@/domains/maintenance/domain/MaintenanceRepository';

// Re-export service instance
import { MaintenanceService } from '@/domains/maintenance/domain/MaintenanceService';
import { MaintenanceRepository } from '@/domains/maintenance/domain/MaintenanceRepository';
import { prisma } from '@/lib/prisma';

const maintenanceRepository = new MaintenanceRepository(prisma);
export const maintenanceService = new MaintenanceService(maintenanceRepository);

