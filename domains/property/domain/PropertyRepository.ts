/**
 * Property Repository
 * 
 * Data access layer for Property domain
 * Handles all database operations
 */

import { PrismaClient } from '@prisma/client';
import { PropertyCreate, PropertyUpdate, PropertyQuery } from '@/lib/schemas';

export class PropertyRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find property by ID
   */
  async findById(id: string, include?: { landlord?: boolean; units?: boolean }) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        landlord: include?.landlord ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        } : false,
        units: include?.units ? {
          select: {
            id: true,
            propertyId: true,
            unitName: true,
            floorNumber: true,
            bedrooms: true,
            bathrooms: true,
            rentPrice: true,
            depositAmount: true,
            status: true,
            createdAt: true,
            leases: {
              where: { status: 'Active' },
              select: {
                id: true,
                leaseStart: true,
                leaseEnd: true,
                rentAmount: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        } : false,
      },
    });
  }

  /**
   * Find properties with filters and pagination
   */
  async findMany(query: PropertyQuery & { where?: any }, include?: { landlord?: boolean; units?: boolean }) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...filters.where,
      ...(filters.landlordId && { landlordId: filters.landlordId }),
      ...(filters.propertyType && { propertyType: filters.propertyType }),
      ...(filters.countryCode && { countryCode: filters.countryCode }),
      ...(filters.regionCode && { regionCode: filters.regionCode }),
    };

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          landlord: include?.landlord ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          } : false,
          units: include?.units ? {
            select: {
              id: true,
              propertyId: true,
              unitName: true,
              floorNumber: true,
              bedrooms: true,
              bathrooms: true,
              rentPrice: true,
              depositAmount: true,
              status: true,
              createdAt: true,
              leases: {
                where: { status: 'Active' },
                select: {
                  id: true,
                  leaseStart: true,
                  leaseEnd: true,
                  rentAmount: true,
                  status: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          } : false,
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new property
   */
  async create(data: PropertyCreate & { propertyId: string; organizationId?: string | null }) {
    return this.prisma.property.create({
      data: {
        ...data,
        propertyId: data.propertyId,
        landlordId: data.landlordId,
        organizationId: data.organizationId || null,
        propertyName: data.propertyName || null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        provinceState: data.provinceState || '',
        postalZip: data.postalZip || '',
        country: data.country || '',
        countryCode: data.countryCode || null,
        regionCode: data.regionCode || null,
        propertyType: data.propertyType || null,
        unitCount: data.unitCount || 1,
        yearBuilt: data.yearBuilt || null,
        purchasePrice: data.purchasePrice || null,
        mortgageAmount: data.mortgageAmount || null,
        interestRate: data.interestRate || null,
        mortgageTermYears: data.mortgageTermYears || null,
        mortgageStartDate: data.mortgageStartDate ? new Date(data.mortgageStartDate) : null,
        paymentFrequency: data.paymentFrequency || 'biweekly',
        rent: data.rent || null,
        depositAmount: data.depositAmount || null,
        rented: data.rented || 'No',
        squareFootage: data.squareFootage || null,
        propertyDescription: data.propertyDescription || null,
        propertyTaxes: data.propertyTaxes || null,
      } as any,
    });
  }

  /**
   * Update a property
   */
  async update(id: string, data: PropertyUpdate) {
    const updateData: any = {};

    if (data.propertyName !== undefined) updateData.propertyName = data.propertyName || null;
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2 || null;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.postalZip !== undefined) updateData.postalZip = data.postalZip;
    if (data.provinceState !== undefined) updateData.provinceState = data.provinceState || null;
    if (data.country !== undefined) updateData.country = data.country || null;
    if (data.countryCode !== undefined) updateData.countryCode = data.countryCode || null;
    if (data.regionCode !== undefined) updateData.regionCode = data.regionCode || null;
    if (data.propertyType !== undefined) updateData.propertyType = data.propertyType || null;
    if (data.unitCount !== undefined) updateData.unitCount = data.unitCount;
    if (data.yearBuilt !== undefined) updateData.yearBuilt = data.yearBuilt || null;
    if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice || null;
    if (data.mortgageAmount !== undefined) updateData.mortgageAmount = data.mortgageAmount || null;
    if (data.interestRate !== undefined) updateData.interestRate = data.interestRate || null;
    if (data.mortgageTermYears !== undefined) updateData.mortgageTermYears = data.mortgageTermYears || null;
    if (data.mortgageStartDate !== undefined) {
      updateData.mortgageStartDate = data.mortgageStartDate ? new Date(data.mortgageStartDate) : null;
    }
    if (data.paymentFrequency !== undefined) updateData.paymentFrequency = data.paymentFrequency || null;
    if (data.rent !== undefined) updateData.rent = data.rent || null;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount || null;
    if (data.rented !== undefined) updateData.rented = data.rented;
    if (data.squareFootage !== undefined) updateData.squareFootage = data.squareFootage || null;
    if (data.propertyDescription !== undefined) updateData.propertyDescription = data.propertyDescription || null;
    if (data.propertyTaxes !== undefined) updateData.propertyTaxes = data.propertyTaxes || null;

    return this.prisma.property.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a property
   */
  async delete(id: string) {
    return this.prisma.property.delete({
      where: { id },
    });
  }

  /**
   * Count properties matching criteria
   */
  async count(where: any) {
    return this.prisma.property.count({ where });
  }
}

