/**
 * Document Repository
 * 
 * Data access layer for Document domain
 */

import { PrismaClient } from '@prisma/client';
import { DocumentCreate, DocumentUpdate, DocumentQuery } from '@/lib/schemas';

export class DocumentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find document by ID
   */
  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  /**
   * Find documents with filters and pagination
   */
  async findMany(query: DocumentQuery & { where?: any }) {
    const { page, limit, expirationDateFrom, expirationDateTo, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.tenantId && { tenantId: filters.tenantId }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.subcategory && { subcategory: filters.subcategory }),
      ...(filters.isRequired !== undefined && { isRequired: filters.isRequired }),
      ...(filters.isVerified !== undefined && { isVerified: filters.isVerified }),
      ...(filters.isDeleted !== undefined && { isDeleted: filters.isDeleted }),
    };

    // Date range filters
    if (expirationDateFrom || expirationDateTo) {
      where.expirationDate = {};
      if (expirationDateFrom) where.expirationDate.gte = new Date(expirationDateFrom);
      if (expirationDateTo) where.expirationDate.lte = new Date(expirationDateTo);
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isRequired: 'desc' },
          { uploadedAt: 'desc' },
        ],
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new document
   */
  async create(data: DocumentCreate & { id?: string; uploadedBy?: string; uploadedByEmail?: string; uploadedByName?: string }) {
    return this.prisma.document.create({
      data: {
        id: data.id || '',
        tenantId: data.tenantId || '',
        propertyId: data.propertyId || null,
        fileName: data.fileName || '',
        originalName: data.originalName || '',
        fileType: data.fileType || '',
        fileSize: data.fileSize || 0,
        category: data.category || 'general',
        subcategory: data.subcategory || null,
        description: data.description || '',
        storagePath: data.storagePath || '',
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        isRequired: data.isRequired || false,
        visibility: data.visibility || 'shared',
        tags: data.tags || [],
        uploadedBy: data.uploadedBy || '',
        uploadedByEmail: data.uploadedByEmail || '',
        uploadedByName: data.uploadedByName || '',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update a document
   */
  async update(id: string, data: DocumentUpdate) {
    const updateData: any = {};

    if (data.category !== undefined) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory || null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.expirationDate !== undefined) {
      updateData.expirationDate = data.expirationDate ? new Date(data.expirationDate) : null;
    }
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.verificationComment !== undefined) updateData.verificationComment = data.verificationComment || null;
    if (data.isRejected !== undefined) updateData.isRejected = data.isRejected;
    if (data.rejectionReason !== undefined) updateData.rejectionReason = data.rejectionReason || null;

    return this.prisma.document.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Soft delete a document
   */
  async softDelete(id: string, deletedBy: string, deletedByEmail: string, deletedByName: string, deletionReason?: string) {
    return this.prisma.document.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        deletedByEmail,
        deletedByName,
        deletionReason: deletionReason || null,
      },
    });
  }

  /**
   * Hard delete a document
   */
  async delete(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }

  /**
   * Count documents matching criteria
   */
  async count(where: any) {
    return this.prisma.document.count({ where });
  }

  /**
   * Get messages for a document
   */
  async getMessages(documentId: string) {
    return this.prisma.documentMessage.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add message to a document
   */
  async addMessage(documentId: string, messageData: {
    message: string;
    senderEmail: string;
    senderName: string;
    senderRole: string;
  }) {
    return this.prisma.documentMessage.create({
      data: {
        documentId,
        message: messageData.message,
        senderEmail: messageData.senderEmail,
        senderName: messageData.senderName,
        senderRole: messageData.senderRole,
      },
    });
  }

  /**
   * Check if document belongs to landlord's property
   */
  async belongsToLandlord(documentId: string, landlordId: string): Promise<boolean> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        property: {
          select: { landlordId: true },
        },
      },
    });
    return document?.property?.landlordId === landlordId;
  }
}

