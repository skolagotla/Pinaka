import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import OperationsClient from './ui';

/**
 * Unified Operations Page
 * Consolidates Maintenance and Inspections functionality
 * Works for all roles: PMC, Landlord, Tenant
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  console.log('[Operations Page] Starting with userRole:', userRole, 'user:', user?.id);
  
  let maintenanceData = null;
  let inspectionsData = null;
  
  try {
    if (userRole === 'landlord') {
    // Load maintenance data
    try {
      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          property: {
            landlordId: user.id,
          },
        },
        select: {
          id: true,
          propertyId: true,
          tenantId: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          requestedDate: true,
          completedDate: true,
          tenantApproved: true,
          landlordApproved: true,
          createdAt: true,
          updatedAt: true,
          ticketNumber: true,
          initiatedBy: true,
          actualCost: true,
          estimatedCost: true,
          scheduledDate: true,
          rating: true,
          property: {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          pmcApprovalRequest: {
            select: {
              id: true,
              status: true,
              requestedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      maintenanceData = {
        requests: requests.map(r => serializePrismaData(r)),
      };
    } catch (error) {
      console.error('[Operations Page] Error loading maintenance data:', error);
    }

    // Load inspections data
    try {
      const tenants = await prisma.tenant.findMany({
        where: { invitedBy: email },
        select: { id: true },
      });

      const tenantIds = tenants.map(t => t.id);

      const checklists = tenantIds.length > 0 ? await prisma.inspectionChecklist.findMany({
        where: {
          tenantId: { in: tenantIds },
        },
        select: {
          id: true,
          tenantId: true,
          propertyId: true,
          unitId: true,
          inspectionDate: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          items: {
            orderBy: { createdAt: 'asc' },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }) : [];

      inspectionsData = {
        checklists: serializePrismaData(checklists),
      };
    } catch (error) {
      console.error('[Operations Page] Error loading inspections data:', error);
    }
  } else if (userRole === 'pmc') {
    // Load PMC maintenance data
    try {
      const pmcRelationships = await prisma.pMCLandlord.findMany({
        where: {
          pmcId: user.id,
          status: 'active',
        },
        select: { landlordId: true },
      });

      const landlordIds = pmcRelationships.map(rel => rel.landlordId);

      if (landlordIds.length > 0) {
        const properties = await prisma.property.findMany({
          where: { landlordId: { in: landlordIds } },
          select: { id: true },
        });

        const propertyIds = properties.map(p => p.id);

        const requests = await prisma.maintenanceRequest.findMany({
          where: {
            propertyId: { in: propertyIds },
          },
          select: {
            id: true,
            propertyId: true,
            tenantId: true,
            title: true,
            description: true,
            category: true,
            priority: true,
            status: true,
            requestedDate: true,
            completedDate: true,
            tenantApproved: true,
            landlordApproved: true,
            createdAt: true,
            updatedAt: true,
            ticketNumber: true,
            initiatedBy: true,
            actualCost: true,
            estimatedCost: true,
            scheduledDate: true,
            rating: true,
            property: {
              select: {
                id: true,
                propertyName: true,
                addressLine1: true,
              },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            assignedToVendorId: true, // Legacy field - no relation
            assignedToProviderId: true, // New unified field
            pmcApprovalRequest: {
              select: {
                id: true,
                status: true,
                requestedAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        maintenanceData = {
          requests: requests.map(r => serializePrismaData(r)),
        };

        // Load PMC inspections data
        const pmcLandlords = await prisma.pMCLandlord.findMany({
          where: {
            pmcId: user.id,
            status: 'active',
          },
          select: {
            id: true,
            landlordId: true,
            landlord: {
              select: { id: true },
            },
          },
        });

        const landlordIdsForInspections = pmcLandlords.map(pl => pl.landlord.id);

        const propertiesForInspections = await prisma.property.findMany({
          where: {
            landlordId: { in: landlordIdsForInspections },
          },
          select: {
            id: true,
            units: {
              select: {
                id: true,
                leases: {
                  select: {
                    id: true,
                    leaseTenants: {
                      select: { tenantId: true },
                    },
                  },
                },
              },
            },
          },
        });

        const tenantIds = new Set();
        propertiesForInspections.forEach(property => {
          property.units.forEach(unit => {
            unit.leases.forEach(lease => {
              lease.leaseTenants.forEach(lt => {
                if (lt.tenantId) {
                  tenantIds.add(lt.tenantId);
                }
              });
            });
          });
        });

        const checklists = tenantIds.size > 0 ? await prisma.inspectionChecklist.findMany({
          where: {
            tenantId: { in: Array.from(tenantIds) },
          },
          select: {
            id: true,
            tenantId: true,
            propertyId: true,
            unitId: true,
            inspectionDate: true,
            status: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            items: {
              orderBy: { createdAt: 'asc' },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }) : [];

        inspectionsData = {
          checklists: serializePrismaData(checklists),
        };
      }
    } catch (error) {
      console.error('[Operations Page] Error loading PMC data:', error);
    }
  } else if (userRole === 'tenant') {
    // Load tenant maintenance data
    try {
      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          tenantId: user.id,
        },
        select: {
          id: true,
          propertyId: true,
          tenantId: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          status: true,
          requestedDate: true,
          completedDate: true,
          tenantApproved: true,
          landlordApproved: true,
          createdAt: true,
          updatedAt: true,
          ticketNumber: true,
          initiatedBy: true,
          actualCost: true,
          estimatedCost: true,
          scheduledDate: true,
          rating: true,
          property: {
            select: {
              id: true,
              propertyName: true,
              addressLine1: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      maintenanceData = {
        requests: requests.map(r => serializePrismaData(r)),
      };
    } catch (error) {
      console.error('[Operations Page] Error loading tenant maintenance data:', error);
    }

    // Load tenant inspections data
    try {
      const checklists = await prisma.inspectionChecklist.findMany({
        where: {
          tenantId: user.id,
        },
        select: {
          id: true,
          tenantId: true,
          propertyId: true,
          unitId: true,
          inspectionDate: true,
          status: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          items: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      inspectionsData = {
        checklists: serializePrismaData(checklists),
      };
    } catch (error) {
      console.error('[Operations Page] Error loading tenant inspections data:', error);
    }
    }
  } catch (error) {
    console.error('[Operations Page] Fatal error:', error);
    console.error('[Operations Page] Error message:', error?.message);
    console.error('[Operations Page] Error stack:', error?.stack);
    console.error('[Operations Page] Error name:', error?.name);
    console.error('[Operations Page] Error code:', error?.code);
    // Return error page instead of crashing
    return (
      <main className="page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Error Loading Operations</h1>
          <p>An error occurred while loading the operations page.</p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 20, textAlign: 'left', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
              {error?.message && <p><strong>Error:</strong> {error.message}</p>}
              {error?.name && <p><strong>Type:</strong> {error.name}</p>}
              {error?.code && <p><strong>Code:</strong> {error.code}</p>}
              {error?.stack && (
                <pre style={{ marginTop: 10, fontSize: '12px', overflow: 'auto' }}>
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  // Serialize user data - ensure user exists
  if (!user) {
    console.error('[Operations Page] No user found');
    return (
      <main className="page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Authentication Error</h1>
          <p>User not found. Please try logging in again.</p>
        </div>
      </main>
    );
  }

  try {
    const serializedUser = serializePrismaData({
      ...user,
      role: userRole || 'landlord',
    });

    console.log('[Operations Page] Rendering OperationsClient with:', {
      userRole,
      hasMaintenanceData: !!maintenanceData,
      hasInspectionsData: !!inspectionsData,
    });

    return (
      <main className="page">
        <OperationsClient
          user={serializedUser}
          userRole={userRole || 'landlord'}
          maintenanceData={maintenanceData || { requests: [] }}
          inspectionsData={inspectionsData || { checklists: [] }}
        />
      </main>
    );
  } catch (renderError) {
    console.error('[Operations Page] Error during render:', renderError);
    console.error('[Operations Page] Render error stack:', renderError?.stack);
    return (
      <main className="page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Error Rendering Operations</h1>
          <p>An error occurred while rendering the operations page.</p>
          {process.env.NODE_ENV === 'development' && renderError?.message && (
            <pre style={{ marginTop: 20, textAlign: 'left', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
              {renderError.message}
            </pre>
          )}
        </div>
      </main>
    );
  }
}, { role: 'both' }); // Allow all roles

