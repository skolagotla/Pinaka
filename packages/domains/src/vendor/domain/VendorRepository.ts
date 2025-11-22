/**
 * Vendor/ServiceProvider Repository
 * 
 * Data access layer for Vendor/ServiceProvider domain
 */

import { PrismaClient } from '@prisma/client';
import { ServiceProviderCreate, ServiceProviderUpdate, ServiceProviderQuery } from '@/lib/schemas';
import { generateCUID } from '@/lib/utils/id-generator';

export class VendorRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.serviceProvider.findUnique({
      where: { id },
    });
  }

  async findMany(query: ServiceProviderQuery & { where?: any }) {
    const { page, limit, search, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.isGlobal !== undefined && { isGlobal: filters.isGlobal }),
    };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [providers, total] = await Promise.all([
      this.prisma.serviceProvider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceProvider.count({ where }),
    ]);

    return {
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: ServiceProviderCreate & { id?: string; providerId?: string }) {
    const providerId = data.providerId || generateCUID();

    return this.prisma.serviceProvider.create({
      data: {
        id: data.id,
        providerId,
        type: data.type,
        name: data.name,
        businessName: data.businessName || null,
        contactName: data.contactName || null,
        email: data.email,
        phone: data.phone,
        category: data.category || null,
        specialties: data.specialties || [],
        licenseNumber: data.licenseNumber || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        provinceState: data.provinceState || null,
        postalZip: data.postalZip || null,
        country: data.country || null,
        countryCode: data.countryCode || null,
        regionCode: data.regionCode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        isGlobal: data.isGlobal || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: ServiceProviderUpdate) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.businessName !== undefined) updateData.businessName = data.businessName || null;
    if (data.contactName !== undefined) updateData.contactName = data.contactName || null;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.specialties !== undefined) updateData.specialties = data.specialties;
    if (data.licenseNumber !== undefined) updateData.licenseNumber = data.licenseNumber || null;
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1 || null;
    if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2 || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.provinceState !== undefined) updateData.provinceState = data.provinceState || null;
    if (data.postalZip !== undefined) updateData.postalZip = data.postalZip || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.countryCode !== undefined) updateData.countryCode = data.countryCode || null;
    if (data.regionCode !== undefined) updateData.regionCode = data.regionCode || null;
    if (data.latitude !== undefined) updateData.latitude = data.latitude || null;
    if (data.longitude !== undefined) updateData.longitude = data.longitude || null;
    if (data.isGlobal !== undefined) updateData.isGlobal = data.isGlobal;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.serviceProvider.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.serviceProvider.delete({
      where: { id },
    });
  }

  async softDelete(id: string) {
    return this.prisma.serviceProvider.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get usage statistics for a vendor
   */
  async getUsageStats(vendorId: string) {
    const [totalJobs, completedJobs, activeJobs, totalSpent, averageRating] = await Promise.all([
      this.prisma.maintenanceRequest.count({
        where: {
          assignedToProviderId: vendorId,
        }
      }),
      this.prisma.maintenanceRequest.count({
        where: {
          assignedToProviderId: vendorId,
          status: 'Completed',
        }
      }),
      this.prisma.maintenanceRequest.count({
        where: {
          assignedToProviderId: vendorId,
          status: {
            in: ['New', 'Pending', 'In Progress']
          }
        }
      }),
      this.prisma.maintenanceRequest.aggregate({
        where: {
          assignedToProviderId: vendorId,
          status: 'Completed',
          actualCost: {
            not: null
          }
        },
        _sum: {
          actualCost: true
        }
      }),
      this.prisma.maintenanceRequest.aggregate({
        where: {
          assignedToProviderId: vendorId,
          rating: {
            not: null
          }
        },
        _avg: {
          rating: true
        }
      })
    ]);

    return {
      totalJobs,
      completedJobs,
      activeJobs,
      totalSpent: totalSpent._sum.actualCost || 0,
      averageRating: averageRating._avg.rating ? Number(averageRating._avg.rating.toFixed(2)) : null,
      completionRate: totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(2) : 0,
    };
  }
}

