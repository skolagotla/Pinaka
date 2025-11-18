/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED VERIFICATION SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized service for managing all verification types in a unified model
 * Handles: Property Ownership, Tenant Documents, Applications, Entity Approvals,
 *          Financial Approvals, Inspection Checklists, and more
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Verification type configurations
 * Defines which roles can verify which types
 */
const VERIFICATION_TYPE_CONFIG = {
  PROPERTY_OWNERSHIP: {
    name: 'Property Ownership',
    icon: 'FileOutlined',
    canVerify: ['pmc', 'admin'],
    canRequest: ['landlord'],
    entityModel: 'PropertyOwnershipVerification',
  },
  TENANT_DOCUMENT: {
    name: 'Tenant Document',
    icon: 'FileTextOutlined',
    canVerify: ['landlord', 'pmc', 'admin'],
    canRequest: ['tenant'],
    entityModel: 'Document',
  },
  APPLICATION: {
    name: 'Application',
    icon: 'UserAddOutlined',
    canVerify: ['admin', 'pmc', 'landlord'], // Depends on application type
    canRequest: ['landlord', 'tenant', 'pmc'],
    entityModel: 'Invitation',
  },
  ENTITY_APPROVAL: {
    name: 'Entity Approval',
    icon: 'CheckCircleOutlined',
    canVerify: ['admin', 'pmc', 'landlord'], // Depends on entity type
    canRequest: ['landlord', 'tenant', 'pmc'],
    entityModel: null, // Can be 'Landlord', 'Tenant', 'PropertyManagementCompany'
  },
  FINANCIAL_APPROVAL: {
    name: 'Financial Approval',
    icon: 'DollarOutlined',
    canVerify: ['pmc', 'admin'],
    canRequest: ['landlord'],
    entityModel: null, // Can be 'Expense', 'MaintenanceRequest'
  },
  INSPECTION: {
    name: 'Inspection',
    icon: 'FileSearchOutlined',
    canVerify: ['landlord', 'pmc', 'admin'],
    canRequest: ['tenant'],
    entityModel: 'InspectionChecklist',
  },
  OTHER: {
    name: 'Other',
    icon: 'QuestionCircleOutlined',
    canVerify: ['admin'],
    canRequest: ['landlord', 'tenant', 'pmc', 'admin'],
    entityModel: null,
  },
};

/**
 * Create a unified verification record
 */
