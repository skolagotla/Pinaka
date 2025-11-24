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

// Using Flowbite Modal
import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spinner } from 'flowbite-react';
import { HiDownload, HiX, HiEye } from 'react-icons/hi';

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
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobUrlRef = useRef(null);

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
    
    // Create AbortController for cleanup
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    fetch(pdfUrl, {
      credentials: 'include', // Include cookies for authentication
      signal: controller.signal,
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          // Try to extract error message from JSON response
          let errorMessage = `Failed to fetch PDF: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
              if (errorData.details) {
                errorMessage += ` - ${errorData.details}`;
              }
            }
          } catch (e) {
            // If JSON parsing fails, use default message
          }
          throw new Error(errorMessage);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(err.message || 'Failed to load PDF');
        }
        console.error('Error fetching PDF:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [open, pdfUrl]);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (blobUrl || pdfUrl) {
      const link = document.createElement('a');
      link.href = blobUrl || pdfUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const displayUrl = blobUrl || pdfUrl;

  return (
    <Modal show={open} onClose={onClose} size="7xl">
      <Modal.Header>{title || 'PDF Viewer'}</Modal.Header>
      <Modal.Body>
        <div className="relative" style={{ minHeight: height }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <Spinner size="xl" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <HiX className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 font-semibold">Error loading PDF</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && displayUrl && (
            <iframe
              src={displayUrl}
              className="w-full border-0 rounded-lg"
              style={{ height: `${height}px`, minHeight: '500px' }}
              title={title || 'PDF Viewer'}
            />
          )}

          {!loading && !error && !displayUrl && (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <HiEye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No PDF URL provided</p>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between items-center w-full">
          <Button color="gray" onClick={onClose} className="flex items-center gap-2">
            <HiX className="h-4 w-4" />
            Close
          </Button>
          {(blobUrl || pdfUrl) && (
            <Button color="blue" onClick={handleDownload} className="flex items-center gap-2">
              <HiDownload className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
}
