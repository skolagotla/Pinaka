/**
 * Notification Repository
 * 
 * Data access layer for Notification domain
 */

import { PrismaClient } from '@prisma/client';
import { NotificationCreate, NotificationUpdate, NotificationQuery } from '@/lib/schemas';
import { generateCUID } from '@/lib/utils/id-generator';

export class NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findMany(query: NotificationQuery & { where?: any }) {
    const { page, limit, unreadOnly, archived, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.type && { type: filters.type }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.entityType && { entityType: filters.entityType }),
    };

    // Filter by read status
    if (unreadOnly) {
      where.isRead = false;
    }

    // Filter by archived status
    if (archived) {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          ...where,
          isRead: false,
          isArchived: false,
        },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      totalCount: total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: NotificationCreate & { id?: string }) {
    return this.prisma.notification.create({
      data: {
        id: data.id || generateCUID(),
        userId: data.userId,
        userRole: data.userRole,
        userEmail: data.userEmail,
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal',
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        verificationId: data.verificationId || null,
        actionUrl: data.actionUrl || null,
        actionLabel: data.actionLabel || null,
        metadata: (data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null) as any,
      },
    });
  }

  async update(id: string, data: NotificationUpdate) {
    const updateData: any = {};

    if (data.isRead !== undefined) {
      updateData.isRead = data.isRead;
      if (data.isRead) {
        updateData.readAt = new Date();
      } else {
        updateData.readAt = null;
      }
    }

    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
      if (data.isArchived) {
        updateData.archivedAt = new Date();
      } else {
        updateData.archivedAt = null;
      }
    }

    return this.prisma.notification.update({
      where: { id },
      data: updateData,
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        isArchived: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}

