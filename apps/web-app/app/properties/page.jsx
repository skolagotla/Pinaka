import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData, serializeProperty } from '@/lib/utils/serialize-prisma-data.js';
import dynamic from 'next/dynamic';

// Lazy load property clients
const LandlordPropertiesClient = dynamic(() => import('@/components/pages/landlord/properties/ui').then(mod => mod.default));
const PMCPropertiesClient = dynamic(() => import('@/components/pages/pmc/properties/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma }) => {
  if (userRole === 'landlord') {
    // Landlord properties logic
    // OPTIMIZED: Use select instead of include for better performance
    const properties = await prisma.property.findMany({
      where: {
        landlordId: user.id,
      },
      select: {
        id: true,
        propertyName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        provinceState: true,
        postalZip: true,
        country: true,
        propertyType: true,
        unitCount: true,
        createdAt: true,
        updatedAt: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        units: {
          select: {
            id: true,
            unitName: true,
            bedrooms: true,
            bathrooms: true,
            rentPrice: true,
            status: true,
            createdAt: true,
            leases: {
              where: {
                status: 'Active',
              },
              select: {
                id: true,
                status: true,
                leaseStart: true,
                leaseEnd: true,
                rentAmount: true,
                leaseTenants: {
                  select: {
                    tenant: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch landlord data for country/region defaults
    const landlord = await prisma.landlord.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        countryCode: true,
        regionCode: true,
      },
    });

    return (
      <LandlordPropertiesClient
        landlordId={user.id}
        initialProperties={properties.map(prop => serializeProperty(prop))}
        landlordData={{
          country: landlord?.countryCode || 'CA',
          region: landlord?.regionCode || 'ON',
        }}
      />
    );
  } else if (userRole === 'pmc') {
    // PMC properties logic
    // For PMC Admin users, use pmcId from user object, otherwise use user.id
    const pmcId = user.pmcId || user.id;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Properties Page] PMC user:', {
        userId: user.id,
        pmcId: pmcId,
        email: user.email,
        isPMCAdmin: !!user.isPMCAdmin,
      });
    }
    
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: pmcId,
        status: 'active',
        OR: [
          { endedAt: null },
          { endedAt: { gt: new Date() } },
        ],
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const landlordIds = pmcRelationships.map(rel => rel.landlordId);

    if (landlordIds.length === 0) {
      return (
        <main className="page">
          <PMCPropertiesClient 
            pmcId={user.id} 
            initialProperties={[]}
            pmcRelationships={[]}
          />
        </main>
      );
    }

    // OPTIMIZED: Use select instead of include for better performance
    const properties = await prisma.property.findMany({
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      select: {
        id: true,
        landlordId: true, // ✅ Added for filtering
        propertyName: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        provinceState: true,
        postalZip: true,
        country: true,
        propertyType: true,
        unitCount: true,
        createdAt: true,
        updatedAt: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        units: {
          select: {
            id: true,
            unitName: true,
            bedrooms: true,
            bathrooms: true,
            rentPrice: true,
            status: true,
            createdAt: true,
            leases: {
              where: {
                status: 'Active',
              },
              select: {
                id: true,
                status: true,
                leaseStart: true,
                leaseEnd: true,
                rentAmount: true,
                leaseTenants: {
                  select: {
                    tenant: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <PMCPropertiesClient
        pmcId={pmcId}
        initialProperties={properties.map(prop => serializeProperty(prop))}
        pmcRelationships={pmcRelationships.map(rel => ({
          ...rel,
          startedAt: rel.startedAt.toISOString(),
          endedAt: rel.endedAt?.toISOString() || null,
        }))}
      />
    );
  }

  // Tenant doesn't have properties page, redirect
  return null;
}, { role: 'both' }); // 'both' allows landlord and PMC

