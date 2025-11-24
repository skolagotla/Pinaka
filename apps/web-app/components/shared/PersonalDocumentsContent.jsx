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
  Card, Empty, Table, Button, Modal, Alert, Progress, 
  Select, Datepicker, Badge, Textarea, Label, Spinner
} from 'flowbite-react';
import {
  HiPlus, HiCloudUpload, HiInbox, HiDocumentText,
  HiTrash, HiRefresh
} from 'react-icons/hi';
import { notify } from '@/lib/utils/notification-helper';
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
      notify.warning('Please select a tenant first to upload documents.');
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
      notify.success('Document deleted successfully');
      library.closeDeleteModal();
      router.refresh();
    } catch (error) {
      console.error('[PersonalDocumentsContent] Delete error:', error);
      notify.error('Failed to delete document');
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
      <div className="p-6">
        {renderDocumentChecklist && renderDocumentChecklist()}

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiDocumentText className="h-5 w-5" />
              <h5 className="font-semibold text-base">
                Documents: {displayDocuments.length}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              {userRole === 'tenant' && (
                <Button
                  color="blue"
                  onClick={library.openUploadModal}
                  className="flex items-center gap-2"
                >
                  <HiPlus className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
              {userRole === 'landlord' && (
                <Button
                  color="blue"
                  onClick={handleUploadClick}
                  disabled={!selectedTenant}
                  className="flex items-center gap-2"
                >
                  <HiPlus className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
              <Button
                color="light"
                onClick={library.refresh}
                className="flex items-center gap-2"
              >
                <HiRefresh className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          {library.loading ? (
            <div className="text-center py-12">
              <Spinner size="xl" />
              <p className="mt-4 text-gray-500">Loading documents...</p>
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
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  {tableProps.columns?.map((col, idx) => (
                    <Table.HeadCell key={col.key || idx}>{col.title}</Table.HeadCell>
                  ))}
                </Table.Head>
                <Table.Body className="divide-y">
                  {documentsSearch.filteredData.map((record, idx) => (
                    <Table.Row key={record.id || idx}>
                      {tableProps.columns?.map((col, colIdx) => (
                        <Table.Cell key={col.key || colIdx}>
                          {col.render ? col.render(record[col.dataIndex], record, idx) : record[col.dataIndex]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Upload Modal */}
      <Modal
        show={library.uploadModalOpen}
        onClose={library.closeUploadModal}
        size="lg"
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
                  <p className="font-semibold">Uploading file {library.uploadProgress.current} of {library.uploadProgress.total}</p>
                  <Progress
                    progress={Math.round((library.uploadProgress.current / library.uploadProgress.total) * 100)}
                    color="blue"
                    className="mt-2"
                  />
                </div>
              </Alert>
            )}

            {userRole === 'tenant' ? (
              <>
                <div>
                  <Label className="mb-2 block font-semibold">Select Document Type</Label>
                  <Select
                    value={library.category || ''}
                    onChange={(e) => library.setCategory(e.target.value)}
                    className="w-full"
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
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <HiInbox className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG, DOC, DOCX</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) library.setSelectedFile(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {library.category && library.selectedFile && getCategoryById(library.category)?.requiresExpiration && (
                  <div>
                    <Label className="mb-2 block font-semibold">Expiration Date (if applicable)</Label>
                    <Datepicker
                      value={library.expirationDate}
                      onSelectedDateChanged={(date) => library.setExpirationDate(date)}
                      className="w-full mt-2"
                    />
                  </div>
                )}

                <div className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={library.closeUploadModal}>Cancel</Button>
                    <Button
                      color="blue"
                      onClick={library.handleUpload}
                      disabled={!library.category || !library.selectedFile}
                      className="flex items-center gap-2"
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
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className={library.category ? 'col-span-1' : 'col-span-2'}>
                    <Label className="mb-2 block font-semibold">Category <span className="text-red-500">*</span></Label>
                    <Select
                      value={library.category || ''}
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
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))
                      )}
                    </Select>
                  </div>
                  {library.category && (
                    <div>
                      <Label className="mb-2 block font-semibold">Expiration Date</Label>
                      <Datepicker
                        value={library.expirationDate}
                        onSelectedDateChanged={(date) => library.setExpirationDate(date)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">
                    Description {library.category === 'OTHER' && <span className="text-red-500">*</span>}
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder={library.category === 'OTHER' ? "Please provide description (required for Other documents)" : "Optional: Provide additional details"}
                    value={library.description}
                    onChange={(e) => library.setDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Upload File <span className="text-red-500">*</span></Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <HiInbox className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {library.category && getCategoryById(library.category).allowedFileTypes.join(', ')}
                          <br />You can upload multiple files at once
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept={library.category ? getCategoryById(library.category).allowedFileTypes.map(t => `.${t.toLowerCase()}`).join(',') : '.pdf,.jpg,.jpeg,.png,.doc,.docx'}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) library.setSelectedFile(files);
                        }}
                      />
                    </label>
                  </div>
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
              className="flex items-center gap-2"
            >
              {library.uploading ? (
                <>
                  <Spinner size="sm" />
                  {library.uploadProgress.total > 1 
                    ? `Uploading ${library.uploadProgress.current}/${library.uploadProgress.total}...`
                    : 'Uploading...'}
                </>
              ) : (
                'Upload'
              )}
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
            const hideLoading = notify.loading('Promoting version to current...');
            
            const { v2Api } = await import('@/lib/api/v2-client');
            await v2Api.forms.promoteDocumentVersion(library.viewingDocument.id, versionIndex);
            hideLoading();
            notify.success('Version promoted successfully');
            library.closeViewModal();
            setTimeout(() => {
              router.refresh();
              window.location.reload();
            }, 300);
          } catch (error) {
            console.error('[PersonalDocumentsContent] Promote version error:', error);
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
        show={library.deleteModal.visible}
        onClose={library.closeDeleteModal}
        size="md"
      >
        <Modal.Header>
          <div className="flex items-center gap-2">
            <HiTrash className="h-5 w-5 text-red-500" />
            <span>Delete Document</span>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Alert color="warning">
              <div>
                <p className="font-semibold">Document Deletion Confirmation</p>
                <p className="text-sm mt-1">
                  This document will be marked as deleted but retained in the system for legal audit purposes.
                </p>
              </div>
            </Alert>

            {library.deleteModal.document && (
              <div className="grid grid-cols-1 gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Document Name:</p>
                  <p>{library.deleteModal.document.originalName}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Category:</p>
                  <p>{getCategoryById(library.deleteModal.document.category)?.name || library.deleteModal.document.category}</p>
                </div>
                {userRole === 'landlord' && (
                  <div>
                    <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Uploaded By:</p>
                    <div className="flex items-center gap-2">
                      <Badge color={library.deleteModal.document.uploadedBy === 'landlord' ? 'blue' : 'green'}>
                        {library.deleteModal.document.uploadedBy === 'landlord' ? 'Landlord' : 'Tenant'}
                      </Badge>
                      <span>{library.deleteModal.document.uploadedByName}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">
                    {userRole === 'landlord' ? "Uploaded Date" : "Upload Date"}:
                  </p>
                  <p>{formatDateTimeDisplay(library.deleteModal.document.uploadedAt)}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-2 block font-semibold">
                Reason for Deletion {userRole === 'landlord' ? '(Optional but Recommended)' : ''}
              </Label>
              <Textarea
                rows={userRole === 'landlord' ? 4 : 3}
                placeholder="Please provide a reason for deleting this document..."
                value={library.deleteModal.reason}
                onChange={(e) => library.updateDeleteReason(e.target.value)}
                className="mt-2"
                disabled={library.deleteModal.loading}
              />
              {userRole === 'landlord' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
            className="flex items-center gap-2"
          >
            {library.deleteModal.loading ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="h-4 w-4" />
                Delete Document
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
