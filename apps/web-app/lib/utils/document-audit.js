/**
 * Document Audit Trail Utility
 * Logs all document actions for legal compliance
 */

const { prisma } = require('../prisma');
const { randomBytes } = require('crypto');

// Generate a unique ID (CUID-like)
function generateId() {
  return randomBytes(12).toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, 20);
}

/**
 * Log a document action to the audit trail
 * @param {Object} params
 * @param {string} params.documentId - Document ID
 * @param {string} params.action - Action type (UPLOAD, VIEW, DOWNLOAD, DELETE, VERIFY, UPDATE)
 * @param {string} params.performedBy - User role (landlord, tenant)
 * @param {string} params.performedByEmail - User email
 * @param {string} params.performedByName - User name
 * @param {string} [params.ipAddress] - IP address
 * @param {string} [params.userAgent] - Browser/device info
 * @param {Object} [params.details] - Additional details (will be JSON stringified)
 */
async function logDocumentAction({
  documentId,
  action,
  performedBy,
  performedByEmail,
  performedByName,
  ipAddress = null,
  userAgent = null,
  details = null,
}) {
  try {
    await prisma.documentAuditLog.create({
      data: {
        id: generateId(),
        documentId,
        action,
        performedBy,
        performedByEmail,
        performedByName,
        ipAddress,
        userAgent,
        details: details ? JSON.stringify(details) : null,
      },
    });
    
    console.log(`[AUDIT] ${action} on document ${documentId} by ${performedByEmail}`);
  } catch (error) {
    console.error('[AUDIT] Failed to log document action:', error);
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

/**
 * Get audit trail for a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} Audit log entries
 */
async function getDocumentAuditTrail(documentId) {
  try {
    const logs = await prisma.documentAuditLog.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
    
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
  } catch (error) {
    console.error('[AUDIT] Failed to fetch audit trail:', error);
    return [];
  }
}

/**
 * Get audit trail for a tenant (all their documents)
 * @param {string} tenantId - Tenant ID
 * @returns {Promise<Array>} Audit log entries
 */
async function getTenantDocumentAuditTrail(tenantId) {
  try {
    const documents = await prisma.document.findMany({
      where: { tenantId },
      select: { id: true },
    });
    
    const documentIds = documents.map(d => d.id);
    
    const logs = await prisma.documentAuditLog.findMany({
      where: {
        documentId: { in: documentIds },
      },
      include: {
        document: {
          select: {
            originalName: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
  } catch (error) {
    console.error('[AUDIT] Failed to fetch tenant audit trail:', error);
    return [];
  }
}

/**
 * Extract IP address from request
 * @param {Request|NextApiRequest} req - Next.js request object (API routes or App Router)
 * @returns {string|null} IP address
 */
function getIpAddress(req) {
  // Helper to get header value (supports both API routes and App Router)
  const getHeader = (name) => {
    if (typeof req.headers.get === 'function') {
      // App Router: Headers object with .get() method
      return req.headers.get(name);
    }
    // API routes: Plain object
    return req.headers[name];
  };

  // Check various headers for IP address (considering proxies)
  const forwarded = getHeader('x-forwarded-for');
  const realIp = getHeader('x-real-ip');
  const cfIp = getHeader('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  if (cfIp) {
    return cfIp.trim();
  }
  
  return null;
}

/**
 * Extract user agent from request
 * @param {Request|NextApiRequest} req - Next.js request object (API routes or App Router)
 * @returns {string|null} User agent string
 */
function getUserAgent(req) {
  // Helper to get header value (supports both API routes and App Router)
  if (typeof req.headers.get === 'function') {
    // App Router: Headers object with .get() method
    return req.headers.get('user-agent') || null;
  }
  // API routes: Plain object
  return req.headers['user-agent'] || null;
}

/**
 * Audit action types
 */
const AUDIT_ACTIONS = {
  UPLOAD: 'UPLOAD',
  VIEW: 'VIEW',
  DOWNLOAD: 'DOWNLOAD',
  DELETE: 'DELETE',
  VERIFY: 'VERIFY',
  REJECT: 'REJECT', // When document is rejected
  UPDATE: 'UPDATE',
  RESTORE: 'RESTORE', // If we implement undelete
};

module.exports = {
  logDocumentAction,
  getDocumentAuditTrail,
  getTenantDocumentAuditTrail,
  getIpAddress,
  getUserAgent,
  AUDIT_ACTIONS,
};

