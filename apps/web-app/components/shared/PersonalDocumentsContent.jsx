/**
 * Personal Documents Content Component
 * 
 * Displays personal documents (checklist and table) for use in admin/library page
 * Uses the same hooks and logic as LibraryClient but without tabs or PageBanner
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  Card, Space, Empty, Table, Text, Button, Modal, Alert, Progress, 
  Select, DatePicker, Row, Col, Tag, Descriptions, Upload
} from 'antd';
import {
  PlusOutlined, CloudUploadOutlined, InboxOutlined, FileProtectOutlined,
  DeleteOutlined, ReloadOutlined
} from '@ant-design/icons';
import { App } from 'antd';
import dynamic from 'next/dynamic';

// Custom Hooks
import { useDocumentVaultFeature, useDocumentUpload, useSearch, useMutualApproval } from '@/lib/hooks';
import { useModalState } from '@/lib/hooks/useModalState';

// Utilities
import { getCategoryById } from '@/lib/constants/document-categories';
import { formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { buildDocumentMetadata, parseDocumentMetadata, needsVersionApproval } from '@/lib/utils/document-metadata';

// Dynamically import PDFViewerModal
const PDFViewerModal = dynamic(() => import('@/components/PDFViewerModal'), {
  ssr: false,
  loading: () => null
});

const { TextArea } = require('antd/lib/input');
const DOCUMENT_CATEGORIES = require('@/lib/constants/document-categories').default;
const { CATEGORY_GROUPS } = require('@/lib/constants/document-categories');

export default function PersonalDocumentsContent({
  userRole,
  user,
  tenants = [],
  initialDocuments = [],
  renderDocumentChecklist,
  tableProps,
}) {
  const router = useRouter();
  const { message } = App.useApp();
  
  // Mutual approval hook
  const mutualApproval = useMutualApproval({
    onSuccess: () => {
      library.closeViewModal();
      router.refresh();
    }
  });
  
  // Tenant selection (only for landlord)
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Property-centric: Get propertyId from selected tenant's active lease (for landlords)
  const selectedPropertyId = useMemo(() => {
    if (userRole === 'landlord' && selectedTenant?.lease?.property?.id) {
      return selectedTenant.lease.property.id;
    }
    return null;
  }, [userRole, selectedTenant]);

  // Use Document Vault Feature Composite Hook
  const library = useDocumentVaultFeature({ 
    userRole, 
    selectedTenantId: userRole === 'landlord' ? selectedTenant?.id : undefined,
    selectedPropertyId,
    initialDocuments: userRole === 'tenant' ? initialDocuments : []
  });

  // Use Document Upload Hook
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
        // Flatten all documents from all tenants
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
      return library.documents || [];
    } else {
      return library.documents || [];
    }
  }, [userRole, selectedTenant, tenants, library.documents]);

  // Search functionality for documents
  const documentsSearch = useSearch(
    getAllDocuments,
    userRole === 'landlord' 
      ? ['fileName', 'category', 'status', 'tenantName', 'tenantEmail', 'uploadedBy']
      : ['fileName', 'category', 'status', 'uploadedBy'],
    { debounceMs: 300 }
  );

  const displayDocuments = getAllDocuments;

  // Handle upload button click (landlord needs tenant selection)
  const handleUploadClick = () => {
    if (userRole === 'landlord' && !selectedTenant) {
      message.warning('Please select a tenant first to upload documents.');
      return;
    }
    library.openUploadModal();
  };

  // Delete confirmation
  const confirmDelete = async () => {
    if (!library.deleteModal.document) return;
    
    try {
      await library.handleDelete(
        library.deleteModal.document.id,
        library.deleteModal.reason
      );
      message.success('Document deleted successfully');
      library.closeDeleteModal();
      router.refresh();
    } catch (error) {
      console.error('[PersonalDocumentsContent] Delete error:', error);
      message.error('Failed to delete document');
    }
  };

  // Get user name for display
  const getUserName = () => {
    if (userRole === 'tenant' && user) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (userRole === 'landlord' && selectedTenant) {
      return `${selectedTenant.firstName} ${selectedTenant.lastName}`;
    }
    return user?.firstName || 'User';
  };

  return (
    <>
      <div style={{ padding: '24px' }}>
        {renderDocumentChecklist && renderDocumentChecklist()}

        <Card
          title={
            <Space>
              <FileProtectOutlined style={{ fontSize: 18 }} />
              <Text strong style={{ fontSize: 16 }}>
                Documents: {displayDocuments.length}
              </Text>
            </Space>
          }
          extra={
            <Space>
              {userRole === 'tenant' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={library.openUploadModal}
                >
                  Upload Document
                </Button>
              )}
              {userRole === 'landlord' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleUploadClick}
                  disabled={!selectedTenant}
                >
                  Upload Document
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={library.refresh}
              >
                Refresh
              </Button>
            </Space>
          }
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
                  <Upload.Dragger
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
                  </Upload.Dragger>
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
                <Upload.Dragger {...uploadProps} style={{ marginTop: 8 }}>
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
                </Upload.Dragger>
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
            
            const { v1Api } = await import('@/lib/api/v1-client');
            await v1Api.forms.promoteDocumentVersion(library.viewingDocument.id, versionIndex);
            message.success({ content: 'Version promoted successfully!', key: 'promote' });
            library.closeViewModal();
            setTimeout(() => {
              router.refresh();
              window.location.reload();
            }, 300);
          } catch (error) {
            console.error('[PersonalDocumentsContent] Promote version error:', error);
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
              
              if (metadata.files && metadata.files.length > 1) {
                return metadata.files.map((file, index) => ({
                  ...library.viewingDocument,
                  id: library.viewingDocument.id,
                  fileName: file.fileName,
                  originalName: file.originalName,
                  fileType: file.fileType,
                  fileSize: file.fileSize,
                  storagePath: file.storagePath,
                  viewUrl: null,
                  fileIndex: index,
                }));
              }
              
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
                    viewUrl: null,
                    versionIndex: index,
                    versionLabel: `Version ${index + 2}`
                  }))
                ];
              }
            } catch (e) {
              console.error('[PersonalDocumentsContent] Failed to parse metadata:', e);
            }
          }
          
          const doc = { ...library.viewingDocument };
          doc.viewUrl = null;
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
}

