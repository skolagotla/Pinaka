/**
 * Document Vault Helper Functions
 * Common utility functions shared between landlord and tenant vaults
 */

import {
  HiDocument,
  HiPhotograph,
  HiDocumentText,
  HiDocumentText as HiFileText,
} from 'react-icons/hi';

/**
 * Get file icon component based on file type
 * @param {string} fileType - MIME type or file extension
 * @param {object} style - Optional style object for the icon
 * @returns {JSX.Element} Icon component
 */
export const getFileIcon = (fileType, className = 'h-12 w-12') => {
  if (fileType.includes('pdf')) {
    return <HiDocument className={`${className} text-red-500`} />;
  }
  if (fileType.includes('image')) {
    return <HiPhotograph className={`${className} text-green-500`} />;
  }
  if (fileType.includes('word') || fileType.includes('doc')) {
    return <HiDocumentText className={`${className} text-blue-500`} />;
  }
  return <HiFileText className={`${className} text-gray-500`} />;
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get appropriate status color based on verification and upload state
 * @param {object} doc - Document object
 * @returns {string} Color code
 */
export const getDocumentStatusColor = (doc) => {
  if (doc.isVerified) return '#52c41a'; // Green
  if (doc.uploadedBy === 'tenant') return '#faad14'; // Orange
  return '#1890ff'; // Blue
};

/**
 * Check if user can delete a document
 * @param {object} doc - Document object
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {boolean}
 */
export const canDeleteDocument = (doc, userRole) => {
  if (userRole === 'landlord') {
    return doc.canLandlordDelete || doc.uploadedBy === 'landlord';
  }
  if (userRole === 'tenant') {
    return doc.canTenantDelete || doc.uploadedBy === 'tenant';
  }
  return false;
};

/**
 * Get upload button tooltip text
 * @param {boolean} hasSelection - Whether a tenant/property is selected (for landlord)
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {string}
 */
export const getUploadTooltip = (hasSelection, userRole) => {
  if (userRole === 'landlord' && !hasSelection) {
    return 'Select a tenant to upload';
  }
  return 'Upload Document';
};

/**
 * Validate required fields before upload
 * @param {object} params - Validation parameters
 * @returns {object} { valid: boolean, error: string }
 */
export const validateUploadFields = ({ category, description, selectedFile }) => {
  const filesToUpload = Array.isArray(selectedFile) 
    ? selectedFile 
    : (selectedFile ? [selectedFile] : []);

  if (filesToUpload.length === 0) {
    return { valid: false, error: 'Please select at least one file to upload' };
  }

  if (!category) {
    return { valid: false, error: 'Please select a document category' };
  }

  if (!description || !description.trim()) {
    return { valid: false, error: 'Please provide a description' };
  }

  return { valid: true, error: null };
};

export default {
  getFileIcon,
  formatFileSize,
  getDocumentStatusColor,
  canDeleteDocument,
  getUploadTooltip,
  validateUploadFields,
};

