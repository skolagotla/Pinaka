/**
 * Shared PDF Viewer Modal Component
 * 
 * Uses browser's native PDF viewer for maximum reliability and simplicity.
 * No external libraries needed - just iframe with browser's built-in viewer.
 * 
 * Used across multiple pages:
 * - Landlord Library (personal documents + legal forms)
 * - Tenant Library (personal documents + legal forms)
 * - Landlord Rent Payments (receipts)
 * - Tenant Rent Receipts
 * - Landlord/Tenant Maintenance (tickets)
 */

"use client";

// Using Ant Design Modal, not MUI Dialog
import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Empty, Space, Spin } from 'antd';
import { DownloadOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

export default function PDFViewerModal({
  open,
  title,
  pdfUrl,
  onClose,
  onDownload,
  downloadFileName = 'document.pdf',
  width = 1000,
  height = 700,
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Fetch PDF as blob for better compatibility with authenticated endpoints
  useEffect(() => {
    if (!open || !pdfUrl) {
      // Cleanup previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
      return;
    }

    // Check if it's an external URL (not our API)
    const isExternalUrl = pdfUrl && (
      pdfUrl.startsWith('http://') || 
      pdfUrl.startsWith('https://')
    ) && typeof window !== 'undefined' && !pdfUrl.includes(window.location.hostname);

    // For external URLs, use directly (will show fallback)
    if (isExternalUrl) {
      // Cleanup previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setBlobUrl(null);
      return;
    }

    // For our API endpoints, fetch as blob
    setLoading(true);
    setError(null);
    
    fetch(pdfUrl, {
      credentials: 'include', // Include cookies for authentication
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        console.error('[PDFViewerModal] Error fetching PDF:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup blob URL on unmount or URL change
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [open, pdfUrl]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (pdfUrl) {
      // Default download behavior
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Don't render anything if there's no valid PDF URL
  if (!open || !pdfUrl) {
    return null;
  }

  // Validate that pdfUrl is a string and looks like a valid path/URL
  const isValidUrl = typeof pdfUrl === 'string' && pdfUrl.length > 0;
  if (!isValidUrl) {
    return null;
  }

  // Check if PDF URL is external (cross-origin)
  const isExternalUrl = pdfUrl && (
    pdfUrl.startsWith('http://') || 
    pdfUrl.startsWith('https://')
  ) && typeof window !== 'undefined' && !pdfUrl.includes(window.location.hostname);

  // Use blob URL if available, otherwise use original URL
  const displayUrl = blobUrl || pdfUrl;
  const pdfUrlWithParams = displayUrl.includes('#') ? displayUrl : `${displayUrl}#view=FitH`;

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button onClick={handleOpenInNewTab}>
            Open in New Tab
          </Button>
          <Space>
            <Button onClick={handleDownload} icon={<DownloadOutlined />}>
              Download
            </Button>
            <Button type="primary" onClick={onClose}>
              Close
            </Button>
          </Space>
        </div>
      }
      centered
      destroyOnClose
      closeIcon={<CloseOutlined />}
    >
      <div style={{ 
        height: `${height}px`, 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* For external URLs, show message and button to open in new tab */}
        {isExternalUrl ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px',
            textAlign: 'center'
          }}>
            <Empty 
              description={
                <div>
                  <p style={{ marginBottom: 16 }}>
                    This PDF is hosted on an external website and cannot be displayed inline due to browser security restrictions.
                  </p>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />}
                      onClick={handleOpenInNewTab}
                      size="large"
                    >
                      Open in New Tab
                    </Button>
                    <Button 
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      size="large"
                    >
                      Download PDF
                    </Button>
                  </Space>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px',
                textAlign: 'center'
              }}>
                <Spin size="large" />
                <p style={{ marginTop: 16 }}>Loading PDF...</p>
              </div>
            ) : error ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '40px',
                textAlign: 'center'
              }}>
                <Empty 
                  description={
                    <div>
                      <p>Error loading PDF: {error}</p>
                      <p style={{ marginTop: 16 }}>
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />}
                          onClick={handleOpenInNewTab}
                        >
                          Open in New Tab
                        </Button>
                      </p>
                    </div>
                  }
                />
              </div>
            ) : (
              /* Browser's Native PDF Viewer using iframe (better for authenticated endpoints) */
              <iframe
                src={pdfUrlWithParams}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title={title || 'PDF Document'}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
