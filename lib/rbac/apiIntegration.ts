/**
 * RBAC API Integration Examples
 * Phase 4: Feature Implementation (RBAC-Enabled)
 * 
 * Examples of integrating RBAC into API routes
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  withCombinedRBAC,
  createRBACQueryBuilder,
  hasPermission,
  canAccessResource,
} from './index';
import {
  createPropertyEditApproval,
  approvePropertyEdit,
  createBigExpenseApproval,
  approveBigExpense,
  createLeaseApproval,
  approveLease,
  createRefundApproval,
  approveRefund,
  getPendingApprovals,
} from './approvalWorkflows';
import {
  logDataAccess,
  logSensitiveDataAccess,
  logReportAccess,
  logDataExport,
} from './auditLogging';
import { ResourceCategory, PermissionAction } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper to get user from request
 * Implement based on your auth system
 */
function getUserFromRequest(req: NextApiRequest): {
  userId: string;
  userType: string;
  email?: string;
  name?: string;
} | null {
  // Implement based on existing authentication system (Auth0 via apiMiddleware)
  // Use the withAuth middleware which sets req.user with UserContext
  const session = (req as any).session;
  if (session?.user) {
    return {
      userId: session.user.id,
      userType: session.user.type || 'tenant',
      email: session.user.email,
      name: session.user.name,
    };
  }
  return null;
}

/**
 * Example: Get Properties API
 * Uses RBAC query builder for automatic data isolation
 */
