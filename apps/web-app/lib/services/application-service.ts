/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED APPLICATION MANAGEMENT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Centralized service for managing applications (completed invitations)
 * Supports: Admin (landlord/pmc), Landlord (tenant), PMC (tenant)
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { PrismaClient } from '@prisma/client';

export type ApplicationRole = 'admin' | 'landlord' | 'pmc';
export type ApplicationType = 'landlord' | 'pmc' | 'tenant';

export interface ApplicationConfig {
  inviterRole: ApplicationRole;
  applicationType: ApplicationType;
  approverRole: ApplicationRole;
  invitationType: ApplicationType;
  userModel: 'landlord' | 'propertyManagementCompany' | 'tenant';
  userRelationField: 'landlordId' | 'pmcId' | 'tenantId';
}

export interface ListApplicationsOptions {
  inviterId: string;
  inviterRole: ApplicationRole;
  approvalStatus?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface ApproveApplicationOptions {
  invitationId: string;
  approverId: string;
  approverName: string;
  approverRole: ApplicationRole;
  comment?: string;
}

export interface RejectApplicationOptions {
  invitationId: string;
  rejectorId: string;
  rejectorName: string;
  rejectorRole: ApplicationRole;
  reason: string;
  comment?: string;
}

/**
 * Application configurations for different scenarios
 * The approver is always the inviter (whoever sent the invitation)
 */
const APPLICATION_CONFIGS: Record<string, ApplicationConfig> = {
  'admin-landlord': {
    inviterRole: 'admin',
    applicationType: 'landlord',
    approverRole: 'admin', // Admin approves landlords they invited
    invitationType: 'landlord',
    userModel: 'landlord',
    userRelationField: 'landlordId',
  },
  'admin-pmc': {
    inviterRole: 'admin',
    applicationType: 'pmc',
    approverRole: 'admin', // Admin approves PMCs they invited
    invitationType: 'pmc',
    userModel: 'propertyManagementCompany',
    userRelationField: 'pmcId',
  },
  'pmc-landlord': {
    inviterRole: 'pmc',
    applicationType: 'landlord',
    approverRole: 'pmc', // PMC approves landlords they invited
    invitationType: 'landlord',
    userModel: 'landlord',
    userRelationField: 'landlordId',
  },
  'landlord-tenant': {
    inviterRole: 'landlord',
    applicationType: 'tenant',
    approverRole: 'landlord', // Landlord approves tenants they invited
    invitationType: 'tenant',
    userModel: 'tenant',
    userRelationField: 'tenantId',
  },
  'pmc-tenant': {
    inviterRole: 'pmc',
    applicationType: 'tenant',
    approverRole: 'pmc', // PMC approves tenants they invited
    invitationType: 'tenant',
    userModel: 'tenant',
    userRelationField: 'tenantId',
  },
};

/**
 * Get application configuration
 */
export function getApplicationConfig(
  inviterRole: ApplicationRole,
  applicationType: ApplicationType
): ApplicationConfig {
  const key = `${inviterRole}-${applicationType}`;
  const config = APPLICATION_CONFIGS[key];
  if (!config) {
    throw new Error(`Invalid application configuration: ${key}`);
  }
  return config;
}

/**
 * List applications (completed invitations)
 */
export async function listApplications(
  prisma: PrismaClient,
  config: ApplicationConfig,
  options: ListApplicationsOptions
) {
  const {
    inviterId,
    inviterRole,
    approvalStatus,
    type,
    page = 1,
    limit = 50,
  } = options;

  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    throw new Error('Invalid page parameter');
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
    throw new Error('Invalid limit parameter');
  }
  
  const skip = (pageNum - 1) * limitNum;

  // Build where clause for invitations
  // Filter by the appropriate FK field based on inviter role
  const where: any = {
    status: 'completed', // Only show completed invitations (applications)
  };

  // Filter by inviter using the appropriate FK field
  if (inviterRole === 'admin') {
    where.invitedByAdminId = inviterId;
  } else if (inviterRole === 'landlord') {
    where.invitedByLandlordId = inviterId;
  } else if (inviterRole === 'pmc') {
    where.invitedByPMCId = inviterId;
  } else {
    // Fallback to generic field
    where.invitedBy = inviterId;
    where.invitedByRole = inviterRole;
  }

