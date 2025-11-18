import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load landlord detail client (PMC-only for now)
const PMCLandlordDetailClient = dynamic(() => 
  import('@/components/pages/pmc/landlords/[id]/ui').then(mod => mod.default)
);

export default withAuth(async ({ user, userRole, prisma, params }) => {
  // Handle params - might be a Promise in Next.js 15+
  const resolvedParams = params instanceof Promise ? await params : (params || {});
  const landlordId = resolvedParams?.id;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Landlord Detail Page] Received params:', {
      params,
      resolvedParams,
      landlordId,
      paramsType: typeof params,
      isPromise: params instanceof Promise,
    });
  }
  
  if (!landlordId) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Landlord ID is required</h1>
        <p>Params received: {JSON.stringify(resolvedParams)}</p>
        <p>Params type: {typeof params}</p>
      </div>
    );
  }

  // Only PMC users can view landlord details
  if (userRole !== 'pmc') {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Access Denied</h1>
        <p>Only PMC users can view landlord details.</p>
      </div>
    );
  }

  // For PMC Admin users, use pmcId from user object, otherwise use user.id
  const pmcId = user.pmcId || user.id;

  // Fetch landlord with all necessary relations
  const landlord = await prisma.landlord.findUnique({
    where: { id: landlordId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      provinceState: true,
      postalZip: true,
      country: true,
      countryCode: true,
      regionCode: true,
      approvalStatus: true,
      createdAt: true,
      updatedAt: true,
      properties: {
        select: {
          id: true,
          propertyName: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          provinceState: true,
          postalZip: true,
          propertyType: true,
          unitCount: true,
          createdAt: true,
          units: {
            select: {
              id: true,
              unitName: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!landlord) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Landlord not found</h1>
      </div>
    );
  }

  // Verify PMC has an active relationship with this landlord
  const pmcRelationship = await prisma.pMCLandlord.findFirst({
    where: {
      pmcId: pmcId,
      landlordId: landlordId,
      status: 'active',
      OR: [
        { endedAt: null },
        { endedAt: { gt: new Date() } },
      ],
    },
    include: {
      pmc: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
  });

  if (!pmcRelationship) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <h1>Access Denied</h1>
        <p>You can only view details for landlords you manage.</p>
      </div>
    );
  }

  return (
    <PMCLandlordDetailClient
      landlord={serializePrismaData(landlord)}
      relationship={serializePrismaData(pmcRelationship)}
    />
  );
}, { role: 'pmc' });

