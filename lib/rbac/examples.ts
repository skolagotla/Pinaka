/**
 * RBAC Integration Examples
 * 
 * Examples of how to use RBAC in API routes and functions
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withRBAC, withScopeCheck, hasPermission, canAccess } from './index';
import { ResourceCategory, PermissionAction } from '@prisma/client';

// ============================================
// Example 1: Basic RBAC Middleware
// ============================================
export const exampleGetProperties = withRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    // This handler only runs if user has permission
    // Permission check: READ on PROPERTY_UNIT_MANAGEMENT category, 'properties' resource
    
    const properties = await prisma.property.findMany({
      // Your query here
    });

    return res.status(200).json({ success: true, data: properties });
  },
  {
    requiredPermission: {
      resource: 'properties',
      action: PermissionAction.READ,
      category: ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    },
    logAccess: true, // Log all access attempts
  }
);

// ============================================
// Example 2: Scope-Based Access
// ============================================
export const exampleGetTenants = withScopeCheck(
  async (req: NextApiRequest, res: NextApiResponse, filteredQuery?: any) => {
    // filteredQuery already has scope filtering applied
    const tenants = await prisma.tenant.findMany(filteredQuery);

    return res.status(200).json({ success: true, data: tenants });
  },
  'tenant' // Resource type for scope filtering
);

// ============================================
// Example 3: Manual Permission Check
// ============================================
export async function exampleCreateProperty(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = getUserFromRequest(req); // Your auth function
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check permission manually
  const canCreate = await hasPermission(
    user.userId,
    user.userType,
    'properties',
    PermissionAction.CREATE,
    ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    {
      pmcId: req.body.pmcId,
      landlordId: req.body.landlordId,
    }
  );

  if (!canCreate) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Create property with approval workflow
  const property = await prisma.property.create({
    data: req.body,
  });

  // If requires approval, create approval request
  // (Implementation depends on your approval system)

  return res.status(201).json({ success: true, data: property });
}

// ============================================
// Example 4: Approval Workflow
// ============================================
export const exampleApproveExpense = withRBAC(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const expenseId = req.query.id as string;
    const user = getUserFromRequest(req);

    // Check if expense requires approval
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if user can approve (Accountant, PM, or Owner)
    const canApprove = await hasPermission(
      user!.userId,
      user!.userType,
      'expenses',
      PermissionAction.APPROVE,
      ResourceCategory.MAINTENANCE,
      {
        propertyId: expense.propertyId || undefined,
      }
    );

    if (!canApprove) {
      return res.status(403).json({ error: 'Cannot approve this expense' });
    }

    // Approve expense
    const approved = await prisma.expense.update({
      where: { id: expenseId },
      data: { /* approval data */ },
    });

    return res.status(200).json({ success: true, data: approved });
  },
  {
    requiredPermission: {
      resource: 'expenses',
      action: PermissionAction.APPROVE,
      category: ResourceCategory.MAINTENANCE,
    },
  }
);

// ============================================
// Example 5: Access Check Before Operation
// ============================================
export async function exampleUpdateTenant(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tenantId = req.query.id as string;
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user can access this tenant
  const canAccessTenant = await canAccess(
    user.userId,
    user.userType,
    tenantId,
    'tenant'
  );

  if (!canAccessTenant) {
    return res.status(403).json({ error: 'Cannot access this tenant' });
  }

  // Update tenant
  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: req.body,
  });

  return res.status(200).json({ success: true, data: updated });
}

// Helper function (implement based on your auth system)
function getUserFromRequest(req: NextApiRequest): {
  userId: string;
  userType: string;
} | null {
  // Implement based on existing authentication system (Auth0 via apiMiddleware)
  // The withAuth middleware sets req.user with UserContext
  const userContext = (req as any).user;
  if (userContext) {
    return {
      userId: userContext.userId,
      userType: userContext.role, // Map role to userType
    };
  }
  
  // Fallback: Try to get from session
  try {
    const session = (req as any).session;
    if (session?.user) {
      return {
        userId: session.user.id || session.user.sub || session.user.email,
        userType: session.user.type || session.user.role || 'tenant',
      };
    }
  } catch (error) {
    // Session check failed
  }
  
  return null;
}

// Import prisma (adjust path as needed)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

