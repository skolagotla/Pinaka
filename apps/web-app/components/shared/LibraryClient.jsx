/**
 * Unified Library Client Component
 * 
 * Handles both landlord and tenant library views with role-based features
 * Consolidates ~2400 lines of duplicate code into a single component
 */

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  Button, Card, Badge, Select, Modal,
  Table, Tooltip, Progress, Alert, Datepicker, Divider,
  Avatar, FileInput, TextInput, Textarea, Label
} from 'flowbite-react';
import { Empty } from '@/components/shared';
import {
  HiPlus, HiEye, HiDownload, HiTrash, HiCloudUpload,
  HiDocumentText, HiPhotograph, HiDocument, HiInbox,
  HiCheckCircle, HiClock, HiExclamation, HiExclamationCircle,
  HiSave, HiX, HiShieldCheck, HiLockClosed,
  HiCalendar, HiUser, HiUserGroup, HiCheck,
  HiPencilAlt, HiRefresh,
} from 'react-icons/hi';
import FlowbitePopconfirm from './FlowbitePopconfirm';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';

dayjs.extend(utc);

// Reusable Components
import dynamic from 'next/dynamic';

// Dynamically import PDFViewerModal to avoid SSR issues with DOMMatrix
// Use the full-featured version that supports documents array
const PDFViewerModal = dynamic(() => import('@/components/PDFViewerModal'), {
  ssr: false,
  loading: () => null
});

// Custom Hooks
import { useDocumentVaultFeature, useDocumentUpload, useResizableTable, withSorter, sortFunctions, useSearch, useMutualApproval, configureTableColumns } from '@/lib/hooks';

// Utilities
import { getFileIcon, formatFileSize } from '@/lib/utils/document-vault-helpers';
import { buildDocumentMetadata, buildDocumentCarousel } from '@/lib/utils/document-metadata-builder';
import { formatDate } from '@/lib/utils/date-formatters';
import { parseDocumentMetadata, needsVersionApproval } from '@/lib/utils/document-metadata';
import { STANDARD_COLUMNS, COLUMN_NAMES, customizeColumn } from '@/lib/constants/standard-columns';

// Import document categories
const DOCUMENT_CATEGORIES = require('@/lib/constants/document-categories').default;
const { 
  CATEGORY_GROUPS,
  getPreLeaseRequiredDocuments,
  getPostLeaseRequiredDocuments,
  getCategoryById,
} = require('@/lib/constants/document-categories');

// Note: Legal forms and LTBDocumentsGrid are handled by parent components (admin/library or documents page)


/**
 * Unified Library Client Component
 * 
 * @param {Object} props
 * @param {'landlord'|'tenant'|'pmc'} props.userRole - User role
 * @param {Object} props.user - Landlord, tenant, or PMC object
 * @param {Array} props.tenants - Array of tenants (only for landlord/pmc)
 * @param {Array} props.initialDocuments - Initial documents (for tenant)
 * @param {Array} props.leaseDocuments - Lease documents (for tenant, optional)
 * @param {string} props.externalSearchTerm - External search term from parent component
 */
