/**
 * Maintenance Request Repository
 * 
 * Data access layer for Maintenance Request domain
 */

import { PrismaClient } from '@prisma/client';
import { MaintenanceRequestCreate, MaintenanceRequestUpdate, MaintenanceRequestQuery } from '@/lib/schemas';

export class MaintenanceRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find maintenance request by ID
   */
  async findById(id: string, include?: { tenant?: boolean; property?: boolean; comments?: boolean; assignedToProvider?: boolean }) {
    return this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        tenant: include?.tenant ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        } : false,
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
        assignedToProvider: include?.assignedToProvider ? {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            type: true,
          },
        } : false,
        comments: include?.comments ? {
          select: {
            id: true,
            comment: true,
            authorName: true,
            authorRole: true,
            authorEmail: true,
            isStatusUpdate: true,
            oldStatus: true,
            newStatus: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        } : false,
      },
    });
  }

  /**
   * Find maintenance requests with filters and pagination
   */
  async findMany(query: MaintenanceRequestQuery & { where?: any }, include?: { tenant?: boolean; property?: boolean; comments?: boolean; assignedToProvider?: boolean }) {
    const { page, limit, requestedDateFrom, requestedDateTo, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.tenantId && { tenantId: filters.tenantId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.category && { category: filters.category }),
      ...(filters.assignedToProviderId && { assignedToProviderId: filters.assignedToProviderId }),
    };

    // Date range filters
    if (requestedDateFrom || requestedDateTo) {
      where.requestedDate = {};
      if (requestedDateFrom) where.requestedDate.gte = new Date(requestedDateFrom);
      if (requestedDateTo) where.requestedDate.lte = new Date(requestedDateTo);
    }

    const [requests, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          propertyId: true,
          tenantId: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          requestedDate: true,
          completedDate: true,
          tenantApproved: true,
          landlordApproved: true,
          createdAt: true,
          updatedAt: true,
          ticketNumber: true,
          initiatedBy: true,
          actualCost: true,
          estimatedCost: true,
          scheduledDate: true,
          rating: true,
          tenantFeedback: true,
          completionNotes: true,
          assignedToVendorId: true,
          assignedToProviderId: true,
          photos: true,
          beforePhotos: true,
          afterPhotos: true,
          tenant: include?.tenant ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          } : false,
          property: include?.property ? {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
              city: true,
              provinceState: true,
            },
          } : false,
          assignedToProvider: include?.assignedToProvider ? {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              type: true,
            },
          } : false,
          comments: include?.comments ? {
            select: {
              id: true,
              comment: true,
              authorName: true,
              authorRole: true,
              isStatusUpdate: true,
              oldStatus: true,
              newStatus: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Limit comments in list view
          } : false,
        },
      }),
      this.prisma.maintenanceRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new maintenance request
   */
  async create(data: MaintenanceRequestCreate & { id?: string; ticketNumber?: string }) {
    return this.prisma.maintenanceRequest.create({
      data: {
        id: data.id || '',
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'Medium',
        status: data.status || 'New',
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        estimatedCost: data.estimatedCost || null,
        initiatedBy: data.initiatedBy || 'tenant',
        photos: data.photos as any || null,
        beforePhotos: data.beforePhotos as any || null,
        afterPhotos: data.afterPhotos as any || null,
        assignedToProviderId: data.assignedToProviderId || null,
        assignedToVendorId: data.assignedToVendorId || null,
        ticketNumber: data.ticketNumber || null,
      } as any,
    });
  }

  /**
   * Update a maintenance request
   */
  async update(id: string, data: MaintenanceRequestUpdate) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.scheduledDate !== undefined) {
      updateData.scheduledDate = data.scheduledDate ? new Date(data.scheduledDate) : null;
    }
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost || null;
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost || null;
    if (data.completedDate !== undefined) {
      updateData.completedDate = data.completedDate ? new Date(data.completedDate) : null;
    }
    if (data.tenantApproved !== undefined) updateData.tenantApproved = data.tenantApproved;
    if (data.landlordApproved !== undefined) updateData.landlordApproved = data.landlordApproved;
    if (data.completionNotes !== undefined) updateData.completionNotes = data.completionNotes || null;
    if (data.tenantFeedback !== undefined) updateData.tenantFeedback = data.tenantFeedback || null;
    if (data.rating !== undefined) updateData.rating = data.rating || null;
    if (data.photos !== undefined) updateData.photos = data.photos ? JSON.stringify(data.photos) : null;
    if (data.beforePhotos !== undefined) updateData.beforePhotos = data.beforePhotos ? JSON.stringify(data.beforePhotos) : null;
    if (data.afterPhotos !== undefined) updateData.afterPhotos = data.afterPhotos ? JSON.stringify(data.afterPhotos) : null;
    if (data.assignedToProviderId !== undefined) updateData.assignedToProviderId = data.assignedToProviderId || null;
    if (data.assignedToVendorId !== undefined) updateData.assignedToVendorId = data.assignedToVendorId || null;

    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a maintenance request
   */
  async delete(id: string) {
    return this.prisma.maintenanceRequest.delete({
      where: { id },
    });
  }

  /**
   * Count maintenance requests matching criteria
   */
  async count(where: any) {
    return this.prisma.maintenanceRequest.count({ where });
  }

  /**
   * Check if maintenance request belongs to landlord
   */
  async belongsToLandlord(maintenanceId: string, landlordId: string): Promise<boolean> {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      include: {
        property: true,
      },
    });
    return request?.property?.landlordId === landlordId;
  }

  /**
   * Add comment to maintenance request
   */
  async addComment(maintenanceId: string, commentData: {
    comment: string;
    authorEmail: string;
    authorName: string;
    authorRole: string;
  }) {
    const { generateCUID } = require('@/lib/utils/id-generator');
    return this.prisma.maintenanceComment.create({
      data: {
        id: generateCUID(),
        maintenanceRequestId: maintenanceId,
        authorEmail: commentData.authorEmail,
        authorName: commentData.authorName,
        authorRole: commentData.authorRole,
        comment: commentData.comment,
      },
    });
  }
}

