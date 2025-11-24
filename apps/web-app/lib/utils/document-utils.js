/**
 * Document Utility Functions
 * Helper functions for document management, validation, and tracking
 */

import { getCategoryById, canUploadCategory, isValidFileType, getMaxFileSize } from '../constants/document-categories';
import dayjs from 'dayjs';

/**
 * Validate document upload
 */
export function validateDocumentUpload(file, categoryId, userRole) {
  const errors = [];
  
  // Check if category exists
  const category = getCategoryById(categoryId);
  if (!category) {
    errors.push('Invalid document category');
    return { valid: false, errors };
  }
  
  // Check if user can upload this category
  if (!canUploadCategory(categoryId, userRole)) {
    errors.push(`Only ${category.uploadedBy} can upload this document type`);
  }
  
  // Check file type
  if (!isValidFileType(file.name, categoryId)) {
    errors.push(`Invalid file type. Allowed: ${category.allowedFileTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSize = getMaxFileSize(categoryId);
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    category,
  };
}

/**
 * Calculate expiration status
 */
export function getExpirationStatus(expirationDate) {
  if (!expirationDate) {
    return { status: 'no_expiration', daysRemaining: null };
  }
  
  const now = dayjs();
  const expiry = dayjs(expirationDate);
  const daysRemaining = expiry.diff(now, 'day');
  
  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  } else if (daysRemaining <= 7) {
    return { status: 'urgent', daysRemaining };
  } else if (daysRemaining <= 30) {
    return { status: 'warning', daysRemaining };
  } else {
    return { status: 'valid', daysRemaining };
  }
}

/**
 * Check if reminder should be sent
 */
export function shouldSendReminder(document) {
  if (!document.expirationDate || document.reminderSent) {
    return false;
  }
  
  const category = getCategoryById(document.category);
  if (!category || !category.expirationReminders) {
    return false;
  }
  
  const { daysRemaining } = getExpirationStatus(document.expirationDate);
  
  // Send reminder if days remaining matches any of the reminder days
  return category.expirationReminders.includes(daysRemaining);
}

/**
 * Get required documents status for a tenant
 */
export function getRequiredDocumentsStatus(documents, leaseStartDate = null) {
  const { 
    getPreLeaseRequiredDocuments, 
    getPostLeaseRequiredDocuments 
  } = require('../constants/document-categories');
  
  const preLeaseDocs = getPreLeaseRequiredDocuments();
  const postLeaseDocs = getPostLeaseRequiredDocuments();
  
  const status = {
    preLease: {
      total: preLeaseDocs.length,
      completed: 0,
      missing: [],
      documents: {},
    },
    postLease: {
      total: postLeaseDocs.length,
      completed: 0,
      missing: [],
      documents: {},
    },
  };
  
  // Check pre-lease documents
  preLeaseDocs.forEach(reqDoc => {
    const uploaded = documents.find(d => d.category === reqDoc.id);
    if (uploaded) {
      status.preLease.completed++;
      status.preLease.documents[reqDoc.id] = uploaded;
    } else {
      status.preLease.missing.push(reqDoc);
    }
  });
  
  // Check post-lease documents
  if (leaseStartDate) {
    postLeaseDocs.forEach(reqDoc => {
      const uploaded = documents.find(d => d.category === reqDoc.id);
      if (uploaded) {
        status.postLease.completed++;
        status.postLease.documents[reqDoc.id] = uploaded;
      } else {
        status.postLease.missing.push(reqDoc);
      }
    });
  }
  
  return {
    ...status,
    allPreLeaseComplete: status.preLease.completed === status.preLease.total,
    allPostLeaseComplete: status.postLease.completed === status.postLease.total,
    allComplete: status.preLease.completed === status.preLease.total && 
                 status.postLease.completed === status.postLease.total,
  };
}

/**
 * Get documents expiring soon
 */
export function getExpiringDocuments(documents, daysThreshold = 30) {
  return documents
    .filter(doc => doc.expirationDate)
    .map(doc => ({
      ...doc,
      expirationStatus: getExpirationStatus(doc.expirationDate),
    }))
    .filter(doc => doc.expirationStatus.daysRemaining <= daysThreshold)
    .sort((a, b) => a.expirationStatus.daysRemaining - b.expirationStatus.daysRemaining);
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName) {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}.${ext}`;
}

/**
 * Get storage path for document
 */
export function getDocumentStoragePath(categoryId, filename) {
  const category = getCategoryById(categoryId);
  const baseDir = 'uploads/documents';
  
  // Organize by category
  if (category.uploadedBy === 'landlord') {
    return `${baseDir}/landlord/${filename}`;
  }
  
  // Further organize tenant documents by type
  if (category.isRequired) {
    return `${baseDir}/tenant/required/${filename}`;
  }
  
  return `${baseDir}/tenant/optional/${filename}`;
}

/**
 * Calculate due date for post-lease documents
 */
export function getPostLeaseDueDate(leaseStartDate, categoryId) {
  const category = getCategoryById(categoryId);
  if (!category || !category.dueAfterLease) {
    return null;
  }
  
  return dayjs(leaseStartDate).add(category.dueAfterLease, 'day').toDate();
}

/**
 * Check if post-lease document is overdue
 */
export function isPostLeaseDocumentOverdue(leaseStartDate, categoryId, uploadedAt = null) {
  if (uploadedAt) return false; // Already uploaded
  
  const dueDate = getPostLeaseDueDate(leaseStartDate, categoryId);
  if (!dueDate) return false;
  
  return dayjs().isAfter(dayjs(dueDate));
}

/**
 * Get document verification status summary
 */
export function getVerificationSummary(documents) {
  const summary = {
    total: documents.length,
    verified: 0,
    pending: 0,
    expired: 0,
    expiringSoon: 0,
  };
  
  documents.forEach(doc => {
    if (doc.isVerified) {
      summary.verified++;
    } else {
      summary.pending++;
    }
    
    if (doc.expirationDate) {
      const { status } = getExpirationStatus(doc.expirationDate);
      if (status === 'expired') {
        summary.expired++;
      } else if (status === 'warning' || status === 'urgent') {
        summary.expiringSoon++;
      }
    }
  });
  
  return summary;
}

/**
 * Format document for API response
 */
export function formatDocumentResponse(document) {
  const expirationStatus = document.expirationDate 
    ? getExpirationStatus(document.expirationDate)
    : null;
  
  return {
    id: document.id,
    documentHash: document.documentHash, // ✅ Include unified hash identifier
    fileName: document.fileName,
    originalName: document.originalName,
    fileType: document.fileType,
    fileSize: document.fileSize,
    category: document.category,
    subcategory: document.subcategory,
    description: document.description,
    tags: document.tags,
    uploadedBy: document.uploadedBy,
    uploadedByEmail: document.uploadedByEmail,
    uploadedByName: document.uploadedByName,
    uploadedAt: document.uploadedAt,
    isRequired: document.isRequired,
    isVerified: document.isVerified,
    verifiedBy: document.verifiedBy,
    verifiedByName: document.verifiedByName,
    verifiedByRole: document.verifiedByRole,
    verifiedAt: document.verifiedAt,
    verificationComment: document.verificationComment,
    isRejected: document.isRejected,
    rejectedBy: document.rejectedBy,
    rejectedByName: document.rejectedByName,
    rejectedByRole: document.rejectedByRole,
    rejectedAt: document.rejectedAt,
    rejectionReason: document.rejectionReason,
    expirationDate: document.expirationDate,
    expirationStatus,
    visibility: document.visibility,
    canTenantDelete: document.canTenantDelete,
    canLandlordDelete: document.canLandlordDelete,
    metadata: document.metadata, // ✅ Include batch upload metadata (JSON string with files array)
  };
}

/**
 * Group documents by category
 */
export function groupDocumentsByCategory(documents) {
  const grouped = {};
  
  documents.forEach(doc => {
    if (!grouped[doc.category]) {
      grouped[doc.category] = [];
    }
    grouped[doc.category].push(doc);
  });
  
  return grouped;
}

/**
 * Get document statistics
 */
export function getDocumentStatistics(documents) {
  return {
    total: documents.length,
    byCategory: groupDocumentsByCategory(documents),
    required: documents.filter(d => d.isRequired).length,
    verified: documents.filter(d => d.isVerified).length,
    withExpiration: documents.filter(d => d.expirationDate).length,
    expired: documents.filter(d => {
      if (!d.expirationDate) return false;
      const { status } = getExpirationStatus(d.expirationDate);
      return status === 'expired';
    }).length,
  };
}

export default {
  validateDocumentUpload,
  getExpirationStatus,
  shouldSendReminder,
  getRequiredDocumentsStatus,
  getExpiringDocuments,
  generateUniqueFilename,
  getDocumentStoragePath,
  getPostLeaseDueDate,
  isPostLeaseDocumentOverdue,
  getVerificationSummary,
  formatDocumentResponse,
  groupDocumentsByCategory,
  getDocumentStatistics,
};

