/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED APPROVAL SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized service for handling approval/rejection workflows
 * Supports: Landlords (approved by Admin), Tenants (approved by Landlord)
 * Future-proof: Can be extended for Vendors, Contractors, etc.
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { formatPhoneNumber } = require('../utils/formatters');

/**
 * Approval configuration for different entity types
 */
const APPROVAL_CONFIG = {
  landlord: {
    model: 'landlord',
    emailFunctions: {
      approval: 'sendLandlordApproval',
      rejection: 'sendLandlordRejection',
    },
    requiresAccessField: false,
    auditLog: true,
  },
  pmc: {
    model: 'propertyManagementCompany',
    emailFunctions: {
      approval: 'sendPMCApproval',
      rejection: 'sendPMCRejection',
    },
    requiresAccessField: false,
    auditLog: true,
  },
  tenant: {
    model: 'tenant',
    emailFunctions: {
      approval: 'sendTenantApproval',
      rejection: 'sendTenantRejection',
    },
    requiresAccessField: true, // Tenants need hasAccess field
    auditLog: false,
  },
  // Future: vendor, contractor, etc.
};

/**
 * Get approval counts for all statuses
 */
async function getApprovalCounts(prisma, config, baseWhere = {}) {
  const [pending, approved, rejected] = await Promise.all([
    prisma[config.model].count({ 
      where: { ...baseWhere, approvalStatus: 'PENDING' } 
    }),
    prisma[config.model].count({ 
      where: { ...baseWhere, approvalStatus: 'APPROVED' } 
    }),
    prisma[config.model].count({ 
      where: { ...baseWhere, approvalStatus: 'REJECTED' } 
    }),
  ]);

  return { pending, approved, rejected };
}

/**
 * List entities with approval status filtering
 */
async function listEntities(prisma, config, options = {}) {
  const {
    status,
    search,
    page = 1,
    limit = 50,
    baseWhere = {},
    selectFields = {},
  } = options;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const where = { ...baseWhere };
  
  if (status) {
    where.approvalStatus = status;
  } else {
    where.approvalStatus = 'PENDING';
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Default select fields
  const defaultSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    city: true,
    provinceState: true,
    approvalStatus: true,
    approvedAt: true,
    rejectedAt: true,
    rejectionReason: true,
    createdAt: true,
    ...selectFields,
  };

  const [entitiesRaw, total, countsArray] = await Promise.all([
    prisma[config.model].findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      select: defaultSelect,
    }),
    prisma[config.model].count({ where }),
    getApprovalCounts(prisma, config, baseWhere).then(counts => [
      counts.pending,
      counts.approved,
      counts.rejected,
    ]),
  ]);

  // Format phone numbers
  const entities = entitiesRaw.map(entity => ({
    ...entity,
    phone: entity.phone ? formatPhoneNumber(entity.phone) : null,
  }));

  return {
    entities,
    total,
    counts: {
      pending: countsArray[0],
      approved: countsArray[1],
      rejected: countsArray[2],
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

/**
 * Approve an entity
 */
async function approveEntity(prisma, config, options = {}) {
  const {
    entityId,
    approverId,
    approverName,
    approverRole,
    req = null, // For audit logging
  } = options;

  const entity = await prisma[config.model].findUnique({
    where: { id: entityId },
  });

  if (!entity) {
    throw new Error(`${config.model} not found`);
  }

  if (entity.approvalStatus === 'APPROVED') {
    throw new Error(`${config.model} is already approved`);
  }

  // Build update data
  // Note: For landlords and PMCs, approvedBy only references Admin.id
  // If approver is not an admin (e.g., PMC approving landlord), set approvedBy to null
  let approvedByValue = approverId;
  if (config.model === 'landlord' && approverRole !== 'admin') {
    // Landlord.approvedBy only references Admin.id, so set to null for PMC approvals
    approvedByValue = null;
  } else if (config.model === 'propertyManagementCompany' && approverRole !== 'admin') {
    // PMC.approvedBy only references Admin.id, so set to null for non-admin approvals
    approvedByValue = null;
  }
  
  const updateData = {
    approvalStatus: 'APPROVED',
    approvedBy: approvedByValue,
    approvedAt: new Date(),
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
  };

  // Add access field for tenants
  if (config.requiresAccessField) {
    updateData.hasAccess = true;
  }

  const updated = await prisma[config.model].update({
    where: { id: entityId },
    data: updateData,
  });

  // Audit logging (for admin actions) - Enhanced with new fields
  if (config.auditLog && req) {
    try {
      const beforeState = {
        approvalStatus: entity.approvalStatus,
        approvedBy: entity.approvedBy,
        approvedAt: entity.approvedAt,
      };
      
      const afterState = {
        approvalStatus: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      };
      
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminId: approverId,
          action: `approve_${config.model}`,
          resource: config.model,
          resourceId: entity.id,
          targetUserId: entity.id,
          targetUserRole: config.model, // 'landlord', 'pmc', etc.
          targetEntityType: config.model,
          targetEntityId: entity.id,
          approvalType: config.model,
          approvalEntityId: entity.id,
          beforeState: beforeState,
          afterState: afterState,
          changedFields: ['approvalStatus', 'approvedBy', 'approvedAt'],
          details: { email: entity.email },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });
    } catch (auditError) {
      console.error('[Approval Service] Audit log error:', auditError);
      // Don't fail the request if audit fails
    }
  }

  // Send approval email
  try {
    const emailLib = require('../email');
    const emailFunction = emailLib[config.emailFunctions.approval];
    
    if (emailFunction) {
      const emailData = {
        [`${config.model}Email`]: entity.email,
        [`${config.model}Name`]: `${entity.firstName} ${entity.lastName}`,
      };

      // Add approver name based on role
      if (config.model === 'landlord') {
        emailData.adminName = approverName;
      } else if (config.model === 'tenant') {
        emailData.landlordName = approverName;
      }

      await emailFunction(emailData);
    }
  } catch (emailError) {
    console.error(`[Approval Service] Error sending approval email:`, emailError);
    // Don't fail the request if email fails
  }

  return updated;
}

