/**
 * Lease Repository Implementation
 * 
 * Infrastructure layer - implements domain repository interface
 * Uses Prisma for database access
 */

import { PrismaClient } from '@prisma/client';
import { LeaseRepository as ILeaseRepository } from '../domain/LeaseRepository';
import { LeaseEntity } from '../domain/Lease';

export class LeaseRepository implements ILeaseRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<LeaseEntity | null> {
    const lease = await this.prisma.lease.findUnique({
      where: { id },
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!lease) {
      return null;
    }

    return this.mapToEntity(lease);
  }

  async findByPropertyId(propertyId: string): Promise<LeaseEntity[]> {
    const leases = await this.prisma.lease.findMany({
      where: {
        unit: {
          propertyId,
        },
      },
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return leases.map(lease => this.mapToEntity(lease));
  }

  async findByTenantId(tenantId: string): Promise<LeaseEntity[]> {
    const leases = await this.prisma.lease.findMany({
      where: {
        leaseTenants: {
          some: {
            tenantId,
          },
        },
      },
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return leases.map(lease => this.mapToEntity(lease));
  }

  async findActive(): Promise<LeaseEntity[]> {
    const now = new Date();
    const leases = await this.prisma.lease.findMany({
      where: {
        status: 'Active',
        leaseStart: { lte: now },
        OR: [
          { leaseEnd: null },
          { leaseEnd: { gte: now } },
        ],
      },
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return leases.map(lease => this.mapToEntity(lease));
  }

  async create(data: Omit<LeaseEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<LeaseEntity> {
    const lease = await this.prisma.lease.create({
      data: {
        unitId: data.propertyId, // Note: propertyId maps to unitId in Prisma
        leaseStart: data.startDate,
        leaseEnd: data.endDate,
        rentAmount: data.monthlyRent,
        status: data.status === 'active' ? 'Active' : data.status === 'expired' ? 'Expired' : 'Terminated',
      } as any,
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return this.mapToEntity(lease);
  }

  async update(id: string, data: Partial<LeaseEntity>): Promise<LeaseEntity> {
    const updateData: any = {};

    if (data.startDate) updateData.leaseStart = data.startDate;
    if (data.endDate) updateData.leaseEnd = data.endDate;
    if (data.monthlyRent) updateData.rentAmount = data.monthlyRent;
    if (data.status) {
      updateData.status = data.status === 'active' ? 'Active' : data.status === 'expired' ? 'Expired' : 'Terminated';
    }

    const lease = await this.prisma.lease.update({
      where: { id },
      data: updateData,
      include: {
        unit: true,
        leaseTenants: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return this.mapToEntity(lease);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lease.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.lease.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Map Prisma model to domain entity
   */
  private mapToEntity(lease: any): LeaseEntity {
    return {
      id: lease.id,
      propertyId: lease.unitId, // Map unitId to propertyId
      tenantId: lease.leaseTenants?.[0]?.tenantId || '', // Get primary tenant
      startDate: lease.leaseStart,
      endDate: lease.leaseEnd || new Date(),
      monthlyRent: lease.rentAmount || 0,
      status: lease.status === 'Active' ? 'active' : lease.status === 'Expired' ? 'expired' : 'terminated',
      createdAt: lease.createdAt || new Date(),
      updatedAt: lease.updatedAt || new Date(),
    };
  }
}

