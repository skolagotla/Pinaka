import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData, serializeTenant } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load tenant clients
const LandlordTenantsClient = dynamic(() => import('@/components/pages/landlord/tenants/ui').then(mod => mod.default));
const PMCTenantsClient = dynamic(() => import('@/components/pages/pmc/tenants/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'landlord') {
    // Landlord tenants logic
    const landlord = await prisma.landlord.findUnique({
      where: { email },
      select: { id: true }
    });
    
    if (!landlord) {
      return (
        <main className="page">
          <LandlordTenantsClient initialTenants={[]} user={null} />
        </main>
      );
    }

    const serializedUser = user ? serializePrismaData(user) : null;
    
    // Get all tenants associated with landlord's properties through leases
    // OPTIMIZED: Use select instead of include for better performance
    const tenants = await prisma.tenant.findMany({
      where: {
        leaseTenants: {
          some: {
            lease: {
              unit: {
                property: {
                  landlordId: landlord.id,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        currentAddress: true,
        city: true,
        provinceState: true,
        postalZip: true,
        country: true,
        numberOfAdults: true,
        numberOfChildren: true,
        hasAccess: true,
        createdAt: true,
        updatedAt: true,
        leaseTenants: {
          select: {
            leaseId: true,
            tenantId: true,
            isPrimaryTenant: true,
            addedAt: true,
            lease: {
              select: {
                id: true,
                status: true,
                leaseStart: true,
                leaseEnd: true,
                rentAmount: true,
                unit: {
                  select: {
                    id: true,
                    unitName: true,
                    property: {
                      select: {
                        id: true,
                        propertyName: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        provinceState: true,
                        postalZip: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return (
      <LandlordTenantsClient 
        initialTenants={tenants.map(t => serializeTenant(t))} 
        user={serializedUser} 
      />
    );
  } else if (userRole === 'pmc') {
    // PMC tenants logic
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: user.id,
        status: 'active',
      },
      select: {
        landlordId: true,
      },
    });

    const landlordIds = pmcRelationships.map(rel => rel.landlordId);

    if (landlordIds.length === 0) {
      return (
        <PMCTenantsClient
          pmc={serializePrismaData(user)}
          tenants={[]}
        />
      );
    }

    const properties = await prisma.property.findMany({
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      select: {
        id: true,
        addressLine1: true,
      },
    });

    const propertyIds = properties.map(p => p.id);

    // OPTIMIZED: Use select instead of include for better performance
    const tenants = await prisma.tenant.findMany({
      where: {
        leaseTenants: {
          some: {
            lease: {
              unit: {
                propertyId: {
                  in: propertyIds,
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        currentAddress: true,
        city: true,
        provinceState: true,
        postalZip: true,
        country: true,
        numberOfAdults: true,
        numberOfChildren: true,
        hasAccess: true,
        createdAt: true,
        updatedAt: true,
        leaseTenants: {
          select: {
            leaseId: true,
            tenantId: true,
            isPrimaryTenant: true,
            addedAt: true,
            lease: {
              select: {
                id: true,
                status: true,
                leaseStart: true,
                leaseEnd: true,
                rentAmount: true,
                unit: {
                  select: {
                    id: true,
                    unitName: true,
                    property: {
                      select: {
                        id: true,
                        addressLine1: true,
                        propertyName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return (
      <PMCTenantsClient
        pmc={serializePrismaData(user)}
        tenants={tenants.map(t => serializeTenant(t))}
      />
    );
  }

  return null;
}, { role: 'both' }); // 'both' allows landlord and PMC