async function createVerification(prisma, options) {
  const {
    verificationType,
    entityType,
    entityId,
    requestedBy,
    requestedByRole,
    requestedByEmail,
    requestedByName,
    assignedTo = null,
    assignedToRole = null,
    assignedToEmail = null,
    assignedToName = null,
    title,
    description = null,
    notes = null,
    fileName = null,
    originalName = null,
    fileUrl = null,
    fileSize = null,
    mimeType = null,
    metadata = null,
    priority = 'normal',
    dueDate = null,
  } = options;

  // Validate verification type
  if (!VERIFICATION_TYPE_CONFIG[verificationType]) {
    throw new Error(`Invalid verification type: ${verificationType}`);
  }

  // Safety check: ensure prisma and unifiedVerification model exist
  if (!prisma) {
    throw new Error('Prisma client is not available');
  }
  
  if (!prisma.unifiedVerification) {
    // Try to get it from the Prisma client directly
    const { prisma: freshPrisma } = require('../prisma');
    if (!freshPrisma || !freshPrisma.unifiedVerification) {
      throw new Error('UnifiedVerification model is not available in Prisma client. Please run: npx prisma generate');
    }
    // Use the fresh prisma client
    prisma = freshPrisma;
  }

  // Check if verification already exists
  const existing = await prisma.unifiedVerification.findUnique({
    where: {
      verificationType_entityType_entityId: {
        verificationType,
        entityType,
        entityId,
      },
    },
  });

  if (existing) {
    throw new Error('Verification already exists for this entity');
  }

  // Create verification
  const verification = await prisma.unifiedVerification.create({
    data: {
      verificationType,
      entityType,
      entityId,
      requestedBy,
      requestedByRole,
      requestedByEmail,
      requestedByName,
      assignedTo,
      assignedToRole,
      assignedToEmail,
      assignedToName,
      title,
      description,
      notes,
      fileName,
      originalName,
      fileUrl,
      fileSize,
      mimeType,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      priority,
      dueDate,
      status: 'PENDING',
      requestedAt: new Date(),
    },
  });

  // Create history entry
  await prisma.unifiedVerificationHistory.create({
    data: {
      verificationId: verification.id,
      action: 'created',
      performedBy: requestedBy,
      performedByRole: requestedByRole,
      performedByEmail: requestedByEmail,
      performedByName: requestedByName,
      newStatus: 'PENDING',
      notes: 'Verification created',
    },
  });

  // Send notification to assigned verifier (if assigned)
  if (assignedTo) {
    try {
      await createNotification({
        userId: assignedTo,
        userRole: assignedToRole,
        userEmail: assignedToEmail,
        type: NOTIFICATION_TYPES.VERIFICATION_REQUESTED || 'verification_requested',
        title: 'Verification Request',
        message: `New ${VERIFICATION_TYPE_CONFIG[verificationType].name} verification requested: ${title}`,
        priority: priority === 'urgent' ? 'high' : priority,
        entityType: 'unified_verification',
        entityId: verification.id,
        actionUrl: `/verifications/${verification.id}`,
        actionLabel: 'Review Verification',
        metadata: {
          verificationId: verification.id,
          verificationType,
          entityType,
          entityId,
        },
      });
    } catch (notifError) {
      console.error('[Unified Verification] Notification error:', notifError);
      // Don't fail if notification fails
    }
  }

  return verification;
}

/**
 * Verify a verification request
 */
