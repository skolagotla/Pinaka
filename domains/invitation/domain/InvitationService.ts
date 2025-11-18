import { InvitationRepository } from './InvitationRepository';
import { TenantRepository } from '@/domains/tenant/domain/TenantRepository';
import { LandlordRepository } from '@/domains/landlord/domain/LandlordRepository';
import { InvitationCreate, InvitationUpdate, InvitationQuery } from '@/lib/schemas';
import { UserContext } from '@/lib/middleware/apiMiddleware';
import { getRoleConfig, canUserInviteRole, isValidRole } from '@/lib/config/invitation-roles';
import { sendTenantInvitation, sendLandlordInvitation } from '@/lib/email';
import { emitEvent, EventType } from '@/lib/events/emitter';

export class InvitationService {
  constructor(
    private repository: InvitationRepository,
    private tenantRepository?: TenantRepository,
    private landlordRepository?: LandlordRepository
  ) {}

  async getInvitations(query: InvitationQuery, user: UserContext) {
    return this.repository.findMany(query, user);
  }

  async getInvitationById(id: string, user: UserContext) {
    return this.repository.findUnique(id, user);
  }

  async createInvitation(data: InvitationCreate, user: UserContext) {
    // Validate invitation type
    if (!isValidRole(data.type)) {
      throw new Error(`Invalid invitation type: ${data.type}`);
    }

    // Check permissions
    const roleConfig = getRoleConfig(data.type);
    if (!roleConfig) {
      throw new Error(`Invalid invitation type: ${data.type}`);
    }

    if (!canUserInviteRole(user.role, data.type)) {
      throw new Error(`You do not have permission to invite ${roleConfig.name.toLowerCase()}s`);
    }

    // Check if user already exists - use repository methods (Domain-Driven Design)
    // Note: This is a cross-domain check, acceptable for invitation service
    let existingUser: any = null;
    if (data.type === 'landlord') {
      // Use LandlordRepository for landlord checks (Domain-Driven Design)
      if (this.landlordRepository) {
        existingUser = await this.landlordRepository.findByEmail(data.email);
      } else {
        // Fallback for backward compatibility
        const { LandlordRepository } = require('@/domains/landlord/domain/LandlordRepository');
        const { prisma } = require('@/lib/prisma');
        const landlordRepo = new LandlordRepository(prisma);
        existingUser = await landlordRepo.findByEmail(data.email);
      }
    } else if (data.type === 'tenant') {
      // Use TenantRepository for tenant checks (Domain-Driven Design)
      if (this.tenantRepository) {
        existingUser = await this.tenantRepository.findByEmail(data.email);
      } else {
        // Fallback for backward compatibility
        const { TenantRepository } = require('@/domains/tenant/domain/TenantRepository');
        const { prisma } = require('@/lib/prisma');
        const tenantRepo = new TenantRepository(prisma);
        existingUser = await tenantRepo.findByEmail(data.email);
      }
    }

    if (existingUser) {
      throw new Error(`A ${roleConfig.name.toLowerCase()} with this email already exists`);
    }

    // Check for existing active invitation - use repository method
    const existingInvitation = await this.repository.findActiveInvitationByEmailAndType(data.email, data.type);

    if (existingInvitation) {
      throw new Error('An active invitation already exists for this email');
    }

    // Create invitation
    const invitation = await this.repository.create(data, user);

    // Send email
    try {
      let emailResult;
      if (data.type === 'tenant') {
        emailResult = await sendTenantInvitation({
          tenantEmail: data.email,
          tenantName: data.metadata?.firstName && data.metadata?.lastName
            ? `${data.metadata.firstName} ${data.metadata.lastName}`
            : 'Tenant',
          invitationToken: invitation.token,
          landlordName: invitation.invitedByName || 'Admin',
        });
      } else if (data.type === 'landlord') {
        emailResult = await sendLandlordInvitation({
          landlordEmail: data.email,
          landlordName: data.metadata?.firstName && data.metadata?.lastName
            ? `${data.metadata.firstName} ${data.metadata.lastName}`
            : 'Landlord',
          invitationToken: invitation.token,
          inviterName: invitation.invitedByName || 'Admin',
        });
      } else {
        emailResult = { success: true, message: 'Email template not yet implemented for this role' };
      }

      if (emailResult.success) {
        await this.repository.update(invitation.id, { status: 'sent' });

        // Emit event
        try {
          await emitEvent(EventType.TENANT_INVITED, {
            invitationId: invitation.id,
            email: data.email,
            type: data.type,
            inviterId: user.userId,
            inviterRole: user.role,
          }, {
            userId: user.userId,
            userRole: user.role,
          });
        } catch (eventError) {
          console.error('Event emission failed:', eventError);
        }
      } else {
        // Keep as pending if email failed
        console.error('Email sending failed:', emailResult.error);
      }
    } catch (error) {
      console.error('Email error:', error);
      // Don't fail the request - invitation was created
    }

    return invitation;
  }

  async updateInvitation(id: string, data: InvitationUpdate, user: UserContext) {
    const existingInvitation = await this.repository.findUnique(id, user);
    if (!existingInvitation) {
      throw new Error('Invitation not found or forbidden');
    }

    return this.repository.update(id, data);
  }

  async deleteInvitation(id: string, user: UserContext) {
    const existingInvitation = await this.repository.findUnique(id, user);
    if (!existingInvitation) {
      throw new Error('Invitation not found or forbidden');
    }

    return this.repository.delete(id);
  }

  /**
   * Resend an invitation email
   */
  async resendInvitation(id: string, user: UserContext) {
    const invitation = await this.repository.findUnique(id, user);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Check authorization
    if (invitation.invitedBy !== user.userId) {
      throw new Error('You do not have permission to resend this invitation');
    }

    // Check if invitation is still valid
    if (invitation.status === 'completed') {
      throw new Error('Cannot resend a completed invitation');
    }

    if (invitation.status === 'cancelled') {
      throw new Error('Cannot resend a cancelled invitation');
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      throw new Error('Cannot resend an expired invitation. Please create a new one.');
    }

    // Send invitation email
    const config = require('@/lib/config/app-config').default || require('@/lib/config/app-config');
    const baseUrl = config.auth.baseUrl;
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    let emailResult;
    if (invitation.type === 'tenant') {
      const tenantName = invitation.metadata?.firstName && invitation.metadata?.lastName
        ? `${invitation.metadata.firstName} ${invitation.metadata.lastName}`
        : 'Tenant';
      const landlordName = invitation.invitedByName || 'Landlord';

      emailResult = await sendTenantInvitation({
        tenantEmail: invitation.email,
        tenantName,
        invitationToken: invitation.token,
        landlordName,
      });
    } else if (invitation.type === 'landlord') {
      const landlordName = invitation.metadata?.firstName && invitation.metadata?.lastName
        ? `${invitation.metadata.firstName} ${invitation.metadata.lastName}`
        : 'Landlord';
      const inviterName = invitation.invitedByName || 'Admin';

      emailResult = await sendLandlordInvitation({
        landlordEmail: invitation.email,
        landlordName,
        invitationToken: invitation.token,
        inviterName,
      });
    } else {
      throw new Error(`Email template not yet implemented for type: ${invitation.type}`);
    }

    if (!emailResult.success) {
      throw new Error(`Failed to send invitation email: ${emailResult.error}`);
    }

    // Update status to 'sent' and increment reminder count
    const updatedInvitation = await this.repository.update(id, {
      status: 'sent',
      reminderSentAt: new Date(),
      reminderCount: (invitation.reminderCount || 0) + 1,
    } as any);

    return updatedInvitation;
  }
}

