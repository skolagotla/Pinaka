/**
 * Property Inference Utilities
 * 
 * Helper functions to infer propertyId from various relationships
 * for property-centric architecture
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Infer propertyId from tenantId by finding active lease
 * Path: Tenant → LeaseTenant → Lease → Unit → Property
 */
export async function inferPropertyFromTenant(tenantId: string): Promise<string | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) return null;

    // Find active or pending lease
    const activeLease = tenant.leaseTenants.find(
      (lt) => lt.lease.status === 'Active' || lt.lease.status === 'Pending'
    );

    return activeLease?.lease.unit.property.id || null;
  } catch (error) {
    console.error('[Property Inference] Error inferring property from tenant:', error);
    return null;
  }
}

/**
 * Infer propertyId from linkedEntityType and linkedEntityId
 * Supports: property, unit, lease, maintenance
 */
export async function inferPropertyFromLinkedEntity(
  linkedEntityType: string | null,
  linkedEntityId: string | null
): Promise<string | null> {
  if (!linkedEntityType || !linkedEntityId) return null;

  try {
    switch (linkedEntityType) {
      case 'property':
        // Direct property link
        const property = await prisma.property.findUnique({
          where: { id: linkedEntityId },
        });
        return property?.id || null;

      case 'unit':
        // Unit → Property
        const unit = await prisma.unit.findUnique({
          where: { id: linkedEntityId },
          include: { property: true },
        });
        return unit?.property.id || null;

      case 'lease':
        // Lease → Unit → Property
        const lease = await prisma.lease.findUnique({
          where: { id: linkedEntityId },
          include: {
            unit: {
              include: { property: true },
            },
          },
        });
        return lease?.unit.property.id || null;

      case 'maintenance':
        // MaintenanceRequest → Property
        const maintenance = await prisma.maintenanceRequest.findUnique({
          where: { id: linkedEntityId },
          include: { property: true },
        });
        return maintenance?.property.id || null;

      default:
        return null;
    }
  } catch (error) {
    console.error('[Property Inference] Error inferring property from linked entity:', error);
    return null;
  }
}

/**
 * Infer propertyId from maintenanceRequestId
 */
export async function inferPropertyFromMaintenanceRequest(
  maintenanceRequestId: string | null
): Promise<string | null> {
  if (!maintenanceRequestId) return null;

  try {
    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceRequestId },
      include: { property: true },
    });

    return maintenance?.property.id || null;
  } catch (error) {
    console.error('[Property Inference] Error inferring property from maintenance request:', error);
    return null;
  }
}

