/**
 * Document Service
 * 
 * Domain logic for Document domain
 */

import { DocumentRepository } from './DocumentRepository';
import { DocumentCreate, DocumentUpdate, DocumentQuery } from '@/lib/schemas';
import { createDateAtLocalMidnight } from '@/lib/utils/unified-date-formatter';
import { generateDocumentHash } from '@/lib/hooks/useHashGenerator';

export class DocumentService {
  constructor(private repository: DocumentRepository) {}

  /**
   * Create a new document with business logic
   */
  async create(data: DocumentCreate, context: { userId: string; userEmail: string; userName: string }) {
    // Generate document hash
    const documentHash = generateDocumentHash({
      tenantId: data.tenantId,
      fileName: data.fileName || data.originalName || '',
      category: data.category || 'general',
    });

    // Parse expiration date if provided
    const expirationDate = data.expirationDate 
      ? createDateAtLocalMidnight(data.expirationDate)
      : null;

    // Create document
    const document = await this.repository.create({
      ...data,
      expirationDate: expirationDate ? expirationDate.toISOString().split('T')[0] : undefined,
      uploadedBy: context.userId,
      uploadedByEmail: context.userEmail,
      uploadedByName: context.userName,
    });

    // Update with hash after creation (if needed)
    if (documentHash && !document.documentHash) {
      // Note: This would require an update call, but for now we'll include it in create
      // The repository should handle this
    }

    return document;
  }

  /**
   * Update a document with business logic
   */
  async update(id: string, data: DocumentUpdate) {
    // Parse expiration date if provided
    if (data.expirationDate) {
      const parsed = createDateAtLocalMidnight(data.expirationDate);
      data.expirationDate = parsed.toISOString().split('T')[0] as any;
    }

    return this.repository.update(id, data);
  }

  /**
   * Get documents with pagination
   */
  async list(query: DocumentQuery & { where?: any }) {
    return this.repository.findMany(query);
  }

  /**
   * Get document by ID
   */
  async getById(id: string) {
    return this.repository.findById(id);
  }

  /**
   * Soft delete a document
   */
  async softDelete(id: string, deletedBy: string, deletedByEmail: string, deletedByName: string, deletionReason?: string) {
    return this.repository.softDelete(id, deletedBy, deletedByEmail, deletedByName, deletionReason);
  }

  /**
   * Hard delete a document
   */
  async delete(id: string) {
    return this.repository.delete(id);
  }

  /**
   * Get messages for a document
   */
  async getMessages(documentId: string) {
    return this.repository.getMessages(documentId);
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
    return this.repository.addMessage(documentId, messageData);
  }

  /**
   * Check if document belongs to landlord's property
   */
  async belongsToLandlord(documentId: string, landlordId: string): Promise<boolean> {
    return this.repository.belongsToLandlord(documentId, landlordId);
  }
}