export default function LibraryClient({ 
  userRole, 
  user, 
  tenants = [], 
  initialDocuments = [],
  leaseDocuments = [],
  externalSearchTerm = ''
}) {
  const router = useRouter();
  
  // Mutual approval hook for version changes and deletions
  const mutualApproval = useMutualApproval({
    onSuccess: () => {
      library.closeViewModal();
      router.refresh();
    }
  });
  
  // Tenant selection (only for landlord)
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // State for drag and drop visual feedback (only for tenant)
  const [dragOverCategory, setDragOverCategory] = useState(null);
  
  // Property-centric: Get propertyId from selected tenant's active lease (for landlords)
  const selectedPropertyId = useMemo(() => {
    if (userRole === 'landlord' && selectedTenant?.lease?.property?.id) {
      return selectedTenant.lease.property.id;
    }
    return null;
  }, [userRole, selectedTenant]);

  // 🎯 Use Document Vault Feature Composite Hook
  const library = useDocumentVaultFeature({ 
    userRole, 
    selectedTenantId: userRole === 'landlord' ? selectedTenant?.id : undefined,
    selectedPropertyId, // Property-centric: Pass propertyId for document linking
    initialDocuments: userRole === 'tenant' ? initialDocuments : []
  });

  // 🎯 Use Document Upload Hook (for upload validation)
  const { uploadProps } = useDocumentUpload({
    category: library.category,
    selectedFile: library.selectedFile,
    setSelectedFile: library.setSelectedFile,
    getCategoryById,
  });

  // Get documents based on role
  const getAllDocuments = useMemo(() => {
    if (userRole === 'landlord') {
      if (!selectedTenant) {
        // Flatten all documents from all tenants and add tenant info
        return tenants.flatMap(tenant => 
          (tenant.documents || [])
            .filter(doc => !doc.isDeleted)
            .map(doc => ({
              ...doc,
              tenantName: `${tenant.firstName} ${tenant.lastName}`,
              tenantEmail: tenant.email,
              tenantId: tenant.id
            }))
        );
      }
      return library.documents;
    } else {
      // Tenant: always their own documents
      return library.documents;
    }
  }, [userRole, selectedTenant, tenants, library.documents]);

  // Calculate document status for checklist (only for tenant or when tenant selected for landlord)
  const documentStatus = useMemo(() => {
    if (userRole === 'tenant' || (userRole === 'landlord' && selectedTenant)) {
      const allRequiredDocs = [...getPreLeaseRequiredDocuments(), ...getPostLeaseRequiredDocuments()];
      
      const verifiedCount = allRequiredDocs.filter(doc => {
        const matchingDoc = library.documents?.find(d => d.category === doc.id);
        return matchingDoc?.isVerified;
      }).length;
      
      const pendingCount = allRequiredDocs.filter(doc => {
        const matchingDoc = library.documents?.find(d => d.category === doc.id);
        return matchingDoc && !matchingDoc.isVerified;
      }).length;
      
      const totalRequired = allRequiredDocs.length;
      const submittedRequired = verifiedCount + pendingCount;
      
      return {
        submittedRequired,
        verifiedCount,
        pendingCount,
        totalRequired,
        allRequiredDocumentsSubmitted: submittedRequired === totalRequired,
        allVerified: verifiedCount === totalRequired
      };
    }
    return null;
  }, [userRole, selectedTenant, library.documents]);

  // Override library.documentStatus if calculated
  if (documentStatus) {
    library.documentStatus = documentStatus;
  }

  // 🔍 Search functionality for documents
  const documentsSearch = useSearch(
    getAllDocuments,
    userRole === 'landlord' 
      ? ['fileName', 'category', 'status', 'tenantName', 'tenantEmail', 'uploadedBy']
      : ['fileName', 'category', 'status', 'uploadedBy'],
    { debounceMs: 150 } // Reduced debounce for more responsive search
  );

  // Use external search term if provided, otherwise use internal search
  // Update immediately when external search term changes (including empty string)
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      // Always update, even if empty string, to clear the search
      // Use setSearchTerm which handles debouncing internally
      documentsSearch.setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm, documentsSearch]);

  // Use documents search (no tabs, so no need for forms search)
  const search = documentsSearch;

  const displayDocuments = getAllDocuments;

  // Calculate stats based on role
  const stats = useMemo(() => {
    if (userRole === 'landlord' && !selectedTenant) {
      // Overall stats across all tenants
      let totalDocuments = 0;
      let verifiedDocuments = 0;
      let expiringDocuments = 0;
      let expiredDocuments = 0;

      tenants.forEach(tenant => {
        const docs = tenant.documents || [];
        totalDocuments += docs.length;
        
        docs.forEach(doc => {
          if (doc.isVerified) verifiedDocuments++;
          
          if (doc.expirationDate) {
            const expStatus = library.getExpirationStatus(doc.expirationDate);
            if (expStatus) {
              if (expStatus.status === 'expired') {
                expiredDocuments++;
              } else if (expStatus.status === 'warning' || expStatus.status === 'urgent') {
                expiringDocuments++;
              }
            }
          }
        });
      });

      // OPTIMIZED: Single pass through filteredData instead of multiple filters
      const filteredDocs = search.filteredData;
      let verifiedCount = 0;
      let expiringCount = 0;
      let expiredCount = 0;
      const now = dayjs();
      
      for (const doc of filteredDocs) {
        if (doc.isVerified) verifiedCount++;
        
        if (doc.expirationDate) {
          const daysUntilExpiry = dayjs(doc.expirationDate).diff(now, 'days');
          if (daysUntilExpiry < 0) {
            expiredCount++;
          } else if (daysUntilExpiry <= 30) {
            expiringCount++;
          }
        }
      }
      
      return {
        totalDocuments: filteredDocs.length,
        verifiedDocuments: verifiedCount,
        expiringDocuments: expiringCount,
        expiredDocuments: expiredCount,
      };
    } else {
      // Tenant or landlord with selected tenant - OPTIMIZED: Single pass
      const docs = library.documents;
      let verifiedCount = 0;
      let expiringCount = 0;
      let expiredCount = 0;
      
      for (const doc of docs) {
        if (doc.isVerified) verifiedCount++;
        
        if (doc.expirationDate) {
          const expStatus = library.getExpirationStatus(doc.expirationDate);
          if (expStatus) {
            if (expStatus.status === 'expired') {
              expiredCount++;
            } else if (expStatus.status === 'warning' || expStatus.status === 'urgent') {
              expiringCount++;
            }
          }
        }
      }
      
      return {
        totalDocuments: docs.length,
        verifiedDocuments: verifiedCount,
        expiringDocuments: expiringCount,
        expiredDocuments: expiredCount,
      };
    }
  }, [userRole, selectedTenant, tenants, library.documents, search.filteredData, library]);

  // Handle tenant selection (only for landlord)
  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
  };

  // Direct upload handler for drag-and-drop (only for tenant)
  const handleDirectUpload = async (file, categoryId) => {
    if (userRole !== 'tenant') return false;
    
    try {
      const loadingToast = notify.loading('Uploading document...');
      
      const existingDoc = library.documents?.find(doc => doc.category === categoryId);
      
      if (existingDoc) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("replaceExisting", "true");
        
        // Use v1 API for document replace
        const replaceResponse = await fetch(
          `/api/v1/documents/upload?replaceId=${existingDoc.id}`,
          {
            method: "POST",
            credentials: 'include',
            body: formData,
          }
        );
        
        if (!replaceResponse.ok) {
          const error = await replaceResponse.json().catch(() => ({}));
          throw new Error(error.error || error.message || 'Failed to replace document');
        }
        
        loadingToast();
        notify.success('Document replaced successfully. Version history saved.');
        router.refresh();
        return true;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", categoryId);
        formData.append("description", "");
        
        // Use v1 API for document upload
        const uploadResponse = await fetch(
          "/api/v1/documents/upload",
          {
            method: "POST",
            credentials: 'include',
            body: formData,
          }
        );
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json().catch(() => ({}));
          throw new Error(error.error || error.message || 'Failed to upload document');
        }
        
        loadingToast();
        notify.success('Document uploaded successfully');
        router.refresh();
        return true;
      }
    } catch (error) {
      console.error(`[${userRole === 'landlord' ? 'Landlord' : 'Tenant'} Library] Direct upload error:`, error);
      loadingToast();
      notify.error('Failed to upload document');
      return false;
    }
  };

  // Handle upload button click (landlord needs tenant selection)
  const handleUploadClick = () => {
    if (userRole === 'landlord' && !selectedTenant) {
      notify.warning('Please select a tenant first to upload documents.');
      return;
    }
    library.openUploadModal();
  };

  // Build document columns based on role
  const documentColumns = useMemo(() => {
    const baseColumns = [
      customizeColumn(STANDARD_COLUMNS.DOCUMENT_ID, {
        key: 'documentId',
        render: (_, doc) => (
          <div className="flex items-center gap-2">
            <span key="doc-id" className="font-mono text-sm font-semibold">
              {doc.documentHash || (doc.id ? `[${doc.id.substring(0, 12)}]` : '[No ID]')}
            </span>
            {!doc.documentHash && (
              <Tooltip key="warning" content="This document needs migration to new hash format">
                <HiExclamation className="h-3 w-3 text-yellow-500" />
              </Tooltip>
            )}
          </div>
        ),
        width: 150,
      }),
      customizeColumn(STANDARD_COLUMNS.DOCUMENT_TYPE, {
        render: (_, doc) => {
          const categoryInfo = getCategoryById(doc.category);
          return (
            <span className="text-sm">
              {categoryInfo?.name || doc.category}
            </span>
          );
        },
        width: 180,
      }),
    ];

    // Landlord-specific columns
    if (userRole === 'landlord') {
      baseColumns.push(
        customizeColumn(STANDARD_COLUMNS.UPLOADED_BY, {
          render: (_, doc) => (
            <div className="flex items-center gap-2">
              <span key="uploader-name" className="text-sm font-semibold">{doc.uploadedByName}</span>
              <Badge 
                key="uploader-role"
                color={doc.uploadedBy === 'landlord' ? 'blue' : 'success'}
                className="text-xs"
              >
                {doc.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
              </Badge>
            </div>
          ),
          width: 200,
        })
      );

      // Add Tenant column if viewing all tenants
      if (!selectedTenant) {
        baseColumns.push({
          title: 'Tenant',
          key: 'tenant',
          render: (_, doc) => (
            <span className="text-sm">
              {doc.tenantName || 'N/A'}
            </span>
          ),
          width: 150,
        });
      }
    } else {
      // Tenant-specific: Status column
      baseColumns.push(
        customizeColumn(STANDARD_COLUMNS.STATUS, {
          render: (_, doc) => {
            if (doc.isVerified) {
              return (
                <Badge icon={HiCheckCircle} color="success" className="text-xs">
                  Verified
                </Badge>
              );
            }
            
            const expStatus = doc.expirationDate ? library.getExpirationStatus(doc.expirationDate) : null;
            if (expStatus && (expStatus.status === 'expired' || expStatus.status === 'urgent')) {
              return (
                <Badge color="failure" className="text-xs">
                  {expStatus.status === 'expired' ? 'Expired' : 'Expiring Soon'}
                </Badge>
              );
            }

            return (
              <Badge color="gray" className="text-xs">
                Pending
              </Badge>
            );
          },
          width: 120,
        })
      );
    }

    // Common columns
    baseColumns.push(
      customizeColumn(STANDARD_COLUMNS.UPLOADED_DATE, {
        render: (date) => (
          <span className="text-sm">
            {formatDate.datetime(date)}
          </span>
        ),
        width: 180,
      }),
      customizeColumn(STANDARD_COLUMNS.EXPIRATION_DATE, {
        render: (date) => {
          if (!date) return <span className="text-xs text-gray-500 dark:text-gray-400">No expiration</span>;
          const expStatus = library.getExpirationStatus(date);
          if (!expStatus) return null;
          
          return (
            <div className="flex items-center gap-2">
              <span key="exp-date" className={`text-sm ${expStatus.status === 'expired' ? 'text-red-600' : ''}`}>
                {formatDateDisplay(date)}
              </span>
              {(expStatus.status === 'expired' || expStatus.status === 'urgent' || expStatus.status === 'warning') && (
                <Badge key="exp-status" color={expStatus.color} className="text-xs">
                  {expStatus.status === 'expired' ? 'Expired' : `${expStatus.daysRemaining}d`}
                </Badge>
              )}
            </div>
          );
        },
        width: 170,
      }),
      customizeColumn(STANDARD_COLUMNS.ACTIONS, {
        render: (_, doc) => {
          const TableActionButton = require('./TableActionButton').default;
          const actions = [
            <TableActionButton
              key="view"
              icon={<HiEye />}
              onClick={() => library.handleView(doc)}
              tooltip="View"
              actionType="view"
            />,
            <TableActionButton
              key="download"
              icon={<HiDownload />}
              onClick={() => library.handleDownload(doc)}
              tooltip="Download"
              actionType="download"
            />
          ];

          // Landlord-specific actions
          if (userRole === 'landlord') {
            // Status indicator
            if (doc.isVerified) {
              actions.push(
                <Tooltip key="status" content="Verified">
                  <HiCheckCircle
                    className="h-5 w-5 text-green-600 cursor-help"
                  />
                </Tooltip>
              );
            } else if (doc.uploadedBy === 'tenant') {
              actions.push(
                <Tooltip key="status" content="Pending verification - Click 'View' to review and verify">
                  <HiCheckCircle
                    className="h-5 w-5 text-yellow-500 cursor-help"
                  />
                </Tooltip>
              );
            }

            // Delete button
            if (doc.canLandlordDelete) {
              actions.push(
                <TableActionButton
                  key="delete"
                  icon={<HiTrash />}
                  onClick={() => library.openDeleteModal(doc)}
                  tooltip={doc.uploadedBy === 'tenant' ? "Cannot delete tenant's document" : "Delete"}
                  actionType="delete"
                  disabled={doc.uploadedBy === 'tenant'}
                />
              );
            }
          } else {
            // Tenant-specific actions
            if (doc.uploadedBy === 'tenant') {
              actions.push(
                <FlowbitePopconfirm
                  key="delete"
                  title="Delete Document"
                  description="Are you sure you want to delete this document?"
                  onConfirm={() => library.openDeleteModal(doc)}
                  okText="Yes"
                  cancelText="No"
                >
                  <TableActionButton
                    icon={<HiTrash />}
                    tooltip="Delete"
                    actionType="delete"
                  />
                </FlowbitePopconfirm>
              );
            }
          }

          return <div className="flex items-center gap-2">{actions}</div>;
        },
        width: userRole === 'landlord' ? 200 : 150,
      })
    );

    return baseColumns;
  }, [userRole, selectedTenant, library]);

  // Configure document columns with standard settings
  const configuredDocumentColumns = useMemo(() => {
    return configureTableColumns(documentColumns, {
      addSorting: false, // Keep existing sorters
      centerAlign: true,
      addWidths: false, // Keep existing widths
    });
  }, [documentColumns]);

  // Use resizable table hook
  const { tableProps } = useResizableTable(configuredDocumentColumns, {
    defaultSort: { field: 'uploadedAt', order: 'descend' },
    storageKey: `${userRole}-documents-table`,
  });

  // Legal forms columns (same for both roles)
  const legalFormsColumns = [
    {
      title: 'Form #',
      dataIndex: 'formCode',
      key: 'formCode',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Form Name',
      dataIndex: 'formName',
      key: 'formName',
      width: 250,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => <Badge color="blue">{category}</Badge>,
      filters: userRole === 'landlord' 
        ? [
            { text: 'Eviction', value: 'Eviction', key: 'eviction' },
            { text: 'Application', value: 'Application', key: 'application' },
            { text: 'Rent', value: 'Rent', key: 'rent' },
            { text: 'Agreement', value: 'Agreement', key: 'agreement' },
          ]
        : [
            { text: 'Notice Response', value: 'Notice Response', key: 'notice' },
            { text: 'Tenant Rights', value: 'Tenant Rights', key: 'rights' },
            { text: 'Rent', value: 'Rent', key: 'rent' },
            { text: 'Maintenance', value: 'Maintenance', key: 'maintenance' },
          ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const TableActionButton = require('./TableActionButton').default;
        return (
          <div className="flex items-center gap-2">
            <TableActionButton
              icon={<HiEye />}
              onClick={() => {
                openPdfViewerForForm(record);
              }}
              tooltip="View"
              actionType="view"
            />
            <TableActionButton
              icon={<HiDownload />}
              onClick={() => {
                const a = document.createElement('a');
                a.href = record.link;
                a.download = `${record.formCode}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              tooltip="Download"
              actionType="download"
            />
          </div>
        );
      },
    },
  ];

  // Configure legal forms columns with standard settings
  const configuredLegalFormsColumns = configureTableColumns(legalFormsColumns);

  // Use resizable table hook for legal forms
  const { tableProps: legalFormsTableProps } = useResizableTable(configuredLegalFormsColumns, {
    storageKey: `${userRole}-legal-forms-table`,
    defaultSort: { field: 'formCode', order: 'ascend' },
  });

  // Get user name for display
  const getUserName = () => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  // Delete confirmation handler
  const confirmDelete = async () => {
    if (!library.deleteModal.document) return;
    
    const success = await library.handleDeleteWithModal();
    
    if (success) {
      router.refresh();
    }
  };

  // Render document checklist (for tenant or when tenant selected for landlord)
  const renderDocumentChecklist = () => {
    const shouldShowChecklist = userRole === 'tenant' || (userRole === 'landlord' && selectedTenant);
    if (!shouldShowChecklist || !documentStatus) return null;

    const requiredDocs = userRole === 'tenant' 
      ? [...getPreLeaseRequiredDocuments(), ...getPostLeaseRequiredDocuments()]
      : getPreLeaseRequiredDocuments();

    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiDocumentText className="h-4 w-4 text-blue-600" />
            <h5 className="font-semibold">
              {userRole === 'landlord' 
                ? `Document Checklist for ${selectedTenant.firstName} ${selectedTenant.lastName}`
                : 'Document Checklist'}
            </h5>
          </div>
          {userRole === 'tenant' ? (
            <div className="flex items-center gap-2">
              <Badge color="success" className="text-xs px-3 py-1">
                ✓ {documentStatus.verifiedCount || 0} Approved
              </Badge>
              {documentStatus.pendingCount > 0 && (
                <Badge color="warning" className="text-xs px-3 py-1">
                  ⏱ {documentStatus.pendingCount} Pending
                </Badge>
              )}
              <Badge color="gray" className="text-xs px-3 py-1">
                {documentStatus.submittedRequired || 0} / {documentStatus.totalRequired || 0} Total
              </Badge>
            </div>
          ) : (
            <Badge 
              color={documentStatus.allRequiredDocumentsSubmitted ? 'success' : 'warning'}
              className="text-xs px-3 py-1"
            >
              {documentStatus.submittedRequired || 0} / {documentStatus.totalRequired || 0} Required
            </Badge>
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          overflowX: 'auto', 
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }}>
          {requiredDocs.map((category) => {
            const matchingDoc = library.documents?.find(doc => doc.category === category.id);
            const isVerified = matchingDoc?.isVerified;
            const isPending = matchingDoc && !isVerified;
            const isNotUploaded = !matchingDoc;
            const isDragOver = userRole === 'tenant' && dragOverCategory === category.id;
            
            // Determine colors and icons based on status
            let bgColor, borderColor, iconColor, textColor, icon;
            
            if (isDragOver) {
              bgColor = '#bae7ff';
              borderColor = '2px dashed #1890ff';
              iconColor = '#1890ff';
              textColor = '#1890ff';
              icon = <HiCloudUpload className="h-4 w-4" style={{ color: iconColor }} />;
            } else if (isVerified) {
              bgColor = '#f6ffed';
              borderColor = '1px solid #b7eb8f';
              iconColor = '#52c41a';
              textColor = '#52c41a';
              icon = <HiCheckCircle className="h-4 w-4" style={{ color: iconColor }} />;
            } else if (isPending) {
              bgColor = '#fff7e6';
              borderColor = '1px solid #ffd591';
              iconColor = '#fa8c16';
              textColor = '#fa8c16';
              icon = <HiClock className="h-4 w-4" style={{ color: iconColor }} />;
            } else {
              bgColor = '#fafafa';
              borderColor = '1px solid #e8e8e8';
              iconColor = '#1890ff';
              textColor = '#1890ff';
              icon = userRole === 'tenant' 
                ? <HiCloudUpload className="h-4 w-4" style={{ color: iconColor }} />
                : <HiX className="h-4 w-4" style={{ color: '#d9d9d9' }} />;
            }
            
            return (
              <div 
                key={category.id}
                style={{ position: 'relative', display: 'inline-flex' }}
              >
                <div 
                  onClick={(e) => {
                    if (e.target.closest('.action-button')) return;
                    if (matchingDoc) {
                      library.handleView(matchingDoc);
                    } else if (userRole === 'tenant') {
                      library.openUploadModal(category.id);
                    }
                  }}
                  onDragOver={userRole === 'tenant' ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  } : undefined}
                  onDragEnter={userRole === 'tenant' ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverCategory(category.id);
                  } : undefined}
                  onDragLeave={userRole === 'tenant' ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverCategory(null);
                  } : undefined}
                  onDrop={userRole === 'tenant' ? async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverCategory(null);
                    const files = Array.from(e.dataTransfer.files);
                    if (files.length > 0) {
                      await handleDirectUpload(files[0], category.id);
                    }
                  } : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: bgColor,
                    border: borderColor,
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content',
                    cursor: (matchingDoc || userRole === 'tenant') ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    transform: isDragOver ? 'scale(1.05)' : 'none',
                    opacity: isNotUploaded && userRole === 'landlord' ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDragOver && (matchingDoc || userRole === 'tenant')) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.backgroundColor = '#e6f7ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDragOver) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.backgroundColor = bgColor;
                    }
                  }}
                >
                  {icon}
                  <span className={`text-sm ${isDragOver ? 'text-blue-600' : ''}`} style={{ 
                    color: isDragOver ? '#1890ff' : textColor,
                    fontWeight: isVerified ? 500 : (isPending ? 500 : 400)
                  }}>
                    {category.name}
                  </span>
                  
                  {matchingDoc && userRole === 'tenant' && (
                    <div className="flex items-center gap-1 ml-2">
                      <Tooltip content="View document">
                        <Button
                          color="light"
                          size="xs"
                          className="action-button p-1 h-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            library.handleView(matchingDoc);
                          }}
                          style={{ color: textColor }}
                        >
                          <HiEye className="h-3 w-3" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Replace document">
                        <Button
                          color="light"
                          size="xs"
                          className="action-button p-1 h-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            library.openUploadModal(category.id);
                          }}
                          style={{ color: textColor }}
                        >
                          <HiRefresh className="h-3 w-3" />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  // If hideTabs is true, only show personal documents content (no PageBanner, no Tabs)
  // But still include all modals for functionality
  const personalDocumentsContent = (
    <div style={{ padding: '20px' }}>
      {/* Search Bar removed for Personal tab - not needed for landlord/tenant */}
      
      {renderDocumentChecklist()}

      <Card className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiShieldCheck className="h-4 w-4 text-gray-600" />
          <h5 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Documents: {displayDocuments.length}
          </h5>
        </div>
        {library.loading ? (
          <div className="text-center py-12">
            <Empty description="Loading documents..." />
          </div>
        ) : displayDocuments.length === 0 ? (
          <Empty
            description={
              userRole === 'landlord'
                ? (selectedTenant 
                    ? "No documents uploaded yet for this tenant." 
                    : "No documents found. Upload documents using the + button above.")
                : "No documents uploaded yet. Upload documents using the + button above."
            }
          />
        ) : (
          <Table hoverable>
            <Table.Head>
              {tableProps.columns?.map((col, idx) => (
                <Table.HeadCell key={idx}>{col.title}</Table.HeadCell>
              ))}
            </Table.Head>
            <Table.Body className="divide-y">
              {documentsSearch.filteredData?.map((row) => (
                <Table.Row key={row.id}>
                  {tableProps.columns?.map((col, idx) => (
                    <Table.Cell key={idx}>
                      {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>
    </div>
  );

  // All modals (shared between hideTabs and normal mode)
  const allModals = (
    <>
      {/* Upload Modal */}
      <Modal
        show={library.uploadModalOpen}
        onClose={library.closeUploadModal}
        size="md"
      >
        <Modal.Header>
          {userRole === 'tenant' ? (
            <div className="flex items-center gap-2">
              <HiCloudUpload className="h-5 w-5 text-blue-600" />
              <span>Upload Document</span>
            </div>
          ) : "Upload Document"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
          {library.uploading && library.uploadProgress.total > 1 && (
            <Alert color="info">
              <div>
                <p className="font-semibold mb-2">Uploading file {library.uploadProgress.current} of {library.uploadProgress.total}</p>
                <Progress 
                  progress={Math.round((library.uploadProgress.current / library.uploadProgress.total) * 100)}
                  color="blue"
                />
              </div>
            </Alert>
          )}

          {userRole === 'tenant' ? (
            <>
              <div>
                <Label className="mb-2 block font-semibold">Select Document Type</Label>
                <Select
                  className="w-full"
                  value={library.category}
                  onChange={(e) => library.setCategory(e.target.value)}
                >
                  <option value="">Choose document category...</option>
                  {Object.values(DOCUMENT_CATEGORIES).filter(cat => 
                    cat.uploadedBy === 'tenant'
                  ).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </div>

              {library.category && (
                <div>
                  <Label className="mb-2 block font-semibold">Upload File</Label>
                  <FileInput
                    {...uploadProps}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    helperText="Supports PDF, JPG, PNG, DOC, DOCX"
                  />
                </div>
              )}

              {library.category && library.selectedFile && getCategoryById(library.category)?.requiresExpiration && (
                <div>
                  <Label className="mb-2 block font-semibold">Expiration Date (if applicable)</Label>
                  <Datepicker
                    className="w-full"
                    value={library.expirationDate}
                    onSelectedDateChanged={(date) => library.setExpirationDate(date)}
                    placeholder="Select expiration date"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={library.closeUploadModal}>Cancel</Button>
                <Button
                  color="blue"
                  className="flex items-center gap-2"
                  onClick={library.handleUpload}
                  disabled={!library.category || !library.selectedFile}
                >
                  {library.uploading ? (
                    <>
                      <Spinner size="sm" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <HiCloudUpload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className={`grid ${library.category ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div>
                  <Label className="mb-2 block font-semibold">Category *</Label>
                  <Select
                    value={library.category}
                    onChange={(e) => library.setCategory(e.target.value)}
                    className="w-full"
                  >
                    <option value="">Select category</option>
                    {Object.values(CATEGORY_GROUPS).flatMap(group =>
                      group.categories
                        .map(catId => getCategoryById(catId))
                        .filter(cat => cat && cat.id != null)
                        .filter(cat => cat.uploadedBy === 'landlord' || cat.uploadedBy === 'both')
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                    )}
                  </Select>
                </div>
                {library.category && (
                  <div>
                    <Label className="mb-2 block font-semibold">Expiration Date</Label>
                    <Datepicker
                      className="w-full"
                      value={library.expirationDate}
                      onSelectedDateChanged={(date) => library.setExpirationDate(date)}
                      placeholder="Select date"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Description {library.category === 'OTHER' && '*'}</Label>
                <Textarea
                  rows={3}
                  placeholder={library.category === 'OTHER' ? "Please provide description (required for Other documents)" : "Optional: Provide additional details"}
                  value={library.description}
                  onChange={(e) => library.setDescription(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Upload File *</Label>
                <FileInput
                  {...uploadProps}
                  helperText={`${library.category ? getCategoryById(library.category).allowedFileTypes.join(', ') : ''}. You can upload multiple files at once.`}
                />
              </div>
            </>
          )}
          </div>
        </Modal.Body>
        {userRole !== 'tenant' && (
          <Modal.Footer>
            <Button color="gray" onClick={library.closeUploadModal} disabled={library.uploading}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={library.handleUpload}
              disabled={
                !library.category ||
                !library.description ||
                !library.selectedFile ||
                (Array.isArray(library.selectedFile) && library.selectedFile.length === 0)
              }
            >
              {library.uploading && library.uploadProgress.total > 1 
                ? `Uploading ${library.uploadProgress.current}/${library.uploadProgress.total}...`
                : 'Upload'}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* View Modal - PDFViewerModal */}
      <PDFViewerModal
        open={library.viewModalOpen}
        userRole={userRole}
        userName={getUserName()}
        onPromoteVersion={async (versionIndex) => {
          if (!library.viewingDocument) return;
          
          try {
            const loadingToast = notify.loading('Promoting version to current...');
            
            // Use v2Api to promote version
            const { v2Api } = await import('@/lib/api/v2-client');
            await v2Api.forms.promoteDocumentVersion(library.viewingDocument.id, versionIndex);
            loadingToast();
            notify.success('Version promoted successfully');
            library.closeViewModal();
            setTimeout(() => {
              router.refresh();
              window.location.reload();
            }, 300);
          } catch (error) {
            console.error(`[${userRole === 'landlord' ? 'Landlord' : 'Tenant'} Library] Promote version error:`, error);
            loadingToast();
            notify.error('Failed to promote version');
          }
        }}
        documents={(() => {
          if (!library.viewingDocument) return [];
          
          if (library.viewingDocument.metadata) {
            try {
              const metadata = typeof library.viewingDocument.metadata === 'string' 
                ? JSON.parse(library.viewingDocument.metadata)
                : library.viewingDocument.metadata;
              
              // Handle batch uploads
              if (metadata.files && metadata.files.length > 1) {
                return metadata.files.map((file, index) => ({
                  ...library.viewingDocument,
                  id: library.viewingDocument.id,
                  fileName: file.fileName,
                  originalName: file.originalName,
                  fileType: file.fileType,
                  fileSize: file.fileSize,
                  storagePath: file.storagePath,
                  viewUrl: null, // Will use v2Api.forms.viewDocument() instead
                  fileIndex: index,
                }));
              }
              
              // Handle version history
              if (metadata.versions && metadata.versions.length > 0) {
                return [
                  { ...library.viewingDocument, versionLabel: 'Current Version' },
                  ...metadata.versions.map((version, index) => ({
                    ...library.viewingDocument,
                    id: library.viewingDocument.id,
                    fileName: version.fileName,
                    originalName: version.originalName,
                    fileType: version.fileType,
                    fileSize: version.fileSize,
                    storagePath: version.storagePath,
                    uploadedBy: version.uploadedBy,
                    uploadedByEmail: version.uploadedByEmail,
                    uploadedByName: version.uploadedByName,
                    uploadedAt: version.uploadedAt,
                    viewUrl: null, // Will use v2Api.forms.viewDocument() instead
                    versionIndex: index,
                    versionLabel: `Version ${index + 2}`
                  }))
                ];
              }
            } catch (e) {
              console.error(`[${userRole === 'landlord' ? 'Landlord' : 'Tenant'} Library] Failed to parse metadata:`, e);
            }
          }
          
          // Default: single document
          const doc = { ...library.viewingDocument };
          doc.viewUrl = null; // Will use v2Api.forms.viewDocument() instead
          return [doc];
        })()}
        currentIndex={0}
        onClose={library.closeViewModal}
        onDownload={library.handleDownload}
        onVerify={(() => {
          if (!library.viewingDocument) return null;
          
          const metadata = parseDocumentMetadata(library.viewingDocument.metadata);
          
          if (needsVersionApproval(metadata, userRole)) {
            return (comment) => mutualApproval.approveVersionChange(library.viewingDocument.id, comment);
          }

          if (userRole === 'landlord' && 
              !library.viewingDocument.isVerified && 
              !library.viewingDocument.isRejected && 
              library.viewingDocument.uploadedBy === 'tenant') {
            return (comment) => library.handleVerify(library.viewingDocument.id, comment);
          }

          return null;
        })()}
        onReject={library.viewingDocument && 
                  userRole === 'landlord' &&
                  !library.viewingDocument.isVerified && 
                  !library.viewingDocument.isRejected && 
                  library.viewingDocument.uploadedBy === 'tenant'
          ? (reason) => library.handleReject(library.viewingDocument.id, reason)
          : null}
        onApproveDeletion={() => 
          library.viewingDocument && mutualApproval.approveDeletion(library.viewingDocument.id)
        }
        metadata={buildDocumentMetadata(library.viewingDocument, {
          showDownload: true,
          onDownload: library.handleDownload,
          includeApprovalDetails: userRole === 'tenant',
        })}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        show={library.deleteModal.visible}
        onClose={library.closeDeleteModal}
        size="md"
      >
        <Modal.Header>
          <div className="flex items-center gap-2">
            <HiTrash className="h-5 w-5 text-red-600" />
            <span>Delete Document</span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Alert color="warning">
              <div>
                <p className="font-semibold mb-1">Document Deletion Confirmation</p>
                <p className="text-sm">This document will be marked as deleted but retained in the system for legal audit purposes.</p>
              </div>
            </Alert>

            {library.deleteModal.document && (
              <div className="grid grid-cols-1 gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Document Name:</span>
                  <p className="text-sm">{library.deleteModal.document.originalName}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Category:</span>
                  <p className="text-sm">{getCategoryById(library.deleteModal.document.category)?.name || library.deleteModal.document.category}</p>
                </div>
                {userRole === 'landlord' && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded By:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={library.deleteModal.document.uploadedBy === 'landlord' ? 'blue' : 'success'}>
                        {library.deleteModal.document.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                      </Badge>
                      <span className="text-sm">{library.deleteModal.document.uploadedByName}</span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{userRole === 'landlord' ? "Uploaded Date" : "Upload Date"}:</span>
                  <p className="text-sm">{formatDateTimeDisplay(library.deleteModal.document.uploadedAt)}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2 block font-semibold">Reason for Deletion {userRole === 'landlord' ? '(Optional but Recommended)' : ''}</Label>
              <Textarea
                rows={userRole === 'landlord' ? 4 : 3}
                placeholder="Please provide a reason for deleting this document..."
                value={library.deleteModal.reason}
                onChange={(e) => library.updateDeleteReason(e.target.value)}
                disabled={library.deleteModal.loading}
              />
              {userRole === 'landlord' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  This reason will be logged for audit trail purposes
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={library.closeDeleteModal} disabled={library.deleteModal.loading}>
            Cancel
          </Button>
          <Button
            color="failure"
            onClick={confirmDelete}
            disabled={library.deleteModal.loading}
          >
            {library.deleteModal.loading ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              'Delete Document'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );

  // LibraryClient now only renders personal documents content (no tabs, no PageBanner)
  // Tabs are handled by the parent component (admin/library or documents page)
  return (
    <>
      {personalDocumentsContent}
      {allModals}
    </>
  );
}

