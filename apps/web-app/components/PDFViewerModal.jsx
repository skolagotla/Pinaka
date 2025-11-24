"use client";
import { Modal, Button, Descriptions, Tag, Space, Typography, Badge, Input, Collapse, Alert, Image, Spin } from 'antd';
import { 
  DownloadOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  LeftOutlined, 
  RightOutlined,
  MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatDateDisplay, formatDateTimeDisplay } from '@/lib/utils/safe-date-formatter';
import { useState, useEffect } from 'react';
import DocumentChat from './DocumentChat';
import { 
  parseDocumentMetadata, 
  getVersionApprovalStatus, 
  getDeletionApprovalStatus 
} from '@/lib/utils/document-metadata';

const { Text } = Typography;
const { TextArea } = Input;

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
          const { v1Api } = await import('@/lib/api/v1-client');
          
          // Check if it's a rent payment receipt
          if (currentDoc.type === 'rent-receipt' || currentDoc.rentPaymentId) {
            const response = await v1Api.specialized.viewRentPaymentReceipt(currentDoc.rentPaymentId || currentDoc.id);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setViewUrl(url);
            return;
          }
          
          // Check if it's a maintenance ticket
          if (currentDoc.type === 'maintenance-ticket' || currentDoc.ticketNumber) {
            const response = await v1Api.specialized.downloadMaintenancePDF(currentDoc.id);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setViewUrl(url);
            return;
          }
          
          // Default to documents API (v1)
          const response = await v1Api.specialized.viewDocument(
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
    <Space wrap>
      <span>{documentTitle}</span>
      <Badge 
        count={`${activeIndex + 1} / ${documents.length}`} 
        style={{ backgroundColor: '#1890ff' }}
      />
      {currentDoc.versionLabel && (
        <Tag color="purple">{currentDoc.versionLabel}</Tag>
      )}
      {showMakeCurrentButton && (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // Calculate version index: activeIndex - 1 (because index 0 is current)
            const versionIndex = activeIndex - 1;
            console.log('[PDFViewerModal] Promoting version:', { versionIndex, activeIndex });
            onPromoteVersion(versionIndex);
          }}
          style={{ fontWeight: 600 }}
        >
          ⭐ Make Current
        </Button>
      )}
    </Space>
  ) : documentTitle;

  return (
    <>
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      width={width}
      footer={null}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Metadata Section - Inline Layout */}
        {showMetadata && metadata.length > 0 && (
          <div style={{ 
            background: '#fafafa',
            border: '1px solid #e8e8e8',
            borderRadius: '6px',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 40px' }}>
              {/* Row 1: Category | Uploaded By */}
              {(() => {
                const category = metadata.find(item => item.label === 'Category');
                const uploadedBy = metadata.find(item => item.label === 'Uploaded By');
                return (
                  <>
                    {category && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '80px', color: '#595959' }}>
                          {category.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
                          {category.render ? category.render(category.value) : category.value}
                        </div>
                      </div>
                    )}
                    {uploadedBy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '100px', color: '#595959' }}>
                          {uploadedBy.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '80px', color: '#595959' }}>
                          {totalFiles.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
                          {totalFiles.render ? totalFiles.render(totalFiles.value) : totalFiles.value}
                        </div>
                      </div>
                    )}
                    {uploaded && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '100px', color: '#595959' }}>
                          {uploaded.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '80px', color: '#595959' }}>
                          {status.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
                          {status.render ? status.render(status.value) : status.value}
                        </div>
                      </div>
                    )}
                    {approvedBy && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '100px', color: '#595959' }}>
                          {approvedBy.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ fontSize: '13px', minWidth: '80px', color: '#595959' }}>
                          {description.label}:
                        </Text>
                        <div style={{ fontSize: '13px', flex: 1 }}>
                          {description.render ? description.render(description.value) : description.value}
                        </div>
                      </div>
                    ) : <div></div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text strong style={{ fontSize: '13px', minWidth: '100px', color: '#595959' }}>
                        Actions:
                      </Text>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {onVerify && !currentDoc?.isVerified && !currentDoc?.isRejected && (
                          <Button
                            type="text"
                            size="small"
                            icon={<CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />}
                            onClick={() => setVerifyModalVisible(true)}
                            title="Approve"
                            style={{ padding: '4px', height: 'auto' }}
                          />
                        )}
                        {onReject && !currentDoc?.isRejected && (
                          <Button
                            type="text"
                            size="small"
                            icon={<CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
                            onClick={() => setRejectModalVisible(true)}
                            title="Reject"
                            style={{ padding: '4px', height: 'auto' }}
                          />
                        )}
                        {onDownload && currentDoc && (
                          <Button
                            type="text"
                            size="small"
                            icon={<DownloadOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                            onClick={() => onDownload(currentDoc)}
                            title="Download"
                            style={{ padding: '4px', height: 'auto' }}
                          />
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
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e8e8e8' }}>
                <Text strong style={{ fontSize: '13px', minWidth: '100px', color: '#595959' }}>
                  {item.label}:
                </Text>
                <div style={{ fontSize: '13px', flex: 1 }}>
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
            <Alert
              type={type}
              showIcon
              style={{ marginTop: '12px' }}
              message={message}
              description={description}
            />
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
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<CheckCircleOutlined />}
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
                    Approve Deletion
                  </Button>
                </div>
              )}
            </>
          );
        })()}

        {/* Default metadata for common document fields */}
        {showMetadata && !metadata.length && (
          <div style={{ position: 'relative' }}>
            <Descriptions column={2} size="small">
            {currentDoc.category && (
              <Descriptions.Item label="Category">
                {currentDoc.category}
              </Descriptions.Item>
            )}
            {currentDoc.fileSize && (
              <Descriptions.Item label="File Size">
                {formatFileSize(currentDoc.fileSize)}
              </Descriptions.Item>
            )}
            {currentDoc.uploadedAt && (
              <Descriptions.Item label="Uploaded">
                {formatDateTimeDisplay(currentDoc.uploadedAt)}
              </Descriptions.Item>
            )}
            {currentDoc.uploadedByName && (
              <Descriptions.Item label="Uploaded By">
                {currentDoc.uploadedByName}
              </Descriptions.Item>
            )}
            {currentDoc.isVerified !== undefined && (
              <Descriptions.Item label="Verification" span={2}>
                {currentDoc.isVerified ? (
                  <>
                    <Tag color="green">
                      <CheckCircleOutlined /> Verified
                    </Tag>
                    {currentDoc.verifiedAt && (
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        on {formatDateDisplay(currentDoc.verifiedAt)}
                      </Text>
                    )}
                  </>
                ) : (
                  <Tag color="default">Pending Verification</Tag>
                )}
              </Descriptions.Item>
            )}
            {currentDoc.expirationDate && (
              <Descriptions.Item label="Expiration" span={2}>
                <Space>
                  <Text>{formatDateDisplay(currentDoc.expirationDate)}</Text>
                  {getExpirationTag(currentDoc.expirationDate)}
                </Space>
              </Descriptions.Item>
            )}
            {currentDoc.description && (
              <Descriptions.Item label="Description" span={2}>
                {currentDoc.description}
              </Descriptions.Item>
            )}
            </Descriptions>
            
            {/* Floating Action Buttons - Only Approve/Reject */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0,
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {onVerify && (
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setVerifyModalVisible(true)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  title="Approve"
                />
              )}
              {onReject && (
                <Button
                  danger
                  shape="circle"
                  size="large"
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectModalVisible(true)}
                  title="Reject"
                />
              )}
            </div>
          </div>
        )}

        {/* Document Viewer */}
        {loadingViewUrl ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Loading document...</Text>
            </div>
          </div>
        ) : viewUrl ? (
          <div style={{ position: 'relative' }}>
            {/* PDF Viewer */}
            {isPDF && (
              <div style={{ height: '600px', border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
                <iframe
                  src={viewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={documentTitle}
                />
              </div>
            )}
            
            {/* Image Viewer */}
            {isImage && !isPDF && (
              <div style={{ textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '16px', backgroundColor: '#fafafa', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Image
                  src={viewUrl}
                  alt={documentTitle}
                  width={1200}
                  height={600}
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            )}

            {/* Video Viewer */}
            {isVideo && !isPDF && !isImage && (
              <div style={{ textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '16px', backgroundColor: '#000', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '600px' }}
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
                  icon={<LeftOutlined />}
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                  size="large"
                  shape="circle"
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid #d9d9d9',
                  }}
                  title="Previous"
                />
                
                {/* Next Button - Right Side */}
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNext}
                  disabled={!canGoNext}
                  size="large"
                  shape="circle"
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    border: '1px solid #d9d9d9',
                  }}
                  title="Next"
                />
              </>
            )}

            {/* Unsupported File Type */}
            {!isPDF && !isImage && !isVideo && viewUrl && (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                <Text type="secondary">
                  Preview not available for this file type. Please download to view.
                </Text>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
            <Text type="secondary">
              Document preview not available.
            </Text>
          </div>
        )}

        {/* Document Discussion/Chat */}
        {userRole && userName && currentDoc && (
          <Collapse
            size="small"
            items={
              {
                key: 'chat',
                label: (
                  <Space>
                    <MessageOutlined />
                    <Text strong>Discuss this Document</Text>
                  </Space>
                ),
                children: (
                  <DocumentChat
                    documentId={currentDoc.id}
                    document={currentDoc}
                    userRole={userRole}
                    userName={userName}
                  />
                ),
              },
            }
          />
        )}
      </Space>
    </Modal>

    {/* Rejection Confirmation Modal */}
    <Modal
      title="Reject Document"
      open={rejectModalVisible}
      onCancel={() => {
        setRejectModalVisible(false);
        setRejectionReason('');
      }}
      onOk={async () => {
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
      okText="Reject Document"
      okButtonProps={{ danger: true, loading: rejecting, disabled: !rejectionReason.trim() }}
      cancelButtonProps={{ disabled: rejecting }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text>
          Please provide a reason for rejecting this document. 
          {isMultiMode && ` This will reject all ${documents.length} files in this batch.`}
        </Text>
        <TextArea
          rows={4}
          placeholder="E.g., 'Document is blurry and unreadable', 'Wrong document type', 'Expired document'..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          maxLength={500}
          showCount
          disabled={rejecting}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          The uploader will be notified and can re-upload the correct document.
        </Text>
      </Space>
    </Modal>

    {/* Verification Confirmation Modal */}
    <Modal
      title="Verify Document"
      open={verifyModalVisible}
      onCancel={() => {
        setVerifyModalVisible(false);
        setVerificationComment('');
      }}
      onOk={async () => {
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
      okText="Verify Document"
      okButtonProps={{ loading: verifying, style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      cancelButtonProps={{ disabled: verifying }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text>
          You are about to verify this document.
          {isMultiMode && ` This will verify all ${documents.length} files in this batch.`}
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Optional: Add a comment about this verification (e.g., "All information verified and correct")
        </Text>
        <TextArea
          rows={3}
          placeholder="Optional comment..."
          value={verificationComment}
          onChange={(e) => setVerificationComment(e.target.value)}
          maxLength={300}
          showCount
          disabled={verifying}
        />
      </Space>
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
    return <Tag color="red">Expired</Tag>;
  } else if (daysRemaining <= 7) {
    return <Tag color="orange">{daysRemaining} days remaining</Tag>;
  } else if (daysRemaining <= 30) {
    return <Tag color="gold">{daysRemaining} days remaining</Tag>;
  } else {
    return <Tag color="green">{daysRemaining} days remaining</Tag>;
  }
}

