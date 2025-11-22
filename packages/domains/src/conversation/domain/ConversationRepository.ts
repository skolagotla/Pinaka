/**
 * Conversation Repository
 * 
 * Data access layer for Conversation domain
 */

import { PrismaClient } from '@prisma/client';
import { ConversationCreate, ConversationQuery, MessageCreate } from '@/lib/schemas';
import { generateCUID } from '@/lib/utils/id-generator';

export class ConversationRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, include?: { messages?: boolean; property?: boolean; landlord?: boolean; tenant?: boolean; pmc?: boolean }) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        property: include?.property ? {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
            city: true,
          },
        } : false,
        landlord: include?.landlord ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        } : false,
        tenant: include?.tenant ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        } : false,
        pmc: include?.pmc ? {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        } : false,
        messages: include?.messages ? {
          orderBy: { createdAt: 'asc' },
          // include: { attachments: true }, // TODO: Fix attachments include
        } : false,
      },
    });
  }

  async findMany(query: ConversationQuery & { where?: any }, include?: { property?: boolean; landlord?: boolean; tenant?: boolean; pmc?: boolean }) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.status && { status: filters.status }),
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.conversationType && { conversationType: filters.conversationType }),
    };

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        select: {
          id: true,
          subject: true,
          conversationType: true,
          status: true,
          propertyId: true,
          landlordId: true,
          tenantId: true,
          pmcId: true,
          lastMessageAt: true,
          createdAt: true,
          updatedAt: true,
          property: include?.property ? {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
              city: true,
            },
          } : false,
          landlord: include?.landlord ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          } : false,
          tenant: include?.tenant ? {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          } : false,
          pmc: include?.pmc ? {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          } : false,
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: ConversationCreate & { id?: string }, context: { userId: string; userRole: string }) {
    const conversationId = data.id || generateCUID();

    // Determine sender IDs based on role
    let landlordId = data.landlordId || null;
    let tenantId = data.tenantId || null;
    let pmcId = data.pmcId || null;

    if (context.userRole === 'landlord') {
      landlordId = context.userId;
    } else if (context.userRole === 'tenant') {
      tenantId = context.userId;
    } else if (context.userRole === 'pmc') {
      pmcId = context.userId;
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        id: conversationId,
        subject: data.subject,
        conversationType: data.conversationType,
        propertyId: data.propertyId || null,
        landlordId: landlordId || null,
        tenantId: tenantId || null,
        pmcId: pmcId || null,
        status: 'ACTIVE',
      } as any, // Type assertion to handle Prisma type mismatch
    });

    // Create initial message if provided
    if (data.initialMessage) {
      await this.createMessage(conversationId, {
        conversationId: conversationId,
        messageText: data.initialMessage,
        attachments: [],
      }, context);
    }

    return conversation;
  }

  async createMessage(conversationId: string, data: MessageCreate, context: { userId: string; userRole: string }) {
    const messageId = generateCUID();

    // Determine sender IDs based on role
    let senderLandlordId: string | undefined = undefined;
    let senderTenantId: string | undefined = undefined;
    let senderPMCId: string | undefined = undefined;

    if (context.userRole === 'landlord') {
      senderLandlordId = context.userId;
    } else if (context.userRole === 'tenant') {
      senderTenantId = context.userId;
    } else if (context.userRole === 'pmc') {
      senderPMCId = context.userId;
    }

    const message = await this.prisma.message.create({
      data: {
        id: messageId,
        conversationId,
        senderId: context.userId,
        senderLandlordId,
        senderTenantId,
        senderPMCId,
        senderRole: context.userRole,
        messageText: data.messageText,
        attachments: data.attachments && data.attachments.length > 0 ? JSON.stringify(data.attachments) : undefined,
      },
    });

    // Create message attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      await Promise.all(
        data.attachments.map(attachment =>
          this.prisma.messageAttachment.create({
            data: {
              id: generateCUID(),
              messageId: messageId,
              fileName: attachment.fileName,
              originalName: attachment.originalName,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
              storagePath: attachment.storagePath,
              mimeType: attachment.mimeType || null,
            },
          })
        )
      );
    }

    // Update conversation's lastMessageAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async update(id: string, data: { status?: 'ACTIVE' | 'CLOSED' | 'ARCHIVED' }) {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.conversation.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }
}

