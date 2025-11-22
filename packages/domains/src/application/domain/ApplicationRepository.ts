/**
 * Application Repository
 * 
 * Data access layer for Application domain
 */

import { PrismaClient } from '@prisma/client';
import { ApplicationCreate, ApplicationUpdate, ApplicationQuery } from '@/lib/schemas';
import { generateCUID } from '@/lib/utils/id-generator';

export class ApplicationRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, include?: { unit?: boolean; property?: boolean; lease?: boolean }) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        unit: include?.unit ? {
          select: {
            id: true,
            unitName: true,
          },
        } : false,
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
          },
        } : false,
        lease: include?.lease ? {
          select: {
            id: true,
            status: true,
          },
        } : false,
      },
    });
  }

  async findMany(query: ApplicationQuery & { where?: any }, include?: { unit?: boolean; property?: boolean; lease?: boolean }) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.unitId && { unitId: filters.unitId }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.applicantEmail && { applicantEmail: filters.applicantEmail }),
    };

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: include?.unit ? {
            select: {
              id: true,
              unitName: true,
            },
          } : false,
          property: include?.property ? {
            select: {
              id: true,
              propertyName: true,
            },
          } : false,
          lease: include?.lease ? {
            select: {
              id: true,
              status: true,
            },
          } : false,
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: ApplicationCreate & { id?: string; propertyId?: string; deadline?: Date }) {
    const applicationId = data.id || generateCUID();
    
    // Calculate deadline (1 week from creation)
    const deadline = data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.application.create({
      data: {
        id: applicationId,
        unitId: data.unitId,
        propertyId: data.propertyId!,
        applicantEmail: data.applicantEmail,
        applicantName: data.applicantName,
        applicantPhone: data.applicantPhone || null,
        coApplicantIds: data.coApplicantIds || [],
        status: 'draft',
        deadline,
      },
    });
  }

  async update(id: string, data: ApplicationUpdate) {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.screeningRequested !== undefined) updateData.screeningRequested = data.screeningRequested;
    if (data.screeningProvider !== undefined) updateData.screeningProvider = data.screeningProvider || null;
    if (data.screeningStatus !== undefined) updateData.screeningStatus = data.screeningStatus || null;
    if (data.approvedAt !== undefined) {
      updateData.approvedAt = data.approvedAt ? new Date(data.approvedAt) : null;
    }
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy || null;
    if (data.approvedByType !== undefined) updateData.approvedByType = data.approvedByType || null;
    if (data.approvedByEmail !== undefined) updateData.approvedByEmail = data.approvedByEmail || null;
    if (data.approvedByName !== undefined) updateData.approvedByName = data.approvedByName || null;
    if (data.rejectedAt !== undefined) {
      updateData.rejectedAt = data.rejectedAt ? new Date(data.rejectedAt) : null;
    }
    if (data.rejectedBy !== undefined) updateData.rejectedBy = data.rejectedBy || null;
    if (data.rejectedByType !== undefined) updateData.rejectedByType = data.rejectedByType || null;
    if (data.rejectedByEmail !== undefined) updateData.rejectedByEmail = data.rejectedByEmail || null;
    if (data.rejectedByName !== undefined) updateData.rejectedByName = data.rejectedByName || null;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason || null;

    return this.prisma.application.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.application.delete({
      where: { id },
    });
  }

  /**
   * Check if application belongs to landlord
   */
  async belongsToLandlord(applicationId: string, landlordId: string): Promise<boolean> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });
    return application?.unit?.property?.landlordId === landlordId;
  }
}

