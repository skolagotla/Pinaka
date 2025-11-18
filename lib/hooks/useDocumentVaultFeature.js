"use client";

/**
 * useDocumentVaultFeature - Composite Hook
 * 
 * Complete document vault feature combining:
 * - useDocumentVault (data + actions)
 * - useDateUtils (date formatting)
 * - useResizableTable (table configuration)
 * - Document metrics/counts
 * - Column definitions
 * 
 * Benefits:
 * - Single import for complete feature
 * - Pre-calculated metrics
 * - Consistent table configuration
 * - Reusable across landlord/tenant
 * 
 * @param {Object} config - Configuration
 * @param {string} config.userRole - 'landlord' or 'tenant'
 * @param {string} config.selectedTenantId - Tenant ID (landlord only)
 * @param {Array} config.initialDocuments - Initial documents
 * @returns {Object} Complete document vault feature
 * 
 * @example
 * // Landlord
 * const vault = useDocumentVaultFeature({ 
 *   userRole: 'landlord', 
 *   selectedTenantId: '123'
 * });
 * 
 * // Tenant
 * const vault = useDocumentVaultFeature({ 
 *   userRole: 'tenant' 
 * });
 */

import { useMemo, useCallback } from 'react';
import { Button, Space, Tag, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  CheckOutlined, 
  CloseOutlined,
  DeleteOutlined,
  SwapOutlined 
} from '@ant-design/icons';

import { useDocumentVault } from './useDocumentVault';
import { useDocumentModals } from './useDocumentModals';
import { useDateUtils } from './useDateUtils';
import { useResizableTable, withSorter } from './useResizableTable';

