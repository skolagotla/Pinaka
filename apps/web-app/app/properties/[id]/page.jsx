import { withAuth } from '@/lib/utils/page-wrapper';
import { serializeProperty } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load property detail clients
const LandlordPropertyDetailClient = dynamic(() => 
  import('@/components/pages/landlord/properties/[id]/ui').then(mod => mod.default)
);
const PMCPropertyDetailClient = dynamic(() => 
  import('@/components/pages/pmc/properties/[id]/ui').then(mod => mod.default)
);

export default withAuth(async ({ user, userRole, prisma, params }) => {
  // Handle params - might be a Promise in Next.js 15+
  const resolvedParams = params instanceof Promise ? await params : (params || {});
  const propertyId = resolvedParams?.id;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Property Detail Page] Received params:', {
      params,
      resolvedParams,
      propertyId,
      paramsType: typeof params,
      isPromise: params instanceof Promise,
    });
  }
  
  if (!propertyId) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Property ID is required</h1>
        <p>Params received: {JSON.stringify(resolvedParams)}</p>
        <p>Params type: {typeof params}</p>
      </div>
    );
  }

  // For PMC Admin users, use pmcId from user object, otherwise use user.id
  const pmcId = userRole === 'pmc' ? (user.pmcId || user.id) : null;

  // Fetch property with all necessary relations
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      propertyId: true,
      propertyName: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      provinceState: true,
      postalZip: true,
      country: true,
      propertyType: true,
      unitCount: true,
      yearBuilt: true,
      rent: true,
      rented: true,
      createdAt: true,
      updatedAt: true,
      landlordId: true,
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
          propertyId: true,
          unitName: true,
          floorNumber: true,
          bedrooms: true,
          bathrooms: true,
          rentPrice: true,
          depositAmount: true,
          status: true,
          createdAt: true,
          leases: {
            where: { status: 'Active' },
            select: {
              id: true,
              leaseStart: true,
              leaseEnd: true,
              rentAmount: true,
              status: true,
              leaseTenants: {
                select: {
                  tenantId: true,
                  isPrimaryTenant: true,
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
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!property) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Property not found</h1>
      </div>
    );
  }

  // Verify access based on user role
  if (userRole === 'landlord') {
    // Landlord can only see their own properties
    if (property.landlordId !== user.id) {
      return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
          <h1>Access Denied</h1>
          <p>You can only view your own properties.</p>
        </div>
      );
    }

    return (
      <LandlordPropertyDetailClient
        property={serializeProperty(property)}
        user={user}
      />
    );
  } else if (userRole === 'pmc') {
    // PMC can see properties for landlords they manage
    if (pmcId) {
      const pmcRelationship = await prisma.pMCLandlord.findFirst({
        where: {
          pmcId: pmcId,
          landlordId: property.landlordId,
          status: 'active',
          OR: [
            { endedAt: null },
            { endedAt: { gt: new Date() } },
          ],
        },
      });

      if (!pmcRelationship) {
        return (
          <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <h1>Access Denied</h1>
            <p>You can only view properties for landlords you manage.</p>
          </div>
        );
      }
    }

    return (
      <PMCPropertyDetailClient
        property={serializeProperty(property)}
      />
    );
  }

  // Tenant doesn't have property detail page
  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Access Denied</h1>
      <p>You don't have permission to view this property.</p>
    </div>
  );
}, { role: ['landlord', 'pmc'] });

