/**
 * Tenant Repository
 * 
 * Data access layer for Tenant domain
 */

import { PrismaClient } from '@prisma/client';
import { TenantCreate, TenantUpdate, TenantQuery } from '@/lib/schemas';

export class TenantRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find tenant by ID
   */
  async findById(id: string, include?: { leases?: boolean; emergencyContacts?: boolean; employers?: boolean }) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        leaseTenants: include?.leases ? {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        } : false,
        emergencyContacts: include?.emergencyContacts || false,
        employers: include?.employers ? {
          include: {
            employmentDocuments: true,
          },
        } : false,
      },
    });
  }

  /**
   * Find tenant by email
   */
  async findByEmail(email: string) {
    return this.prisma.tenant.findUnique({
      where: { email },
    });
  }

  /**
   * Find tenants with filters and pagination
   */
  async findMany(query: TenantQuery & { where?: any }, include?: { leases?: boolean }) {
    const { page, limit, search, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.landlordId && {
        leaseTenants: {
          some: {
            lease: {
              unit: {
                property: {
                  landlordId: filters.landlordId,
                },
              },
            },
          },
        },
      }),
      ...(filters.propertyId && {
        leaseTenants: {
          some: {
            lease: {
              unit: {
                propertyId: filters.propertyId,
              },
            },
          },
        },
      }),
      ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus }),
      ...(filters.hasAccess !== undefined && { hasAccess: filters.hasAccess }),
    };

    // Search by name or email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          leaseTenants: include?.leases ? {
            include: {
              lease: {
                include: {
                  unit: {
                    include: {
                      property: true,
                    },
                  },
                },
              },
            },
          } : false,
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new tenant
   */
  async create(data: TenantCreate & { tenantId: string; invitedBy?: string }) {
    const tenantData: any = {
      tenantId: data.tenantId,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      currentAddress: data.currentAddress || null,
      city: data.city || null,
      postalZip: data.postalZip || null,
      provinceState: data.provinceState || null,
      country: data.country || null,
      countryCode: data.countryCode || null,
      regionCode: data.regionCode || null,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      numberOfAdults: data.numberOfAdults || null,
      numberOfChildren: data.numberOfChildren || null,
      moveInDate: data.moveInDate ? new Date(data.moveInDate) : null,
      leaseTerm: data.leaseTerm || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      employmentStatus: data.employmentStatus || null,
      monthlyIncome: data.monthlyIncome || null,
      timezone: data.timezone || 'America/New_York',
      invitedBy: data.invitedBy || null,
    };

    return this.prisma.tenant.create({
      data: tenantData,
    });
  }

  /**
   * Update a tenant
   */
  async update(id: string, data: TenantUpdate) {
    const updateData: any = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName || null;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.currentAddress !== undefined) updateData.currentAddress = data.currentAddress || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.postalZip !== undefined) updateData.postalZip = data.postalZip || null;
    if (data.provinceState !== undefined) updateData.provinceState = data.provinceState || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.countryCode !== undefined) updateData.countryCode = data.countryCode || null;
    if (data.regionCode !== undefined) updateData.regionCode = data.regionCode || null;
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if (data.numberOfAdults !== undefined) updateData.numberOfAdults = data.numberOfAdults || null;
    if (data.numberOfChildren !== undefined) updateData.numberOfChildren = data.numberOfChildren || null;
    if (data.moveInDate !== undefined) {
      updateData.moveInDate = data.moveInDate ? new Date(data.moveInDate) : null;
    }
    if (data.leaseTerm !== undefined) updateData.leaseTerm = data.leaseTerm || null;
    if (data.emergencyContactName !== undefined) updateData.emergencyContactName = data.emergencyContactName || null;
    if (data.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = data.emergencyContactPhone || null;
    if (data.employmentStatus !== undefined) updateData.employmentStatus = data.employmentStatus || null;
    if (data.monthlyIncome !== undefined) updateData.monthlyIncome = data.monthlyIncome || null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    return this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a tenant
   */
  async delete(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }

  /**
   * Count tenants matching criteria
   */
  async count(where: any) {
    return this.prisma.tenant.count({ where });
  }

  /**
   * Create tenant with related entities (emergency contacts, employers) in a transaction
   */
  async createWithRelated(
    tenantData: TenantCreate & { tenantId: string; invitedBy?: string },
    relatedData: {
      emergencyContacts?: Array<{
        name: string;
        phone: string;
        email?: string;
        isPrimary?: boolean;
      }>;
      employers?: Array<{
        name: string;
        address?: string;
        income?: number;
        jobTitle?: string;
        startDate?: Date;
        payFrequency?: string;
        isCurrent?: boolean;
      }>;
    }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const { generateCUID } = require('@/lib/utils/id-generator');
      const tenantId = generateCUID();
      const now = new Date();
      
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          id: tenantId,
          tenantId: tenantData.tenantId,
          firstName: tenantData.firstName,
          middleName: tenantData.middleName || null,
          lastName: tenantData.lastName,
          email: tenantData.email,
          phone: tenantData.phone || null,
          currentAddress: tenantData.currentAddress || null,
          city: tenantData.city || null,
          postalZip: tenantData.postalZip || null,
          provinceState: tenantData.provinceState || null,
          country: tenantData.country || null,
          countryCode: tenantData.countryCode || null,
          regionCode: tenantData.regionCode || null,
          dateOfBirth: tenantData.dateOfBirth ? new Date(tenantData.dateOfBirth) : null,
          numberOfAdults: tenantData.numberOfAdults || null,
          numberOfChildren: tenantData.numberOfChildren || null,
          moveInDate: tenantData.moveInDate ? new Date(tenantData.moveInDate) : null,
          leaseTerm: tenantData.leaseTerm || null,
          emergencyContactName: tenantData.emergencyContactName || null,
          emergencyContactPhone: tenantData.emergencyContactPhone || null,
          employmentStatus: tenantData.employmentStatus || null,
          monthlyIncome: tenantData.monthlyIncome || null,
          timezone: tenantData.timezone || 'America/New_York',
          invitedBy: tenantData.invitedBy || null,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Create emergency contacts if provided
      if (relatedData.emergencyContacts && relatedData.emergencyContacts.length > 0) {
        for (const contact of relatedData.emergencyContacts) {
          if (contact.name.trim() && contact.phone.trim()) {
            await tx.emergencyContact.create({
              data: {
                id: require('@/lib/utils/id-generator').generateCUID(),
                tenantId: tenant.id,
                contactName: contact.name.trim(),
                email: contact.email?.trim() || null,
                phone: contact.phone.trim(),
                isPrimary: contact.isPrimary || false,
                createdAt: now,
                updatedAt: now,
              },
            });
          }
        }
      }

      // Create employers if provided
      if (relatedData.employers && relatedData.employers.length > 0) {
        for (const employer of relatedData.employers) {
          if (employer.name.trim()) {
            await tx.employer.create({
              data: {
                id: require('@/lib/utils/id-generator').generateCUID(),
                tenantId: tenant.id,
                employerName: employer.name.trim(),
                employerAddress: employer.address?.trim() || null,
                income: employer.income || null,
                isCurrent: employer.isCurrent !== undefined ? employer.isCurrent : true,
                createdAt: now,
                updatedAt: now,
              },
            });
          }
        }
      }

      return tenant;
    });
  }
}

