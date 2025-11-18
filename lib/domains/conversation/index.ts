/**
 * Conversation Domain Re-export
 * Re-exports from domains/conversation/domain
 */

export * from '@/domains/conversation/domain';
export { ConversationService } from '@/domains/conversation/domain/ConversationService';
export { ConversationRepository } from '@/domains/conversation/domain/ConversationRepository';

// Re-export service instance
import { ConversationService } from '@/domains/conversation/domain/ConversationService';
import { ConversationRepository } from '@/domains/conversation/domain/ConversationRepository';
import { prisma } from '@/lib/prisma';

const conversationRepository = new ConversationRepository(prisma);
export const conversationService = new ConversationService(conversationRepository);

