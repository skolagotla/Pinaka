/**
 * TenantInvitation Service
 * Business logic layer for TenantInvitation operations
 * 
 * Note: TenantInvitation is a legacy model that will be migrated to unified Invitation model
 */

import { TenantInvitationRepository, TenantInvitationQuery, TenantInvitationCreate, TenantInvitationUpdate } from './TenantInvitationRepository';
import { TenantRepository } from '@/domains/tenant/domain/TenantRepository';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { UserContext } from '@/lib/middleware/apiMiddleware';

export class TenantInvitationService {
  constructor(
    private repository: TenantInvitationRepository,
    private tenantRepository?: TenantRepository,
    private landlordRepository?: LandlordRepository
  ) {}

  async getById(id: string) {
    return this.repository.findUnique(id);
  }

  async getByToken(token: string) {
    return this.repository.findByToken(token);
  }

  async list(query: TenantInvitationQuery, user: UserContext) {
    // Ensure user can only see their own invitations
    const queryWithUser = {
      ...query,
      invitedBy: user.userId,
    };
    return this.repository.findMany(queryWithUser);
  }

  async create(data: TenantInvitationCreate, user: UserContext) {
    // Check if tenant already exists
    let existingTenant = null;
    if (this.tenantRepository) {
      existingTenant = await this.tenantRepository.findByEmail(data.email);
    } else {
      const { TenantRepository } = require('@/domains/tenant/domain/TenantRepository');
      const { prisma } = require('@/lib/prisma');
      const tenantRepo = new TenantRepository(prisma);
      existingTenant = await tenantRepo.findByEmail(data.email);
    }

    if (existingTenant) {
      throw new Error('A tenant with this email already exists');
    }

    // Check for existing active invitation
    const existingInvitation = await this.repository.findFirst({
      email: data.email,
      status: ['pending', 'sent', 'opened'],
      expiresAt: { gt: new Date() } as any,
    });

    if (existingInvitation) {
      throw new Error('An active invitation already exists for this email');
    }

    // Create invitation
    const invitation = await this.repository.create({
      ...data,
      invitedBy: user.userId,
    });

    return invitation;
  }

  async update(id: string, data: TenantInvitationUpdate, user: UserContext) {
    // Verify ownership
    const invitation = await this.repository.findUnique(id);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedBy !== user.userId) {
      throw new Error('You do not have permission to update this invitation');
    }

    return this.repository.update(id, data);
  }

  async cancel(id: string, user: UserContext) {
    const invitation = await this.repository.findUnique(id);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedBy !== user.userId) {
      throw new Error('You do not have permission to cancel this invitation');
    }

    if (invitation.status === 'completed') {
      throw new Error('Cannot cancel a completed invitation');
    }

    return this.repository.update(id, { status: 'cancelled' });
  }

  async acceptInvitation(token: string, formData: any) {
    const invitation = await this.repository.findByToken(token);
    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status === 'completed') {
      throw new Error('This invitation has already been accepted');
    }

    if (invitation.status === 'cancelled') {
      throw new Error('This invitation has been cancelled');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await this.repository.update(invitation.id, { status: 'expired' });
      throw new Error('This invitation has expired');
    }

    // Validate email matches
    if (formData.email && formData.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error('Email does not match invitation');
    }

    // Check if tenant already exists
    let tenant = null;
    if (this.tenantRepository) {
      tenant = await this.tenantRepository.findByEmail(invitation.email);
    } else {
      const { TenantRepository } = require('@/domains/tenant/domain/TenantRepository');
      const { prisma } = require('@/lib/prisma');
      const tenantRepo = new TenantRepository(prisma);
      tenant = await tenantRepo.findByEmail(invitation.email);
    }

    // Update or create tenant (this logic is complex, so we'll keep it in the service)
    // For now, we'll return the invitation and let the endpoint handle tenant creation
    // This is acceptable as tenant creation is a complex cross-domain operation

    // Update invitation status
    await this.repository.update(invitation.id, {
      status: 'completed',
      completedAt: new Date(),
      tenantId: tenant?.id || null,
    });

    return { invitation, tenant };
  }

  async resendInvitation(id: string, user: UserContext) {
    const invitation = await this.repository.findUnique(id);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedBy !== user.userId) {
      throw new Error('You do not have permission to resend this invitation');
    }

    if (invitation.status === 'completed') {
      throw new Error('Cannot resend a completed invitation');
    }

    if (invitation.status === 'cancelled') {
      throw new Error('Cannot resend a cancelled invitation');
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Update invitation status (email sending will be handled by the endpoint)
    // Note: reminderCount and reminderSentAt will be updated by the endpoint after email is sent
    return invitation;
  }

  async update(id: string, data: TenantInvitationUpdate & { reminderCount?: number; reminderSentAt?: Date }, user?: UserContext) {
    // Verify ownership if user is provided
    if (user) {
      const invitation = await this.repository.findUnique(id);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.invitedBy !== user.userId) {
        throw new Error('You do not have permission to update this invitation');
      }
    }

    return this.repository.update(id, data);
  }
}

