/**
 * Lease Repository
 * 
 * Data access layer for Lease domain
 */

import { PrismaClient } from '@prisma/client';
import { LeaseCreate, LeaseUpdate, LeaseQuery } from '@/lib/schemas';

export class LeaseRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find lease by ID
   */
  async findById(id: string, include?: { tenants?: boolean; unit?: boolean; property?: boolean }) {
    return this.prisma.lease.findUnique({
      where: { id },
      include: {
        leaseTenants: include?.tenants ? {
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        } : false,
        unit: include?.unit ? {
          include: {
            property: include?.property ? {
              select: {
                id: true,
                propertyName: true,
                addressLine1: true,
                city: true,
                provinceState: true,
                landlord: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            } : false,
          },
        } : false,
      },
    });
  }

  /**
   * Find leases with filters and pagination
   */
  async findMany(query: LeaseQuery & { where?: any }, include?: { tenants?: boolean; unit?: boolean }) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.unitId && { unitId: filters.unitId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.propertyId && {
        unit: {
          propertyId: filters.propertyId,
        },
      }),
      ...(filters.tenantId && {
        leaseTenants: {
          some: {
            tenantId: filters.tenantId,
          },
        },
      }),
    };

    const [leases, total] = await Promise.all([
      this.prisma.lease.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          unitId: true,
          leaseStart: true,
          leaseEnd: true,
          rentAmount: true,
          rentDueDay: true,
          securityDeposit: true,
          paymentMethod: true,
          status: true,
          renewalReminderSent: true,
          renewalReminderSentAt: true,
          renewalDecision: true,
          renewalDecisionAt: true,
          renewalDecisionBy: true,
          createdAt: true,
          updatedAt: true,
          leaseTenants: include?.tenants ? {
            select: {
              leaseId: true,
              tenantId: true,
              isPrimaryTenant: true,
              addedAt: true,
              tenant: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          } : false,
          unit: include?.unit ? {
            select: {
              id: true,
              unitName: true,
              floorNumber: true,
              bedrooms: true,
              bathrooms: true,
              rentPrice: true,
              status: true,
              property: {
                select: {
                  id: true,
                  propertyName: true,
                  addressLine1: true,
                  city: true,
                  provinceState: true,
                },
              },
            },
          } : false,
        },
      }),
      this.prisma.lease.count({ where }),
    ]);

    return {
      leases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new lease
   */
  async create(data: LeaseCreate & { tenantIds: string[]; primaryTenantId?: string }) {
    return this.prisma.$transaction(async (tx: any) => {
      // Create lease
      const lease = await tx.lease.create({
        data: {
          unitId: data.unitId,
          leaseStart: new Date(data.leaseStart),
          leaseEnd: data.leaseEnd ? new Date(data.leaseEnd) : null,
          rentAmount: data.rentAmount,
          rentDueDay: data.rentDueDay || 1,
          securityDeposit: data.securityDeposit || null,
          paymentMethod: data.paymentMethod || null,
          status: data.status || 'Active',
        },
      });

      // Create lease-tenant relationships
      for (const tenantId of data.tenantIds) {
        await tx.leaseTenant.create({
          data: {
            leaseId: lease.id,
            tenantId: tenantId,
            isPrimaryTenant: tenantId === (data.primaryTenantId || data.tenantIds[0]),
          },
        });
      }

      // Update unit status if lease is active
      if (data.status === 'Active') {
        await tx.unit.update({
          where: { id: data.unitId },
          data: { status: 'Occupied' },
        });

        // Update property rented status
        const unit = await tx.unit.findUnique({
          where: { id: data.unitId },
          select: { propertyId: true },
        });

        if (unit) {
          await tx.property.update({
            where: { id: unit.propertyId },
            data: { rented: 'Yes' },
          });
        }
      }

      return lease;
    });
  }

  /**
   * Update a lease
   */
  async update(id: string, data: LeaseUpdate & { tenantIds?: string[]; primaryTenantId?: string }) {
    return this.prisma.$transaction(async (tx: any) => {
      // Get current lease to check status changes
      const currentLease = await tx.lease.findUnique({
        where: { id },
        select: { status: true, unitId: true },
      });

      if (!currentLease) {
        throw new Error('Lease not found');
      }

      const updateData: any = {};

      if (data.leaseStart !== undefined) updateData.leaseStart = new Date(data.leaseStart);
      if (data.leaseEnd !== undefined) {
        updateData.leaseEnd = data.leaseEnd ? new Date(data.leaseEnd) : null;
      }
      if (data.rentAmount !== undefined) updateData.rentAmount = data.rentAmount;
      if (data.rentDueDay !== undefined) updateData.rentDueDay = data.rentDueDay;
      if (data.securityDeposit !== undefined) updateData.securityDeposit = data.securityDeposit || null;
      if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod || null;
      if (data.status !== undefined) updateData.status = data.status;

      // Update lease
      const updatedLease = await tx.lease.update({
        where: { id },
        data: updateData,
      });

      // Update lease-tenant relationships if provided
      if (data.tenantIds && data.tenantIds.length > 0) {
        // Delete existing relationships
        await tx.leaseTenant.deleteMany({
          where: { leaseId: id },
        });

        // Create new relationships
        for (const tenantId of data.tenantIds) {
          await tx.leaseTenant.create({
            data: {
              leaseId: id,
              tenantId: tenantId,
              isPrimaryTenant: tenantId === (data.primaryTenantId || data.tenantIds[0]),
            },
          });
        }
      }

      // Handle status changes
      const oldStatus = currentLease.status;
      const newStatus = data.status || oldStatus;

      if (newStatus === 'Active' && oldStatus !== 'Active') {
        // Lease became active - update unit and property
        await tx.unit.update({
          where: { id: currentLease.unitId },
          data: { status: 'Occupied' },
        });

        const unit = await tx.unit.findUnique({
          where: { id: currentLease.unitId },
          select: { propertyId: true },
        });

        if (unit) {
          await tx.property.update({
            where: { id: unit.propertyId },
            data: { rented: 'Yes' },
          });
        }
      } else if (newStatus !== 'Active' && oldStatus === 'Active') {
        // Lease became inactive - check if there are other active leases
        const otherActiveLeases = await tx.lease.count({
          where: {
            unitId: currentLease.unitId,
            id: { not: id },
            status: 'Active',
          },
        });

        if (otherActiveLeases === 0) {
          // No other active leases - update unit to Vacant
          await tx.unit.update({
            where: { id: currentLease.unitId },
            data: { status: 'Vacant' },
          });

          // Check if property has any other active leases
          const unit = await tx.unit.findUnique({
            where: { id: currentLease.unitId },
            select: { propertyId: true },
          });

          if (unit) {
            const propertyActiveLeases = await tx.lease.count({
              where: {
                unit: {
                  propertyId: unit.propertyId,
                },
                status: 'Active',
              },
            });

            if (propertyActiveLeases === 0) {
              await tx.property.update({
                where: { id: unit.propertyId },
                data: { rented: 'No' },
              });
            }
          }
        }
      }

      return updatedLease;
    });
  }

  /**
   * Delete a lease
   */
  async delete(id: string) {
    return this.prisma.lease.delete({
      where: { id },
    });
  }

  /**
   * Count leases matching criteria
   */
  async count(where: any) {
    return this.prisma.lease.count({ where });
  }

  /**
   * Check if lease belongs to landlord
   */
  async belongsToLandlord(leaseId: string, landlordId: string): Promise<boolean> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });
    return lease?.unit?.property?.landlordId === landlordId;
  }

  /**
   * Check if tenant is on lease
   */
  async hasTenant(leaseId: string, tenantId: string): Promise<boolean> {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        leaseTenants: {
          where: {
            tenantId,
          },
        },
      },
    });
    return (lease?.leaseTenants?.length || 0) > 0;
  }
}

