/**
 * Property Inspections Feature (Enhanced)
 * Phase 4: Feature Implementation (RBAC-Enabled)
 * 
 * Enhances existing InspectionChecklist with RBAC integration
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission, canAccessResource } from '../rbac';
import { logDataAccess } from '../rbac/auditLogging';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create property inspection
 * RBAC: PM or licensed inspector can conduct inspections
 */
export async function createPropertyInspection(
  propertyId: string,
  unitId: string | null,
  inspectionType: 'move-in' | 'move-out' | 'periodic' | 'damage_assessment',
  conductedBy: string,
  conductedByType: string,
  conductedByEmail: string,
  conductedByName: string,
  tenantId?: string
): Promise<string> {
  // Check permission
  const canConduct = await hasPermission(
    conductedBy,
    conductedByType,
    'inspections',
    PermissionAction.CREATE,
    ResourceCategory.PROPERTY_UNIT_MANAGEMENT,
    {
      propertyId,
      unitId: unitId || undefined,
    }
  );

  if (!canConduct) {
    throw new Error('You do not have permission to conduct inspections');
  }

  // Verify user is PM or licensed inspector
  // (This would check user's role - PM or licensed inspector)
  if (conductedByType !== 'pmc' && conductedByType !== 'landlord') {
    // Check if user has licensed inspector role or PM role
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: conductedBy,
        userType: conductedByType,
        isActive: true,
        role: {
          name: {
            in: ['PROPERTY_MANAGER', 'LEASING_AGENT'], // PM or Leasing can conduct
          },
        },
      },
    });

    if (userRoles.length === 0) {
      throw new Error('Only Property Managers or licensed inspectors can conduct inspections');
    }
  }

  // Check property access
  const canAccessProperty = await canAccessResource(
    conductedBy,
    conductedByType,
    propertyId,
    'property'
  );

  if (!canAccessProperty) {
    throw new Error('Access denied to this property');
  }

  // Create inspection checklist
  const now = new Date();
  const inspection = await prisma.inspectionChecklist.create({
    data: {
      id: `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: tenantId || '', // Required by schema, but can be empty for property inspections
      propertyId,
      unitId,
      checklistType: inspectionType,
      status: 'pending',
      updatedAt: now,
    },
  });

  // Log inspection creation
  await prisma.rBACAuditLog.create({
    data: {
      userId: conductedBy,
      userType: conductedByType,
      userEmail: conductedByEmail,
      userName: conductedByName,
      action: 'inspection_created',
      resource: 'inspection',
      resourceId: inspection.id,
      details: {
        inspectionType,
        propertyId,
        unitId,
      },
    },
  });

  return inspection.id;
}

/**
 * Tenant can request inspection
 * RBAC: Tenant can request inspections for their unit
 */
export async function requestInspection(
  propertyId: string,
  unitId: string,
  inspectionType: 'move-in' | 'move-out' | 'periodic' | 'damage_assessment',
  tenantId: string,
  tenantEmail: string,
  tenantName: string
): Promise<string> {
  // Verify tenant has active lease for this unit
  const lease = await prisma.leaseTenant.findFirst({
    where: {
      tenantId,
      lease: {
        unitId,
        status: 'Active',
      },
    },
  });

  if (!lease) {
    throw new Error('You must have an active lease for this unit to request an inspection');
  }

  // Create inspection request
  const now = new Date();
  const inspection = await prisma.inspectionChecklist.create({
    data: {
      id: `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      propertyId,
      unitId,
      checklistType: inspectionType,
      status: 'pending',
      updatedAt: now,
    },
  });

  // Log inspection request
  await prisma.rBACAuditLog.create({
    data: {
      userId: tenantId,
      userType: 'tenant',
      userEmail: tenantEmail,
      userName: tenantName,
      action: 'inspection_requested',
      resource: 'inspection',
      resourceId: inspection.id,
      details: {
        inspectionType,
        propertyId,
        unitId,
      },
    },
  });

  return inspection.id;
}

/**
 * Get inspection report
 * RBAC: Shared with tenants and landlords
 */
export async function getInspectionReport(
  inspectionId: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<any> {
  const inspection = await prisma.inspectionChecklist.findUnique({
    where: { id: inspectionId },
    include: {
      items: true,
      tenant: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!inspection) {
    throw new Error('Inspection not found');
  }

  // Check access
  if (userType === 'tenant') {
    // Tenant can only see their own inspections
    if (inspection.tenantId !== userId) {
      throw new Error('Access denied');
    }
  } else {
    // PM/Landlord need property access
    if (inspection.propertyId) {
      const canAccess = await canAccessResource(
        userId,
        userType,
        inspection.propertyId,
        'property'
      );

      if (!canAccess) {
        throw new Error('Access denied');
      }
    }
  }

  // Log access
  await logDataAccess(
    userId,
    userType,
    userEmail,
    userName,
    'inspection',
    inspectionId,
    'read',
    ipAddress,
    userAgent
  );

  return inspection;
}

