/**
 * TenantInvitation Domain Export
 * Provides singleton instance of TenantInvitationService
 */

import { TenantInvitationRepository, TenantInvitationService } from '@/domains/tenant-invitation/domain';
import { TenantRepository } from '@/domains/tenant/domain/TenantRepository';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { prisma } from '@/lib/prisma';

// Create singleton instances
const tenantInvitationRepository = new TenantInvitationRepository(prisma);
const tenantRepository = new TenantRepository(prisma);
const landlordRepository = new LandlordRepository(prisma);

export const tenantInvitationService = new TenantInvitationService(
  tenantInvitationRepository,
  tenantRepository,
  landlordRepository
);

export { TenantInvitationRepository, TenantInvitationService } from '@/domains/tenant-invitation/domain';
export type {
  TenantInvitationQuery,
  TenantInvitationCreate,
  TenantInvitationUpdate,
} from '@/domains/tenant-invitation/domain';

