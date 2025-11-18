/**
 * useDocumentVault Hook
 * Centralized document management logic for both landlord and tenant
 * 
 * Features:
 * - Document CRUD operations
 * - Upload validation
 * - Expiration status calculation
 * - Category filtering
 * - File type detection
 * - Verification workflow (landlord)
 * 
 * Usage (Tenant):
 * const vault = useDocumentVault({ userRole: 'tenant' });
 * 
 * Usage (Landlord):
 * const vault = useDocumentVault({ 
 *   userRole: 'landlord', 
 *   selectedTenantId: tenantId 
 * });
 */

import { useState, useCallback, useEffect } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import { useUnifiedApi } from './useUnifiedApi';

export function useDocumentVault({ 
  userRole, 
  selectedTenantId = null,
  selectedPropertyId = null, // Property-centric: Property ID for document linking
  initialDocuments = []
}) {
  const { message } = App.useApp();
  const { fetch } = useUnifiedApi();
  
  // State management
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null); // Can be single file or array of files
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 }); // For multiple uploads

  // Calculate expiration status
  const getExpirationStatus = useCallback((expirationDate) => {
    if (!expirationDate) return null;
    
    const now = dayjs();
    const expiry = dayjs(expirationDate);
    const daysRemaining = expiry.diff(now, 'day');
    
    if (daysRemaining < 0) {
      return { status: 'expired', daysRemaining, color: 'red', text: 'Expired' };
    } else if (daysRemaining <= 7) {
      return { status: 'urgent', daysRemaining, color: 'orange', text: `${daysRemaining}d left` };
    } else if (daysRemaining <= 30) {
      return { status: 'warning', daysRemaining, color: 'gold', text: `${daysRemaining}d left` };
    } else {
      return { status: 'valid', daysRemaining, color: 'green', text: `${daysRemaining}d left` };
    }
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Get file icon type
  const getFileIcon = useCallback((fileType) => {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('word') || fileType.includes('doc')) return 'word';
    return 'text';
  }, []);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    // For landlord or PMC, don't fetch if no tenant selected
    if ((userRole === 'landlord' || userRole === 'pmc') && !selectedTenantId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use v1Api for document listing
      const { v1Api } = await import('@/lib/api/v1-client');
      const query = {};
      
      // If landlord/PMC and tenant selected, filter by tenantId
      if ((userRole === 'landlord' || userRole === 'pmc') && selectedTenantId) {
        query.tenantId = selectedTenantId;
      }
      
      const response = await v1Api.documents.list(query);
      const documents = response.data || response.documents || [];
      setDocuments(documents);
    } catch (error) {
      console.error('[useDocumentVault] Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole, selectedTenantId]);

  // Fetch document status (landlord and PMC only)
  // Calculate status from documents list instead of separate endpoint
  const fetchDocumentStatus = useCallback(async () => {
    if ((userRole !== 'landlord' && userRole !== 'pmc') || !selectedTenantId) return;
    
    try {
      // Use v1Api to get documents and calculate status
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.documents.list({ tenantId: selectedTenantId });
      const documents = response.data || response.documents || [];
      
      // Calculate status from documents
      const status = {
        total: documents.length,
        verified: documents.filter(d => d.isVerified).length,
        rejected: documents.filter(d => d.isRejected).length,
        pending: documents.filter(d => !d.isVerified && !d.isRejected).length,
        expired: documents.filter(d => d.expirationDate && new Date(d.expirationDate) < new Date()).length,
      };
      
      setDocumentStatus(status);
    } catch (error) {
      console.error('[useDocumentVault] Error fetching document status:', error);
    }
  }, [userRole, selectedTenantId]);

  // Upload document
  const handleUpload = useCallback(async () => {
    // Handle both array and single file for backward compatibility
    const filesToUpload = Array.isArray(selectedFile) 
      ? selectedFile.map(f => f.originFileObj || f) 
      : (selectedFile ? [selectedFile] : []);
    
    if (filesToUpload.length === 0) {
      message.error("Please select at least one file to upload");
      return false;
    }

    if (!category) {
      message.error("Please select a document category");
      return false;
    }

    // Description is mandatory only for "Other" category
    if (category === 'OTHER' && (!description || !description ? description.trim() : "")) {
      message.error("Please provide a description for 'Other' document type");
      return false;
    }

    console.log('[Library] Starting upload with:', {
      fileCount: filesToUpload.length,
      category,
      description,
      userRole,
      selectedTenantId,
      expirationDate: expirationDate ? expirationDate.toISOString() : null
    });

    setUploading(true);
    setUploadProgress({ current: 0, total: filesToUpload.length });
    
    try {
      // Use batch API for multiple files, single API for one file
      if (filesToUpload.length > 1) {
        // BATCH UPLOAD: Create ONE document with all files
        const formData = new FormData();
        
        // Append all files
        filesToUpload.forEach(file => {
        formData.append("file", file);
      });
      
      formData.append("category", category);
      formData.append("description", description ? description.trim() : "");
      
      // For landlord uploading for tenant
      if (userRole === 'landlord' && selectedTenantId) {
        formData.append("tenantId", selectedTenantId);
      }
      
      // Property-centric: Include propertyId if provided (API will infer if not provided)
      if (selectedPropertyId) {
        formData.append("propertyId", selectedPropertyId);
      }
        
        if (subcategory) formData.append("subcategory", subcategory);
        if (expirationDate) formData.append("expirationDate", expirationDate.toISOString());
        tags.forEach(tag => formData.append("tags", tag));

        // Use v1Api for batch upload - upload files sequentially
        const { v1Api } = await import('@/lib/api/v1-client');
        const uploadPromises = filesToUpload.map(async (file) => {
          const singleFormData = new FormData();
          singleFormData.append("file", file);
          singleFormData.append("category", category);
          singleFormData.append("description", description ? description.trim() : "");
          if (userRole === 'landlord' && selectedTenantId) {
            singleFormData.append("tenantId", selectedTenantId);
          }
          if (selectedPropertyId) {
            singleFormData.append("propertyId", selectedPropertyId);
          }
          
          const response = await fetch("/api/v1/documents/upload", {
            method: "POST",
            credentials: 'include',
            body: singleFormData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload document');
          }
          return response.json();
        });
        
        await Promise.all(uploadPromises);
        message.success(`All ${filesToUpload.length} files uploaded successfully!`);
      } else {
        // SINGLE FILE UPLOAD: Use existing API
        const file = filesToUpload[0];
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        formData.append("description", description ? description.trim() : "");
        
        // For landlord uploading for tenant
        if (userRole === 'landlord' && selectedTenantId) {
          formData.append("tenantId", selectedTenantId);
        }
        
        // Property-centric: Include propertyId if provided (API will infer if not provided)
        if (selectedPropertyId) {
          formData.append("propertyId", selectedPropertyId);
        }
        
        if (subcategory) formData.append("subcategory", subcategory);
        if (expirationDate) formData.append("expirationDate", expirationDate.toISOString());
        tags.forEach(tag => formData.append("tags", tag));

        // Use v1Api for document upload
        const uploadResponse = await fetch("/api/v1/documents/upload", {
          method: "POST",
          credentials: 'include',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json().catch(() => ({}));
          throw new Error(error.error || error.message || 'Failed to upload document');
        }

        message.success("Document uploaded successfully");
      }
      
      await fetchDocuments();
      await fetchDocumentStatus();
      
      // Reset form
      resetUploadForm();
      setUploadModalOpen(false);
      
      return true;
    } catch (error) {
      console.error("[Library] Upload error:", error);
      message.error("Failed to upload document");
      return false;
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  }, [selectedFile, documentName, category, subcategory, description, expirationDate, tags, 
      userRole, selectedTenantId, selectedPropertyId, message, fetchDocuments, fetchDocumentStatus]);

  // Delete document
  const handleDelete = useCallback(async (docId, reason = null) => {
    try {
      // Use v1Api for document deletion
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.documents.delete(docId);
      
      // Note: If reason is needed, it would need to be passed via update before delete
      // or a specialized endpoint would need to be created

      message.success("Document deleted successfully");
      await fetchDocuments();
      await fetchDocumentStatus();
      return true;
    } catch (error) {
      console.error('[useDocumentVault] Error deleting document:', error);
      message.error(error.message || 'Failed to delete document');
      return false;
    }
  }, [message, fetchDocuments, fetchDocumentStatus]);

  // Verify document (both landlord and tenant)
  const handleVerify = useCallback(async (docId, verificationComment = null) => {
    try {
      console.log('[Library] Verifying document:', docId, 'Role:', userRole, 'Comment:', verificationComment);
      
      // Use v1Api to update document with verification
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.documents.update(docId, {
        isVerified: true,
        verificationComment: verificationComment || null,
        isRejected: false, // Clear rejection if verifying
        rejectionReason: null,
      });

      message.success("Document verified successfully");
      await fetchDocuments();
      if (userRole === 'landlord' || userRole === 'pmc') {
        await fetchDocumentStatus();
      }
      return true;
    } catch (error) {
      console.error('[useDocumentVault] Error verifying document:', error);
      message.error(error.message || 'Failed to verify document');
      return false;
    }
  }, [userRole, message, fetchDocuments, fetchDocumentStatus]);

  // Reject document (both landlord and tenant)
  const handleReject = useCallback(async (docId, rejectionReason) => {
    try {
      console.log('[Library] Rejecting document:', docId, 'Role:', userRole);
      
      // Use v1Api to update document with rejection
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.documents.update(docId, {
        isRejected: true,
        rejectionReason: rejectionReason || null,
        isVerified: false, // Clear verification if rejecting
        verificationComment: null,
      });

      message.success("Document rejected. The uploader has been notified.");
      await fetchDocuments();
      if (userRole === 'landlord' || userRole === 'pmc') {
        await fetchDocumentStatus();
      }
      return true;
    } catch (error) {
      console.error('[useDocumentVault] Error rejecting document:', error);
      message.error(error.message || 'Failed to reject document');
      return false;
    }
  }, [userRole, message, fetchDocuments, fetchDocumentStatus]);

  // View document
  const handleView = useCallback((doc) => {
    console.log('[Library] handleView called with doc:', {
      id: doc.id,
      documentHash: doc.documentHash,
      originalName: doc.originalName,
      hasMetadata: !!doc.metadata,
      metadata: doc.metadata,
    });
    setViewingDocument(doc);
    setViewModalOpen(true);
  }, []);

  // Download document
  const handleDownload = useCallback((doc) => {
    // Use v1Api for document view/download
    window.open(`/api/v1/documents/${doc.id}/view`, '_blank');
  }, []);

  // Open upload modal
  const openUploadModal = useCallback((categoryId = null) => {
    if (categoryId) {
      setCategory(categoryId);
    }
    setUploadModalOpen(true);
  }, []);

  // Close upload modal
  const closeUploadModal = useCallback(() => {
    resetUploadForm();
    setUploadModalOpen(false);
  }, []);

  // Close view modal
  const closeViewModal = useCallback(() => {
    setViewingDocument(null);
    setViewModalOpen(false);
  }, []);

  // Reset upload form
  const resetUploadForm = useCallback(() => {
    setSelectedFile(null);
    setDocumentName("");
    setCategory("");
    setSubcategory("");
    setDescription("");
    setExpirationDate(null);
    setTags([]);
    setUploadProgress({ current: 0, total: 0 });
  }, []);

  // Replace document with new version
  const handleReplace = useCallback(async (documentId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use v1Api for document replace (upload with replaceId)
      const res = await fetch(`/api/v1/documents/upload?replaceId=${documentId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to replace document');
      }

      message.success('Document replaced successfully. Re-approval required.');
      await fetchDocuments();
      await fetchDocumentStatus();
      return true;
    } catch (error) {
      console.error('[useDocumentVault] Error replacing document:', error);
      message.error(error.message || 'Failed to replace document');
      return false;
    }
  }, [fetch, message, fetchDocuments, fetchDocumentStatus]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await fetchDocuments();
    await fetchDocumentStatus();
  }, [fetchDocuments, fetchDocumentStatus]);

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
    if ((userRole === 'landlord' || userRole === 'pmc') && selectedTenantId) {
      fetchDocumentStatus();
    }
  }, [fetchDocuments, fetchDocumentStatus, userRole, selectedTenantId]);

  return {
    // Data
    documents,
    documentStatus,
    viewingDocument,
    
    // State
    loading,
    uploading,
    uploadModalOpen,
    viewModalOpen,
    uploadProgress,
    
    // Upload form state
    selectedFile,
    documentName,
    category,
    subcategory,
    description,
    expirationDate,
    tags,
    
    // Upload form setters
    setSelectedFile,
    setDocumentName,
    setCategory,
    setSubcategory,
    setDescription,
    setExpirationDate,
    setTags,
    
    // Actions
    handleUpload,
    handleDelete,
    handleVerify,
    handleReject,
    handleReplace,
    handleView,
    handleDownload,
    openUploadModal,
    closeUploadModal,
    closeViewModal,
    refresh,
    
    // Helpers
    getExpirationStatus,
    formatFileSize,
    getFileIcon,
  };
}

export default useDocumentVault;