export async function getProperties(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Create RBAC query builder
  const queryBuilder = createRBACQueryBuilder(user.userId, user.userType);

  try {
    // Automatically filters by user's scope
    const properties = await queryBuilder.findProperties({
      include: {
        landlord: true,
        units: true,
      },
    });

    // Log data access
    await logDataAccess(
      user.userId,
      user.userType,
      user.email || '',
      user.name || '',
      'property',
      'all',
      'read',
      req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      req.headers['user-agent']
    );

    return res.status(200).json({ success: true, data: properties });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Get Property by ID API
 * Uses permission check and access validation
 */
export async function getPropertyById(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const propertyId = req.query.id as string;

  // Check if user can access this property
  const canAccess = await canAccessResource(
    user.userId,
    user.userType,
    propertyId,
    'property'
  );

  if (!canAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const queryBuilder = createRBACQueryBuilder(user.userId, user.userType);
    const property = await queryBuilder.findProperty(propertyId, {
      include: {
        landlord: true,
        units: {
          include: {
            leases: true,
          },
        },
      },
    });

    // Log data access
    await logDataAccess(
      user.userId,
      user.userType,
      user.email || '',
      user.name || '',
      'property',
      propertyId,
      'read',
      req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
      req.headers['user-agent']
    );

    return res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Update Property API
 * Requires approval workflow for property edits
 */
export const updateProperty = withCombinedRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const propertyId = req.query.id as string;
    const changes = req.body;

    try {
      // Check if user can update
      const canUpdate = await hasPermission(
        user.userId,
        user.userType,
        'properties',
        PermissionAction.UPDATE,
        ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
        {
          propertyId,
        }
      );

      if (!canUpdate) {
        return res.status(403).json({ error: 'Cannot update this property' });
      }

      // Property edits require approval - create approval request
      const approvalRequestId = await createPropertyEditApproval(
        propertyId,
        changes,
        user.userId,
        user.userType
      );

      return res.status(202).json({
        success: true,
        message: 'Property edit submitted for approval',
        approvalRequestId,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  {
    requiredPermission: {
      resource: 'properties',
      action: PermissionAction.UPDATE,
      category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    },
    resourceType: 'property',
    logAccess: true,
  }
);

/**
 * Example: Create Expense API
 * Checks for big expense threshold and creates approval if needed
 */
export const createExpense = withCombinedRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, propertyId, pmcId, landlordId, threshold = 1000 } = req.body;

    try {
      // Check if user can create expenses
      const canCreate = await hasPermission(
        user.userId,
        user.userType,
        'expenses',
        PermissionAction.CREATE,
        ResourceCategory.MAINTENANCE,
        {
          propertyId,
        }
      );

      if (!canCreate) {
        return res.status(403).json({ error: 'Cannot create expenses' });
      }

      // Create expense (example - requires all required fields)
      // Note: This is example code and should be replaced with proper expense creation logic
      // that includes all required fields: id, category, date, description, createdBy, updatedAt
      throw new Error('Expense creation not fully implemented - requires id, category, date, description, createdBy, updatedAt');
      /*
      const expense = await prisma.expense.create({
        data: {
          id: generateCUID(),
          amount,
          propertyId,
          category: req.body.category || 'other',
          date: new Date(req.body.date || Date.now()),
          description: req.body.description || '',
          createdBy: user.userId,
          updatedAt: new Date(),
        },
      });

      // If big expense, create approval request
      if (amount > threshold) {
        const approvalRequestId = await createBigExpenseApproval(
          expense.id,
          amount,
          threshold,
          user.userId,
          user.userType,
          pmcId,
          landlordId
        );

        return res.status(201).json({
          success: true,
          data: expense,
          approvalRequired: true,
          approvalRequestId,
        });
      }

      return res.status(201).json({
        success: true,
        data: expense,
        approvalRequired: false,
      });
      */
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  {
    requiredPermission: {
      resource: 'expenses',
      action: PermissionAction.CREATE,
      category: ResourceCategory.MAINTENANCE,
    },
    logAccess: true,
  }
);

/**
 * Example: Get Tenants API
 * Uses RBAC query builder with automatic tenant isolation
 */
export async function getTenants(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const queryBuilder = createRBACQueryBuilder(user.userId, user.userType);
    const tenants = await queryBuilder.findTenants({
      include: {
        leases: true,
      },
    });

    // Log sensitive data access if viewing financials
    if (req.query.includeFinancials === 'true') {
      await logSensitiveDataAccess(
        user.userId,
        user.userType,
        user.email || '',
        user.name || '',
        'tenant',
        'all',
        ['financials', 'paymentHistory'],
        req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        req.headers['user-agent']
      );
    }

    return res.status(200).json({ success: true, data: tenants });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Create Lease API
 * Always requires approval
 */
export const createLease = withCombinedRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { unitId, tenantIds, landlordId, ...leaseData } = req.body;

    try {
      // Check if user can create leases
      const canCreate = await hasPermission(
        user.userId,
        user.userType,
        'leases',
        PermissionAction.CREATE,
        ResourceCategory.LEASING_APPLICATIONS,
        {
          propertyId: req.body.propertyId,
        }
      );

      if (!canCreate) {
        return res.status(403).json({ error: 'Cannot create leases' });
      }

      // Create lease (draft status)
      const lease = await prisma.lease.create({
        data: {
          ...leaseData,
          unitId,
          status: 'Draft', // Not official until approved
        },
      });

      // Create lease approval request (ALWAYS required)
      const approvalRequestId = await createLeaseApproval(
        lease.id,
        user.userId,
        user.userType,
        landlordId
      );

      return res.status(201).json({
        success: true,
        data: lease,
        approvalRequired: true,
        approvalRequestId,
        message: 'Lease created and submitted for owner approval',
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  {
    requiredPermission: {
      resource: 'leases',
      action: PermissionAction.CREATE,
      category: ResourceCategory.LEASING_APPLICATIONS,
    },
    logAccess: true,
  }
);

/**
 * Example: Approve Lease API
 */
export const approveLeaseEndpoint = withCombinedRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { approvalRequestId, leaseId } = req.body;

    try {
      await approveLease(
        approvalRequestId,
        leaseId,
        user.userId,
        user.userType,
        user.email,
        user.name
      );

      return res.status(200).json({
        success: true,
        message: 'Lease approved',
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  {
    requiredPermission: {
      resource: 'leases',
      action: PermissionAction.APPROVE,
      category: ResourceCategory.LEASING_APPLICATIONS,
    },
    logAccess: true,
  }
);

/**
 * Example: Get Pending Approvals API
 */
export async function getPendingApprovalsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const approvals = await getPendingApprovals(user.userId, user.userType);

    return res.status(200).json({ success: true, data: approvals });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Example: Generate Report API
 * Logs report generation and export
 */
export const generateReport = withCombinedRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reportType, format = 'json', export: shouldExport = false } = req.query;

    try {
      // Check if user can generate reports
      const canGenerate = await hasPermission(
        user.userId,
        user.userType,
        'reports',
        PermissionAction.VIEW,
        ResourceCategory.REPORTING_OWNER_STATEMENTS
      );

      if (!canGenerate) {
        return res.status(403).json({ error: 'Cannot generate reports' });
      }

      // Generate report (implementation depends on your report system)
      const report = {
        type: reportType,
        data: [], // Your report data
        generatedAt: new Date(),
      };

      // Log report access
      await logReportAccess(
        user.userId,
        user.userType,
        user.email || '',
        user.name || '',
        reportType as string,
        undefined,
        shouldExport === 'true',
        req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
        req.headers['user-agent']
      );

      if (shouldExport === 'true') {
        // Log data export
        await logDataExport(
          user.userId,
          user.userType,
          user.email || '',
          user.name || '',
          reportType as string,
          0, // record count
          req.query,
          req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
          req.headers['user-agent']
        );
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
  {
    requiredPermission: {
      resource: 'reports',
      action: PermissionAction.VIEW,
      category: ResourceCategory.REPORTING_OWNER_STATEMENTS,
    },
    logAccess: true,
  }
);