/**
 * Reject an entity
 */
async function rejectEntity(prisma, config, options = {}) {
  const {
    entityId,
    rejectorId,
    rejectorName,
    rejectorRole,
    reason = null,
    req = null, // For audit logging
  } = options;

  const entity = await prisma[config.model].findUnique({
    where: { id: entityId },
  });

  if (!entity) {
    throw new Error(`${config.model} not found`);
  }

  if (entity.approvalStatus === 'REJECTED') {
    throw new Error(`${config.model} is already rejected`);
  }

  // Build update data
  // Note: For landlords and PMCs, rejectedBy only references Admin.id
  // If rejector is not an admin (e.g., PMC rejecting landlord), set rejectedBy to null
  let rejectedByValue = rejectorId;
  if (config.model === 'landlord' && rejectorRole !== 'admin') {
    // Landlord.rejectedBy only references Admin.id, so set to null for PMC rejections
    rejectedByValue = null;
  } else if (config.model === 'propertyManagementCompany' && rejectorRole !== 'admin') {
    // PMC.rejectedBy only references Admin.id, so set to null for non-admin rejections
    rejectedByValue = null;
  }
  
  const updateData = {
    approvalStatus: 'REJECTED',
    rejectedBy: rejectedByValue,
    rejectedAt: new Date(),
    rejectionReason: reason || null,
    approvedBy: null,
    approvedAt: null,
  };

  // Remove access for tenants
  if (config.requiresAccessField) {
    updateData.hasAccess = false;
  }

  const updated = await prisma[config.model].update({
    where: { id: entityId },
    data: updateData,
  });

  // Audit logging (for admin actions) - Enhanced with new fields
  if (config.auditLog && req) {
    try {
      const beforeState = {
        approvalStatus: entity.approvalStatus,
        rejectedBy: entity.rejectedBy,
        rejectedAt: entity.rejectedAt,
      };
      
      const afterState = {
        approvalStatus: 'REJECTED',
        rejectedBy: rejectorId,
        rejectedAt: new Date(),
        rejectionReason: reason,
      };
      
      await prisma.adminAuditLog.create({
        data: {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          adminId: rejectorId,
          action: `reject_${config.model}`,
          resource: config.model,
          resourceId: entity.id,
          targetUserId: entity.id,
          targetUserRole: config.model, // 'landlord', 'pmc', etc.
          targetEntityType: config.model,
          targetEntityId: entity.id,
          approvalType: config.model,
          approvalEntityId: entity.id,
          beforeState: beforeState,
          afterState: afterState,
          changedFields: ['approvalStatus', 'rejectedBy', 'rejectedAt', 'rejectionReason'],
          details: { email: entity.email, reason },
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          success: true,
        },
      });
    } catch (auditError) {
      console.error('[Approval Service] Audit log error:', auditError);
      // Don't fail the request if audit fails
    }
  }

  // Send rejection email
  try {
    const emailLib = require('../email');
    const emailFunction = emailLib[config.emailFunctions.rejection];
    
    if (emailFunction) {
      const emailData = {
        [`${config.model}Email`]: entity.email,
        [`${config.model}Name`]: `${entity.firstName} ${entity.lastName}`,
      };

      // Add rejector name based on role
      if (config.model === 'landlord') {
        emailData.adminName = rejectorName;
      } else if (config.model === 'tenant') {
        emailData.landlordName = rejectorName;
      }

      if (reason) {
        emailData.reason = reason;
      }

      await emailFunction(emailData);
    }
  } catch (emailError) {
    console.error(`[Approval Service] Error sending rejection email:`, emailError);
    // Don't fail the request if email fails
  }

  return updated;
}

module.exports = {
  APPROVAL_CONFIG,
  getApprovalCounts,
  listEntities,
  approveEntity,
  rejectEntity,
};