export function useDocumentVaultFeature({
  userRole,
  selectedTenantId = null,
  selectedPropertyId = null, // Property-centric: Property ID for document linking
  initialDocuments = []
}) {
  // Compose base hooks
  const vault = useDocumentVault({
    userRole,
    selectedTenantId,
    selectedPropertyId, // Property-centric: Pass propertyId to vault
    initialDocuments
  });

  const modals = useDocumentModals();
  const { formatDateDisplay, formatDateTimeDisplay } = useDateUtils();

  // Calculate document metrics
  const metrics = useMemo(() => {
    const docs = vault.documents || [];
    
    return {
      total: docs.length,
      verified: docs.filter(d => d.verified).length,
      pending: docs.filter(d => !d.verified && !d.isDeleted).length,
      rejected: docs.filter(d => d.rejectionReason).length,
      expired: docs.filter(d => {
        if (!d.expirationDate) return false;
        return new Date(d.expirationDate) < new Date();
      }).length,
    };
  }, [vault.documents]);

  // Get friendly category name
  const getCategoryName = useCallback((category) => {
    const categoryMap = {
      'GOVERNMENT_ID': 'Government ID',
      'PASSPORT': 'Passport',
      'DRIVERS_LICENSE': 'Driver\'s License',
      'CREDIT_REPORT': 'Credit Report',
      'TAX_RETURNS': 'Tax Returns',
      'PAY_STUBS': 'Pay Stubs',
      'BANK_STATEMENTS': 'Bank Statements',
      'EMPLOYMENT_LETTER': 'Employment Letter',
      'REFERENCE_LETTER': 'Reference Letter',
      'LEASE_AGREEMENT': 'Lease Agreement',
      'PROOF_OF_INSURANCE': 'Proof of Insurance',
      'PET_DOCUMENTS': 'Pet Documents',
      'PROPERTY_PHOTOS': 'Property Photos',
      'OTHER': 'Other Documents',
    };
    return categoryMap[category] || category;
  }, []);

  // Get status tag
  const getStatusTag = useCallback((doc) => {
    if (doc.isDeleted) {
      return <Tag color="default">Deleted</Tag>;
    }
    if (doc.rejectionReason) {
      return <Tag color="red">Rejected</Tag>;
    }
    if (doc.verified) {
      return <Tag color="green">Verified</Tag>;
    }
    return <Tag color="orange">Pending</Tag>;
  }, []);

  // Get uploaded by label with role
  const getUploadedByLabel = useCallback((doc) => {
    const name = doc.uploadedBy?.name || 'Unknown';
    const role = doc.uploadedBy?.role || '';
    
    if (role === 'LANDLORD') {
      return `${name} (Landlord)`;
    } else if (role === 'TENANT') {
      return `${name} (Tenant)`;
    }
    return name;
  }, []);

  // Define table columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Document ID',
        dataIndex: 'documentHash',
        key: 'documentHash',
        width: 150,
        fixed: 'left',
        ...withSorter('documentHash'),
      },
      {
        title: 'Type',
        dataIndex: 'category',
        key: 'category',
        width: 180,
        render: (category) => getCategoryName(category),
        ...withSorter('category'),
      },
      {
        title: 'Uploaded By',
        key: 'uploadedBy',
        width: 180,
        render: (_, record) => getUploadedByLabel(record),
        sorter: (a, b) => {
          const nameA = a.uploadedBy?.name || '';
          const nameB = b.uploadedBy?.name || '';
          return nameA.localeCompare(nameB);
        },
      },
      {
        title: 'Uploaded',
        dataIndex: 'uploadedAt',
        key: 'uploadedAt',
        width: 180,
        render: (date) => formatDateTimeDisplay(date),
        ...withSorter('uploadedAt'),
        defaultSortOrder: 'descend',
      },
      {
        title: 'Total Files',
        key: 'totalFiles',
        width: 100,
        align: 'center',
        render: (_, record) => {
          const fileCount = record.metadata?.files?.length || 1;
          return fileCount;
        },
        sorter: (a, b) => {
          const filesA = a.metadata?.files?.length || 1;
          const filesB = b.metadata?.files?.length || 1;
          return filesA - filesB;
        },
      },
      {
        title: 'Status',
        key: 'status',
        width: 120,
        align: 'center',
        render: (_, record) => getStatusTag(record),
        sorter: (a, b) => {
          const getStatus = (doc) => {
            if (doc.isDeleted) return 0;
            if (doc.rejectionReason) return 1;
            if (doc.verified) return 2;
            return 3;
          };
          return getStatus(a) - getStatus(b);
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 200,
        fixed: 'right',
        align: 'center',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => vault.handleView(record)}
              />
            </Tooltip>
            
            {!record.isDeleted && (
              <>
                {userRole === 'landlord' && !record.verified && !record.rejectionReason && (
                  <>
                    <Tooltip title="Approve">
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        size="small"
                        style={{ color: '#52c41a' }}
                        onClick={() => vault.handleVerify(record.id)}
                      />
                    </Tooltip>
                    <Tooltip title="Reject">
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        size="small"
                        danger
                        onClick={() => vault.handleReject(record.id, 'Please review and reupload')}
                      />
                    </Tooltip>
                  </>
                )}
                
                <Tooltip title="Download">
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() => vault.handleDownload(record)}
                  />
                </Tooltip>
                
                <Tooltip title="Replace">
                  <Button
                    type="text"
                    icon={<SwapOutlined />}
                    size="small"
                    onClick={() => {
                      // This will be handled by the page component
                      // through a custom handler
                    }}
                  />
                </Tooltip>
                
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => modals.openDeleteModal(record)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        ),
      },
    ];

    return baseColumns;
  }, [userRole, vault, modals, getCategoryName, getStatusTag, getUploadedByLabel, formatDateTimeDisplay]);

  // Configure resizable table
  const { tableProps } = useResizableTable(columns, {
    storageKey: `document-vault-${userRole}`,
    defaultSort: { field: 'uploadedAt', order: 'descend' },
  });

  // Delete handler with modal support
  const handleDeleteWithModal = useCallback(async () => {
    if (!modals.deleteModal.document) return false;
    
    modals.setDeleteLoading(true);
    const success = await vault.handleDelete(
      modals.deleteModal.document.id,
      modals.deleteModal.reason
    );
    
    if (success) {
      modals.closeDeleteModal();
    } else {
      modals.setDeleteLoading(false);
    }
    
    return success;
  }, [vault, modals]);

  return {
    // Original vault data and state
    documents: vault.documents,
    documentStatus: vault.documentStatus,
    viewingDocument: vault.viewingDocument,
    loading: vault.loading,
    uploading: vault.uploading,
    uploadModalOpen: vault.uploadModalOpen,
    viewModalOpen: vault.viewModalOpen,
    uploadProgress: vault.uploadProgress,
    
    // Upload form state
    selectedFile: vault.selectedFile,
    documentName: vault.documentName,
    category: vault.category,
    subcategory: vault.subcategory,
    description: vault.description,
    expirationDate: vault.expirationDate,
    tags: vault.tags,
    
    // Upload form setters
    setSelectedFile: vault.setSelectedFile,
    setDocumentName: vault.setDocumentName,
    setCategory: vault.setCategory,
    setSubcategory: vault.setSubcategory,
    setDescription: vault.setDescription,
    setExpirationDate: vault.setExpirationDate,
    setTags: vault.setTags,
    
    // Metrics (pre-calculated)
    metrics,
    
    // Table configuration
    columns,
    tableProps,
    
    // Actions from vault
    handleUpload: vault.handleUpload,
    handleDelete: vault.handleDelete,
    handleVerify: vault.handleVerify,
    handleReject: vault.handleReject,
    handleReplace: vault.handleReplace,
    handleView: vault.handleView,
    handleDownload: vault.handleDownload,
    openUploadModal: vault.openUploadModal,
    closeUploadModal: vault.closeUploadModal,
    closeViewModal: vault.closeViewModal,
    refresh: vault.refresh,
    
    // Delete modal state and actions
    deleteModal: modals.deleteModal,
    openDeleteModal: modals.openDeleteModal,
    closeDeleteModal: modals.closeDeleteModal,
    updateDeleteReason: modals.updateDeleteReason,
    handleDeleteWithModal,
    
    // Helpers
    getExpirationStatus: vault.getExpirationStatus,
    formatFileSize: vault.formatFileSize,
    getFileIcon: vault.getFileIcon,
    getCategoryName,
    getStatusTag,
    getUploadedByLabel,
  };
}

export default useDocumentVaultFeature;

