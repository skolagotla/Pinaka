/**
 * TenantInvitation Repository
 * Data access layer for TenantInvitation operations
 * 
 * Note: TenantInvitation is a legacy model that will be migrated to unified Invitation model
 */

import { Prisma } from '@prisma/client';

export interface TenantInvitationQuery {
  status?: string;
  email?: string;
  invitedBy?: string;
  limit?: number;
  offset?: number;
}

export interface TenantInvitationCreate {
  email: string;
  token: string;
  invitedBy: string;
  propertyId?: string | null;
  unitId?: string | null;
  expiresAt: Date;
  status?: string;
  metadata?: any;
}

export interface TenantInvitationUpdate {
  status?: string;
  completedAt?: Date;
  tenantId?: string;
  openedAt?: Date;
}

export class TenantInvitationRepository {
  constructor(private prisma: any) {}

  async findUnique(id: string) {
    return this.prisma.tenantInvitation.findUnique({
      where: { id },
      include: {
        landlord: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.tenantInvitation.findUnique({
      where: { token },
      include: {
        landlord: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async findFirst(query: TenantInvitationQuery) {
    const where: Prisma.TenantInvitationWhereInput = {};
    
    if (query.email) where.email = query.email;
    if (query.status) {
      if (Array.isArray(query.status)) {
        where.status = { in: query.status };
      } else {
        where.status = query.status;
      }
    }
    if (query.invitedBy) where.invitedBy = query.invitedBy;
    if (query.expiresAt) where.expiresAt = query.expiresAt;

    return this.prisma.tenantInvitation.findFirst({ where });
  }

  async findMany(query: TenantInvitationQuery) {
    const where: Prisma.TenantInvitationWhereInput = {};
    
    if (query.invitedBy) where.invitedBy = query.invitedBy;
    if (query.status) where.status = query.status;
    if (query.email) where.email = { contains: query.email, mode: 'insensitive' };

    const limit = query.limit || 50;
    const offset = query.offset || 0;

    const [invitations, total] = await Promise.all([
      this.prisma.tenantInvitation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          status: true,
          expiresAt: true,
          openedAt: true,
          completedAt: true,
          reminderCount: true,
          createdAt: true,
          propertyId: true,
          unitId: true,
        },
      }),
      this.prisma.tenantInvitation.count({ where }),
    ]);

    return { invitations, total };
  }

  async create(data: TenantInvitationCreate) {
    return this.prisma.tenantInvitation.create({
      data: {
        email: data.email,
        token: data.token,
        invitedBy: data.invitedBy,
        propertyId: data.propertyId || null,
        unitId: data.unitId || null,
        expiresAt: data.expiresAt,
        status: data.status || 'pending',
        metadata: data.metadata || {},
      },
    });
  }

  async update(id: string, data: TenantInvitationUpdate & { reminderCount?: number; reminderSentAt?: Date }) {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
    if (data.tenantId !== undefined) updateData.tenantId = data.tenantId;
    if (data.openedAt !== undefined) updateData.openedAt = data.openedAt;
    if (data.reminderCount !== undefined) updateData.reminderCount = data.reminderCount;
    if (data.reminderSentAt !== undefined) updateData.reminderSentAt = data.reminderSentAt;

    return this.prisma.tenantInvitation.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.tenantInvitation.delete({
      where: { id },
    });
  }

  async count(where: Prisma.TenantInvitationWhereInput) {
    return this.prisma.tenantInvitation.count({ where });
  }
}

