/**
 * Landlord Repository
 * 
 * Data access layer for Landlord domain
 */

import { PrismaClient } from '@prisma/client';
import { LandlordCreate, LandlordUpdate, LandlordQuery } from '@/lib/schemas';

export class LandlordRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find landlord by ID
   */
  async findById(id: string, include?: { properties?: boolean; organization?: boolean }) {
    return this.prisma.landlord.findUnique({
      where: { id },
      include: {
        properties: include?.properties ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
            city: true,
            postalZip: true,
            propertyType: true,
            unitCount: true,
          },
        } : false,
        organization: include?.organization || false,
      },
    });
  }

  /**
   * Find landlord by email
   */
  async findByEmail(email: string) {
    return this.prisma.landlord.findUnique({
      where: { email },
    });
  }

  /**
   * Find landlord by landlordId
   */
  async findByLandlordId(landlordId: string) {
    return this.prisma.landlord.findUnique({
      where: { landlordId },
    });
  }

  /**
   * Find landlords with filters and pagination
   */
  async findMany(query: LandlordQuery & { where?: any }, include?: { properties?: boolean }) {
    const { page, limit, search, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.organizationId && { organizationId: filters.organizationId }),
      ...(filters.approvalStatus && { approvalStatus: filters.approvalStatus }),
    };

    // Search by name or email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [landlords, total] = await Promise.all([
      this.prisma.landlord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          properties: include?.properties ? {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
              city: true,
              postalZip: true,
              propertyType: true,
              unitCount: true,
            },
          } : false,
        },
      }),
      this.prisma.landlord.count({ where }),
    ]);

    return {
      landlords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new landlord
   */
  async create(data: LandlordCreate & { landlordId: string; countryCode?: string; regionCode?: string }) {
    return this.prisma.landlord.create({
      data: {
        id: data.id || undefined,
        landlordId: data.landlordId,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        postalZip: data.postalZip || null,
        provinceState: data.provinceState || null,
        country: data.country || null,
        countryCode: data.countryCode || null,
        regionCode: data.regionCode || null,
        timezone: data.timezone || 'America/Toronto',
        theme: data.theme || 'default',
        organizationId: data.organizationId || null,
        approvalStatus: 'PENDING',
      },
    });
  }

  /**
   * Update a landlord
   */
  async update(id: string, data: LandlordUpdate & { countryCode?: string; regionCode?: string }) {
    return this.prisma.landlord.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.middleName !== undefined && { middleName: data.middleName || null }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone || null }),
        ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 || null }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.postalZip !== undefined && { postalZip: data.postalZip || null }),
        ...(data.provinceState !== undefined && { provinceState: data.provinceState || null }),
        ...(data.country !== undefined && { country: data.country || null }),
        ...(data.countryCode !== undefined && { countryCode: data.countryCode || null }),
        ...(data.regionCode !== undefined && { regionCode: data.regionCode || null }),
        ...(data.timezone !== undefined && { timezone: data.timezone }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.organizationId !== undefined && { organizationId: data.organizationId || null }),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete a landlord (soft delete by setting approvalStatus to REJECTED)
   */
  async delete(id: string) {
    return this.prisma.landlord.update({
      where: { id },
      data: {
        approvalStatus: 'REJECTED',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Add vendor to landlord's vendor list
   */
  async addVendor(landlordId: string, vendorId: string) {
    // Check if relationship already exists
    const existing = await this.prisma.landlordVendor.findFirst({
      where: {
        landlordId,
        vendorId,
      }
    });

    if (existing) {
      return existing;
    }

    // Create relationship
    return this.prisma.landlordVendor.create({
      data: {
        landlordId,
        vendorId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            email: true,
            phone: true,
            type: true,
          }
        }
      }
    });
  }

  /**
   * Remove vendor from landlord's vendor list
   */
  async removeVendor(landlordId: string, vendorId: string) {
    const relationship = await this.prisma.landlordVendor.findFirst({
      where: {
        landlordId,
        vendorId,
      }
    });

    if (!relationship) {
      return null;
    }

    return this.prisma.landlordVendor.delete({
      where: { id: relationship.id },
    });
  }
}
