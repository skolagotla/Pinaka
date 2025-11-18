/**
 * Invitation Domain Re-export
 * Re-exports from domains/invitation/domain
 */

export * from '@/domains/invitation/domain';
export { InvitationService } from '@/domains/invitation/domain/InvitationService';
export { InvitationRepository } from '@/domains/invitation/domain/InvitationRepository';

// Re-export service instance
import { InvitationService } from '@/domains/invitation/domain/InvitationService';
import { InvitationRepository } from '@/domains/invitation/domain/InvitationRepository';
import { TenantRepository } from '@/domains/tenant/domain/TenantRepository';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { prisma } from '@/lib/prisma';

const invitationRepository = new InvitationRepository(prisma);
const tenantRepository = new TenantRepository(prisma);
const landlordRepository = new LandlordRepository(prisma);
export const invitationService = new InvitationService(invitationRepository, tenantRepository, landlordRepository);

