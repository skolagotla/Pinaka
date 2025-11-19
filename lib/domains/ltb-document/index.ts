/**
 * LTB Document Domain - Central Export
 * 
 * Provides singleton instance of LTBDocumentService
 */

import { LTBDocumentService } from '@/domains/ltb-document/domain';

// Singleton instance
export const ltbDocumentService = new LTBDocumentService();

// Re-export types and classes
export { LTBDocumentService } from '@/domains/ltb-document/domain';

