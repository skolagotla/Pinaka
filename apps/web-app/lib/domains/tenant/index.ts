/**
 * Tenant Domain Re-export
 * Re-exports from domains/tenant/domain
 */

export * from '@/domains/tenant/domain';
export { TenantService } from '@/domains/tenant/domain/TenantService';
export { TenantRepository } from '@/domains/tenant/domain/TenantRepository';

// Re-export service instance
import { TenantService } from '@/domains/tenant/domain/TenantService';
import { TenantRepository } from '@/domains/tenant/domain/TenantRepository';
import { prisma } from '@/lib/prisma';

const tenantRepository = new TenantRepository(prisma);
export const tenantService = new TenantService(tenantRepository);