async function verifyVerification(prisma, options) {
  const {
    verificationId,
    verifiedBy,
    verifiedByRole,
    verifiedByEmail,
    verifiedByName,
    verificationNotes = null,
  } = options;

  // Safety check: ensure prisma and unifiedVerification model exist
  if (!prisma) {
    throw new Error('Prisma client is not available');
  }
  
  if (!prisma.unifiedVerification) {
    // Try to get it from the Prisma client directly
    const { prisma: freshPrisma } = require('../prisma');
    if (!freshPrisma || !freshPrisma.unifiedVerification) {
      throw new Error('UnifiedVerification model is not available in Prisma client. Please run: npx prisma generate');
    }
    // Use the fresh prisma client
    prisma = freshPrisma;
  }

  const verification = await prisma.unifiedVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.status !== 'PENDING') {
    throw new Error(`Cannot verify verification with status: ${verification.status}`);
  }

  // Check if user can verify this type
  const config = VERIFICATION_TYPE_CONFIG[verification.verificationType];
  if (!config.canVerify.includes(verifiedByRole)) {
    throw new Error(`Role ${verifiedByRole} cannot verify ${verification.verificationType} verifications`);
  }

  // Update verification
  const updated = await prisma.unifiedVerification.update({
    where: { id: verificationId },
    data: {
      status: 'VERIFIED',
      verifiedBy,
      verifiedByRole,
      verifiedByEmail,
      verifiedByName,
      verificationNotes,
      verifiedAt: new Date(),
    },
  });

  // Create history entry
  await prisma.unifiedVerificationHistory.create({
    data: {
      verificationId,
      action: 'verified',
      performedBy: verifiedBy,
      performedByRole,
      performedByEmail,
      performedByName,
      previousStatus: 'PENDING',
      newStatus: 'VERIFIED',
      notes: verificationNotes,
    },
  });

  // Send notification to requester
  try {
    await createNotification({
      userId: verification.requestedBy,
      userRole: verification.requestedByRole,
      userEmail: verification.requestedByEmail,
      type: NOTIFICATION_TYPES.VERIFICATION_VERIFIED || 'verification_verified',
      title: 'Verification Approved',
      message: `Your ${config.name} verification "${verification.title}" has been approved.`,
      priority: 'normal',
      entityType: 'unified_verification',
      entityId: verificationId,
      actionUrl: `/verifications/${verificationId}`,
      actionLabel: 'View Details',
      metadata: {
        verificationId,
        verificationType: verification.verificationType,
        verifiedBy,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (notifError) {
    console.error('[Unified Verification] Notification error:', notifError);
  }

  return updated;
}

/**
 * Reject a verification request
 */
async function rejectVerification(prisma, options) {
  const {
    verificationId,
    rejectedBy,
    rejectedByRole,
    rejectedByEmail,
    rejectedByName,
    rejectionReason,
  } = options;

  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  // Safety check: ensure prisma and unifiedVerification model exist
  if (!prisma) {
    throw new Error('Prisma client is not available');
  }
  
  if (!prisma.unifiedVerification) {
    // Try to get it from the Prisma client directly
    const { prisma: freshPrisma } = require('../prisma');
    if (!freshPrisma || !freshPrisma.unifiedVerification) {
      throw new Error('UnifiedVerification model is not available in Prisma client. Please run: npx prisma generate');
    }
    // Use the fresh prisma client
    prisma = freshPrisma;
  }

  const verification = await prisma.unifiedVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification not found');
  }

  if (verification.status !== 'PENDING') {
    throw new Error(`Cannot reject verification with status: ${verification.status}`);
  }

  // Check if user can verify this type
  const config = VERIFICATION_TYPE_CONFIG[verification.verificationType];
  if (!config.canVerify.includes(rejectedByRole)) {
    throw new Error(`Role ${rejectedByRole} cannot verify ${verification.verificationType} verifications`);
  }

  // Update verification
  const updated = await prisma.unifiedVerification.update({
    where: { id: verificationId },
    data: {
      status: 'REJECTED',
      rejectedBy: rejectedBy,
      rejectedByRole,
      rejectedByEmail,
      rejectedByName,
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date(),
    },
  });

  // Create history entry
  await prisma.unifiedVerificationHistory.create({
    data: {
      verificationId,
      action: 'rejected',
      performedBy: rejectedBy,
      performedByRole,
      performedByEmail,
      performedByName,
      previousStatus: 'PENDING',
      newStatus: 'REJECTED',
      notes: rejectionReason.trim(),
    },
  });

  // Send notification to requester
  try {
    await createNotification({
      userId: verification.requestedBy,
      userRole: verification.requestedByRole,
      userEmail: verification.requestedByEmail,
      type: NOTIFICATION_TYPES.VERIFICATION_REJECTED || 'verification_rejected',
      title: 'Verification Rejected',
      message: `Your ${config.name} verification "${verification.title}" has been rejected. Reason: ${rejectionReason.trim()}`,
      priority: 'high',
      entityType: 'unified_verification',
      entityId: verificationId,
      actionUrl: `/verifications/${verificationId}`,
      actionLabel: 'View Details',
      metadata: {
        verificationId,
        verificationType: verification.verificationType,
        rejectedBy,
        rejectionReason: rejectionReason.trim(),
        rejectedAt: new Date().toISOString(),
      },
    });
  } catch (notifError) {
    console.error('[Unified Verification] Notification error:', notifError);
  }

  return updated;
}

/**
 * List verifications with filters
 */
async function listVerifications(prisma, options = {}) {
  const {
    userId = null,
    userRole = null,
    verificationType = null,
    status = null,
    assignedTo = null,
    requestedBy = null,
    page = 1,
    limit = 50,
    orderBy = 'requestedAt',
    orderDirection = 'desc',
  } = options;

  const where = {};

  // Filter by verification type
  if (verificationType) {
    where.verificationType = verificationType;
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Filter by assigned to (for verifier's queue)
  if (assignedTo) {
    where.assignedTo = assignedTo;
  }

  // Filter by requested by (for requester's list)
  if (requestedBy) {
    where.requestedBy = requestedBy;
  }

  // Safety check: ensure prisma and unifiedVerification model exist
  if (!prisma) {
    throw new Error('Prisma client is not available');
  }
  
  if (!prisma.unifiedVerification) {
    // Try to get it from the Prisma client directly
    const { prisma: freshPrisma } = require('../prisma');
    if (!freshPrisma || !freshPrisma.unifiedVerification) {
      throw new Error('UnifiedVerification model is not available in Prisma client. Please run: npx prisma generate');
    }
    // Use the fresh prisma client
    prisma = freshPrisma;
  }

  // Role-based filtering
  if (userId && userRole) {
    const orConditions = [];
    
    // If user is a verifier, show items assigned to them or unassigned pending items they can verify
    if (['pmc', 'landlord', 'admin'].includes(userRole)) {
      orConditions.push(
        { assignedTo: userId },
        { assignedTo: null, status: 'PENDING' } // Unassigned pending items
      );
    }
    
    // Always show user's own requests (as requester)
    orConditions.push({ requestedBy: userId });
    
    // If we have multiple conditions, use OR
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }
  }

  const skip = (page - 1) * limit;

  const [verifications, total] = await Promise.all([
    prisma.unifiedVerification.findMany({
      where,
      orderBy: {
        [orderBy]: orderDirection,
      },
      skip,
      take: limit,
      include: {
        history: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    }),
    prisma.unifiedVerification.count({ where }),
  ]);

  return {
    verifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get verification by ID
 */
async function getVerification(prisma, verificationId, includeHistory = true) {
  const verification = await prisma.unifiedVerification.findUnique({
    where: { id: verificationId },
    include: {
      history: includeHistory ? {
        orderBy: {
          createdAt: 'desc',
        },
      } : false,
    },
  });

  return verification;
}

/**
 * Get verification statistics
 */
async function getVerificationStats(prisma, options = {}) {
  const { userId = null, userRole = null } = options;

  // Safety check: ensure prisma and unifiedVerification model exist
  if (!prisma) {
    throw new Error('Prisma client is not available');
  }
  
  if (!prisma.unifiedVerification) {
    // Try to get it from the Prisma client directly
    const { prisma: freshPrisma } = require('../prisma');
    if (!freshPrisma || !freshPrisma.unifiedVerification) {
      throw new Error('UnifiedVerification model is not available in Prisma client. Please run: npx prisma generate');
    }
    // Use the fresh prisma client
    prisma = freshPrisma;
  }

  const where = {};

  // Role-based filtering - show both verifier queue and requester's own requests
  if (userId && userRole) {
    const orConditions = [];
    
    // If user is a verifier, show items assigned to them or unassigned pending items
    if (['pmc', 'landlord', 'admin'].includes(userRole)) {
      orConditions.push(
        { assignedTo: userId },
        { assignedTo: null, status: 'PENDING' }
      );
    }
    
    // Always include user's own requests
    orConditions.push({ requestedBy: userId });
    
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }
  }

  const [pending, verified, rejected, expired, total] = await Promise.all([
    prisma.unifiedVerification.count({ where: { ...where, status: 'PENDING' } }),
    prisma.unifiedVerification.count({ where: { ...where, status: 'VERIFIED' } }),
    prisma.unifiedVerification.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.unifiedVerification.count({ where: { ...where, status: 'EXPIRED' } }),
    prisma.unifiedVerification.count({ where }),
  ]);

  return {
    pending,
    verified,
    rejected,
    expired,
    total,
  };
}

module.exports = {
  createVerification,
  verifyVerification,
  rejectVerification,
  listVerifications,
  getVerification,
  getVerificationStats,
  VERIFICATION_TYPE_CONFIG,
};

