/**
 * Inspection Repository
 * 
 * Data access layer for Inspection domain
 */

import { PrismaClient } from '@prisma/client';
import { InspectionChecklistCreate, InspectionChecklistUpdate, InspectionChecklistQuery } from '@/lib/schemas';

export class InspectionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, include?: { tenant?: boolean; items?: boolean }) {
    return this.prisma.inspectionChecklist.findUnique({
      where: { id },
      include: {
        tenant: include?.tenant ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        } : false,
        items: include?.items ? {
          orderBy: { createdAt: 'asc' },
        } : false,
      },
    });
  }

  async findMany(query: InspectionChecklistQuery & { where?: any }, include?: { tenant?: boolean; items?: boolean }) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.unitId && { unitId: filters.unitId }),
      ...(filters.tenantId && { tenantId: filters.tenantId }),
      ...(filters.leaseId && { leaseId: filters.leaseId }),
      ...(filters.checklistType && { checklistType: filters.checklistType }),
      ...(filters.status && { status: filters.status }),
    };

    const [checklists, total] = await Promise.all([
      this.prisma.inspectionChecklist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: include?.tenant ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          } : false,
          items: include?.items ? {
            orderBy: { createdAt: 'asc' },
          } : false,
        },
      }),
      this.prisma.inspectionChecklist.count({ where }),
    ]);

    return {
      checklists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: InspectionChecklistCreate & { id?: string }) {
    return this.prisma.inspectionChecklist.create({
      data: {
        id: data.id || '',
        tenantId: data.tenantId || '',
        propertyId: data.propertyId || null,
        unitId: data.unitId || null,
        leaseId: data.leaseId || null,
        checklistType: data.checklistType,
        inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : null,
        status: 'pending', // Default status - inspection schemas don't include status in create
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: InspectionChecklistUpdate) {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.inspectionDate !== undefined) {
      updateData.inspectionDate = data.inspectionDate ? new Date(data.inspectionDate) : null;
    }
    if (data.submittedAt !== undefined) {
      updateData.submittedAt = data.submittedAt ? new Date(data.submittedAt) : null;
    }
    if (data.approvedAt !== undefined) {
      updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    }
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy || null;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName || null;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason || null;
    if (data.rejectedAt !== undefined) {
      updateData.rejectedAt = data.rejectedAt ? new Date(data.rejectedAt) : null;
    }
    if (data.rejectedBy !== undefined) updateData.rejectedBy = data.rejectedBy || null;
    if (data.rejectedByName !== undefined) updateData.rejectedByName = data.rejectedByName || null;

    return this.prisma.inspectionChecklist.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.inspectionChecklist.delete({
      where: { id },
    });
  }
}

