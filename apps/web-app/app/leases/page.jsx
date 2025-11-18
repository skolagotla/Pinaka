import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData, serializeLease } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load lease clients
const LandlordLeasesClient = dynamic(() => import('@/components/pages/landlord/leases/ui').then(mod => mod.default));
const PMCLeasesClient = dynamic(() => import('@/components/pages/pmc/leases/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'landlord') {
    // Landlord leases logic - reuse existing page logic
    // Removed - no longer needed
    // Since we can't directly call the component, we'll duplicate the logic
    const landlord = await prisma.landlord.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!landlord) {
      return (
        <main className="page">
          <LandlordLeasesClient 
            units={[]} 
            tenants={[]} 
            initialLeases={[]} 
            user={null} 
          />
        </main>
      );
    }

    // Get properties for this landlord
    const properties = await prisma.property.findMany({
      where: {
        landlordId: landlord.id,
      },
      select: {
        id: true,
      },
    });

    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return (
        <LandlordLeasesClient 
          units={[]} 
          tenants={[]} 
          initialLeases={[]} 
          user={serializePrismaData(user)} 
        />
      );
    }

    // Get units for landlord's properties
    const units = await prisma.unit.findMany({
      where: {
        propertyId: {
          in: propertyIds,
        },
      },
      select: {
        id: true,
        unitName: true,
        bedrooms: true,
        bathrooms: true,
        rentPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get tenants associated with landlord's properties
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
      },
    });

    // OPTIMIZED: Use select instead of include for better performance
    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      select: {
        id: true,
        status: true,
        leaseStart: true,
        leaseEnd: true,
        rentAmount: true,
        securityDeposit: true,
        createdAt: true,
        updatedAt: true,
        unit: {
          select: {
            id: true,
            unitName: true,
            bedrooms: true,
            bathrooms: true,
            rentPrice: true,
            status: true,
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
        leaseTenants: {
          select: {
            leaseId: true,
            tenantId: true,
            isPrimaryTenant: true,
            addedAt: true,
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return (
      <LandlordLeasesClient 
        units={units.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        }))}
        tenants={tenants.map(t => ({
          ...t,
          createdAt: t.createdAt?.toISOString(),
          updatedAt: t.updatedAt?.toISOString(),
        }))}
        initialLeases={leases.map(l => serializeLease(l))} 
        user={serializePrismaData(user)} 
      />
    );
  } else if (userRole === 'pmc') {
    // PMC leases logic - reuse existing page logic
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
        <PMCLeasesClient
          units={[]}
          tenants={[]}
          initialLeases={[]}
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
      },
    });

    const propertyIds = properties.map(p => p.id);

    // Get units for managed properties
    // OPTIMIZED: Use select instead of include
    const units = await prisma.unit.findMany({
      where: {
        propertyId: {
          in: propertyIds,
        },
      },
      select: {
        id: true,
        unitName: true,
        bedrooms: true,
        bathrooms: true,
        rentPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            propertyName: true,
            addressLine1: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get tenants associated with managed properties
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
      },
    });

    // OPTIMIZED: Use select instead of include for better performance
    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          propertyId: {
            in: propertyIds,
          },
        },
      },
      select: {
        id: true,
        status: true,
        leaseStart: true,
        leaseEnd: true,
        rentAmount: true,
        securityDeposit: true,
        createdAt: true,
        updatedAt: true,
        unit: {
          select: {
            id: true,
            unitName: true,
            bedrooms: true,
            bathrooms: true,
            rentPrice: true,
            status: true,
            property: {
              select: {
                id: true,
                propertyName: true,
                addressLine1: true,
              },
            },
          },
        },
        leaseTenants: {
          select: {
            leaseId: true,
            tenantId: true,
            isPrimaryTenant: true,
            addedAt: true,
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return (
      <PMCLeasesClient
        units={units.map(u => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        }))}
        tenants={tenants.map(t => ({
          ...t,
          createdAt: t.createdAt?.toISOString(),
          updatedAt: t.updatedAt?.toISOString(),
        }))}
        initialLeases={leases.map(l => serializeLease(l))}
      />
    );
  }

  return null;
}, { role: 'both' }); // 'both' allows landlord and PMC

