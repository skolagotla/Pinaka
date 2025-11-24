/**
 * Document Metadata Utilities
 * 
 * Centralized utilities for parsing and working with document metadata.
 * Handles mutual approvals, version promotion, and deletion tracking.
 */

/**
 * Safely parse document metadata JSON
 * @param {string|object} metadata - Metadata to parse
 * @returns {object|null} Parsed metadata or null
 */
export function parseDocumentMetadata(metadata) {
  if (!metadata) return null;
  
  try {
    return typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  } catch (e) {
    console.error('[parseDocumentMetadata] Parse error:', e);
    return null;
  }
}

/**
 * Check if document requires mutual approval for version change
 * @param {object} metadata - Parsed metadata
 * @returns {boolean}
 */
export function requiresMutualApproval(metadata) {
  return Boolean(metadata?.requiresMutualApproval);
}

/**
 * Get mutual approval status for version changes
 * @param {object} metadata - Parsed metadata
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {object} Approval status
 */
export function getVersionApprovalStatus(metadata, userRole) {
  if (!metadata?.requiresMutualApproval) {
    return { requiresApproval: false, userApproved: false, otherApproved: false, bothApproved: false };
  }

  const landlordApproved = Boolean(metadata.landlordApproval?.approved);
  const tenantApproved = Boolean(metadata.tenantApproval?.approved);
  const userApproved = userRole === 'landlord' ? landlordApproved : tenantApproved;
  const otherApproved = userRole === 'landlord' ? tenantApproved : landlordApproved;

  return {
    requiresApproval: true,
    userApproved,
    otherApproved,
    bothApproved: landlordApproved && tenantApproved,
    landlordApproved,
    tenantApproved,
    promotionInfo: metadata.lastPromoted || null,
  };
}

/**
 * Check if document has pending deletion
 * @param {object} metadata - Parsed metadata
 * @returns {boolean}
 */
export function hasPendingDeletion(metadata) {
  return Boolean(metadata?.pendingDeletion);
}

/**
 * Get deletion approval status
 * @param {object} metadata - Parsed metadata
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {object} Deletion status
 */
export function getDeletionApprovalStatus(metadata, userRole) {
  if (!metadata?.pendingDeletion) {
    return { hasPendingDeletion: false, userApproved: false, otherApproved: false, bothApproved: false };
  }

  const pendingDeletion = metadata.pendingDeletion;
  const landlordApproved = Boolean(pendingDeletion.landlordApproval?.approved);
  const tenantApproved = Boolean(pendingDeletion.tenantApproval?.approved);
  const userApproved = userRole === 'landlord' ? landlordApproved : tenantApproved;
  const otherApproved = userRole === 'landlord' ? tenantApproved : landlordApproved;

  return {
    hasPendingDeletion: true,
    userApproved,
    otherApproved,
    bothApproved: landlordApproved && tenantApproved,
    landlordApproved,
    tenantApproved,
    deletionInfo: pendingDeletion,
    requesterRole: pendingDeletion.requestedByRole,
    requesterName: pendingDeletion.requestedBy,
    requestedAt: pendingDeletion.requestedAt,
  };
}

/**
 * Check if user needs to approve version change
 * @param {object} metadata - Parsed metadata
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {boolean}
 */
export function needsVersionApproval(metadata, userRole) {
  const status = getVersionApprovalStatus(metadata, userRole);
  return status.requiresApproval && !status.userApproved;
}

/**
 * Check if user needs to approve deletion
 * @param {object} metadata - Parsed metadata
 * @param {string} userRole - 'landlord' or 'tenant'
 * @returns {boolean}
 */
export function needsDeletionApproval(metadata, userRole) {
  const status = getDeletionApprovalStatus(metadata, userRole);
  return status.hasPendingDeletion && !status.userApproved;
}

