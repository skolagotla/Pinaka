import React from 'react';
import { Space, Tag, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined } from '@ant-design/icons';
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
 *   visible={isOpen}
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
        <Space>
          <span>{document.uploadedByName}</span>
          <Tag color={document.uploadedBy === 'landlord' ? 'blue' : 'green'}>
            {document.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
          </Tag>
        </Space>
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

  // Row 3: Approved By (if verified) or placeholder + Download
  if (document.isVerified) {
    metadata.push({
      label: 'Approved By',
      value: (
        <Space>
          <span>{document.verifiedByName}</span>
          <Tag color={document.verifiedByRole === 'landlord' ? 'blue' : 'green'}>
            {document.verifiedByRole === 'landlord' ? 'Landlord' : 'Tenant'}
          </Tag>
        </Space>
      ),
      span: 1,
    });
  } else {
    metadata.push({
      label: '',
      value: '',
      span: 1,
    });
  }

  // Download button
  if (showDownload && onDownload) {
    metadata.push({
      label: 'Download',
      value: (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={onDownload}
          style={{ padding: 0 }}
        >
          Download
        </Button>
      ),
      span: 1,
    });
  } else {
    metadata.push({
      label: '',
      value: '',
      span: 1,
    });
  }

  // Row 4: Expiration (if exists) + Status
  if (document.expirationDate) {
    metadata.push({
      label: 'Expiration',
      value: formatDate.date(document.expirationDate),
      span: 1,
    });
  } else {
    metadata.push({
      label: '',
      value: '',
      span: 1,
    });
  }

  metadata.push({
    label: 'Status',
    value: document.isRejected ? (
      <Tag color="error" icon={<CloseCircleOutlined />}>Rejected</Tag>
    ) : document.isVerified ? (
      <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
    ) : (
      <Tag color="warning">Pending Verification</Tag>
    ),
    span: 1,
  });

  // Row 5: Description (full width if exists)
  if (document.description) {
    metadata.push({
      label: 'Description',
      value: document.description,
      span: 2,
    });
  }

  // Optional: Include approval/rejection details
  if (includeApprovalDetails) {
    if (document.verificationComment) {
      metadata.push({
        label: 'Approval Note',
        value: document.verificationComment,
        span: 2,
      });
    }

    if (document.isRejected && document.rejectionReason) {
      metadata.push({
        label: 'Rejection Reason',
        value: document.rejectionReason,
        span: 2,
      });
    }
  }

  return metadata;
}

/**
 * Build carousel documents array for multi-file documents
 * Handles both batch uploads (metadata.files) and version history (metadata.versions)
 */
export function buildDocumentCarousel(document: any) {
  if (!document) return [];

  const documents: any[] = [];

  // Parse metadata if exists
  let metadata: any = null;
  if (document.metadata) {
    try {
      metadata = JSON.parse(document.metadata);
    } catch (e) {
      console.error('[buildDocumentCarousel] Failed to parse metadata:', e);
    }
  }

  // Primary/current document
  documents.push({
    id: document.id,
    documentHash: document.documentHash,
    fileName: document.fileName,
    originalName: document.originalName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    storagePath: document.storagePath,
    category: document.category,
    description: document.description,
    uploadedBy: document.uploadedBy,
    uploadedByName: document.uploadedByName,
    uploadedAt: document.uploadedAt,
    expirationDate: document.expirationDate,
    isVerified: document.isVerified,
    verifiedByName: document.verifiedByName,
    verifiedByRole: document.verifiedByRole,
    verifiedAt: document.verifiedAt,
    verificationComment: document.verificationComment,
    isRejected: document.isRejected,
    rejectedByName: document.rejectedByName,
    rejectedByRole: document.rejectedByRole,
    rejectedAt: document.rejectedAt,
    rejectionReason: document.rejectionReason,
    versionLabel: metadata?.versions?.length > 0 ? 'Current Version' : undefined,
  });

  // Batch upload files (additional files in a batch)
  if (metadata?.files && Array.isArray(metadata.files)) {
    metadata.files.forEach((file: any, index: number) => {
      documents.push({
        ...document,
        fileName: file.fileName,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        storagePath: file.storagePath,
        fileIndex: index,
        versionLabel: undefined,
      });
    });
  }

  // Version history (previous versions of replaced documents)
  if (metadata?.versions && Array.isArray(metadata.versions)) {
    metadata.versions.forEach((version: any, index: number) => {
      documents.push({
        ...document,
        fileName: version.fileName,
        originalName: version.originalName,
        fileType: version.fileType,
        fileSize: version.fileSize,
        storagePath: version.storagePath,
        uploadedBy: version.uploadedBy,
        uploadedByName: version.uploadedByName,
        uploadedByEmail: version.uploadedByEmail,
        uploadedAt: version.uploadedAt,
        versionIndex: index,
        versionLabel: `Version ${metadata.versions.length - index}`,
        // Previous versions don't have verification status
        isVerified: false,
        isRejected: false,
      });
    });
  }

  return documents;
}

/**
 * Get document display name
 */
export function getDocumentDisplayName(document: any): string {
  if (!document) return 'Document';
  
  // Use document name if available
  if (document.documentName) {
    return document.documentName;
  }
  
  // Use original file name
  if (document.originalName) {
    return document.originalName;
  }
  
  // Use category as fallback
  const category = getCategoryById(document.category);
  return category?.name || 'Document';
}

/**
 * Get file count for a document
 */
export function getDocumentFileCount(document: any): number {
  if (!document) return 0;
  
  if (document.metadata) {
    try {
      const metadata = JSON.parse(document.metadata);
      return metadata.fileCount || metadata.files?.length || 1;
    } catch (e) {
      return 1;
    }
  }
  
  return 1;
}

