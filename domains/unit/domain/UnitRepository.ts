/**
 * Unit Repository
 * 
 * Data access layer for Unit domain
 * Handles all database operations for units
 */

import { PrismaClient } from '@prisma/client';
import { UnitCreate, UnitUpdate } from '@/lib/schemas';

export class UnitRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find unit by ID
   */
  async findById(id: string, include?: { property?: boolean }) {
    return this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        } : false,
      },
    });
  }

  /**
   * Find units by property ID
   */
  async findByPropertyId(propertyId: string, include?: { property?: boolean }) {
    return this.prisma.unit.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' },
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        } : false,
      },
    });
  }

  /**
   * Find units with filters
   */
  async findMany(where: any, include?: { property?: boolean }) {
    return this.prisma.unit.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        } : false,
      },
    });
  }

  /**
   * Create a new unit
   */
  async create(data: UnitCreate, include?: { property?: boolean }) {
    return this.prisma.unit.create({
      data: {
        id: (data as any).id || undefined, // Will use Prisma's default if not provided
        propertyId: data.propertyId,
        unitName: data.unitName,
        floorNumber: data.floorNumber || null,
        bedrooms: data.bedrooms || null,
        bathrooms: data.bathrooms || null,
        rentPrice: data.rentPrice || null,
        depositAmount: data.depositAmount || null,
        status: data.status || 'Vacant',
      } as any,
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        } : false,
      },
    });
  }

  /**
   * Update a unit
   */
  async update(id: string, data: UnitUpdate, include?: { property?: boolean }) {
    const updateData: any = {};

    if (data.unitName !== undefined) updateData.unitName = data.unitName;
    if (data.floorNumber !== undefined) updateData.floorNumber = data.floorNumber || null;
    if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms || null;
    if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms || null;
    if (data.rentPrice !== undefined) updateData.rentPrice = data.rentPrice || null;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount || null;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.unit.update({
      where: { id },
      data: updateData,
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        } : false,
      },
    });
  }

  /**
   * Delete a unit
   */
  async delete(id: string) {
    return this.prisma.unit.delete({
      where: { id },
    });
  }

  /**
   * Count units for a property
   */
  async countByPropertyId(propertyId: string): Promise<number> {
    return this.prisma.unit.count({
      where: { propertyId },
    });
  }
}

