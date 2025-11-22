import { prisma } from '@/lib/prisma';
// import { InvitationCreateInput, InvitationUpdateInput, InvitationQueryInput } from '@/lib/schemas/domains/invitation.schema';
// TODO: Use types from schema registry
type InvitationCreateInput = any;
type InvitationUpdateInput = any;
type InvitationQueryInput = any;
import { Prisma } from '@prisma/client';

export class InvitationRepository {
  constructor(private prisma: any) {} // Using any to avoid circular type reference

  async findMany(query: InvitationQueryInput, user: any) {
    const { page = 1, limit = 20, type, status, email } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvitationWhereInput = {};

    // Filter by inviter based on role
    if (user.role === 'admin') {
      where.invitedByAdminId = user.userId;
    } else if (user.role === 'landlord') {
      where.invitedByLandlordId = user.userId;
    } else if (user.role === 'pmc') {
      where.invitedByPMCId = user.userId;
    } else {
      where.invitedBy = user.userId;
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const [invitations, total] = await Promise.all([
      this.prisma.invitation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          token: true,
          type: true,
          status: true,
          expiresAt: true,
          openedAt: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          invitedBy: true,
          invitedByRole: true,
          invitedByName: true,
          invitedByEmail: true,
          invitedByAdminId: true,
          invitedByLandlordId: true,
          invitedByPMCId: true,
          landlordId: true,
          tenantId: true,
          pmcId: true,
          metadata: true,
        },
      }),
      this.prisma.invitation.count({ where }),
    ]);

    // For completed invitations, fetch approval status
    const invitationsWithStatus = await Promise.all(
      invitations.map(async (inv) => {
        if (inv.status === 'completed') {
          let approvalStatus = null;
          try {
            if (inv.type === 'landlord' && inv.landlordId) {
              const landlord = await this.prisma.landlord.findUnique({
                where: { id: inv.landlordId },
                select: { approvalStatus: true },
              });
              approvalStatus = landlord?.approvalStatus || null;
            } else if (inv.type === 'tenant' && inv.tenantId) {
              const tenant = await this.prisma.tenant.findUnique({
                where: { id: inv.tenantId },
                select: { approvalStatus: true },
              });
              approvalStatus = tenant?.approvalStatus || null;
            } else if (inv.type === 'pmc' && inv.pmcId) {
              const pmc = await this.prisma.propertyManagementCompany.findUnique({
                where: { id: inv.pmcId },
                select: { approvalStatus: true },
              });
              approvalStatus = pmc?.approvalStatus || null;
            }
          } catch (error) {
            console.error(`Error fetching approval status for invitation ${inv.id}:`, error);
          }
          return { ...inv, approvalStatus };
        }
        return inv;
      })
    );

    return { invitations: invitationsWithStatus, total };
  }

  async findUnique(id: string, user?: any) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) return null;

    // RBAC check
    if (user && user.role === 'admin' && invitation.invitedByAdminId !== user.userId) return null;
    if (user && user.role === 'landlord' && invitation.invitedByLandlordId !== user.userId) return null;
    if (user && user.role === 'pmc' && invitation.invitedByPMCId !== user.userId) return null;

    return invitation;
  }

  async findActiveInvitationByEmailAndType(email: string, type: string) {
    return this.prisma.invitation.findFirst({
      where: {
        email,
        type,
        status: { in: ['pending', 'sent', 'opened'] },
        expiresAt: { gt: new Date() },
      },
    });
  }

  /**
   * Find invitation by token (for public endpoints)
   */
  async findByToken(token: string) {
    return this.prisma.invitation.findUnique({
      where: { token },
      include: {
        landlord: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        invitedByPMC: {
          select: { id: true, companyName: true, email: true },
        },
        invitedByLandlord: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async create(data: InvitationCreateInput, user: any) {
    const { generateSecureToken } = require('@/lib/utils/token-generator');
    const token = generateSecureToken(32);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 14));

    // Get inviter info
    let inviterName = user.userName || 'Admin';
    let inviterEmail = user.email;
    let inviterId = user.userId;
    let inviterRole = user.role;

    if (user.role === 'landlord') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { id: user.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (landlord) {
        inviterName = `${landlord.firstName} ${landlord.lastName}`;
        inviterEmail = landlord.email;
      }
    } else if (user.role === 'pmc') {
      const pmc = await this.prisma.propertyManagementCompany.findUnique({
        where: { id: user.userId },
        select: { companyName: true, email: true },
      });
      if (pmc) {
        inviterName = pmc.companyName;
        inviterEmail = pmc.email;
      }
    } else if (user.role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: user.userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (admin) {
        inviterName = `${admin.firstName} ${admin.lastName}`;
        inviterEmail = admin.email;
      }
    }

    const invitationData: any = {
      email: data.email,
      token,
      type: data.type,
      status: 'pending',
      invitedBy: inviterId,
      invitedByRole: inviterRole,
      invitedByName: inviterName,
      invitedByEmail: inviterEmail,
      propertyId: data.propertyId || null,
      unitId: data.unitId || null,
      expiresAt,
      metadata: data.metadata || {},
      invitationSource: 'api',
    };

    // Populate FK fields
    if (inviterRole === 'admin') {
      invitationData.invitedByAdminId = inviterId;
    } else if (inviterRole === 'landlord') {
      invitationData.invitedByLandlordId = inviterId;
    } else if (inviterRole === 'pmc') {
      invitationData.invitedByPMCId = inviterId;
    }

    return this.prisma.invitation.create({
      data: invitationData,
    });
  }

  async update(id: string, data: InvitationUpdateInput & { reminderCount?: number; reminderSentAt?: Date }) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.reminderCount !== undefined) updateData.reminderCount = data.reminderCount;
    if (data.reminderSentAt) updateData.reminderSentAt = data.reminderSentAt;

    // Handle resend
    if (data.resend) {
      updateData.status = 'pending';
      // Token regeneration would happen in service layer
    }

    return this.prisma.invitation.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.invitation.delete({ where: { id } });
  }
}

