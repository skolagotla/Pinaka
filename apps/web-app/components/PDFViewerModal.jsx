"use client";
import { Modal, Button, Badge, Textarea, Label, Alert, Spinner } from 'flowbite-react';
import { 
  HiDownload, 
  HiCheckCircle,
  HiXCircle,
  HiArrowLeft, 
  HiArrowRight,
  HiChatAlt2
} from 'react-icons/hi';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useState, useEffect } from 'react';
import DocumentChat from './DocumentChat';
import { 
  parseDocumentMetadata, 
  getVersionApprovalStatus, 
  getDeletionApprovalStatus 
} from '@/lib/utils/document-metadata';

/**
 * PDFViewerModal Component
 * Reusable modal for viewing PDF, image, and video documents
 * Supports multi-document navigation (Previous/Next)
 * 
 * Single Document Usage:
 * <PDFViewerModal
 *   open={isOpen}
 *   document={viewingDocument}
 *   onClose={handleClose}
 *   onDownload={handleDownload}
 * />
 * 
 * Multiple Documents Usage:
 * <PDFViewerModal
 *   open={isOpen}
 *   documents={[doc1, doc2, doc3}
 *   currentIndex={0}
 *   onClose={handleClose}
 *   onDownload={handleDownload}
 *   onNavigate={(newIndex) => setCurrentIndex(newIndex)}
 * />
 */