  if (type) {
    where.type = type;
  } else {
    where.type = config.invitationType;
  }

  // Get invitations
  const [invitations, total] = await Promise.all([
    prisma.invitation.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { completedAt: 'desc' },
      include: {
        invitedByAdmin: {
          select: { id: true, email: true },
        },
        invitedByLandlord: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        invitedByPMC: {
          select: { id: true, email: true, companyName: true },
        },
      },
    }),
    prisma.invitation.count({ where }),
  ]);

  // OPTIMIZED: Batch fetch all users at once instead of N+1 queries
  const userIds = invitations
    .map((inv: any) => inv[config.userRelationField])
    .filter((id: string | null) => id !== null) as string[];

  if (userIds.length === 0) {
    return {
      success: true,
      data: [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Common select fields for all user types
  const commonSelect = {
    id: true,
    email: true,
    phone: true,
    approvalStatus: true,
    approvedAt: true,
    rejectedAt: true,
    rejectionReason: true,
    createdAt: true,
  };

  // Batch fetch users based on model type
  let usersMap: Map<string, any> = new Map();
  
  if (config.userModel === 'landlord') {
    const users = await prisma.landlord.findMany({
      where: { id: { in: userIds } },
      select: {
        ...commonSelect,
        firstName: true,
        lastName: true,
      },
    });
    users.forEach((user: any) => usersMap.set(user.id, user));
  } else if (config.userModel === 'propertyManagementCompany') {
    const users = await prisma.propertyManagementCompany.findMany({
      where: { id: { in: userIds } },
      select: {
        ...commonSelect,
        companyName: true,
        companyId: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        provinceState: true,
        postalZip: true,
        country: true,
        countryCode: true,
        regionCode: true,
        defaultCommissionRate: true,
        countryFK: {
          select: {
            code: true,
            name: true,
          },
        },
        regionFK: {
          select: {
            code: true,
            name: true,
            countryCode: true,
          },
        },
      },
    });
    users.forEach((user: any) => usersMap.set(user.id, user));
  } else if (config.userModel === 'tenant') {
    const users = await prisma.tenant.findMany({
      where: { id: { in: userIds } },
      select: {
        ...commonSelect,
        firstName: true,
        lastName: true,
      },
    });
    users.forEach((user: any) => usersMap.set(user.id, user));
  }

  // Map invitations to applications
  const applications = invitations
    .map((invitation: any) => {
      const userId = invitation[config.userRelationField];
      if (!userId) return null;

      const user = usersMap.get(userId);
      if (!user) return null;

      const userApprovalStatus = user.approvalStatus;

      // Filter by approval status if provided
      if (approvalStatus && userApprovalStatus !== approvalStatus) {
        return null;
      }

      return {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          type: invitation.type,
          status: invitation.status,
          completedAt: invitation.completedAt,
          createdAt: invitation.createdAt,
        },
        user,
        approvalStatus: userApprovalStatus,
      };
    })
    .filter((app: any) => app !== null);

  // Calculate accurate total after filtering
  const filteredTotal = approvalStatus 
    ? applications.length 
    : total;

  return {
    success: true,
    data: applications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filteredTotal,
      totalPages: Math.ceil(filteredTotal / limitNum),
    },
  };
}

/**
 * Approve an application
 */
