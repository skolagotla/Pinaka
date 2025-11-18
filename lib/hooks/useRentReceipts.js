/**
 * Shared hook for rent receipt viewing and downloading
 * Used by both landlord rent payments and tenant rent receipts
 */

import { useState } from 'react';
import { App } from 'antd';

export function useRentReceipts() {
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  /**
   * View receipt in modal
   */
  async function handleViewReceipt(receipt, apiPath = '/api/rent-payments') {
    setSelectedReceipt(receipt);
    setPdfLoading(true);
    setIsModalOpen(true);
    
    try {
      // Tenant API uses /view, landlord API uses /view-pdf
      const endpoint = apiPath.includes('tenant-rent-receipts') 
        ? `${apiPath}/${receipt.id}/view`
        : `${apiPath}/${receipt.id}/view-pdf`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        message.error('Failed to load receipt');
      }
    } catch (error) {
      console.error('[useRentReceipts] View error:', error);
      message.error('Failed to load receipt');
    } finally {
      setPdfLoading(false);
    }
  }

  /**
   * Download receipt as PDF
   */
  async function handleDownloadReceipt(receipt, apiPath = '/api/rent-payments') {
    try {
      // Tenant API uses /download, landlord API uses /download-pdf
      const endpoint = apiPath.includes('tenant-rent-receipts') 
        ? `${apiPath}/${receipt.id}/download`
        : `${apiPath}/${receipt.id}/download-pdf`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${receipt.receiptNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('Receipt downloaded');
      } else {
        message.error('Failed to download receipt');
      }
    } catch (error) {
      console.error('[useRentReceipts] Download error:', error);
      message.error('Failed to download receipt');
    }
  }

  /**
   * Close modal and cleanup
   */
  function handleCloseModal() {
    setIsModalOpen(false);
    setSelectedReceipt(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl('');
    }
  }

  return {
    // State
    isModalOpen,
    selectedReceipt,
    pdfUrl,
    pdfLoading,
    
    // Actions
    handleViewReceipt,
    handleDownloadReceipt,
    handleCloseModal,
    
    // Setters (for advanced use)
    setSelectedReceipt,
  };
}

