import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamicImport from 'next/dynamic';

// Lazy load landlords client (PMC-only)
const PMCLandlordsClient = dynamicImport(() => import('@/components/pages/pmc/landlords/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma }) => {
  if (userRole === 'pmc') {
    // PMC landlords logic
    // For PMC Admin users, use pmcId from user object, otherwise use user.id
    const pmcId = user.pmcId || user.id;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Landlords Page] PMC user:', {
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
          include: {
            properties: {
              select: {
                id: true,
                addressLine1: true,
                propertyName: true,
              },
            },
            _count: {
              select: {
                properties: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // Get property counts for each landlord
    const landlordIds = pmcRelationships.map(rel => rel.landlordId);
    const propertyCounts = await prisma.property.groupBy({
      by: ['landlordId'],
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      _count: {
        id: true,
      },
    });

    const propertyCountMap = new Map(
      propertyCounts.map(pc => [pc.landlordId, pc._count.id])
    );

    const relationships = pmcRelationships.map(rel => ({
      ...rel,
      landlord: {
        ...rel.landlord,
        propertyCount: propertyCountMap.get(rel.landlordId) || 0,
      },
      startedAt: rel.startedAt.toISOString(),
      endedAt: rel.endedAt?.toISOString() || null,
    }));

    return (
      <PMCLandlordsClient
        pmc={serializePrismaData(user)}
        relationships={relationships}
      />
    );
  }

  // Not a PMC, redirect to dashboard
  return null;
}, { role: 'pmc' });

