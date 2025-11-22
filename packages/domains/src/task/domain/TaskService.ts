/**
 * Task Service
 * 
 * Domain logic for Task domain
 */

import { TaskRepository } from './TaskRepository';
import { TaskCreate, TaskUpdate, TaskQuery } from '@/lib/schemas';

export class TaskService {
  constructor(private repository: TaskRepository) {}

  async create(data: TaskCreate, context: { userId: string }) {
    // Infer propertyId from linkedEntity if not provided
    let finalPropertyId = data.propertyId;
    if (!finalPropertyId && data.linkedEntityType && data.linkedEntityId) {
      const { inferPropertyFromLinkedEntity } = require('@/lib/utils/property-inference');
      finalPropertyId = await inferPropertyFromLinkedEntity(data.linkedEntityType, data.linkedEntityId);
    }

    // Create task
    const task = await this.repository.create({
      ...data,
      propertyId: finalPropertyId,
      userId: context.userId,
    });

    return task;
  }

  async update(id: string, data: TaskUpdate) {
    // Parse dates if provided
    if (data.dueDate) {
      const { createDateAtLocalMidnight } = require('@/lib/utils/unified-date-formatter');
      const parsed = createDateAtLocalMidnight(data.dueDate);
      data.dueDate = parsed.toISOString().split('T')[0] as any;
    }

    if (data.completedAt) {
      const { createDateAtLocalMidnight } = require('@/lib/utils/unified-date-formatter');
      const parsed = createDateAtLocalMidnight(data.completedAt);
      data.completedAt = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  async list(query: TaskQuery & { where?: any }, include?: { property?: boolean }) {
    return this.repository.findMany(query, include);
  }

  async getById(id: string, include?: { property?: boolean }) {
    return this.repository.findById(id, include);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}

