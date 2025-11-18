/**
 * Document Domain Re-export
 * Re-exports from domains/document/domain
 */

export * from '@/domains/document/domain';
export { DocumentService } from '@/domains/document/domain/DocumentService';
export { DocumentRepository } from '@/domains/document/domain/DocumentRepository';

// Re-export service instance
import { DocumentService } from '@/domains/document/domain/DocumentService';
import { DocumentRepository } from '@/domains/document/domain/DocumentRepository';
import { prisma } from '@/lib/prisma';

const documentRepository = new DocumentRepository(prisma);
export const documentService = new DocumentService(documentRepository);

