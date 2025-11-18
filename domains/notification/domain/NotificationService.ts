/**
 * Notification Service
 * 
 * Domain logic for Notification domain
 */

import { NotificationRepository } from './NotificationRepository';
import { NotificationCreate, NotificationUpdate, NotificationQuery } from '@/lib/schemas';

export class NotificationService {
  constructor(private repository: NotificationRepository) {}

  async create(data: NotificationCreate) {
    return this.repository.create(data);
  }

  async update(id: string, data: NotificationUpdate) {
    return this.repository.update(id, data);
  }

  async list(query: NotificationQuery & { where?: any }) {
    return this.repository.findMany(query);
  }

  async getById(id: string) {
    return this.repository.findById(id);
  }

  async markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}

