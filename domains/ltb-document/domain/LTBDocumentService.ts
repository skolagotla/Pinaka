/**
 * LTB Document Service
 * 
 * Domain logic for LTB Document domain
 * Since LTB documents are static data, this service provides read-only access
 */

import { LTBDocumentQuery, LTBDocumentResponse } from '@/lib/schemas';
import { 
  LTB_DOCUMENTS, 
  getLTBDocumentsByLocation, 
  getLTBDocumentsByAudience,
  searchLTBDocuments 
} from '@/lib/constants/ltb-documents';

export class LTBDocumentService {
  /**
   * List LTB documents with filtering and pagination
   */
  async list(query: LTBDocumentQuery): Promise<{
    documents: LTBDocumentResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    let documents = [...LTB_DOCUMENTS];

    // Filter by location
    if (query.country && query.province) {
      documents = getLTBDocumentsByLocation(query.country, query.province);
    }

    // Filter by audience
    if (query.audience) {
      documents = getLTBDocumentsByAudience(query.audience);
    }

    // Filter by category
    if (query.category) {
      documents = documents.filter(doc => doc.category === query.category);
    }

    // Search
    if (query.search) {
      documents = searchLTBDocuments(query.search).filter(doc =>
        documents.some(d => d.id === doc.id)
      );
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    const total = documents.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocuments = documents.slice(startIndex, endIndex);

    return {
      documents: paginatedDocuments as LTBDocumentResponse[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get a single LTB document by form number
   */
  async getByFormNumber(formNumber: string): Promise<LTBDocumentResponse | null> {
    const document = LTB_DOCUMENTS.find(
      doc => doc.formNumber.toLowerCase() === formNumber.toLowerCase()
    );
    return document as LTBDocumentResponse | null;
  }
}

