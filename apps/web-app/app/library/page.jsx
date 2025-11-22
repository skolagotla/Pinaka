import { redirect } from 'next/navigation';
import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import DocumentsClient from './ui';

/**
 * Unified Documents Page
 * Consolidates Library and Forms functionality
 * Works for all roles: Admin, PMC, Landlord, Tenant
 * Admin users are redirected to /admin/library for consistency
 * PMC users use same approach as admin - no props, loads internally
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  // Redirect admin users to /admin/library for consistency
  if (userRole === 'admin') {
    redirect('/admin/library');
  }
  
  // For PMC, use same approach as admin - no data loading needed
  // UnifiedLibraryComponent will load user internally
  if (userRole === 'pmc' || userRole === 'pm') {
    return <DocumentsClient userRole={userRole} />;
  }
  
  // For landlord/tenant, we need to load library data
  let libraryData = null;
  
  if (userRole === 'landlord') {
    const { getLandlordWithFullRelations } = require('@/lib/utils/landlord-data-loader');
    try {
      const landlord = await getLandlordWithFullRelations(prisma, email, {
        includeProperties: true,
        includeUnits: true,
        includeLeases: true,
        includeTenants: true,
        includeDocuments: true,
        autoCreateUnits: true
      });
      
      if (landlord && landlord.properties) {
        // Extract all unique tenants with their documents
        const tenantsMap = new Map();
        
        landlord.properties.forEach(property => {
          (property.units || []).forEach(unit => {
            (unit.leases || []).forEach(lease => {
              (lease.leaseTenants || []).forEach(lt => {
                if (lt.tenant && !tenantsMap.has(lt.tenant.id)) {
                  tenantsMap.set(lt.tenant.id, {
                    ...lt.tenant,
                    lease: {
                      id: lease.id,
                      status: lease.status,
                      leaseStart: lease.leaseStart?.toISOString() || null,
                      leaseEnd: lease.leaseEnd?.toISOString() || null,
                      property: {
                        propertyName: property.propertyName,
                        addressLine1: property.addressLine1,
                      },
                      unit: {
                        unitNumber: unit.unitNumber || unit.unitName,
                      },
                    },
                  });
                }
              });
            });
          });
        });
        
        libraryData = {
          landlord: serializePrismaData(landlord),
          tenants: Array.from(tenantsMap.values()).map(t => serializePrismaData(t)),
        };
      }
    } catch (error) {
      console.error('[Documents Page] Error loading landlord data:', error);
    }
  } else if (userRole === 'tenant') {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { email },
        include: {
          documents: {
            where: { isDeleted: false },
            orderBy: [
              { isRequired: 'desc' },
              { category: 'asc' },
              { uploadedAt: 'desc' },
            ],
          },
          leaseTenants: {
            include: {
              lease: {
                include: {
                  leaseDocuments: {
                    orderBy: { uploadedAt: 'desc' },
                  },
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
      
      if (tenant) {
        const leaseDocuments = tenant.leaseTenants.flatMap((lt) =>
          (lt.lease?.leaseDocuments || []).map((doc) => ({
            ...doc,
            leaseInfo: {
              property: lt.lease.unit?.property?.propertyName || lt.lease.unit?.property?.addressLine1,
              unit: lt.lease.unit?.unitName,
            },
          }))
        );
        
        libraryData = {
          tenant: serializePrismaData(tenant),
          initialDocuments: tenant.documents.map(d => serializePrismaData(d)),
          leaseDocuments: leaseDocuments.map(d => serializePrismaData(d)),
        };
      }
    } catch (error) {
      console.error('[Documents Page] Error loading tenant data:', error);
    }
  }

  // Serialize user data
  const serializedUser = serializePrismaData({
    ...user,
    role: userRole || 'landlord',
  });

  return (
    <DocumentsClient
      user={serializedUser}
      userRole={userRole || 'landlord'}
      libraryData={libraryData}
    />
  );
}, { role: 'both' }); // Allow all roles

