import React from 'react';
import { Badge } from 'flowbite-react';
import { HiCheckCircle, HiXCircle, HiDownload } from 'react-icons/hi';
import { formatDate } from './date-formatters';
import { getCategoryById } from '../constants/document-categories';

/**
 * Document Metadata Builder
 * 
 * Builds standardized metadata array for PDFViewerModal
 * Eliminates 150+ lines of duplicated code between landlord and tenant vaults
 * 
 * Usage:
 * ```tsx
 * import { buildDocumentMetadata } from '@/lib/utils/document-metadata-builder';
 * 
 * <PDFViewerModal
 *   open={isOpen}
 *   document={doc}
 *   metadata={buildDocumentMetadata(doc)}
 *   onClose={handleClose}
 * />
 * ```
 */

export interface DocumentMetadataOptions {
  /**
   * Show download button in metadata
   */
  showDownload?: boolean;
  
  /**
   * Custom download handler
   */
  onDownload?: () => void;
  
  /**
   * Include approval/rejection details
   */
  includeApprovalDetails?: boolean;
}

/**
 * Builds metadata array for document viewer
 */
export function buildDocumentMetadata(
  document: any, 
  options: DocumentMetadataOptions = {}
) {
  if (!document) return [];

  const {
    showDownload = true,
    onDownload,
    includeApprovalDetails = false,
  } = options;

  const metadata: any[] = [];

  // Row 1: Category + Uploaded By
  metadata.push(
    {
      label: 'Category',
      value: getCategoryById(document.category)?.name || document.category,
      span: 1,
    },
    {
      label: 'Uploaded By',
      value: (
        <div className="flex items-center gap-2">
          <span>{document.uploadedByName}</span>
          <Badge color={document.uploadedBy === 'landlord' ? 'blue' : 'green'}>
            {document.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
          </Badge>
        </div>
      ),
      span: 1,
    }
  );

  // Row 2: Uploaded Date + Total Files
  metadata.push(
    {
      label: 'Uploaded',
      value: formatDate.datetime(document.uploadedAt),
      span: 1,
    },
    {
      label: 'Total Files',
      value: (() => {
        if (document.metadata) {
          try {
            const meta = JSON.parse(document.metadata);
            return meta.fileCount || meta.files?.length || 1;
          } catch (e) {
            return 1;
          }
        }
        return 1;
      })(),
      span: 1,
    }
  );

  // Row 3: Approval Status (if applicable)
  if (includeApprovalDetails || document.isVerified || document.isRejected) {
    metadata.push({
      label: 'Status',
      value: (() => {
        if (document.isVerified) {
          return (
            <div className="flex items-center gap-2">
              <HiCheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-600">Verified</span>
            </div>
          );
        }
        if (document.isRejected) {
          return (
            <div className="flex items-center gap-2">
              <HiXCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-600">Rejected</span>
            </div>
          );
        }
        return <Badge color="gray">Pending</Badge>;
      })(),
      span: 2,
    });
  }

  // Row 4: Download button (if enabled)
  if (showDownload && onDownload) {
    metadata.push({
      label: 'Actions',
      value: (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <HiDownload className="h-4 w-4" />
          Download
        </button>
      ),
      span: 2,
    });
  }

  return metadata;
}