export default function PDFViewerModal({
  open,
  visible, // Deprecated: kept for backward compatibility, use 'open' instead
  document = null,        // Single document (deprecated, use documents array)
  documents = [],         // Array of documents for navigation
  currentIndex = 0,       // Current document index in array
  onClose,
  onDownload,
  onVerify,               // Callback for verification: () => void
  onReject,               // Callback for rejection: (reason) => void
  onNavigate,             // Callback when user navigates: (newIndex) => void
  onPromoteVersion,       // Callback to promote a version: (versionIndex) => void
  onApproveDeletion,      // Callback to approve deletion: (reason) => void
  metadata = [],
  title = null,
  width = 900,
  showMetadata = true,
  userRole = null,        // "landlord" or "tenant" - for chat feature
  userName = null,        // Current user's display name - for chat feature
}) {
  // Support both single document and multi-document modes
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  
  // Rejection modal state
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  
  // Verification modal state
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verificationComment, setVerificationComment] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  // Determine if we're in multi-document mode
  const isMultiMode = documents.length > 1;
  // Support both old (document) and new (documents array) API
  const currentDoc = documents.length > 0 ? documents[activeIndex] : document;
  
  // Support both 'open' (v5) and 'visible' (deprecated) for backward compatibility
  const isOpen = open !== undefined ? open : (visible !== undefined ? visible : false);
  
  // Debug logging
  console.log('[PDFViewerModal] Rendering with:', { open: isOpen, documentsCount: documents.length, hasDocument: !!document, currentDoc: !!currentDoc, activeIndex });
  
  // Sync external currentIndex with internal activeIndex
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);
  
  if (!currentDoc) return null;

  const documentTitle = title || currentDoc.originalName || currentDoc.fileName || 'Document';
  const isPDF = currentDoc.fileType?.includes('pdf') || documentTitle.toLowerCase().endsWith('.pdf');
  const isImage = currentDoc.fileType?.includes('image') || 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(documentTitle);
  const isVideo = currentDoc.fileType?.includes('video') || 
    /\.(mp4|webm|ogg|mov)$/i.test(documentTitle);

  // State for async viewUrl loading
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loadingViewUrl, setLoadingViewUrl] = useState(false);

  // Build view URL (async for v1Api)
  useEffect(() => {
    const loadViewUrl = async () => {
      // If viewUrl is provided, use it (for legacy support)
      if (currentDoc.viewUrl) {
        setViewUrl(currentDoc.viewUrl);
        return;
      }
      
      // If it's a document with id but no viewUrl, use v1Api
      if (currentDoc.id && !currentDoc.viewUrl) {
        setLoadingViewUrl(true);
        try {
          const { v2Api } = await import('@/lib/api/v2-client');
          
          // Check if it's a rent payment receipt
          if (currentDoc.type === 'rent-receipt' || currentDoc.rentPaymentId) {
            const response = await v2Api.specialized.viewRentPaymentReceipt(currentDoc.rentPaymentId || currentDoc.id);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setViewUrl(url);
            return;
          }
          
          // Check if it's a maintenance ticket
          if (currentDoc.type === 'maintenance-ticket' || currentDoc.ticketNumber) {
            const response = await v2Api.specialized.downloadMaintenancePDF(currentDoc.id);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setViewUrl(url);
            return;
          }
          
          // Default to documents API (v1)
          const response = await v2Api.specialized.viewDocument(
            currentDoc.id,
            currentDoc.fileIndex,
            currentDoc.versionIndex
          );
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setViewUrl(url);
        } catch (error) {
          console.error('[PDFViewerModal] Error loading document:', error);
          setViewUrl(null);
        } finally {
          setLoadingViewUrl(false);
        }
        return;
      }
      setViewUrl(null);
    };

    if (isOpen && currentDoc) {
      loadViewUrl();
    } else {
      setViewUrl(null);
    }

    // Cleanup blob URL on unmount or when document changes
    return () => {
      if (viewUrl && viewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(viewUrl);
      }
    };
  }, [isOpen, currentDoc?.id, currentDoc?.viewUrl, currentDoc?.fileIndex, currentDoc?.versionIndex]);
  
  // Navigation handlers
  const handlePrevious = () => {
    const newIndex = activeIndex - 1;
    setActiveIndex(newIndex);
    if (onNavigate) onNavigate(newIndex);
  };
  
  const handleNext = () => {
    const newIndex = activeIndex + 1;
    setActiveIndex(newIndex);
    if (onNavigate) onNavigate(newIndex);
  };
  
  const canGoPrevious = isMultiMode && activeIndex > 0;
  const canGoNext = isMultiMode && activeIndex < documents.length - 1;

  // Check if we should show the "Make Current" button
  const showMakeCurrentButton = currentDoc?.versionLabel && 
                                 currentDoc.versionLabel !== 'Current Version' && 
                                 typeof onPromoteVersion === 'function';

  // Modal title with document counter for multi-mode
  const modalTitle = isMultiMode ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span>{documentTitle}</span>
      <Badge color="blue">
        {activeIndex + 1} / {documents.length}
      </Badge>
      {currentDoc.versionLabel && (
        <Badge color="purple">{currentDoc.versionLabel}</Badge>
      )}
      {showMakeCurrentButton && (
        <Button
          color="blue"
          size="sm"
          onClick={() => {
            // Calculate version index: activeIndex - 1 (because index 0 is current)
            const versionIndex = activeIndex - 1;
            console.log('[PDFViewerModal] Promoting version:', { versionIndex, activeIndex });
            onPromoteVersion(versionIndex);
          }}
          className="font-semibold"
        >
          ⭐ Make Current
        </Button>
      )}
    </div>
  ) : documentTitle;

  return (
    <>
    <Modal
      show={isOpen}
      onClose={onClose}
      size="7xl"
    >
      <Modal.Header>{modalTitle}</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
        {/* Metadata Section - Inline Layout */}
        {showMetadata && metadata.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-x-10 gap-y-2">
              {/* Row 1: Category | Uploaded By */}
              {(() => {
                const category = metadata.find(item => item.label === 'Category');
                const uploadedBy = metadata.find(item => item.label === 'Uploaded By');
                return (
                  <>
                    {category && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[80px] text-gray-600 dark:text-gray-400">
                          {category.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {category.render ? category.render(category.value) : category.value}
                        </div>
                      </div>
                    )}
                    {uploadedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[100px] text-gray-600 dark:text-gray-400">
                          {uploadedBy.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {uploadedBy.render ? uploadedBy.render(uploadedBy.value) : uploadedBy.value}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Row 2: Total Files | Uploaded */}
              {(() => {
                const totalFiles = metadata.find(item => item.label === 'Total Files');
                const uploaded = metadata.find(item => item.label === 'Uploaded');
                return (
                  <>
                    {totalFiles && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[80px] text-gray-600 dark:text-gray-400">
                          {totalFiles.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {totalFiles.render ? totalFiles.render(totalFiles.value) : totalFiles.value}
                        </div>
                      </div>
                    )}
                    {uploaded && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[100px] text-gray-600 dark:text-gray-400">
                          {uploaded.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {uploaded.render ? uploaded.render(uploaded.value) : uploaded.value}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Row 3: Status | Approved By */}
              {(() => {
                const status = metadata.find(item => item.label === 'Status');
                const approvedBy = metadata.find(item => item.label === 'Approved By');
                return (
                  <>
                    {status && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[80px] text-gray-600 dark:text-gray-400">
                          {status.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {status.render ? status.render(status.value) : status.value}
                        </div>
                      </div>
                    )}
                    {approvedBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[100px] text-gray-600 dark:text-gray-400">
                          {approvedBy.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {approvedBy.render ? approvedBy.render(approvedBy.value) : approvedBy.value}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Row 4: Description | Actions */}
              {(() => {
                const description = metadata.find(item => item.label === 'Description');
                return (
                  <>
                    {description ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold min-w-[80px] text-gray-600 dark:text-gray-400">
                          {description.label}:
                        </span>
                        <div className="text-xs flex-1">
                          {description.render ? description.render(description.value) : description.value}
                        </div>
                      </div>
                    ) : <div></div>}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold min-w-[100px] text-gray-600 dark:text-gray-400">
                        Actions:
                      </span>
                      <div className="flex gap-1">
                        {onVerify && !currentDoc?.isVerified && !currentDoc?.isRejected && (
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => setVerifyModalVisible(true)}
                            title="Approve"
                          >
                            <HiCheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {onReject && !currentDoc?.isRejected && (
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => setRejectModalVisible(true)}
                            title="Reject"
                          >
                            <HiXCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        {onDownload && currentDoc && (
                          <Button
                            color="light"
                            size="sm"
                            className="p-1 h-auto"
                            onClick={() => onDownload(currentDoc)}
                            title="Download"
                          >
                            <HiDownload className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Full-Width Fields Below (Expiration only - approval/rejection notes moved to chat) */}
            {metadata.filter(item => 
              ['Expiration'].includes(item.label)
            ).map((item, index) => (
              <div key={index} className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold min-w-[100px] text-gray-600 dark:text-gray-400">
                  {item.label}:
                </span>
                <div className="text-xs flex-1">
                  {item.render ? item.render(item.value) : item.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Version Promotion / Mutual Approval Alert */}
        {(() => {
          // Parse metadata and get approval status
          const metadata = parseDocumentMetadata(currentDoc?.metadata);
          if (!metadata?.lastPromoted) return null;

          const approvalStatus = getVersionApprovalStatus(metadata, userRole);
          
          // Don't show if fully approved
          if (approvalStatus.bothApproved && currentDoc?.isVerified) return null;

          const promotedDate = new Date(metadata.lastPromoted.at);
          const formattedDate = promotedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });

          const promoterRole = metadata.lastPromoted.byRole;
          const promoterName = metadata.lastPromoted.by;
          const fromVersion = metadata.lastPromoted.fromVersion;
          
          let message, description, type;

          if (approvalStatus.requiresApproval) {
            // Mutual approval workflow
            if (userRole === 'landlord') {
              if (approvalStatus.landlordApproved && !approvalStatus.tenantApproved) {
                type = 'info';
                message = `Version ${fromVersion} promoted - Awaiting tenant approval`;
                description = promoterRole === 'landlord'
                  ? `You promoted this version on ${formattedDate}, which counts as your approval. Waiting for tenant to approve.`
                  : `${promoterName} promoted this version on ${formattedDate}. You approved it, now waiting for tenant approval.`;
              } else if (!approvalStatus.landlordApproved && approvalStatus.tenantApproved) {
                type = 'warning';
                message = `Version ${fromVersion} promoted - Your approval needed`;
                description = `${promoterName} changed this document to a different version on ${formattedDate} and the tenant has approved it. You must also approve this change.`;
              } else {
                type = 'warning';
                message = `Version ${fromVersion} promoted - Mutual approval required`;
                description = `This version was promoted on ${formattedDate}. Both parties must approve this change.`;
              }
            } else {
              // Tenant view
              if (approvalStatus.tenantApproved && !approvalStatus.landlordApproved) {
                type = 'info';
                message = 'Document version changed - Awaiting landlord approval';
                description = promoterRole === 'tenant'
                  ? `You promoted this version on ${formattedDate}, which counts as your approval. Waiting for landlord to approve.`
                  : `${promoterName} promoted this version on ${formattedDate}. You approved it, now waiting for landlord approval.`;
              } else if (!approvalStatus.tenantApproved && approvalStatus.landlordApproved) {
                type = 'warning';
                message = 'Document version changed - Your approval needed';
                description = `Your landlord changed this document to a different version on ${formattedDate}. By promoting this version, they've approved it. You must also approve this change for it to be official.`;
              } else {
                type = 'warning';
                message = 'Document version changed - Mutual approval required';
                description = `This version was promoted on ${formattedDate}. Both parties must approve this change.`;
              }
            }
          } else {
            // Standard approval workflow
            type = userRole === 'landlord' ? 'warning' : 'info';
            message = userRole === 'landlord'
              ? `Version ${fromVersion} promoted to current`
              : 'Document version was changed';
            description = userRole === 'landlord'
              ? `You promoted this version on ${formattedDate}. This document now requires re-approval.`
              : `Your landlord changed this document to a different version on ${formattedDate}. It is now awaiting their approval.`;
          }

          return (
            <Alert color={type === 'error' ? 'failure' : type === 'warning' ? 'warning' : 'info'} className="mt-3">
              <div>
                <p className="font-semibold mb-1">{message}</p>
                <p className="text-sm">{description}</p>
              </div>
            </Alert>
          );
        })()}

        {/* Pending Deletion Alert */}
        {(() => {
          // Parse metadata and get deletion status
          const metadata = parseDocumentMetadata(currentDoc?.metadata);
          const deletionStatus = getDeletionApprovalStatus(metadata, userRole);
          
          if (!deletionStatus.hasPendingDeletion) return null;

          const requestedDate = new Date(deletionStatus.requestedAt);
          const formattedDate = requestedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });

          const requesterRole = deletionStatus.requesterRole;
          const requesterName = deletionStatus.requesterName;
          
          let message, description, type;

          if (userRole === 'landlord') {
            if (deletionStatus.landlordApproved && !deletionStatus.tenantApproved) {
              type = 'info';
              message = 'Deletion Requested - Awaiting tenant approval';
              description = requesterRole === 'landlord'
                ? `You requested deletion on ${formattedDate}. Waiting for tenant to approve before this document is permanently deleted.`
                : `${requesterName} requested deletion on ${formattedDate}. You approved it, now waiting for tenant approval.`;
            } else if (!deletionStatus.landlordApproved && deletionStatus.tenantApproved) {
              type = 'error';
              message = 'Deletion Requested - Your approval needed';
              description = `${requesterName} requested to delete this document on ${formattedDate}. The tenant has approved. You must also approve to permanently delete it.`;
            }
          } else {
            // Tenant view
            if (deletionStatus.tenantApproved && !deletionStatus.landlordApproved) {
              type = 'info';
              message = 'Deletion Requested - Awaiting landlord approval';
              description = requesterRole === 'tenant'
                ? `You requested deletion on ${formattedDate}. Waiting for landlord to approve before this document is permanently deleted.`
                : `${requesterName} requested deletion on ${formattedDate}. You approved it, now waiting for landlord approval.`;
            } else if (!deletionStatus.tenantApproved && deletionStatus.landlordApproved) {
              type = 'error';
              message = 'Deletion Requested - Your approval needed';
              description = `Your landlord requested to delete this document on ${formattedDate} and has approved it. You must also approve to permanently delete it.`;
            }
          }

          const needsApproval = onApproveDeletion && !deletionStatus.userApproved;
          const deletionReason = deletionStatus.deletionInfo?.landlordApproval?.reason || 
                                deletionStatus.deletionInfo?.tenantApproval?.reason;

          return (
            <>
              <Alert
                type={type}
                showIcon
                style={{ marginTop: '12px' }}
                message={message}
                description={description}
              />
              {/* Approve Deletion Button */}
              {needsApproval && (
                <div className="mt-3 text-center">
                  <Button
                    color="failure"
                    size="lg"
                    className="flex items-center gap-2"
                    onClick={() => {
                      const confirmDelete = window.confirm(
                        `Are you sure you want to approve the deletion of this document?\n\n` +
                        `Reason: ${deletionReason}\n\n` +
                        `This action cannot be undone once both parties approve.`
                      );
                      if (confirmDelete) {
                        onApproveDeletion();
                      }
                    }}
                  >
                    <HiCheckCircle className="h-5 w-5" />
                    Approve Deletion
                  </Button>
                </div>
              )}
            </>
          );
        })()}

        {/* Default metadata for common document fields */}
        {showMetadata && !metadata.length && (
          <div className="relative">
            <div className="grid grid-cols-2 gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {currentDoc.category && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Category:</span>
                <p className="text-sm">{currentDoc.category}</p>
              </div>
            )}
            {currentDoc.fileSize && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">File Size:</span>
                <p className="text-sm">{formatFileSize(currentDoc.fileSize)}</p>
              </div>
            )}
            {currentDoc.uploadedAt && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded:</span>
                <p className="text-sm">{formatDateTimeDisplay(currentDoc.uploadedAt)}</p>
              </div>
            )}
            {currentDoc.uploadedByName && (
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Uploaded By:</span>
                <p className="text-sm">{currentDoc.uploadedByName}</p>
              </div>
            )}
            {currentDoc.isVerified !== undefined && (
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Verification:</span>
                <div className="flex items-center gap-2 mt-1">
                  {currentDoc.isVerified ? (
                    <>
                      <Badge color="success" icon={HiCheckCircle}>
                        Verified
                      </Badge>
                      {currentDoc.verifiedAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          on {formatDateDisplay(currentDoc.verifiedAt)}
                        </span>
                      )}
                    </>
                  ) : (
                    <Badge color="gray">Pending Verification</Badge>
                  )}
                </div>
              </div>
            )}
            {currentDoc.expirationDate && (
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Expiration:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm">{formatDateDisplay(currentDoc.expirationDate)}</span>
                  {getExpirationTag(currentDoc.expirationDate)}
                </div>
              </div>
            )}
            {currentDoc.description && (
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Description:</span>
                <p className="text-sm">{currentDoc.description}</p>
              </div>
            )}
            </div>
            
            {/* Floating Action Buttons - Only Approve/Reject */}
            <div className="absolute top-0 right-0 flex gap-2 z-10">
              {onVerify && (
                <Button
                  color="success"
                  className="rounded-full p-2"
                  onClick={() => setVerifyModalVisible(true)}
                  title="Approve"
                >
                  <HiCheckCircle className="h-5 w-5" />
                </Button>
              )}
              {onReject && (
                <Button
                  color="failure"
                  className="rounded-full p-2"
                  onClick={() => setRejectModalVisible(true)}
                  title="Reject"
                >
                  <HiXCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Document Viewer */}
        {loadingViewUrl ? (
          <div className="text-center py-10">
            <Spinner size="xl" />
            <div className="mt-4">
              <span className="text-gray-500 dark:text-gray-400">Loading document...</span>
            </div>
          </div>
        ) : viewUrl ? (
          <div style={{ position: 'relative' }}>
            {/* PDF Viewer */}
            {isPDF && (
              <div className="h-[600px] border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <iframe
                  src={viewUrl}
                  className="w-full h-full border-0"
                  title={documentTitle}
                />
              </div>
            )}
            
            {/* Image Viewer */}
            {isImage && !isPDF && (
              <div className="text-center border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[600px] flex items-center justify-center relative">
                <img
                  src={viewUrl}
                  alt={documentTitle}
                  className="max-w-full max-h-[600px] object-contain"
                />
              </div>
            )}

            {/* Video Viewer */}
            {isVideo && !isPDF && !isImage && (
              <div className="text-center border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-black min-h-[600px] flex items-center justify-center">
                <video
                  controls
                  className="max-w-full max-h-[600px]"
                  src={viewUrl}
                >
                  <source src={viewUrl} type={currentDoc.fileType || 'video/mp4'} />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Floating Navigation Buttons for Multi-Document Mode */}
            {isMultiMode && (
              <>
                {/* Previous Button - Left Side */}
                <Button
                  color="light"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] rounded-full p-3 bg-white/95 shadow-md border border-gray-300"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  title="Previous"
                >
                  <HiArrowLeft className="h-5 w-5" />
                </Button>
                
                {/* Next Button - Right Side */}
                <Button
                  color="light"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] rounded-full p-3 bg-white/95 shadow-md border border-gray-300"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  title="Next"
                >
                  <HiArrowRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Unsupported File Type */}
            {!isPDF && !isImage && !isVideo && viewUrl && (
              <div className="text-center py-10 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-gray-500 dark:text-gray-400">
                  Preview not available for this file type. Please download to view.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 border border-gray-300 dark:border-gray-600 rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">
              Document preview not available.
            </span>
          </div>
        )}

        {/* Document Discussion/Chat */}
        {userRole && userName && currentDoc && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
              <HiChatAlt2 className="h-5 w-5" />
              <h5 className="font-semibold">Discuss this Document</h5>
            </div>
            <div className="p-4">
              <DocumentChat
                documentId={currentDoc.id}
                document={currentDoc}
                userRole={userRole}
                    userName={userName}
                  />
            </div>
          </div>
        )}
          </div>
        </Modal.Body>
      </Modal>

    {/* Rejection Confirmation Modal */}
    <Modal
      show={rejectModalVisible}
      onClose={() => {
        setRejectModalVisible(false);
        setRejectionReason('');
      }}
      size="md"
    >
      <Modal.Header>Reject Document</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p>
            Please provide a reason for rejecting this document. 
            {isMultiMode && ` This will reject all ${documents.length} files in this batch.`}
          </p>
          <div>
            <Label className="mb-2 block">Rejection Reason</Label>
            <Textarea
              rows={4}
              placeholder="E.g., 'Document is blurry and unreadable', 'Wrong document type', 'Expired document'..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              disabled={rejecting}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {rejectionReason.length} / 500 characters
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            The uploader will be notified and can re-upload the correct document.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="gray"
          onClick={() => {
            setRejectModalVisible(false);
            setRejectionReason('');
          }}
          disabled={rejecting}
        >
          Cancel
        </Button>
        <Button
          color="failure"
          onClick={async () => {
            if (!rejectionReason.trim()) {
              return;
            }
            setRejecting(true);
            try {
              await onReject(rejectionReason.trim());
              setRejectModalVisible(false);
              setRejectionReason('');
              onClose(); // Close main modal after rejection
            } finally {
              setRejecting(false);
            }
          }}
          disabled={rejecting || !rejectionReason.trim()}
        >
          {rejecting ? (
            <>
              <Spinner size="sm" />
              Rejecting...
            </>
          ) : (
            'Reject Document'
          )}
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Verification Confirmation Modal */}
    <Modal
      show={verifyModalVisible}
      onClose={() => {
        setVerifyModalVisible(false);
        setVerificationComment('');
      }}
      size="md"
    >
      <Modal.Header>Verify Document</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p>
            You are about to verify this document.
            {isMultiMode && ` This will verify all ${documents.length} files in this batch.`}
          </p>
          <div>
            <Label className="mb-2 block">Verification Comment (Optional)</Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Add a comment about this verification (e.g., "All information verified and correct")
            </p>
            <Textarea
              rows={3}
              placeholder="Optional comment..."
              value={verificationComment}
              onChange={(e) => setVerificationComment(e.target.value)}
              maxLength={300}
              disabled={verifying}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {verificationComment.length} / 300 characters
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="gray"
          onClick={() => {
            setVerifyModalVisible(false);
            setVerificationComment('');
          }}
          disabled={verifying}
        >
          Cancel
        </Button>
        <Button
          color="success"
          onClick={async () => {
            console.log('[PDFViewerModal] Verify clicked, onVerify:', typeof onVerify);
            if (!onVerify) {
              console.error('[PDFViewerModal] onVerify is not defined');
              return;
            }
            setVerifying(true);
            try {
              await onVerify(verificationComment.trim() || null);
              setVerifyModalVisible(false);
              setVerificationComment('');
              onClose(); // Close main modal after verification
            } catch (error) {
              console.error('[PDFViewerModal] Verification error:', error);
            } finally {
              setVerifying(false);
            }
          }}
          disabled={verifying}
        >
          {verifying ? (
            <>
              <Spinner size="sm" />
              Verifying...
            </>
          ) : (
            'Verify Document'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to get expiration status tag
function getExpirationTag(expirationDate) {
  if (!expirationDate) return null;
  
  const now = dayjs();
  const expiry = dayjs(expirationDate);
  const daysRemaining = expiry.diff(now, 'day');
  
  if (daysRemaining < 0) {
    return <Badge color="failure">Expired</Badge>;
  } else if (daysRemaining <= 7) {
    return <Badge color="warning">{daysRemaining} days remaining</Badge>;
  } else if (daysRemaining <= 30) {
    return <Badge color="warning">{daysRemaining} days remaining</Badge>;
  } else {
    return <Badge color="success">{daysRemaining} days remaining</Badge>;
  }
}

