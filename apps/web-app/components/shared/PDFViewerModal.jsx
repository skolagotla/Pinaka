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
import { Modal, Button, Empty } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';

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

  // Add #view=FitH to force browser's PDF viewer to open properly
  const pdfUrlWithParams = pdfUrl.includes('#') ? pdfUrl : `${pdfUrl}#view=FitH`;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      footer={null}
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
        {/* Browser's Native PDF Viewer using object tag (more reliable than iframe) */}
        <object
          data={pdfUrlWithParams}
          type="application/pdf"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          aria-label={title || 'PDF Document'}
        >
          {/* Fallback if PDF can't be displayed inline */}
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
                  <p>Your browser cannot display this PDF inline.</p>
                  <p style={{ marginTop: 8 }}>Please use the download button or open in a new tab.</p>
                </div>
              }
            />
          </div>
        </object>
      </div>
    </Modal>
  );
}