export async function approveApplication(
  prisma: PrismaClient,
  config: ApplicationConfig,
  options: ApproveApplicationOptions
) {
  const {
    invitationId,
    approverId,
    approverName,
    approverRole,
    comment,
  } = options;

  // Get invitation to verify it was sent by the approver
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      type: true,
      [config.userRelationField]: true,
      invitedBy: true,
      invitedByRole: true,
      invitedByAdminId: true,
      invitedByLandlordId: true,
      invitedByPMCId: true,
    },
  });

  if (!invitation) {
    throw new Error('Application not found');
  }

  // Verify invitation was sent by the approver
  // Check using the appropriate FK field based on inviter role
  let invitedByThisApprover = false;
  if (config.inviterRole === 'admin' && invitation.invitedByAdminId === approverId) {
    invitedByThisApprover = true;
  } else if (config.inviterRole === 'landlord' && invitation.invitedByLandlordId === approverId) {
    invitedByThisApprover = true;
  } else if (config.inviterRole === 'pmc' && invitation.invitedByPMCId === approverId) {
    invitedByThisApprover = true;
  } else if (invitation.invitedBy === approverId && invitation.invitedByRole === config.inviterRole) {
    // Fallback to generic field
    invitedByThisApprover = true;
  }

  if (!invitedByThisApprover) {
    throw new Error('You can only approve applications you invited');
  }

  const userId = invitation[config.userRelationField];
  if (!userId) {
    throw new Error('User not found for this application');
  }

  // Use the existing approval service (lazy load to avoid circular dependencies)
  const { approveEntity, APPROVAL_CONFIG } = require('./approval-service');
  const approvalConfig = APPROVAL_CONFIG[config.applicationType];
  
  if (!approvalConfig) {
    throw new Error(`Invalid approval configuration for ${config.applicationType}`);
  }

  // Approve the entity (approval service handles transactions internally)
  const updatedEntity = await approveEntity(prisma, approvalConfig, {
    entityId: userId,
    approverId,
    approverName,
    approverRole,
    comment,
  });

  // PHASE 2: Sync approval status to invitation
  if (approverRole === 'admin') {
    try {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          approvedBy: approverId,
          approvedAt: new Date(),
          rejectedBy: null,
          rejectedAt: null,
          rejectionReason: null,
        },
      });
    } catch (invitationError: any) {
      // Log error but don't fail the approval
      console.error('[Application Service] Error updating invitation approval status:', invitationError);
    }
  }

  return {
    success: true,
    data: updatedEntity,
    message: 'Application approved successfully',
  };
}

/**
 * Reject an application
 */
export async function rejectApplication(
  prisma: PrismaClient,
  config: ApplicationConfig,
  options: RejectApplicationOptions
) {
  const {
    invitationId,
    rejectorId,
    rejectorName,
    rejectorRole,
    reason,
    comment,
  } = options;

  if (!reason) {
    throw new Error('Rejection reason is required');
  }

  // Get invitation to verify it was sent by the rejector
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      type: true,
      [config.userRelationField]: true,
      invitedBy: true,
      invitedByRole: true,
      invitedByAdminId: true,
      invitedByLandlordId: true,
      invitedByPMCId: true,
    },
  });

  if (!invitation) {
    throw new Error('Application not found');
  }

  // Verify invitation was sent by the rejector
  // Check using the appropriate FK field based on inviter role
  let invitedByThisRejector = false;
  if (config.inviterRole === 'admin' && invitation.invitedByAdminId === rejectorId) {
    invitedByThisRejector = true;
  } else if (config.inviterRole === 'landlord' && invitation.invitedByLandlordId === rejectorId) {
    invitedByThisRejector = true;
  } else if (config.inviterRole === 'pmc' && invitation.invitedByPMCId === rejectorId) {
    invitedByThisRejector = true;
  } else if (invitation.invitedBy === rejectorId && invitation.invitedByRole === config.inviterRole) {
    // Fallback to generic field
    invitedByThisRejector = true;
  }

  if (!invitedByThisRejector) {
    throw new Error('You can only reject applications you invited');
  }

  const userId = invitation[config.userRelationField];
  if (!userId) {
    throw new Error('User not found for this application');
  }

  // Use the existing approval service (lazy load to avoid circular dependencies)
  const { rejectEntity, APPROVAL_CONFIG } = require('./approval-service');
  const approvalConfig = APPROVAL_CONFIG[config.applicationType];
  
  if (!approvalConfig) {
    throw new Error(`Invalid approval configuration for ${config.applicationType}`);
  }

  // Reject the entity (approval service handles transactions internally)
  const updatedEntity = await rejectEntity(prisma, approvalConfig, {
    entityId: userId,
    rejectorId,
    rejectorName,
    rejectorRole,
    reason: reason || comment || 'Application rejected',
    comment,
  });

  // PHASE 2: Sync rejection status to invitation
  if (rejectorRole === 'admin') {
    try {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          rejectedBy: rejectorId,
          rejectedAt: new Date(),
          rejectionReason: reason || comment || 'Application rejected',
          approvedBy: null,
          approvedAt: null,
        },
      });
    } catch (invitationError: any) {
      // Log error but don't fail the rejection
      console.error('[Application Service] Error updating invitation rejection status:', invitationError);
    }
  }

  return {
    success: true,
    data: updatedEntity,
    message: 'Application rejected successfully',
  };
}

