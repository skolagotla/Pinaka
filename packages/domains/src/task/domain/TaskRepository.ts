/**
 * Task Repository
 * 
 * Data access layer for Task domain
 */

import { PrismaClient } from '@prisma/client';
import { TaskCreate, TaskUpdate, TaskQuery } from '@/lib/schemas';
import { generateCUID } from '@/lib/utils/id-generator';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';

export class TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string, include?: { property?: boolean }) {
    return this.prisma.task.findUnique({
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

  async findMany(query: TaskQuery & { where?: any }, include?: { property?: boolean }) {
    const { page, limit, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    let where: any = {
      ...filters.where,
      ...(filters.propertyId && { propertyId: filters.propertyId }),
      ...(filters.category && { category: filters.category }),
      ...(filters.type && { type: filters.type }),
      ...(filters.isCompleted !== undefined && { isCompleted: filters.isCompleted }),
      ...(filters.priority && { priority: filters.priority }),
    };

    // Date range filters
    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = createDateAtLocalMidnight(startDate);
      if (endDate) where.dueDate.lte = createDateAtLocalMidnight(endDate);
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isCompleted: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' },
        ],
        include: {
          property: include?.property ? {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
            },
          } : false,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: TaskCreate & { id?: string; userId?: string }) {
    const dueDate = createDateAtLocalMidnight(data.dueDate);

    return this.prisma.task.create({
      data: {
        ...data,
        id: data.id || generateCUID(),
        userId: data.userId!,
        propertyId: data.propertyId || null,
        title: data.title,
        description: data.description || null,
        type: data.type || 'todo',
        category: data.category,
        dueDate: dueDate,
        priority: data.priority || 'medium',
        linkedEntityType: data.linkedEntityType || null,
        linkedEntityId: data.linkedEntityId || null,
        reminderDays: data.reminderDays || null,
      } as any,
    });
  }

  async update(id: string, data: TaskUpdate) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.dueDate !== undefined) {
      updateData.dueDate = createDateAtLocalMidnight(data.dueDate);
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isCompleted !== undefined) {
      updateData.isCompleted = data.isCompleted;
      if (data.isCompleted) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? createDateAtLocalMidnight(data.completedAt) : null;
    }
    if (data.linkedEntityType !== undefined) updateData.linkedEntityType = data.linkedEntityType || null;
    if (data.linkedEntityId !== undefined) updateData.linkedEntityId = data.linkedEntityId || null;
    if (data.reminderDays !== undefined) updateData.reminderDays = data.reminderDays || null;

    return this.prisma.task.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}

