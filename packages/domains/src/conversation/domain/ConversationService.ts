/**
 * Conversation Service
 * 
 * Domain logic for Conversation domain
 */

import { ConversationRepository } from './ConversationRepository';
import { ConversationCreate, ConversationQuery, MessageCreate } from '@/lib/schemas';

export class ConversationService {
  constructor(private repository: ConversationRepository) {}

  async create(data: ConversationCreate, context: { userId: string; userRole: string }) {
    return this.repository.create(data, context);
  }

  async createMessage(conversationId: string, data: MessageCreate, context: { userId: string; userRole: string }) {
    return this.repository.createMessage(conversationId, data, context);
  }

  async list(query: ConversationQuery & { where?: any }, include?: { property?: boolean; landlord?: boolean; tenant?: boolean; pmc?: boolean }) {
    return this.repository.findMany(query, include);
  }

  async getById(id: string, include?: { messages?: boolean; property?: boolean; landlord?: boolean; tenant?: boolean; pmc?: boolean }) {
    return this.repository.findById(id, include);
  }

  async update(id: string, data: { status?: 'ACTIVE' | 'CLOSED' | 'ARCHIVED' }) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}

