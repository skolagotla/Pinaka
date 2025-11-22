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
  Typography, Button, Row, Col, Card, Tag, Select, Modal, Space, Empty,
  Table, Popconfirm, Tooltip, Progress, Alert, Badge, DatePicker, Divider,
  Descriptions, Statistic, List, Avatar, Upload, Input, App
} from 'antd';
import {
  PlusOutlined, EyeOutlined, DownloadOutlined, DeleteOutlined, CloudUploadOutlined,
  FilePdfOutlined, FileImageOutlined, FileWordOutlined, FileTextOutlined, InboxOutlined,
  CheckCircleOutlined, CheckCircleFilled, ClockCircleFilled, ClockCircleOutlined, WarningOutlined, ExclamationCircleOutlined,
  SaveOutlined, CloseOutlined, FileProtectOutlined, SafetyCertificateOutlined,
  CalendarOutlined, UserOutlined, TeamOutlined, FileDoneOutlined, CloseCircleOutlined,
  FormOutlined, LockOutlined, ReloadOutlined,
} from '@ant-design/icons';
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

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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
  const { message } = App.useApp();
  
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
      message.loading({ content: 'Uploading document...', key: 'upload', duration: 0 });
      
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
        
        message.success({ content: 'Document replaced successfully! Version history saved.', key: 'upload' });
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
        
        message.success({ content: 'Document uploaded successfully!', key: 'upload' });
        router.refresh();
        return true;
      }
    } catch (error) {
      console.error(`[${userRole === 'landlord' ? 'Landlord' : 'Tenant'} Library] Direct upload error:`, error);
      message.error({ content: 'Failed to upload document', key: 'upload' });
      return false;
    }
  };

  // Handle upload button click (landlord needs tenant selection)
  const handleUploadClick = () => {
    if (userRole === 'landlord' && !selectedTenant) {
      message.warning('Please select a tenant first to upload documents.');
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
          <Space size="small">
            <Text key="doc-id" strong style={{ fontFamily: 'monospace', fontSize: 13 }}>
              {doc.documentHash || (doc.id ? `[${doc.id.substring(0, 12)}]` : '[No ID]')}
            </Text>
            {!doc.documentHash && (
              <Tooltip key="warning" title="This document needs migration to new hash format">
                <WarningOutlined style={{ color: '#faad14', fontSize: 12 }} />
              </Tooltip>
            )}
          </Space>
        ),
        width: 150,
      }),
      customizeColumn(STANDARD_COLUMNS.DOCUMENT_TYPE, {
        render: (_, doc) => {
          const categoryInfo = getCategoryById(doc.category);
          return (
            <Text style={{ fontSize: 13 }}>
              {categoryInfo?.name || doc.category}
            </Text>
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
            <Space size="small">
              <Text key="uploader-name" strong style={{ fontSize: 13 }}>{doc.uploadedByName}</Text>
              <Tag 
                key="uploader-role"
                color={doc.uploadedBy === 'landlord' ? 'blue' : 'green'}
                style={{ fontSize: 11 }}
              >
                {doc.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
              </Tag>
            </Space>
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
            <Text style={{ fontSize: 13 }}>
              {doc.tenantName || 'N/A'}
            </Text>
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
                <Tag icon={<CheckCircleFilled />} color="success" style={{ fontSize: 11 }}>
                  Verified
                </Tag>
              );
            }
            
            const expStatus = doc.expirationDate ? library.getExpirationStatus(doc.expirationDate) : null;
            if (expStatus && (expStatus.status === 'expired' || expStatus.status === 'urgent')) {
              return (
                <Tag color="error" style={{ fontSize: 11 }}>
                  {expStatus.status === 'expired' ? 'Expired' : 'Expiring Soon'}
                </Tag>
              );
            }

            return (
              <Tag style={{ fontSize: 11 }}>
                Pending
              </Tag>
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
          <Text style={{ fontSize: 13 }}>
            {formatDate.datetime(date)}
          </Text>
        ),
        width: 180,
      }),
      customizeColumn(STANDARD_COLUMNS.EXPIRATION_DATE, {
        render: (date) => {
          if (!date) return <Text type="secondary" style={{ fontSize: 12 }}>No expiration</Text>;
          const expStatus = library.getExpirationStatus(date);
          if (!expStatus) return null;
          
          return (
            <Space size="small">
              <Text key="exp-date" style={{ 
                color: expStatus.status === 'expired' ? '#ff4d4f' : undefined,
                fontSize: 13
              }}>
                {formatDateDisplay(date)}
              </Text>
              {(expStatus.status === 'expired' || expStatus.status === 'urgent' || expStatus.status === 'warning') && (
                <Tag key="exp-status" color={expStatus.color} style={{ fontSize: 11 }}>
                  {expStatus.status === 'expired' ? 'Expired' : `${expStatus.daysRemaining}d`}
                </Tag>
              )}
            </Space>
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
              icon={<EyeOutlined />}
              onClick={() => library.handleView(doc)}
              tooltip="View"
              actionType="view"
            />,
            <TableActionButton
              key="download"
              icon={<DownloadOutlined />}
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
                <Tooltip key="status" title="Verified">
                  <CheckCircleFilled
                    style={{ 
                      color: '#52c41a',
                      fontSize: '18px',
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
              );
            } else if (doc.uploadedBy === 'tenant') {
              actions.push(
                <Tooltip key="status" title="Pending verification - Click 'View' to review and verify">
                  <CheckCircleFilled
                    style={{ 
                      color: '#faad14',
                      fontSize: '18px',
                      cursor: 'help'
                    }}
                  />
                </Tooltip>
              );
            }

            // Delete button
            if (doc.canLandlordDelete) {
              actions.push(
                <TableActionButton
                  key="delete"
                  icon={<DeleteOutlined />}
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
                <Popconfirm
                  key="delete"
                  title="Delete Document"
                  description="Are you sure you want to delete this document?"
                  onConfirm={() => library.openDeleteModal(doc)}
                  okText="Yes"
                  cancelText="No"
                >
                  <TableActionButton
                    icon={<DeleteOutlined />}
                    tooltip="Delete"
                    actionType="delete"
                  />
                </Popconfirm>
              );
            }
          }

          return <Space>{actions}</Space>;
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
      render: (category) => <Tag color="blue">{category}</Tag>,
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
          <Space size="small">
            <TableActionButton
              icon={<EyeOutlined />}
              onClick={() => {
                openPdfViewerForForm(record);
              }}
              tooltip="View"
              actionType="view"
            />
            <TableActionButton
              icon={<DownloadOutlined />}
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
          </Space>
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
      <Card 
        size="small"
        style={{ marginBottom: 24 }}
        title={
          <Space>
            <FileDoneOutlined style={{ fontSize: 16, color: '#1890ff' }} />
            <Text strong>
              {userRole === 'landlord' 
                ? `Document Checklist for ${selectedTenant.firstName} ${selectedTenant.lastName}`
                : 'Document Checklist'}
            </Text>
          </Space>
        }
        extra={
          userRole === 'tenant' ? (
            <Space size="small">
              <Tag color="success" style={{ fontSize: 12, padding: '4px 12px' }}>
                ✓ {documentStatus.verifiedCount || 0} Approved
              </Tag>
              {documentStatus.pendingCount > 0 && (
                <Tag color="warning" style={{ fontSize: 12, padding: '4px 12px' }}>
                  ⏱ {documentStatus.pendingCount} Pending
                </Tag>
              )}
              <Tag color="default" style={{ fontSize: 12, padding: '4px 12px' }}>
                {documentStatus.submittedRequired || 0} / {documentStatus.totalRequired || 0} Total
              </Tag>
            </Space>
          ) : (
            <Tag 
              color={documentStatus.allRequiredDocumentsSubmitted ? 'success' : 'warning'}
              style={{ fontSize: 12, padding: '4px 12px' }}
            >
              {documentStatus.submittedRequired || 0} / {documentStatus.totalRequired || 0} Required
            </Tag>
          )
        }
      >
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
              icon = <CloudUploadOutlined style={{ fontSize: 16, color: iconColor }} />;
            } else if (isVerified) {
              bgColor = '#f6ffed';
              borderColor = '1px solid #b7eb8f';
              iconColor = '#52c41a';
              textColor = '#52c41a';
              icon = <CheckCircleFilled style={{ fontSize: 16, color: iconColor }} />;
            } else if (isPending) {
              bgColor = '#fff7e6';
              borderColor = '1px solid #ffd591';
              iconColor = '#fa8c16';
              textColor = '#fa8c16';
              icon = <ClockCircleFilled style={{ fontSize: 16, color: iconColor }} />;
            } else {
              bgColor = '#fafafa';
              borderColor = '1px solid #e8e8e8';
              iconColor = '#1890ff';
              textColor = '#1890ff';
              icon = userRole === 'tenant' 
                ? <CloudUploadOutlined style={{ fontSize: 16, color: iconColor }} />
                : <CloseCircleOutlined style={{ fontSize: 16, color: '#d9d9d9' }} />;
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
                  <Text style={{ 
                    fontSize: 13,
                    color: isDragOver ? '#1890ff' : textColor,
                    fontWeight: isVerified ? 500 : (isPending ? 500 : 400)
                  }}>
                    {category.name}
                  </Text>
                  
                  {matchingDoc && userRole === 'tenant' && (
                    <Space size={4} style={{ marginLeft: 8 }}>
                      <Tooltip title="View document">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            library.handleView(matchingDoc);
                          }}
                          style={{ padding: '0 4px', height: 20, fontSize: 12, color: textColor }}
                        />
                      </Tooltip>
                      <Tooltip title="Replace document">
                        <Button
                          type="text"
                          size="small"
                          icon={<ReloadOutlined />}
                          className="action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            library.openUploadModal(category.id);
                          }}
                          style={{ padding: '0 4px', height: 20, fontSize: 12, color: textColor }}
                        />
                      </Tooltip>
                    </Space>
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

      <Card
        title={
          <Space>
            <FileProtectOutlined style={{ fontSize: 16, color: '#595959' }} />
            <Text strong style={{ fontSize: '15px', color: '#262626' }}>
              Documents: {displayDocuments.length}
            </Text>
          </Space>
        }
        style={{ borderRadius: '6px', border: '1px solid #f0f0f0' }}
        bodyStyle={{ padding: '16px' }}
      >
        {library.loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Empty description="Loading documents..." />
          </div>
        ) : displayDocuments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              userRole === 'landlord'
                ? (selectedTenant 
                    ? "No documents uploaded yet for this tenant." 
                    : "No documents found. Upload documents using the + button above.")
                : "No documents uploaded yet. Upload documents using the + button above."
            }
          />
        ) : (
          <Table
            {...tableProps}
            dataSource={documentsSearch.filteredData}
            rowKey="id"
            pagination={userRole === 'tenant' ? {
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} documents`,
            } : { pageSize: 25 }}
          />
        )}
      </Card>
    </div>
  );

  // All modals (shared between hideTabs and normal mode)
  const allModals = (
    <>
      {/* Upload Modal */}
      <Modal
        title={userRole === 'tenant' ? (
          <Space>
            <CloudUploadOutlined style={{ color: '#1890ff' }} />
            <span>Upload Document</span>
          </Space>
        ) : "Upload Document"}
        open={library.uploadModalOpen}
        onCancel={library.closeUploadModal}
        footer={userRole === 'tenant' ? null : [
          <Button key="cancel" onClick={library.closeUploadModal} disabled={library.uploading}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={library.uploading}
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
          </Button>,
        ]}
        width={600}
        destroyOnClose={userRole === 'tenant'}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {library.uploading && library.uploadProgress.total > 1 && (
            <Alert
              message={`Uploading file ${library.uploadProgress.current} of ${library.uploadProgress.total}`}
              type="info"
              showIcon
              icon={<CloudUploadOutlined />}
              description={
                <Progress 
                  percent={Math.round((library.uploadProgress.current / library.uploadProgress.total) * 100)} 
                  status="active"
                />
              }
            />
          )}

          {userRole === 'tenant' ? (
            <>
              <div>
                <Text strong>Select Document Type</Text>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Choose document category..."
                  value={library.category}
                  onChange={library.setCategory}
                  options={Object.values(DOCUMENT_CATEGORIES).filter(cat => 
                    cat.uploadedBy === 'tenant'
                  ).map(cat => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </div>

              {library.category && (
                <div>
                  <Text strong>Upload File</Text>
                  <Dragger
                    {...uploadProps}
                    style={{ marginTop: 8 }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to upload</p>
                    <p className="ant-upload-hint">
                      Supports PDF, JPG, PNG, DOC, DOCX
                    </p>
                  </Dragger>
                </div>
              )}

              {library.category && library.selectedFile && getCategoryById(library.category)?.requiresExpiration && (
                <div>
                  <Text strong>Expiration Date (if applicable)</Text>
                  <DatePicker
                    style={{ width: '100%', marginTop: 8 }}
                    value={library.expirationDate}
                    onChange={library.setExpirationDate}
                    format="YYYY-MM-DD"
                    placeholder="Select expiration date"
                  />
                </div>
              )}

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={library.closeUploadModal}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={library.handleUpload}
                    disabled={!library.category || !library.selectedFile}
                    loading={library.uploading}
                  >
                    Upload
                  </Button>
                </Space>
              </div>
            </>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={library.category ? 12 : 24}>
                  <Text strong>Category *</Text>
                  <Select
                    value={library.category}
                    onChange={(value) => library.setCategory(value)}
                    style={{ width: '100%', marginTop: 8 }}
                    placeholder="Select category"
                  >
                    {Object.values(CATEGORY_GROUPS).flatMap(group =>
                      group.categories
                        .map(catId => getCategoryById(catId))
                        .filter(cat => cat && cat.id != null)
                        .filter(cat => cat.uploadedBy === 'landlord' || cat.uploadedBy === 'both')
                        .map(cat => (
                          <Select.Option key={cat.id} value={cat.id}>
                            {cat.name}
                          </Select.Option>
                        ))
                    )}
                  </Select>
                </Col>
                {library.category && (
                  <Col span={12}>
                    <Text strong>Expiration Date</Text>
                    <DatePicker
                      value={library.expirationDate}
                      onChange={(date) => library.setExpirationDate(date)}
                      style={{ width: '100%', marginTop: 8 }}
                      format="YYYY-MM-DD"
                      placeholder="Select date"
                    />
                  </Col>
                )}
              </Row>

              <div>
                <Text strong>Description {library.category === 'OTHER' && '*'}</Text>
                <TextArea
                  rows={3}
                  placeholder={library.category === 'OTHER' ? "Please provide description (required for Other documents)" : "Optional: Provide additional details"}
                  value={library.description}
                  onChange={(e) => library.setDescription(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>

              <div>
                <Text strong>Upload File *</Text>
                <Dragger {...uploadProps} style={{ marginTop: 8 }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag files to upload (multiple files supported)
                  </p>
                  <p className="ant-upload-hint">
                    {library.category && getCategoryById(library.category).allowedFileTypes.join(', ')}
                    <br />You can upload multiple files at once
                  </p>
                </Dragger>
              </div>
            </>
          )}
        </Space>
      </Modal>

      {/* View Modal - PDFViewerModal */}
      <PDFViewerModal
        open={library.viewModalOpen}
        userRole={userRole}
        userName={getUserName()}
        onPromoteVersion={async (versionIndex) => {
          if (!library.viewingDocument) return;
          
          try {
            message.loading({ content: 'Promoting version to current...', key: 'promote', duration: 0 });
            
            // Use v1Api to promote version
            const { v1Api } = await import('@/lib/api/v1-client');
            await v1Api.forms.promoteDocumentVersion(library.viewingDocument.id, versionIndex);
            message.success({ content: 'Version promoted successfully!', key: 'promote' });
            library.closeViewModal();
            setTimeout(() => {
              router.refresh();
              window.location.reload();
            }, 300);
          } catch (error) {
            console.error(`[${userRole === 'landlord' ? 'Landlord' : 'Tenant'} Library] Promote version error:`, error);
            message.error({ content: 'Failed to promote version', key: 'promote' });
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
                  viewUrl: null, // Will use v1Api.forms.viewDocument() instead
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
                    viewUrl: null, // Will use v1Api.forms.viewDocument() instead
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
          doc.viewUrl = null; // Will use v1Api.forms.viewDocument() instead
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
        title={
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <Text>Delete Document</Text>
          </Space>
        }
        open={library.deleteModal.visible}
        onCancel={library.closeDeleteModal}
        footer={[
          <Button key="cancel" onClick={library.closeDeleteModal} disabled={library.deleteModal.loading}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={library.deleteModal.loading}
            onClick={confirmDelete}
          >
            Delete Document
          </Button>,
        ]}
        width={500}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Document Deletion Confirmation"
            description="This document will be marked as deleted but retained in the system for legal audit purposes."
            type="warning"
            showIcon
          />

          {library.deleteModal.document && (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Document Name">
                {library.deleteModal.document.originalName}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {getCategoryById(library.deleteModal.document.category)?.name || library.deleteModal.document.category}
              </Descriptions.Item>
              {userRole === 'landlord' && (
                <Descriptions.Item label="Uploaded By">
                  <Space>
                    <Tag color={library.deleteModal.document.uploadedBy === 'landlord' ? 'blue' : 'green'}>
                      {library.deleteModal.document.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                    </Tag>
                    {library.deleteModal.document.uploadedByName}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label={userRole === 'landlord' ? "Uploaded Date" : "Upload Date"}>
                {formatDateTimeDisplay(library.deleteModal.document.uploadedAt)}
              </Descriptions.Item>
            </Descriptions>
          )}

          <div>
            <Text strong>Reason for Deletion {userRole === 'landlord' ? '(Optional but Recommended)' : ''}</Text>
            <TextArea
              rows={userRole === 'landlord' ? 4 : 3}
              placeholder="Please provide a reason for deleting this document..."
              value={library.deleteModal.reason}
              onChange={(e) => library.updateDeleteReason(e.target.value)}
              style={{ marginTop: 8 }}
              disabled={library.deleteModal.loading}
            />
            {userRole === 'landlord' && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                This reason will be logged for audit trail purposes
              </Text>
            )}
          </div>
        </Space>
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

